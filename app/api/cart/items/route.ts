
import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { db } from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/session";

export const runtime = "nodejs";

const GUEST_CART_COOKIE_NAME = "flamingo_guest_cart";
const GUEST_CART_DURATION_SECONDS = 30 * 24 * 60 * 60;

type AddToCartBody = {
  listingId?: unknown;
  quantity?: unknown;
  startDate?: unknown;
  endDate?: unknown;
};

export async function POST(request: Request) {
  try {
    // 1. VALIDATE REQUEST BODY
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
      typeof body.listingId === "string"
        ? body.listingId.trim()
        : "";

    const quantity =
      body.quantity === undefined ? 1 : body.quantity;

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

    // 2. VALIDATE RENTAL DATES
    function parseDate(value: unknown): Date | null | undefined {
      if (value === undefined || value === null || value === "") {
        return null;
      }

      if (typeof value !== "string") {
        return undefined;
      }

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return undefined;
      }

      return date;
    }

    const startDate = parseDate(body.startDate);
    const endDate = parseDate(body.endDate);

    if (startDate === undefined || endDate === undefined) {
      return NextResponse.json(
        { message: "Please provide valid rental dates." },
        { status: 400 }
      );
    }

    if (Boolean(startDate) !== Boolean(endDate)) {
      return NextResponse.json(
        {
          message:
            "Both rental start and end dates must be provided together.",
        },
        { status: 400 }
      );
    }

    if (
      startDate &&
      endDate &&
      endDate.getTime() <= startDate.getTime()
    ) {
      return NextResponse.json(
        {
          message: "The end date must be after the start date.",
        },
        { status: 400 }
      );
    }

    // 3. IDENTIFY CUSTOMER OR GUEST
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
      guestId = cookieStore.get(
        GUEST_CART_COOKIE_NAME
      )?.value;

      if (!guestId) {
        guestId = randomBytes(32).toString("hex");
        newGuestId = guestId;
      }
    }

    // 4. CHECK THAT THE LISTING IS AVAILABLE
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
      },
    });

    if (!listing) {
      return NextResponse.json(
        {
          message:
            "This listing is unavailable or no longer active.",
        },
        { status: 404 }
      );
    }

    // 5. CREATE OR RETRIEVE CART AND ADD ITEM
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

      // Look for the same listing with the same rental dates.
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
        const newQuantity =
          existingItem.quantity + quantity;

        if (newQuantity > 99) {
          throw new Error("CART_QUANTITY_LIMIT");
        }

        cartItem = await tx.cartItem.update({
          where: {
            id: existingItem.id,
          },

          data: {
            quantity: newQuantity,
          },

          include: {
            listing: {
              select: {
                id: true,
                title: true,
                slug: true,
                category: true,
                priceKobo: true,
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
                pricingUnit: true,
              },
            },
          },
        });

        created = true;
      }

      return {
        cartItem,
        created,
      };
    });

    // 6. RETURN RESPONSE
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
            result.cartItem.listing.priceKobo *
            result.cartItem.quantity,
        },
      },
      {
        status: result.created ? 201 : 200,
      }
    );

    // Save guest ID in an HTTP-only cookie.
    if (newGuestId) {
      response.cookies.set(
        GUEST_CART_COOKIE_NAME,
        newGuestId,
        {
          httpOnly: true,

          secure:
            process.env.NODE_ENV === "production",

          sameSite: "lax",

          path: "/",

          maxAge: GUEST_CART_DURATION_SECONDS,
        }
      );
    }

    return response;
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "CART_QUANTITY_LIMIT"
    ) {
      return NextResponse.json(
        {
          message:
            "You cannot add more than 99 units of the same listing and rental dates.",
        },
        { status: 400 }
      );
    }

    console.error("Add to cart API error:", error);

    return NextResponse.json(
      {
        message: "Could not add listing to cart.",
      },
      { status: 500 }
    );
  }
}
