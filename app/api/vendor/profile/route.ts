import { NextResponse } from "next/server";

import { vendorSegments } from "@/app/data/vendorSegments";
import { nigerianStates } from "@/app/data/nigerianStates";
import { db } from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/session";

export const runtime = "nodejs";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          message: "You must be signed in.",
        },
        {
          status: 401,
        }
      );
    }

    if (currentUser.role !== "VENDOR") {
      return NextResponse.json(
        {
          success: false,
          message: "Vendor access required.",
        },
        {
          status: 403,
        }
      );
    }

    const user = await db.user.findUnique({
      where: {
        id: currentUser.id,
      },

      include: {
        vendorProfile: true,
      },
    });

    if (!user || !user.vendorProfile) {
      return NextResponse.json(
        {
          success: false,
          message: "Vendor profile not found.",
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

          country:
            user.vendorProfile.country,

          state:
            user.vendorProfile.state,

          city:
            user.vendorProfile.city,

          averageRating:
            user.vendorProfile.averageRating,

          reviewCount:
            user.vendorProfile.reviewCount,

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
        message:
          "Could not load vendor profile.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PATCH(
  request: Request
) {
  try {
    const currentUser =
      await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You must be signed in.",
        },
        {
          status: 401,
        }
      );
    }

    if (
      currentUser.role !==
      "VENDOR"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Vendor access required.",
        },
        {
          status: 403,
        }
      );
    }

    const profile =
      await db.vendorProfile.findUnique({
        where: {
          userId:
            currentUser.id,
        },
      });

    if (!profile) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Vendor profile not found.",
        },
        {
          status: 404,
        }
      );
    }

    const body: unknown =
      await request.json();

    if (
      !body ||
      typeof body !== "object"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid request body.",
        },
        {
          status: 400,
        }
      );
    }

    const requestBody =
      body as Record<
        string,
        unknown
      >;

    const businessName =
      String(
        requestBody.businessName ??
          ""
      ).trim();

    const state =
      String(
        requestBody.state ?? ""
      ).trim();

    const city =
      String(
        requestBody.city ?? ""
      ).trim();

    const submittedSegments: string[] =
      Array.isArray(
        requestBody.segments
      )
        ? requestBody.segments.map(
            (
              segment: unknown
            ): string =>
              String(
                segment
              ).trim()
          )
        : [];

    if (!businessName) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Business name is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      businessName.length > 120
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Business name is too long.",
        },
        {
          status: 400,
        }
      );
    }

    const validSegments: string[] =
      submittedSegments.filter(
        (
          segment: string
        ): boolean =>
          vendorSegments.includes(
            segment as
              (typeof vendorSegments)[number]
          )
      );

    const uniqueSegments: string[] =
      Array.from(
        new Set<string>(
          validSegments
        )
      );

    if (
      uniqueSegments.length ===
      0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please select at least one service.",
        },
        {
          status: 400,
        }
      );
    }

    if (!state) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please select your state.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !nigerianStates.includes(
        state as
          (typeof nigerianStates)[number]
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please select a valid Nigerian state.",
        },
        {
          status: 400,
        }
      );
    }

    if (!city) {
      return NextResponse.json(
        {
          success: false,
          message:
            "City is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (city.length > 80) {
      return NextResponse.json(
        {
          success: false,
          message:
            "City name is too long.",
        },
        {
          status: 400,
        }
      );
    }

    const updatedProfile =
      await db.vendorProfile.update({
        where: {
          id: profile.id,
        },

        data: {
          businessName,

          segments:
            uniqueSegments,

          country:
            "Nigeria",

          state,

          city,
        },
      });

    return NextResponse.json({
      success: true,

      message:
        "Business profile updated successfully.",

      data: {
        businessName:
          updatedProfile.businessName,

        segments:
          updatedProfile.segments,

        country:
          updatedProfile.country,

        state:
          updatedProfile.state,

        city:
          updatedProfile.city,
      },
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
          "Could not update business profile.",
      },
      {
        status: 500,
      }
    );
  }
}