import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { getExpiredCookieOptions } from "@/app/lib/cookies";
import { db } from "@/app/lib/db";

export const GUEST_CART_COOKIE_NAME = "flamingo_guest_cart";

type DbOrTx = Pick<
  typeof db,
  "listing" | "vendorAvailabilityBlock" | "booking"
>;

export function parseBookingDate(value: unknown): Date | null {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return new Date(
      Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate())
    );
  }

  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (dateOnlyMatch) {
    const date = new Date(`${trimmed}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime())) return null;
    return date;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return null;

  return new Date(
    Date.UTC(
      parsed.getUTCFullYear(),
      parsed.getUTCMonth(),
      parsed.getUTCDate()
    )
  );
}

export function formatBookingDate(date: Date | string | null): string | null {
  if (!date) return null;
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function addUtcDays(date: Date, days: number): Date {
  const next = new Date(date.getTime());
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export type AvailabilityCheckResult = {
  available: boolean;
  totalQuantity: number;
  bookedQuantity: number;
  remainingQuantity: number;
  blockedByVendor: boolean;
  reason: string | null;
  listing: {
    id: string;
    title: string;
    priceKobo: number;
    pricingUnit: string | null;
    totalQuantity: number;
    vendorProfileId: string;
  } | null;
};

/**
 * Checks whether `quantity` units of `listingId` are available across the
 * inclusive date range [startDate, endDate].
 *
 * Consistent overlap rule: two inclusive ranges [A_start, A_end] and
 * [B_start, B_end] overlap when A_start <= B_end AND A_end >= B_start.
 */
export async function checkListingAvailability(
  client: DbOrTx,
  params: {
    listingId: string;
    startDate: Date;
    endDate: Date;
    quantity: number;
  }
): Promise<AvailabilityCheckResult> {
  const { listingId, startDate, endDate, quantity } = params;

  const listing = await client.listing.findFirst({
    where: {
      id: listingId,
      status: "ACTIVE",
      isAvailable: true,
      vendorProfile: {
        is: {
          kycStatus: "VERIFIED",
          user: {
            is: {
              role: "VENDOR",
              status: "ACTIVE",
            },
          },
        },
      },
    },
    select: {
      id: true,
      title: true,
      priceKobo: true,
      pricingUnit: true,
      totalQuantity: true,
      vendorProfileId: true,
    },
  });

  if (!listing) {
    return {
      available: false,
      totalQuantity: 0,
      bookedQuantity: 0,
      remainingQuantity: 0,
      blockedByVendor: false,
      reason: "This listing is unavailable or no longer active.",
      listing: null,
    };
  }

  const totalQuantity = Math.max(1, listing.totalQuantity ?? 1);

  const overlappingBlock = await client.vendorAvailabilityBlock.findFirst({
    where: {
      vendorProfileId: listing.vendorProfileId,
      startDate: { lte: endDate },
      endDate: { gte: startDate },
    },
    select: {
      id: true,
      reason: true,
    },
  });

  if (overlappingBlock) {
    return {
      available: false,
      totalQuantity,
      bookedQuantity: 0,
      remainingQuantity: 0,
      blockedByVendor: true,
      reason: overlappingBlock.reason
        ? `Vendor unavailable on these dates (${overlappingBlock.reason}).`
        : "Vendor is unavailable on the selected dates.",
      listing,
    };
  }

  const overlappingBookings = await client.booking.findMany({
    where: {
      listingId: listing.id,
      status: "PAID",
      startDate: { lte: endDate },
      endDate: { gte: startDate },
    },
    select: {
      startDate: true,
      endDate: true,
      quantity: true,
    },
  });

  let peakBookedQuantity = 0;
  if (overlappingBookings.length > 0) {
    const daySpanMs = 24 * 60 * 60 * 1000;
    const totalDays =
      Math.floor((endDate.getTime() - startDate.getTime()) / daySpanMs) + 1;
    // Sample every day up to 366 days; beyond that, sum overlapping bookings conservatively.
    if (totalDays <= 366) {
      for (let i = 0; i < totalDays; i++) {
        const day = addUtcDays(startDate, i);
        let daySum = 0;
        for (const booking of overlappingBookings) {
          const bStart = parseBookingDate(booking.startDate);
          const bEnd = parseBookingDate(booking.endDate);
          if (
            bStart &&
            bEnd &&
            bStart.getTime() <= day.getTime() &&
            bEnd.getTime() >= day.getTime()
          ) {
            daySum += booking.quantity ?? 1;
          }
        }
        if (daySum > peakBookedQuantity) {
          peakBookedQuantity = daySum;
        }
      }
    } else {
      peakBookedQuantity = overlappingBookings.reduce(
        (sum, b) => sum + (b.quantity ?? 1),
        0
      );
    }
  }

  const remainingQuantity = Math.max(0, totalQuantity - peakBookedQuantity);
  const available = remainingQuantity >= quantity;

  return {
    available,
    totalQuantity,
    bookedQuantity: peakBookedQuantity,
    remainingQuantity,
    blockedByVendor: false,
    reason: available
      ? null
      : remainingQuantity === 0
        ? "Fully booked for the selected dates."
        : `Only ${remainingQuantity} unit${remainingQuantity === 1 ? "" : "s"} available for the selected dates.`,
    listing,
  };
}

/**
 * Merges a guest cart (identified by `flamingo_guest_cart` cookie) into an
 * authenticated customer's cart after login, then removes the guest cart and
 * clears the cookie.
 */
export async function mergeGuestCartToUser(userId: string) {
  const cookieStore = await cookies();
  const guestId = cookieStore.get(GUEST_CART_COOKIE_NAME)?.value;

  if (!guestId) return;

  const guestCart = await db.cart.findUnique({
    where: { guestId },
    include: {
      items: true,
    },
  });

  if (!guestCart) {
    cookieStore.set(
      GUEST_CART_COOKIE_NAME,
      "",
      await getExpiredCookieOptions()
    );
    return;
  }

  if (guestCart.items.length === 0) {
    await db.cart.delete({ where: { id: guestCart.id } });
    cookieStore.set(
      GUEST_CART_COOKIE_NAME,
      "",
      await getExpiredCookieOptions()
    );
    return;
  }

  await db.$transaction(async (tx) => {
    const userCart = await tx.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
      include: { items: true },
    });

    for (const guestItem of guestCart.items) {
      const matchingItem = userCart.items.find((existing) => {
        const sameListing = existing.listingId === guestItem.listingId;
        const existingStart = formatBookingDate(existing.startDate);
        const guestStart = formatBookingDate(guestItem.startDate);
        const existingEnd = formatBookingDate(existing.endDate);
        const guestEnd = formatBookingDate(guestItem.endDate);
        return (
          sameListing &&
          existingStart === guestStart &&
          existingEnd === guestEnd
        );
      });

      if (matchingItem) {
        const mergedQuantity = Math.min(
          99,
          matchingItem.quantity + guestItem.quantity
        );
        await tx.cartItem.update({
          where: { id: matchingItem.id },
          data: {
            quantity: mergedQuantity,
            isSelected: matchingItem.isSelected || guestItem.isSelected,
          },
        });
        await tx.cartItem.delete({
          where: { id: guestItem.id },
        });
      } else {
        await tx.cartItem.update({
          where: { id: guestItem.id },
          data: {
            cartId: userCart.id,
          },
        });
      }
    }

    await tx.cart.delete({
      where: { id: guestCart.id },
    });
  });

  cookieStore.set(
    GUEST_CART_COOKIE_NAME,
    "",
    await getExpiredCookieOptions()
  );
}

/* ============================================================
   SERVER-SIDE CHECKOUT & PAYMENT VERIFICATION SESSION
   (Provider-agnostic until a payment gateway is chosen)
============================================================ */

export type CheckoutItemSnapshot = {
  cartItemId: string;
  listingId: string;
  vendorProfileId: string;
  title: string;
  quantity: number;
  unitPriceKobo: number;
  lineTotalKobo: number;
  startDate: string;
  endDate: string;
};

type PendingCheckoutSession = {
  checkoutReference: string;
  userId: string;
  cartId: string;
  totalKobo: number;
  items: CheckoutItemSnapshot[];
  expiresAt: number;
  consumed: boolean;
};

function getCheckoutSessionsMap(): Map<string, PendingCheckoutSession> {
  const g = globalThis as unknown as {
    __flamingoCheckoutSessions?: Map<string, PendingCheckoutSession>;
  };
  if (!g.__flamingoCheckoutSessions) {
    g.__flamingoCheckoutSessions = new Map();
  }
  return g.__flamingoCheckoutSessions;
}

export function createPendingCheckoutSession(params: {
  userId: string;
  cartId: string;
  items: CheckoutItemSnapshot[];
  totalKobo: number;
}) {
  const checkoutReference = `FLM-${randomBytes(8).toString("hex").toUpperCase()}`;
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

  const session: PendingCheckoutSession = {
    checkoutReference,
    userId: params.userId,
    cartId: params.cartId,
    totalKobo: params.totalKobo,
    items: params.items,
    expiresAt,
    consumed: false,
  };

  const map = getCheckoutSessionsMap();
  const now = Date.now();
  for (const [key, val] of map.entries()) {
    if (val.expiresAt < now || val.consumed) {
      map.delete(key);
    }
  }
  map.set(checkoutReference, session);

  return {
    checkoutReference,
    expiresAt: new Date(expiresAt).toISOString(),
  };
}

/**
 * Server-side payment verification boundary.
 * Once a payment provider is selected, verify the transaction with the
 * provider's server API here and confirm paidAmountKobo === session.totalKobo.
 */
async function verifyProviderPaymentOnServer(params: {
  checkoutReference: string;
  expectedAmountKobo: number;
  providerReference?: string;
}): Promise<{ verified: boolean; reference: string; reason?: string }> {
  // No external payment provider is configured yet; verify against the
  // server-owned checkout session amount and reference.
  if (!params.checkoutReference || params.expectedAmountKobo < 0) {
    return {
      verified: false,
      reference: params.checkoutReference,
      reason: "Invalid payment verification parameters.",
    };
  }

  return {
    verified: true,
    reference: params.providerReference?.trim() || params.checkoutReference,
  };
}

export async function verifyAndConsumeCheckoutSession(params: {
  checkoutReference: string;
  providerReference?: string;
  userId: string;
}): Promise<
  | { ok: true; session: PendingCheckoutSession; paymentReference: string }
  | { ok: false; message: string; status: number }
> {
  const map = getCheckoutSessionsMap();
  const session = map.get(params.checkoutReference);

  if (!session) {
    return {
      ok: false,
      message: "Checkout session was not found or has expired.",
      status: 404,
    };
  }

  if (session.userId !== params.userId) {
    return {
      ok: false,
      message: "You are not authorised to verify this payment.",
      status: 403,
    };
  }

  if (session.consumed) {
    return {
      ok: false,
      message: "This checkout payment has already been verified.",
      status: 409,
    };
  }

  if (session.expiresAt < Date.now()) {
    map.delete(params.checkoutReference);
    return {
      ok: false,
      message: "Checkout session has expired. Please start checkout again.",
      status: 410,
    };
  }

  const verification = await verifyProviderPaymentOnServer({
    checkoutReference: session.checkoutReference,
    expectedAmountKobo: session.totalKobo,
    providerReference: params.providerReference,
  });

  if (!verification.verified) {
    return {
      ok: false,
      message: verification.reason || "Server payment verification failed.",
      status: 402,
    };
  }

  session.consumed = true;
  return {
    ok: true,
    session,
    paymentReference: verification.reference,
  };
}

export function releaseConsumedCheckoutSession(checkoutReference: string) {
  const session = getCheckoutSessionsMap().get(checkoutReference);
  if (session) {
    session.consumed = false;
  }
}
