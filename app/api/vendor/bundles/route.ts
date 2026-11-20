
import { NextResponse } from "next/server";

import { db } from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/session";

export const runtime = "nodejs";

// GET: Retrieve bundles belonging to the signed-in vendor
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "You must be signed in",
        },
        { status: 401 }
      );
    }

    if (user.role !== "VENDOR") {
      return NextResponse.json(
        {
          success: false,
          message: "Vendor access required",
        },
        { status: 403 }
      );
    }

    if (!user.vendorProfile) {
      return NextResponse.json(
        {
          success: false,
          message: "Vendor profile not found",
        },
        { status: 404 }
      );
    }

    const bundles = await db.vendorBundle.findMany({
      where: {
        vendorProfileId: user.vendorProfile.id,
      },
      include: {
        items: {
          include: {
            listing: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: bundles,
      meta: {
        count: bundles.length,
      },
    });
  } catch (error) {
    console.error("Vendor bundles GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Could not load vendor bundles",
      },
      { status: 500 }
    );
  }
}

// POST: Create a new vendor bundle
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "You must be signed in",
        },
        { status: 401 }
      );
    }

    if (user.role !== "VENDOR") {
      return NextResponse.json(
        {
          success: false,
          message: "Vendor access required",
        },
        { status: 403 }
      );
    }

    if (!user.vendorProfile) {
      return NextResponse.json(
        {
          success: false,
          message: "Vendor profile not found",
        },
        { status: 404 }
      );
    }

    const body = await request.json();

    const title = String(body.title ?? "").trim();
    const description = String(body.description ?? "").trim();
    const priceKobo = Number(body.priceKobo);
    const items = body.items;

    if (!title) {
      return NextResponse.json(
        {
          success: false,
          message: "Bundle title is required",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isSafeInteger(priceKobo) ||
      priceKobo <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Enter a valid bundle price",
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Select at least one listing",
        },
        { status: 400 }
      );
    }

    // Validate listing IDs and quantities
    const normalizedItems: {
      listingId: string;
      quantity: number;
    }[] = [];

    const seenListingIds = new Set<string>();

    for (const item of items) {
      const listingId = String(item?.listingId ?? "").trim();
      const quantity = Number(item?.quantity);

      if (!listingId) {
        return NextResponse.json(
          {
            success: false,
            message: "Every bundle item must have a listing ID",
          },
          { status: 400 }
        );
      }

      if (seenListingIds.has(listingId)) {
        return NextResponse.json(
          {
            success: false,
            message: "A listing cannot appear twice in the same bundle",
          },
          { status: 400 }
        );
      }

      if (
        !Number.isSafeInteger(quantity) ||
        quantity < 1 ||
        quantity > 100
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Each item quantity must be between 1 and 100",
          },
          { status: 400 }
        );
      }

      seenListingIds.add(listingId);

      normalizedItems.push({
        listingId,
        quantity,
      });
    }

    // Confirm that every selected listing belongs to this vendor
    // and is active and available.
    const listings = await db.listing.findMany({
      where: {
        id: {
          in: normalizedItems.map((item) => item.listingId),
        },
        vendorProfileId: user.vendorProfile.id,
        status: "ACTIVE",
        isAvailable: true,
      },
      select: {
        id: true,
      },
    });

    if (listings.length !== normalizedItems.length) {
      return NextResponse.json(
        {
          success: false,
          message:
            "One or more selected listings are unavailable or do not belong to your account",
        },
        { status: 400 }
      );
    }

    // Create the bundle and its component listings together
    const bundle = await db.vendorBundle.create({
      data: {
        vendorProfileId: user.vendorProfile.id,
        title,
        description: description || null,
        priceKobo,
        status: "DRAFT",

        items: {
          create: normalizedItems.map((item) => ({
            listingId: item.listingId,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        items: {
          include: {
            listing: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Vendor bundle created successfully",
        data: bundle,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Vendor bundles POST error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Could not create vendor bundle",
      },
      { status: 500 }
    );
  }
}
