import { NextResponse } from "next/server";

import { db } from "@/app/lib/db";
import {
  checkListingAvailability,
  parseBookingDate,
} from "@/app/lib/booking";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const listingId = String(searchParams.get("listingId") ?? "").trim();
    const startDateRaw = searchParams.get("startDate");
    const endDateRaw = searchParams.get("endDate");
    const quantityRaw = searchParams.get("quantity");

    if (!listingId) {
      return NextResponse.json(
        { message: "A listing ID is required." },
        { status: 400 }
      );
    }

    const quantity = quantityRaw ? Number(quantityRaw) : 1;
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      return NextResponse.json(
        { message: "Quantity must be between 1 and 99." },
        { status: 400 }
      );
    }

    const startDate = parseBookingDate(startDateRaw);
    const endDate = parseBookingDate(endDateRaw);

    if (!startDate || !endDate) {
      return NextResponse.json(
        { message: "Please provide valid start and end dates." },
        { status: 400 }
      );
    }

    if (endDate.getTime() < startDate.getTime()) {
      return NextResponse.json(
        { message: "End date cannot be before the start date." },
        { status: 400 }
      );
    }

    const result = await checkListingAvailability(db, {
      listingId,
      startDate,
      endDate,
      quantity,
    });

    return NextResponse.json({
      data: {
        available: result.available,
        totalQuantity: result.totalQuantity,
        bookedQuantity: result.bookedQuantity,
        remainingQuantity: result.remainingQuantity,
        blockedByVendor: result.blockedByVendor,
        reason: result.reason,
      },
    });
  } catch (error) {
    console.error("Availability check API error:", error);

    return NextResponse.json(
      { message: "Could not check availability." },
      { status: 500 }
    );
  }
}
