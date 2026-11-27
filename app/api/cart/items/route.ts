import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { getAppCookieOptions } from "@/app/lib/cookies";
import { db } from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/session";
import {
  checkListingAvailability,
  GUEST_CART_COOKIE_NAME,
  parseBookingDate,
} from "@/app/lib/booking";

export const runtime = "nodejs";

const GUEST_CART_DURATION_SECONDS = 30 * 24 * 60 * 60;

type AddToCartBody = {
  listingId?: unknown;
  quantity?: unknown;
  startDate?: unknown;
  endDate?: unknown;
};

export async function POST(request: Request) {
  try {
    let body: AddToCartBody;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { message: "Invalid request body." },
        { status: 400 }
      );
    }

    const listingId =
      typeof body.listingId === "string" ? body.listingId.trim() : "";

    const quantity = body.quantity === undefined ? 1 : body.quantity;

    if (!listingId) {
      return NextResponse.json(
        { message: "A listing ID is required." },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(quantity) ||
      typeof quantity !== "number" ||
      quantity < 1 ||
      quantity > 99
    ) {
      return NextResponse.json(
        { message: "Quantity must be between 1 and 99." },
        { status: 400 }
      );
    }

    const hasStart =
      body.startDate !== undefined &&
      body.startDate !== null &&
      body.startDate !== "";
    const hasEnd =
      body.endDate !== undefined &&
      body.endDate !== null &&
      body.endDate !== "";

    if (hasStart !== hasEnd) {
      return NextResponse.json(
        {
          message:
            "Both rental start and end dates must be provided together.",
        },
        { status: 400 }
      );
    }

    let startDate: Date | null = null;
    let endDate: Date | null = null;

    if (hasStart && hasEnd) {
      startDate = parseBookingDate(body.startDate);
      endDate = parseBookingDate(body.endDate);

      if (!startDate || !endDate) {
        return NextResponse.json(
          { message: "Please provide valid rental dates." },
          { status: 400 }
        );
      }

      if (endDate.getTime() < startDate.getTime()) {
        return NextResponse.json(
          {
            message: "End date cannot be before the start date.",
          },
          { status: 400 }
        );
      }
    }

    const currentUser = await getCurrentUser();
    const cookieStore = await cookies();

    if (currentUser && currentUser.role !== "CUSTOMER") {
      return NextResponse.json(
        {
          message: "Only customer accounts can add items to a cart.",
        },
        { status: 403 }
      );
    }

    let guestId: string | undefined;
    let newGuestId: string | null = null;

    if (!currentUser) {
      guestId = cookieStore.get(GUEST_CART_COOKIE_NAME)?.value;

      if (!guestId) {
        guestId = randomBytes(32).toString("hex");
        newGuestId = guestId;
      }
    }

    const listing = await db.listing.findFirst({
      where: {
        id: listingId,
        status: "ACTIVE",
        isAvailable: true,
        vendorProfile: {
          is: {
            kycStatus: "VERIFIED",
            user: {
              is: {
                role: "VENDOR",
                status: "ACTIVE",
              },
            },
          },
        },
      },
      select: {
        id: true,
        totalQuantity: true,
      },
    });

    if (!listing) {
      return NextResponse.json(
        {
          message: "This listing is unavailable or no longer active.",
        },
        { status: 404 }
      );
    }

    const totalStock = Math.max(1, listing.totalQuantity ?? 1);
    if (quantity > totalStock) {
      return NextResponse.json(
        {
          message: `Only ${totalStock} unit${totalStock === 1 ? "" : "s"} available for this listing.`,
        },
        { status: 409 }
      );
    }

    if (startDate && endDate) {
      const availability = await checkListingAvailability(db, {
        listingId,
        startDate,
        endDate,
        quantity,
      });

      if (!availability.available) {
        return NextResponse.json(
          {
            message:
              availability.reason ||
              "This listing is unavailable for the selected dates.",
          },
          { status: 409 }
        );
      }
    }

    const result = await db.$transaction(async (tx) => {
      const cart = await tx.cart.upsert({
        where: currentUser
          ? { userId: currentUser.id }
          : { guestId: guestId! },
        update: {},
        create: currentUser
          ? { userId: currentUser.id }
          : { guestId: guestId! },
      });

      const existingItem = await tx.cartItem.findFirst({
        where: {
          cartId: cart.id,
          listingId,
          startDate,
          endDate,
        },
      });

      let cartItem;
      let created = false;

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;

        if (newQuantity > 99) {
          throw new Error("CART_QUANTITY_LIMIT");
        }

        if (newQuantity > totalStock) {
          throw new Error("INSUFFICIENT_INVENTORY");
        }

        if (startDate && endDate) {
          const recheck = await checkListingAvailability(tx, {
            listingId,
            startDate,
            endDate,
            quantity: newQuantity,
          });
          if (!recheck.available) {
            throw new Error("INSUFFICIENT_INVENTORY");
          }
        }

        cartItem = await tx.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: newQuantity },
          include: {
            listing: {
              select: {
                id: true,
                title: true,
                slug: true,
                category: true,
                priceKobo: true,
                totalQuantity: true,
                pricingUnit: true,
              },
            },
          },
        });
      } else {
        cartItem = await tx.cartItem.create({
          data: {
            cartId: cart.id,
            listingId,
            quantity,
            startDate,
            endDate,
          },
          include: {
            listing: {
              select: {
                id: true,
                title: true,
                slug: true,
                category: true,
                priceKobo: true,
                totalQuantity: true,
                pricingUnit: true,
              },
            },
          },
        });

        created = true;
      }

      return { cartItem, created };
    });

    const response = NextResponse.json(
      {
        message: result.created
          ? "Listing added to cart successfully."
          : "Cart quantity updated successfully.",
        data: {
          id: result.cartItem.id,
          listing: result.cartItem.listing,
          quantity: result.cartItem.quantity,
          startDate: result.cartItem.startDate,
          endDate: result.cartItem.endDate,
          lineTotalKobo:
            result.cartItem.listing.priceKobo * result.cartItem.quantity,
        },
      },
      { status: result.created ? 201 : 200 }
    );

    if (newGuestId) {
      const cookieOptions = await getAppCookieOptions(request);
      response.cookies.set(GUEST_CART_COOKIE_NAME, newGuestId, {
        ...cookieOptions,
        maxAge: GUEST_CART_DURATION_SECONDS,
      });
    }

    return response;
  } catch (error) {
    if (error instanceof Error && error.message === "CART_QUANTITY_LIMIT") {
      return NextResponse.json(
        {
          message:
            "You cannot add more than 99 units of the same listing and rental dates.",
        },
        { status: 400 }
      );
    }

    if (
      error instanceof Error &&
      error.message === "INSUFFICIENT_INVENTORY"
    ) {
      return NextResponse.json(
        {
          message:
            "Not enough units are available for the selected dates.",
        },
        { status: 409 }
      );
    }

    console.error("Add to cart API error:", error);

    return NextResponse.json(
      { message: "Could not add listing to cart." },
      { status: 500 }
    );
  }
}
