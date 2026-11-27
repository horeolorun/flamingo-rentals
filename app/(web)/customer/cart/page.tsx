"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Calendar,
  CreditCard,
  Edit3,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import BookingDetailsModal from "@/components/customer/BookingDetailsModal";

type CartItem = {
  id: string;
  listing: {
    id: string;
    title: string;
    slug: string;
    category: string;
    priceKobo: number;
    totalQuantity: number;
    pricingUnit: string | null;
    status: "DRAFT" | "ACTIVE" | "INACTIVE";
    isAvailable: boolean;
    vendor: {
      id: string;
      businessName: string | null;
    };
  };
  quantity: number;
  isSelected: boolean;
  startDate: string | null;
  endDate: string | null;
  hasRequiredBookingDetails: boolean;
  availability: {
    available: boolean;
    remainingQuantity: number;
    reason: string | null;
  };
  lineTotalKobo: number;
};

type CartData = {
  id: string;
  items: CartItem[];
  itemCount: number;
  selectedItemCount: number;
  subtotalKobo: number;
  selectedSubtotalKobo: number;
};

type CheckoutSessionData = {
  checkoutReference: string;
  expiresAt: string;
  amountKobo: number;
  currency: string;
  items: {
    cartItemId: string;
    listingId: string;
    title: string;
    quantity: number;
    lineTotalKobo: number;
    startDate: string;
    endDate: string;
  }[];
};

function formatPrice(amountKobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(amountKobo / 100);
}

function formatDate(date: string | null) {
  if (!date) return null;

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));
}

