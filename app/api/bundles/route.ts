
import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";

export async function GET() {
  try {
    const bundles = await db.vendorBundle.findMany({
      where: {
        status: "ACTIVE",
        vendorProfile: {
          kycStatus: "VERIFIED",
          user: {
            status: "ACTIVE",
          },
        },
        items: {
          some: {},
          every: {
            listing: {
              status: "ACTIVE",
              isAvailable: true,
            },
          },
        },
      },
      include: {
        vendorProfile: {
          select: {
            id: true,
            businessName: true,
            user: {
              select: {
                status: true,
              },
            },
          },
        },
        items: {
          include: {
            listing: {
              select: {
                id: true,
                title: true,
                slug: true,
                category: true,
                priceKobo: true,
                pricingUnit: true,
                isAvailable: true,
                status: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      data: bundles,
    });
  } catch (error) {
    console.error("Error fetching customer bundles:", error);

    return NextResponse.json(
      { error: "Unable to retrieve bundles." },
      { status: 500 }
    );
  }
}
