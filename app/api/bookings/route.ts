import { NextResponse } from "next/server";

import { db } from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/session";

export const runtime = "nodejs";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { message: "You must be signed in." },
        { status: 401 }
      );
    }

    if (currentUser.role === "CUSTOMER") {
      const bookings = await db.booking.findMany({
        where: { customerId: currentUser.id },
        include: {
          listing: {
            select: {
              id: true,
              title: true,
              category: true,
              pricingUnit: true,
            },
          },
          vendor: {
            select: {
              id: true,
              businessName: true,
              state: true,
              city: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({
        data: bookings,
      });
    }

    if (currentUser.role === "VENDOR") {
      if (!currentUser.vendorProfile) {
        return NextResponse.json(
          { message: "Vendor profile not found." },
          { status: 404 }
        );
      }

      const bookings = await db.booking.findMany({
        where: { vendorProfileId: currentUser.vendorProfile.id },
        include: {
          listing: {
            select: {
              id: true,
              title: true,
              category: true,
              pricingUnit: true,
            },
          },
          customer: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({
        data: bookings,
      });
    }

    return NextResponse.json(
      { message: "Unsupported account role." },
      { status: 403 }
    );
  } catch (error) {
    console.error("Bookings GET API error:", error);

    return NextResponse.json(
      { message: "Could not load bookings." },
      { status: 500 }
    );
  }
}
