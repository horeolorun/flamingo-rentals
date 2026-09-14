import { NextResponse } from "next/server";

import { getCurrentUser } from "@/app/lib/session";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "You must be signed in",
        },
        {
          status: 401,
        }
      );
    }

    if (user.role !== "VENDOR") {
      return NextResponse.json(
        {
          success: false,
          message: "Vendor access required",
        },
        {
          status: 403,
        }
      );
    }

    return NextResponse.json({
      success: true,

      data: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,

        business: user.vendorProfile
          ? {
              id: user.vendorProfile.id,
              businessName:
                user.vendorProfile.businessName,
              primaryCategory:
                user.vendorProfile.primaryCategory,
              kycStatus:
                user.vendorProfile.kycStatus,
              payoutStatus:
                user.vendorProfile.payoutStatus,
            }
          : null,
      },
    });
  } catch (error) {
    console.error(
      "Vendor profile API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Could not load vendor profile",
      },
      {
        status: 500,
      }
    );
  }
}