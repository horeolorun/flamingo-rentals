import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { db } from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/session";
import {
  checkListingAvailability,
  GUEST_CART_COOKIE_NAME,
  parseBookingDate,
} from "@/app/lib/booking";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ itemId: string }>;
};

async function getCartId() {
  const currentUser = await getCurrentUser();
  const cookieStore = await cookies();

  if (currentUser && currentUser.role !== "CUSTOMER") {
    return {
      error: "Only customer accounts can manage a cart.",
      status: 403,
    };
  }

  if (currentUser) {
    const cart = await db.cart.findUnique({
      where: { userId: currentUser.id },
      select: { id: true },
    });

    return { cartId: cart?.id ?? null };
  }

  const guestId = cookieStore.get(GUEST_CART_COOKIE_NAME)?.value;

  if (!guestId) {
    return { cartId: null };
  }

  const cart = await db.cart.findUnique({
    where: { guestId },
    select: { id: true },
  });

  return { cartId: cart?.id ?? null };
}

async function getCartSummary(cartId: string) {
  const cart = await db.cart.findUnique({
    where: { id: cartId },
    include: {
      items: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          listing: {
            select: {
              id: true,
              title: true,
              slug: true,
              category: true,
              priceKobo: true,
              totalQuantity: true,
              pricingUnit: true,
              status: true,
              isAvailable: true,
              vendorProfile: {
                select: {
                  id: true,
                  businessName: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!cart) return null;

  const items = await Promise.all(
    cart.items.map(async (item) => {
      const parsedStart = parseBookingDate(item.startDate);
      const parsedEnd = parseBookingDate(item.endDate);
      const hasRequiredBookingDetails = Boolean(
        parsedStart && parsedEnd && item.quantity >= 1
      );

      let availability = {
        available:
          item.listing.status === "ACTIVE" && item.listing.isAvailable,
        remainingQuantity: item.listing.totalQuantity ?? 1,
        reason: null as string | null,
      };

      if (parsedStart && parsedEnd) {
        const check = await checkListingAvailability(db, {
          listingId: item.listing.id,
          startDate: parsedStart,
          endDate: parsedEnd,
          quantity: item.quantity,
        });
        availability = {
          available: check.available,
          remainingQuantity: check.remainingQuantity,
          reason: check.reason,
        };
      }

      return {
        id: item.id,
        listing: {
          id: item.listing.id,
          title: item.listing.title,
          slug: item.listing.slug,
          category: item.listing.category,
          priceKobo: item.listing.priceKobo,
          totalQuantity: item.listing.totalQuantity ?? 1,
          pricingUnit: item.listing.pricingUnit,
          status: item.listing.status,
          isAvailable: item.listing.isAvailable,
          vendor: {
            id: item.listing.vendorProfile.id,
            businessName: item.listing.vendorProfile.businessName,
          },
        },
        quantity: item.quantity,
        isSelected: item.isSelected,
        startDate: item.startDate,
        endDate: item.endDate,
        hasRequiredBookingDetails,
        availability,
        lineTotalKobo: item.listing.priceKobo * item.quantity,
      };
    })
  );

  return {
    id: cart.id,
    items,
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    selectedItemCount: items.reduce(
      (total, item) => total + (item.isSelected ? item.quantity : 0),
      0
    ),
    subtotalKobo: items.reduce(
      (total, item) => total + item.lineTotalKobo,
      0
    ),
    selectedSubtotalKobo: items.reduce(
      (total, item) =>
        total + (item.isSelected ? item.lineTotalKobo : 0),
      0
    ),
  };
}

// UPDATE CART ITEM BOOKING DETAILS (DATES, QUANTITY) AND/OR SELECTION
export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { itemId } = await context.params;
    const body = await request.json();

    const hasQuantity = Object.prototype.hasOwnProperty.call(
      body,
      "quantity"
    );
    const hasSelection = Object.prototype.hasOwnProperty.call(
      body,
      "isSelected"
    );
    const hasStartDate = Object.prototype.hasOwnProperty.call(
      body,
      "startDate"
    );
    const hasEndDate = Object.prototype.hasOwnProperty.call(body, "endDate");

    if (!hasQuantity && !hasSelection && !hasStartDate && !hasEndDate) {
      return NextResponse.json(
        {
          message:
            "Provide booking details, quantity, or selection value to update.",
        },
        { status: 400 }
      );
    }

    if (
      hasQuantity &&
      (typeof body.quantity !== "number" ||
        !Number.isInteger(body.quantity) ||
        body.quantity < 1 ||
        body.quantity > 99)
    ) {
      return NextResponse.json(
        { message: "Quantity must be between 1 and 99." },
        { status: 400 }
      );
    }

    if (hasSelection && typeof body.isSelected !== "boolean") {
      return NextResponse.json(
        { message: "Selection must be true or false." },
        { status: 400 }
      );
    }

    if (hasStartDate !== hasEndDate) {
      return NextResponse.json(
        {
          message:
            "Both rental start and end dates must be provided together.",
        },
        { status: 400 }
      );
    }

    const cartAccess = await getCartId();

    if ("error" in cartAccess) {
      return NextResponse.json(
        { message: cartAccess.error },
        { status: cartAccess.status }
      );
    }

    if (!cartAccess.cartId) {
      return NextResponse.json(
        { message: "Cart not found." },
        { status: 404 }
      );
    }

    const existingItem = await db.cartItem.findFirst({
      where: {
        id: itemId,
        cartId: cartAccess.cartId,
      },
      include: {
        listing: {
          select: {
            id: true,
            totalQuantity: true,
          },
        },
      },
    });

    if (!existingItem) {
      return NextResponse.json(
        { message: "Cart item not found." },
        { status: 404 }
      );
    }

    let nextStartDate = existingItem.startDate
      ? parseBookingDate(existingItem.startDate)
      : null;
    let nextEndDate = existingItem.endDate
      ? parseBookingDate(existingItem.endDate)
      : null;

    if (hasStartDate && hasEndDate) {
      if (
        body.startDate === null &&
        body.endDate === null
      ) {
        nextStartDate = null;
        nextEndDate = null;
      } else {
        nextStartDate = parseBookingDate(body.startDate);
        nextEndDate = parseBookingDate(body.endDate);

        if (!nextStartDate || !nextEndDate) {
          return NextResponse.json(
            { message: "Please provide valid rental dates." },
            { status: 400 }
          );
        }

        if (nextEndDate.getTime() < nextStartDate.getTime()) {
          return NextResponse.json(
            { message: "End date cannot be before the start date." },
            { status: 400 }
          );
        }
      }
    }

    const nextQuantity = hasQuantity ? body.quantity : existingItem.quantity;

    // Recheck availability whenever booking details change or dates are present
    if (
      (hasStartDate || hasQuantity) &&
      nextStartDate &&
      nextEndDate
    ) {
      const availability = await checkListingAvailability(db, {
        listingId: existingItem.listingId,
        startDate: nextStartDate,
        endDate: nextEndDate,
        quantity: nextQuantity,
      });

      if (!availability.available) {
        return NextResponse.json(
          {
            message:
              availability.reason ||
              "Selected quantity is not available for these dates.",
          },
          { status: 409 }
        );
      }
    } else if (hasQuantity && existingItem.listing) {
      const totalStock = Math.max(
        1,
        existingItem.listing.totalQuantity ?? 1
      );
      if (nextQuantity > totalStock) {
        return NextResponse.json(
          {
            message: `Only ${totalStock} unit${totalStock === 1 ? "" : "s"} available for this listing.`,
          },
          { status: 409 }
        );
      }
    }

    const updateData: {
      quantity?: number;
      isSelected?: boolean;
      startDate?: Date | null;
      endDate?: Date | null;
    } = {};

    if (hasQuantity) updateData.quantity = nextQuantity;
    if (hasSelection) updateData.isSelected = body.isSelected;
    if (hasStartDate && hasEndDate) {
      updateData.startDate = nextStartDate;
      updateData.endDate = nextEndDate;
    }

    await db.cartItem.update({
      where: { id: existingItem.id },
      data: updateData,
    });

    const updatedCart = await getCartSummary(cartAccess.cartId);

    return NextResponse.json({
      message: "Cart item updated successfully.",
      data: updatedCart,
    });
  } catch (error) {
    console.error("Update cart item API error:", error);

    return NextResponse.json(
      { message: "Could not update cart item." },
      { status: 500 }
    );
  }
}

// REMOVE CART ITEM
export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { itemId } = await context.params;

    const cartAccess = await getCartId();

    if ("error" in cartAccess) {
      return NextResponse.json(
        { message: cartAccess.error },
        { status: cartAccess.status }
      );
    }

    if (!cartAccess.cartId) {
      return NextResponse.json(
        { message: "Cart not found." },
        { status: 404 }
      );
    }

    const existingItem = await db.cartItem.findFirst({
      where: {
        id: itemId,
        cartId: cartAccess.cartId,
      },
    });

    if (!existingItem) {
      return NextResponse.json(
        { message: "Cart item not found." },
        { status: 404 }
      );
    }

    await db.cartItem.delete({
      where: { id: existingItem.id },
    });

    const updatedCart = await getCartSummary(cartAccess.cartId);

    return NextResponse.json({
      message: "Item removed from cart successfully.",
      data: updatedCart,
    });
  } catch (error) {
    console.error("Remove cart item API error:", error);

    return NextResponse.json(
      { message: "Could not remove cart item." },
      { status: 500 }
    );
  }
}