export default function CustomerCartPage() {
  const router = useRouter();

  const [cart, setCart] = useState<CartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<CartItem | null>(null);
  const [checkoutSession, setCheckoutSession] =
    useState<CheckoutSessionData | null>(null);
  const [isStartingCheckout, setIsStartingCheckout] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadCart = useCallback(async () => {
    try {
      const response = await fetch("/api/cart", {
        method: "GET",
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not load your cart.");
      }

      setError("");
      setCart(result.data);
    } catch (err) {
      console.error("Load cart error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading your cart."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    fetch("/api/cart", { method: "GET", cache: "no-store" })
      .then(async (response) => {
        const result = await response.json();
        if (!active) return;
        if (!response.ok) {
          throw new Error(result.message || "Could not load your cart.");
        }
        setCart(result.data);
      })
      .catch((err) => {
        if (!active) return;
        console.error("Load cart error:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading your cart."
        );
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function updateCartItemSelection(itemId: string, isSelected: boolean) {
    setLoadingItemId(itemId);
    setError("");
    setNotice("");

    try {
      const response = await fetch(`/api/cart/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isSelected }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not update cart item.");
      }

      setCart(result.data);
      window.dispatchEvent(new Event("flamingo:cart-updated"));
    } catch (err) {
      console.error("Cart update error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Could not update this cart item."
      );
    } finally {
      setLoadingItemId(null);
    }
  }

  async function removeCartItem(itemId: string) {
    setLoadingItemId(itemId);
    setError("");
    setNotice("");

    try {
      const response = await fetch(`/api/cart/items/${itemId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not remove this item.");
      }

      setConfirmRemoveId(null);
      setCart(result.data);
      window.dispatchEvent(new Event("flamingo:cart-updated"));
    } catch (err) {
      console.error("Remove cart item error:", err);
      setError(
        err instanceof Error ? err.message : "Could not remove this item."
      );
    } finally {
      setLoadingItemId(null);
    }
  }

  async function handleStartCheckout() {
    if (!cart || cart.selectedItemCount === 0) return;

    setError("");
    setNotice("");
    setIsStartingCheckout(true);

    try {
      const response = await fetch("/api/bookings/checkout", {
        method: "POST",
      });

      const result = await response.json();

      if (response.status === 401 && result.requiresAuth) {
        router.push("/auth/login?next=/customer/cart");
        return;
      }

      if (!response.ok) {
        setError(result.message || "Could not start checkout.");
        return;
      }

      setCheckoutSession(result.data);
    } catch (err) {
      console.error("Start checkout error:", err);
      setError("Something went wrong while starting checkout.");
    } finally {
      setIsStartingCheckout(false);
    }
  }

  async function handleVerifyPayment() {
    if (!checkoutSession) return;

    setError("");
    setIsVerifyingPayment(true);

    try {
      const response = await fetch("/api/bookings/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkoutReference: checkoutSession.checkoutReference,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Payment verification failed.");
        setCheckoutSession(null);
        await loadCart();
        return;
      }

      setCheckoutSession(null);
      window.dispatchEvent(new Event("flamingo:cart-updated"));
      router.push("/customer/bookings?confirmed=1");
    } catch (err) {
      console.error("Verify payment error:", err);
      setError("Could not complete server payment verification.");
    } finally {
      setIsVerifyingPayment(false);
    }
  }

  const selectedItems = cart?.items.filter((item) => item.isSelected) ?? [];

  const hasUnavailableSelectedItem = selectedItems.some(
    (item) =>
      item.listing.status !== "ACTIVE" ||
      !item.listing.isAvailable ||
      (item.hasRequiredBookingDetails && !item.availability.available)
  );

  const hasIncompleteSelectedItem = selectedItems.some(
    (item) => !item.hasRequiredBookingDetails
  );

  const allSelected =
    !!cart &&
    cart.items.length > 0 &&
    cart.items.every((item) => item.isSelected);

  function toggleAllItems() {
    if (!cart) return;

    const nextSelection = !allSelected;

    void (async () => {
      setError("");
      setNotice("");

      for (const item of cart.items) {
        if (item.isSelected !== nextSelection) {
          await updateCartItemSelection(item.id, nextSelection);
        }
      }
    })();
  }

  if (isLoading) {
    return (
      <main className="min-h-[70vh] bg-[#FFF9FB] px-4 py-12">
        <div className="mx-auto max-w-6xl animate-pulse space-y-6">
          <div className="h-8 w-48 rounded-lg bg-gray-200" />
          <div className="h-48 rounded-2xl bg-gray-200" />
          <div className="h-48 rounded-2xl bg-gray-200" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[70vh] bg-[#FFF9FB] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* PAGE HEADING */}
        <div className="mb-8">
          <Link
            href="/"
            className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-primary"
          >
            <span aria-hidden="true">←</span>
            Continue exploring
          </Link>

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Your Cart
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                Complete booking dates and quantity for each item before
                proceeding to payment.
              </p>
            </div>

            <div className="rounded-xl border border-[#F0E3E9] bg-white px-4 py-2 text-sm font-semibold text-gray-600">
              {cart?.itemCount ?? 0}{" "}
              {(cart?.itemCount ?? 0) === 1 ? "unit" : "units"} in cart
            </div>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
            <button
              type="button"
              onClick={() => setError("")}
              className="ml-3 font-bold underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* NOTICE */}
        {notice && (
          <div
            role="status"
            className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
          >
            {notice}
          </div>
        )}

        {/* EMPTY CART */}
        {!cart || cart.items.length === 0 ? (
          <div className="rounded-3xl border border-[#F0E3E9] bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#FFF0F5] text-4xl">
              🛒
            </div>

            <h2 className="mt-6 text-xl font-bold text-gray-900">
              Your cart is empty
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              You have not added any rentals or services yet. Explore our
              vendors to find what you need for your event.
            </p>

            <Link
              href="/customer/vendors"
              className="mt-7 inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark"
            >
              Explore Vendors
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            {/* CART ITEMS */}
            <section className="space-y-4">
              {/* SELECT ALL */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#F0E3E9] bg-white px-5 py-4 shadow-sm">
                <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-gray-800">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAllItems}
                    disabled={loadingItemId !== null}
                    className="h-4 w-4 accent-[#B60152]"
                  />
                  Select all items
                </label>

                <span className="text-xs text-gray-500">
                  {cart.selectedItemCount} of {cart.itemCount} units selected
                </span>
              </div>

              {/* INDIVIDUAL ITEMS */}
              {cart.items.map((item) => {
                const isUnavailable =
                  item.listing.status !== "ACTIVE" ||
                  !item.listing.isAvailable ||
                  (item.hasRequiredBookingDetails &&
                    !item.availability.available);

                const isUpdating = loadingItemId === item.id;

                return (
                  <article
                    key={item.id}
                    className={`rounded-2xl border border-[#F0E3E9] bg-white p-5 shadow-sm transition ${
                      !item.isSelected ? "opacity-75" : ""
                    }`}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={item.isSelected}
                          onChange={(event) =>
                            updateCartItemSelection(
                              item.id,
                              event.target.checked
                            )
                          }
                          disabled={isUpdating || loadingItemId !== null}
                          aria-label={`Select ${item.listing.title}`}
                          className="mt-2 h-4 w-4 shrink-0 accent-[#B60152]"
                        />

                        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-[#FFF0F5] text-3xl sm:hidden">
                          🛍️
                        </div>
                      </div>

                      <div className="hidden h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-[#FFF0F5] text-3xl sm:flex">
                        🛍️
                      </div>

                      {/* ITEM DETAILS */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                              {item.listing.category}
                            </p>

                            <h3 className="mt-1 text-lg font-bold text-gray-900">
                              {item.listing.title}
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                              Vendor:{" "}
                              {item.listing.vendor.businessName || "Vendor"}
                            </p>
                          </div>

                          <div className="text-left sm:text-right">
                            <p className="text-lg font-bold text-gray-900">
                              {formatPrice(item.lineTotalKobo)}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              {formatPrice(item.listing.priceKobo)}{" "}
                              {item.listing.pricingUnit
                                ? `/ ${item.listing.pricingUnit}`
                                : "per unit"}{" "}
                              × {item.quantity}
                            </p>
                          </div>
                        </div>

                        {/* BOOKING DETAILS STATUS */}
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#FFF6F9] px-3 py-1.5 text-xs font-semibold text-[#29232A]">
                            Qty: {item.quantity}
                          </span>

                          {item.hasRequiredBookingDetails ? (
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#FCEBF2] px-3 py-1.5 text-xs font-semibold text-[#B60152]">
                              <Calendar className="h-3.5 w-3.5" />
                              {formatDate(item.startDate)} –{" "}
                              {formatDate(item.endDate)}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800">
                              <AlertCircle className="h-3.5 w-3.5" />
                              Booking dates required before checkout
                            </span>
                          )}
                        </div>

                        {isUnavailable && (
                          <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-red-600">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            {item.availability.reason ||
                              "This listing is currently unavailable and cannot be checked out."}
                          </p>
                        )}

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#F0E3E9] pt-3.5">
                          <button
                            type="button"
                            onClick={() => setEditingItem(item)}
                            disabled={isUpdating || loadingItemId !== null}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-[#EAC6D5] bg-[#FFF9FB] px-3.5 py-2 text-xs font-semibold text-[#B60152] transition hover:bg-[#FCEBF2] disabled:opacity-40"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            {item.hasRequiredBookingDetails
                              ? "Edit booking details"
                              : "Add booking dates & quantity"}
                          </button>

                          {confirmRemoveId === item.id ? (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => removeCartItem(item.id)}
                                disabled={isUpdating}
                                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                              >
                                {isUpdating ? "Removing..." : "Confirm remove"}
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmRemoveId(null)}
                                className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                              >
                                Keep
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmRemoveId(item.id)}
                              disabled={loadingItemId !== null}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 transition hover:text-red-600 disabled:opacity-40"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>

            {/* ORDER SUMMARY */}
            <aside className="h-fit rounded-2xl border border-[#F0E3E9] bg-white p-6 shadow-sm lg:sticky lg:top-28">
              <h2 className="text-lg font-bold text-gray-900">
                Order Summary
              </h2>

              <div className="mt-6 space-y-4 text-sm">
                <div className="flex justify-between gap-3 text-gray-500">
                  <span>Total units in cart</span>
                  <span className="font-semibold text-gray-800">
                    {cart.itemCount}
                  </span>
                </div>

                <div className="flex justify-between gap-3 text-gray-500">
                  <span>Selected units</span>
                  <span className="font-semibold text-gray-800">
                    {cart.selectedItemCount}
                  </span>
                </div>

                <div className="flex justify-between gap-3 text-gray-500">
                  <span>Selected subtotal</span>
                  <span className="font-semibold text-gray-800">
                    {formatPrice(cart.selectedSubtotalKobo)}
                  </span>
                </div>

                <div className="border-t border-dashed border-gray-200 pt-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-bold text-gray-900">
                      Total due at checkout
                    </span>
                    <span className="text-xl font-bold text-primary">
                      {formatPrice(cart.selectedSubtotalKobo)}
                    </span>
                  </div>

                  <p className="mt-2 text-xs leading-5 text-gray-400">
                    Availability is rechecked at checkout and upon server-side
                    payment verification before your booking is confirmed.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleStartCheckout}
                disabled={
                  cart.selectedItemCount === 0 ||
                  hasUnavailableSelectedItem ||
                  hasIncompleteSelectedItem ||
                  loadingItemId !== null ||
                  isStartingCheckout
                }
                className="mt-7 w-full rounded-xl bg-primary px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {isStartingCheckout
                  ? "Checking availability..."
                  : hasUnavailableSelectedItem
                    ? "Resolve unavailable items to continue"
                    : hasIncompleteSelectedItem
                      ? "Add booking dates to continue"
                      : cart.selectedItemCount === 0
                        ? "Select items to continue"
                        : "Proceed to Checkout"}
              </button>

              <p className="mt-4 text-center text-xs leading-5 text-gray-400">
                Bookings are confirmed automatically once payment is verified.
              </p>
            </aside>
          </div>
        )}
      </div>

      {/* EDIT BOOKING DETAILS MODAL */}
      {editingItem && (
        <BookingDetailsModal
          isOpen={Boolean(editingItem)}
          mode="edit"
          cartItemId={editingItem.id}
          listingId={editingItem.listing.id}
          listingTitle={editingItem.listing.title}
          priceKobo={editingItem.listing.priceKobo}
          pricingUnit={editingItem.listing.pricingUnit}
          totalQuantity={editingItem.listing.totalQuantity}
          initialStartDate={editingItem.startDate}
          initialEndDate={editingItem.endDate}
          initialQuantity={editingItem.quantity}
          onClose={() => setEditingItem(null)}
          onCompleted={(msg) => {
            setNotice(msg);
            void loadCart();
          }}
        />
      )}

      {/* CHECKOUT & SERVER PAYMENT VERIFICATION MODAL */}
      {checkoutSession && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#29232A]/50 px-4 py-6 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="checkout-verify-title"
        >
          <div className="w-full max-w-lg rounded-3xl border border-[#F0E3E9] bg-white p-6 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#B60152]">
                  Checkout Confirmation
                </p>
                <h2
                  id="checkout-verify-title"
                  className="mt-1 text-xl font-bold text-[#29232A]"
                >
                  Complete & verify payment
                </h2>
                <p className="mt-1 text-xs text-[#737373]">
                  Reference: {checkoutSession.checkoutReference}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setCheckoutSession(null)}
                disabled={isVerifyingPayment}
                aria-label="Close checkout"
                className="rounded-xl p-2 text-gray-400 transition hover:bg-[#FFF6F9] hover:text-[#29232A]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 space-y-3 rounded-2xl border border-[#F0E3E9] bg-[#FFF9FB] p-4">
              {checkoutSession.items.map((item) => (
                <div
                  key={item.cartItemId}
                  className="flex items-start justify-between gap-3 text-sm"
                >
                  <div>
                    <p className="font-semibold text-[#29232A]">
                      {item.title} × {item.quantity}
                    </p>
                    <p className="text-xs text-[#737373]">
                      {formatDate(item.startDate)} – {formatDate(item.endDate)}
                    </p>
                  </div>
                  <p className="font-semibold text-[#29232A]">
                    {formatPrice(item.lineTotalKobo)}
                  </p>
                </div>
              ))}

              <div className="flex items-center justify-between border-t border-dashed border-[#EAC6D5] pt-3">
                <span className="text-sm font-bold text-[#29232A]">
                  Total to pay
                </span>
                <span className="text-xl font-bold text-[#B60152]">
                  {formatPrice(checkoutSession.amountKobo)}
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-green-50 px-4 py-3 text-xs leading-5 text-green-800">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-green-700" />
              <span>
                No external payment gateway is connected yet. Confirming will
                run server-side payment verification, recheck live inventory,
                and confirm your bookings as paid.
              </span>
            </div>

            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setCheckoutSession(null)}
                disabled={isVerifyingPayment}
                className="rounded-xl border border-[#F0E3E9] px-5 py-2.5 text-sm font-semibold text-[#737373] transition hover:bg-[#FFF9FB]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleVerifyPayment}
                disabled={isVerifyingPayment}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#B60152] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#C40032] disabled:opacity-50"
              >
                <CreditCard className="h-4 w-4" />
                {isVerifyingPayment
                  ? "Verifying payment..."
                  : "Pay & Confirm Booking"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
