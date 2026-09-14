import { NextResponse } from "next/server";

import { db } from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/session";

export const runtime = "nodejs";

function createSlug(title: string) {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${base}-${Date.now()}`;
}

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

    const listings = await db.listing.findMany({
      where: {
        vendorProfileId: user.vendorProfile.id,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: listings,
      meta: {
        count: listings.length,
      },
    });
  } catch (error) {
    console.error("Vendor listings GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Could not load vendor listings",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: Request) {
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

    const title = String(body.title ?? "").trim();
    const description = String(body.description ?? "").trim();
    const category = String(body.category ?? "").trim();
    const pricingUnit = String(body.pricingUnit ?? "").trim();
    const priceKobo = Number(body.priceKobo);

    if (!title) {
      return NextResponse.json(
        {
          success: false,
          message: "Listing title is required",
        },
        {
          status: 400,
        }
      );
    }

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: "Category is required",
        },
        {
          status: 400,
        }
      );
    }

    if (!Number.isInteger(priceKobo) || priceKobo < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Price must be a valid amount",
        },
        {
          status: 400,
        }
      );
    }

    const listing = await db.listing.create({
      data: {
        vendorProfileId: user.vendorProfile.id,
        title,
        slug: createSlug(title),
        description: description || null,
        category,
        priceKobo,
        pricingUnit: pricingUnit || null,
        status: "DRAFT",
        isAvailable: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Listing created successfully",
        data: listing,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Vendor listings POST error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Could not create vendor listing",
      },
      {
        status: 500,
      }
    );
  }
}