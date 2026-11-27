import { NextResponse } from "next/server";

import { db } from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/session";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ bookingId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { message: "You must be signed in." },
        { status: 401 }
      );
    }

    const { bookingId } = await context.params;

    let body: { reason?: unknown } = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const reason =
      typeof body.reason === "string" ? body.reason.trim() : "";

    const booking = await db.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json(
        { message: "Booking not found." },
        { status: 404 }
      );
    }

    const isVendorOwner =
      currentUser.role === "VENDOR" &&
      currentUser.vendorProfile?.id === booking.vendorProfileId;

    const isCustomerOwner =
      currentUser.role === "CUSTOMER" &&
      currentUser.id === booking.customerId;

    if (!isVendorOwner && !isCustomerOwner) {
      return NextResponse.json(
        { message: "You are not authorised to cancel this booking." },
        { status: 403 }
      );
    }

    if (isVendorOwner && reason.length < 3) {
      return NextResponse.json(
        {
          message:
            "A cancellation reason (at least 3 characters) is required for vendors.",
        },
        { status: 400 }
      );
    }

    if (reason.length > 500) {
      return NextResponse.json(
        { message: "Cancellation reason must be 500 characters or less." },
        { status: 400 }
      );
    }

    if (booking.status !== "PAID") {
      return NextResponse.json(
        {
          message:
            booking.status === "CANCELLED"
              ? "This booking has already been cancelled."
              : "Only paid bookings can be cancelled.",
        },
        { status: 409 }
      );
    }

    const now = new Date();

    const updatedBooking = await db.booking.update({
      where: { id: booking.id },
      data: {
        status: "CANCELLED",
        cancellationReason: reason || null,
        cancelledBy: isVendorOwner ? "VENDOR" : "CUSTOMER",
        cancelledAt: now,
        refundStatus: "PENDING",
        refundAmountKobo: booking.totalPriceKobo,
        refundRequestedAt: now,
      },
    });

    return NextResponse.json({
      message: "Booking cancelled successfully.",
      data: updatedBooking,
    });
  } catch (error) {
    console.error("Cancel booking API error:", error);

    return NextResponse.json(
      { message: "Could not cancel booking." },
      { status: 500 }
    );
  }
}
