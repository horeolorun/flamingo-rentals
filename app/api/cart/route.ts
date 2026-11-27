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

export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    const cookieStore = await cookies();

    let cart;
    let newGuestId: string | null = null;

    const includeItems = {
      items: {
        orderBy: {
          createdAt: "desc" as const,
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
              status: true,
              isAvailable: true,
              vendorProfile: {
                select: {
                  id: true,
                  businessName: true,
                },
              },
            },
          },
        },
      },
    };

    if (currentUser) {
      if (currentUser.role !== "CUSTOMER") {
        return NextResponse.json(
          {
            message: "Only customer accounts can access a shopping cart.",
          },
          { status: 403 }
        );
      }

      cart = await db.cart.upsert({
        where: { userId: currentUser.id },
        update: {},
        create: { userId: currentUser.id },
        include: includeItems,
      });
    } else {
      let guestId = cookieStore.get(GUEST_CART_COOKIE_NAME)?.value;

      if (!guestId) {
        guestId = randomBytes(32).toString("hex");
        newGuestId = guestId;
      }

      cart = await db.cart.upsert({
        where: { guestId },
        update: {},
        create: { guestId },
        include: includeItems,
      });
    }

    const items = await Promise.all(
      cart.items.map(async (item) => {
        const parsedStart = parseBookingDate(item.startDate);
        const parsedEnd = parseBookingDate(item.endDate);
        const hasRequiredBookingDetails = Boolean(
          parsedStart && parsedEnd && item.quantity >= 1
        );

        let availability = {
          available:
            item.listing.status === "ACTIVE" && item.listing.isAvailable,
          remainingQuantity: item.listing.totalQuantity ?? 1,
          reason: null as string | null,
        };

        if (parsedStart && parsedEnd) {
          const check = await checkListingAvailability(db, {
            listingId: item.listing.id,
            startDate: parsedStart,
            endDate: parsedEnd,
            quantity: item.quantity,
          });
          availability = {
            available: check.available,
            remainingQuantity: check.remainingQuantity,
            reason: check.reason,
          };
        }

        return {
          id: item.id,
          listing: {
            id: item.listing.id,
            title: item.listing.title,
            slug: item.listing.slug,
            category: item.listing.category,
            priceKobo: item.listing.priceKobo,
            totalQuantity: item.listing.totalQuantity ?? 1,
            pricingUnit: item.listing.pricingUnit,
            status: item.listing.status,
            isAvailable: item.listing.isAvailable,
            vendor: {
              id: item.listing.vendorProfile.id,
              businessName: item.listing.vendorProfile.businessName,
            },
          },
          quantity: item.quantity,
          isSelected: item.isSelected,
          startDate: item.startDate,
          endDate: item.endDate,
          hasRequiredBookingDetails,
          availability,
          lineTotalKobo: item.listing.priceKobo * item.quantity,
        };
      })
    );

    const subtotalKobo = items.reduce(
      (total, item) => total + item.lineTotalKobo,
      0
    );

    const selectedSubtotalKobo = items.reduce(
      (total, item) =>
        total + (item.isSelected ? item.lineTotalKobo : 0),
      0
    );

    const itemCount = items.reduce(
      (total, item) => total + item.quantity,
      0
    );

    const selectedItemCount = items.reduce(
      (total, item) =>
        total + (item.isSelected ? item.quantity : 0),
      0
    );

    const response = NextResponse.json({
      data: {
        id: cart.id,
        items,
        itemCount,
        selectedItemCount,
        subtotalKobo,
        selectedSubtotalKobo,
      },
      meta: {
        currency: "NGN",
        guest: !currentUser,
      },
    });

    if (newGuestId) {
      const cookieOptions = await getAppCookieOptions(request);
      response.cookies.set(GUEST_CART_COOKIE_NAME, newGuestId, {
        ...cookieOptions,
        maxAge: GUEST_CART_DURATION_SECONDS,
      });
    }

    return response;
  } catch (error) {
    console.error("Cart retrieval API error:", error);

    return NextResponse.json(
      { message: "Could not retrieve cart." },
      { status: 500 }
    );
  }
}
