import { NextResponse } from "next/server";

import { vendorSegments } from "@/app/data/vendorSegments";
import { db } from "@/app/lib/db";
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

    if (!user.vendorProfile) {
      return NextResponse.json(
        {
          success: false,
          message: "Vendor profile not found",
        },
        {
          status: 404,
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

        business: {
          id: user.vendorProfile.id,
          businessName:
            user.vendorProfile.businessName,

          segments:
            user.vendorProfile.segments,

          kycStatus:
            user.vendorProfile.kycStatus,

          payoutStatus:
            user.vendorProfile.payoutStatus,
        },
      },
    });
  } catch (error) {
    console.error(
      "Vendor profile GET error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Could not load vendor profile",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PATCH(request: Request) {
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

    if (!user.vendorProfile) {
      return NextResponse.json(
        {
          success: false,
          message: "Vendor profile not found",
        },
        {
          status: 404,
        }
      );
    }

    const body = await request.json();

    const businessName = String(
      body.businessName ?? ""
    ).trim();

    const submittedSegments =
      Array.isArray(body.segments)
        ? body.segments.map((segment: unknown) =>
            String(segment)
          )
        : [];

    if (!businessName) {
      return NextResponse.json(
        {
          success: false,
          message: "Business name is required",
        },
        {
          status: 400,
        }
      );
    }

    const validSegments =
      submittedSegments.filter((segment) =>
        vendorSegments.includes(
          segment as
            (typeof vendorSegments)[number]
        )
      );

    if (validSegments.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please select at least one business segment",
        },
        {
          status: 400,
        }
      );
    }

    const profile =
      await db.vendorProfile.update({
        where: {
          id: user.vendorProfile.id,
        },

        data: {
          businessName,
          segments: validSegments,
        },
      });

    return NextResponse.json({
      success: true,
      message:
        "Business profile updated successfully",
      data: profile,
    });
  } catch (error) {
    console.error(
      "Vendor profile PATCH error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Could not update business profile",
      },
      {
        status: 500,
      }
    );
  }
}