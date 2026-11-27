import { NextResponse } from "next/server";

import { db } from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/session";
import {
  checkListingAvailability,
  createPendingCheckoutSession,
  formatBookingDate,
  parseBookingDate,
  type CheckoutItemSnapshot,
} from "@/app/lib/booking";

export const runtime = "nodejs";

export async function POST() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          message: "Please sign in to proceed to checkout.",
          requiresAuth: true,
        },
        { status: 401 }
      );
    }

    if (currentUser.role !== "CUSTOMER") {
      return NextResponse.json(
        { message: "Only customer accounts can complete bookings." },
        { status: 403 }
      );
    }

    const cart = await db.cart.findUnique({
      where: { userId: currentUser.id },
      include: {
        items: {
          where: { isSelected: true },
          include: {
            listing: {
              select: {
                id: true,
                title: true,
                priceKobo: true,
                totalQuantity: true,
                status: true,
                isAvailable: true,
                vendorProfileId: true,
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { message: "Select at least one item in your cart before checking out." },
        { status: 400 }
      );
    }

    const snapshots: CheckoutItemSnapshot[] = [];

    for (const item of cart.items) {
      const startDate = parseBookingDate(item.startDate);
      const endDate = parseBookingDate(item.endDate);

      if (!startDate || !endDate) {
        return NextResponse.json(
          {
            message: `"${item.listing.title}" is missing required booking dates. Edit its booking details before checkout.`,
          },
          { status: 400 }
        );
      }

      if (endDate.getTime() < startDate.getTime()) {
        return NextResponse.json(
          {
            message: `"${item.listing.title}" has an invalid date range.`,
          },
          { status: 400 }
        );
      }

      // Sum quantity across any overlapping selected cart items for the same listing
      const combinedQtyForRange = cart.items.reduce((sum, other) => {
        if (other.listingId !== item.listingId) return sum;
        const oStart = parseBookingDate(other.startDate);
        const oEnd = parseBookingDate(other.endDate);
        if (!oStart || !oEnd) return sum;
        if (
          oStart.getTime() <= endDate.getTime() &&
          oEnd.getTime() >= startDate.getTime()
        ) {
          return sum + other.quantity;
        }
        return sum;
      }, 0);

      const availability = await checkListingAvailability(db, {
        listingId: item.listingId,
        startDate,
        endDate,
        quantity: combinedQtyForRange,
      });

      if (!availability.available) {
        return NextResponse.json(
          {
            message: `${item.listing.title}: ${
              availability.reason || "Not available for the selected dates."
            }`,
          },
          { status: 409 }
        );
      }

      snapshots.push({
        cartItemId: item.id,
        listingId: item.listing.id,
        vendorProfileId: item.listing.vendorProfileId,
        title: item.listing.title,
        quantity: item.quantity,
        unitPriceKobo: item.listing.priceKobo,
        lineTotalKobo: item.listing.priceKobo * item.quantity,
        startDate: formatBookingDate(startDate)!,
        endDate: formatBookingDate(endDate)!,
      });
    }

    const totalKobo = snapshots.reduce(
      (sum, item) => sum + item.lineTotalKobo,
      0
    );

    const session = createPendingCheckoutSession({
      userId: currentUser.id,
      cartId: cart.id,
      items: snapshots,
      totalKobo,
    });

    return NextResponse.json({
      data: {
        checkoutReference: session.checkoutReference,
        expiresAt: session.expiresAt,
        amountKobo: totalKobo,
        currency: "NGN",
        items: snapshots,
      },
    });
  } catch (error) {
    console.error("Booking checkout initiation error:", error);

    return NextResponse.json(
      { message: "Could not start checkout." },
      { status: 500 }
    );
  }
}
