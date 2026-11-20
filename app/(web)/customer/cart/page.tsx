
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type CartItem = {
  id: string;
  listing: {
    id: string;
    title: string;
    slug: string;
    category: string;
    priceKobo: number;
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
  }).format(new Date(date));
}

export default function CustomerCartPage() {
  const [cart, setCart] = useState<CartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadCart = useCallback(async () => {
    setError("");

    try {
      const response = await fetch("/api/cart", {
        method: "GET",
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not load your cart.");
      }

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
    loadCart();
  }, [loadCart]);

  async function updateCartItem(
    itemId: string,
    changes: { quantity?: number; isSelected?: boolean }
  ) {
    setLoadingItemId(itemId);
    setError("");
    setNotice("");

    try {
      const response = await fetch(`/api/cart/items/${itemId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(changes),
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
    const confirmed = window.confirm(
      "Are you sure you want to remove this item from your cart?"
    );

    if (!confirmed) return;

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

      setCart(result.data);

      window.dispatchEvent(new Event("flamingo:cart-updated"));
    } catch (err) {
      console.error("Remove cart item error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Could not remove this item."
      );
    } finally {
      setLoadingItemId(null);
    }
  }

  function handleCheckout() {
    if (!cart || cart.selectedItemCount === 0) return;

    setNotice(
      "Your selected items are ready. The booking and payment checkout process has not been connected yet."
    );
  }

  const selectedItems = cart?.items.filter(
    (item) => item.isSelected
  ) ?? [];

  const hasUnavailableSelectedItem = selectedItems.some(
    (item) =>
      item.listing.status !== "ACTIVE" ||
      !item.listing.isAvailable
  );

  const allSelected =
    !!cart &&
    cart.items.length > 0 &&
    cart.items.every((item) => item.isSelected);

  function toggleAllItems() {
    if (!cart) return;

    const nextSelection = !allSelected;

    // Update each item through the API so the selection persists.
    // Process sequentially to avoid overlapping updates to the same cart.
    void (async () => {
      setError("");
      setNotice("");

      for (const item of cart.items) {
        if (item.isSelected !== nextSelection) {
          await updateCartItem(item.id, {
            isSelected: nextSelection,
          });
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
                Review your selected rentals and services before checkout.
              </p>
            </div>

            <div className="rounded-xl border border-[#F0E3E9] bg-white px-4 py-2 text-sm font-semibold text-gray-600">
              {cart?.itemCount ?? 0}{" "}
              {(cart?.itemCount ?? 0) === 1 ? "item" : "items"} in cart
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
            className="mb-6 rounded-xl border border-[#EAC6D5] bg-white px-4 py-3 text-sm text-gray-700"
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
              You haven't added any rentals or services yet. Explore our
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
          <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
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
                  !item.listing.isAvailable;

                const isUpdating = loadingItemId === item.id;

                return (
                  <article
                    key={item.id}
                    className={`rounded-2xl border border-[#F0E3E9] bg-white p-5 shadow-sm transition ${
                      !item.isSelected ? "opacity-75" : ""
                    }`}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row">
                      {/* CHECKBOX */}
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={item.isSelected}
                          onChange={(event) =>
                            updateCartItem(item.id, {
                              isSelected: event.target.checked,
                            })
                          }
                          disabled={isUpdating || loadingItemId !== null}
                          aria-label={`Select ${item.listing.title}`}
                          className="mt-2 h-4 w-4 shrink-0 accent-[#B60152]"
                        />

                        {/* IMAGE PLACEHOLDER */}
                        <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-xl bg-[#FFF0F5] text-4xl sm:hidden">
                          🛍️
                        </div>
                      </div>

                      <div className="hidden h-28 w-28 shrink-0 items-center justify-center rounded-xl bg-[#FFF0F5] text-4xl sm:flex">
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
                              {item.listing.vendor.businessName ||
                                "Vendor"}
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
                                : "per unit"}
                            </p>
                          </div>
                        </div>

                        {item.startDate && item.endDate && (
                          <p className="mt-3 text-xs text-gray-500">
                            Rental period: {formatDate(item.startDate)} –{" "}
                            {formatDate(item.endDate)}
                          </p>
                        )}

                        {isUnavailable && (
                          <p className="mt-3 text-xs font-semibold text-red-600">
                            This listing is currently unavailable. It cannot
                            be checked out.
                          </p>
                        )}

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                          {/* QUANTITY */}
                          <div className="flex items-center rounded-xl border border-gray-200">
                            <button
                              type="button"
                              onClick={() =>
                                updateCartItem(item.id, {
                                  quantity: item.quantity - 1,
                                })
                              }
                              disabled={
                                isUpdating ||
                                loadingItemId !== null ||
                                item.quantity <= 1
                              }
                              aria-label="Decrease quantity"
                              className="h-9 w-9 text-lg font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-30"
                            >
                              −
                            </button>

                            <span className="min-w-10 text-center text-sm font-semibold text-gray-900">
                              {item.quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                updateCartItem(item.id, {
                                  quantity: item.quantity + 1,
                                })
                              }
                              disabled={
                                isUpdating ||
                                loadingItemId !== null ||
                                item.quantity >= 99
                              }
                              aria-label="Increase quantity"
                              className="h-9 w-9 text-lg font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-30"
                            >
                              +
                            </button>
                          </div>

                          {/* REMOVE */}
                          <button
                            type="button"
                            onClick={() => removeCartItem(item.id)}
                            disabled={loadingItemId !== null}
                            className="text-sm font-semibold text-gray-500 transition hover:text-red-600 disabled:opacity-40"
                          >
                            {isUpdating ? "Updating..." : "Remove"}
                          </button>
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
                  <span>Total items in cart</span>
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
                      Estimated total
                    </span>
                    <span className="text-xl font-bold text-primary">
                      {formatPrice(cart.selectedSubtotalKobo)}
                    </span>
                  </div>

                  <p className="mt-2 text-xs leading-5 text-gray-400">
                    Final booking costs may change depending on rental dates,
                    vendor approval, delivery and other applicable charges.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCheckout}
                disabled={
                  cart.selectedItemCount === 0 ||
                  hasUnavailableSelectedItem ||
                  loadingItemId !== null
                }
                className="mt-7 w-full rounded-xl bg-primary px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {hasUnavailableSelectedItem
                  ? "Remove unavailable items to continue"
                  : cart.selectedItemCount === 0
                    ? "Select items to continue"
                    : "Proceed to Checkout"}
              </button>

              <p className="mt-4 text-center text-xs leading-5 text-gray-400">
                You will review your booking details before confirming.
              </p>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
