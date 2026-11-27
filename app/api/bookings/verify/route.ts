import { NextResponse } from "next/server";

import { db } from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/session";
import {
  checkListingAvailability,
  parseBookingDate,
  releaseConsumedCheckoutSession,
  verifyAndConsumeCheckoutSession,
} from "@/app/lib/booking";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { message: "Please sign in to verify your payment." },
        { status: 401 }
      );
    }

    if (currentUser.role !== "CUSTOMER") {
      return NextResponse.json(
        { message: "Only customer accounts can verify booking payments." },
        { status: 403 }
      );
    }

    let body: { checkoutReference?: unknown; providerReference?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { message: "Invalid request body." },
        { status: 400 }
      );
    }

    const checkoutReference =
      typeof body.checkoutReference === "string"
        ? body.checkoutReference.trim()
        : "";
    const providerReference =
      typeof body.providerReference === "string"
        ? body.providerReference.trim()
        : undefined;

    if (!checkoutReference) {
      return NextResponse.json(
        { message: "Checkout reference is required." },
        { status: 400 }
      );
    }

    const verification = await verifyAndConsumeCheckoutSession({
      checkoutReference,
      providerReference,
      userId: currentUser.id,
    });

    if (!verification.ok) {
      return NextResponse.json(
        { message: verification.message },
        { status: verification.status }
      );
    }

    const { session, paymentReference } = verification;

    try {
      const createdBookings = await db.$transaction(async (tx) => {
        const cartItemIds = session.items.map((item) => item.cartItemId);

        // Re-verify cart items still exist and match the verified checkout snapshot
        const currentCartItems = await tx.cartItem.findMany({
          where: {
            id: { in: cartItemIds },
            cartId: session.cartId,
          },
          include: {
            listing: {
              select: {
                id: true,
                title: true,
                priceKobo: true,
                vendorProfileId: true,
                status: true,
                isAvailable: true,
              },
            },
          },
        });

        if (currentCartItems.length !== session.items.length) {
          throw new Error("CART_CHANGED");
        }

        // Recheck availability & inventory inside transaction before confirming PAID bookings
        for (const item of currentCartItems) {
          const startDate = parseBookingDate(item.startDate);
          const endDate = parseBookingDate(item.endDate);

          if (!startDate || !endDate) {
            throw new Error("MISSING_DATES");
          }

          const combinedQtyForRange = currentCartItems.reduce((sum, other) => {
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

          const availability = await checkListingAvailability(tx, {
            listingId: item.listingId,
            startDate,
            endDate,
            quantity: combinedQtyForRange,
          });

          if (!availability.available) {
            throw new Error(
              `AVAILABILITY_CONFLICT:${item.listing.title}: ${
                availability.reason || "No longer available."
              }`
            );
          }
        }

        const bookings = [];
        for (const item of currentCartItems) {
          const startDate = parseBookingDate(item.startDate)!;
          const endDate = parseBookingDate(item.endDate)!;
          const totalPriceKobo = item.listing.priceKobo * item.quantity;

          const booking = await tx.booking.create({
            data: {
              customerId: currentUser.id,
              vendorProfileId: item.listing.vendorProfileId,
              listingId: item.listingId,
              startDate,
              endDate,
              quantity: item.quantity,
              totalPriceKobo,
              status: "PAID",
            },
          });

          bookings.push(booking);
        }

        await tx.cartItem.deleteMany({
          where: {
            id: { in: cartItemIds },
            cartId: session.cartId,
          },
        });

        return bookings;
      });

      return NextResponse.json(
        {
          message: "Payment verified and booking confirmed.",
          data: {
            paymentReference,
            bookings: createdBookings,
          },
        },
        { status: 201 }
      );
    } catch (txError) {
      if (txError instanceof Error) {
        if (txError.message === "CART_CHANGED") {
          releaseConsumedCheckoutSession(checkoutReference);
          return NextResponse.json(
            {
              message:
                "Your cart changed during checkout. Please review your cart and try again.",
            },
            { status: 409 }
          );
        }
        if (txError.message === "MISSING_DATES") {
          releaseConsumedCheckoutSession(checkoutReference);
          return NextResponse.json(
            {
              message:
                "One or more items are missing required booking dates.",
            },
            { status: 400 }
          );
        }
        if (txError.message.startsWith("AVAILABILITY_CONFLICT:")) {
          return NextResponse.json(
            {
              message: txError.message.replace(
                "AVAILABILITY_CONFLICT:",
                ""
              ),
            },
            { status: 409 }
          );
        }
      }
      throw txError;
    }
  } catch (error) {
    console.error("Payment verification API error:", error);

    return NextResponse.json(
      { message: "Could not verify payment and confirm booking." },
      { status: 500 }
    );
  }
}
