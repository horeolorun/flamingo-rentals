import { NextResponse } from "next/server";

import { db } from "@/app/lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const vendorProfiles =
      await db.vendorProfile.findMany({
        include: {
          user: true,

          listings: {
            where: {
              isAvailable: true,
            },

            orderBy: {
              createdAt: "desc",
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    const vendors = vendorProfiles
      .filter(
        (profile) =>
          profile.user.role === "VENDOR" &&
          profile.user.status === "ACTIVE"
      )
      .map((profile) => ({
        id: profile.id,

        // For now the database ID acts as the slug.
        // Later we can add friendly URLs.
        slug: profile.id,

        businessName:
          profile.businessName?.trim() ||
          `${profile.user.fullName}'s Business`,

        segments: profile.segments,

        verified:
          profile.kycStatus === "VERIFIED",

        listingCount:
          profile.listings.length,

        imageUrl:
          "/home/hero-venue.jpg",
      }));

    return NextResponse.json({
      data: vendors,

      meta: {
        count: vendors.length,
      },
    });
  } catch (error) {
    console.error(
      "Customer vendors API error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Could not load vendors.",
      },
      {
        status: 500,
      }
    );
  }
}