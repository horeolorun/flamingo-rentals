import { NextResponse } from "next/server";

import { db } from "@/app/lib/db";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(
  request: Request,
  { params }: RouteContext
) {
  try {
    const { slug } = await params;

    const profile =
      await db.vendorProfile.findUnique({
        where: {
          id: slug,
        },

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
      });

    if (
      !profile ||
      profile.user.role !== "VENDOR" ||
      profile.user.status !== "ACTIVE"
    ) {
      return NextResponse.json(
        {
          message:
            "Vendor not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      data: {
        id: profile.id,

        slug: profile.id,

        businessName:
          profile.businessName?.trim() ||
          `${profile.user.fullName}'s Business`,

        segments:
          profile.segments,

        verified:
          profile.kycStatus ===
          "VERIFIED",

        kycStatus:
          profile.kycStatus,

        listingCount:
          profile.listings.length,

        imageUrl:
          "/home/hero-venue.jpg",

        listings:
          profile.listings.map(
            (listing) => ({
              id:
                listing.id,

              title:
                listing.title,

              slug:
                listing.slug,

              description:
                listing.description,

              category:
                listing.category,

              priceKobo:
                listing.priceKobo,

              pricingUnit:
                listing.pricingUnit,

              status:
                listing.status,

              isAvailable:
                listing.isAvailable,
            })
          ),
      },
    });
  } catch (error) {
    console.error(
      "Customer vendor detail API error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Could not load vendor.",
      },
      {
        status: 500,
      }
    );
  }
}