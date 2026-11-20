
"use client";

import { useState } from "react";
import Link from "next/link";

type Listing = {
  id: string;
  title: string;
  category: string;
  description: string | null;
  priceKobo: number;
  pricingUnit: string | null;
};

type Props = {
  listings: Listing[];
};

function formatNaira(priceKobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(priceKobo / 100);
}

export default function BundleForm({ listings }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedCount = Object.values(selected).filter(Boolean).length;

  function toggleListing(listingId: string) {
    setSelected((previous) => ({
      ...previous,
      [listingId]: !previous[listingId],
    }));

    setError("");
    setSuccess("");
  }

  function updateQuantity(listingId: string, value: string) {
    const quantity = Number(value);

    setQuantities((previous) => ({
      ...previous,
      [listingId]:
        Number.isInteger(quantity) && quantity >= 1
          ? quantity
          : 1,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!title.trim()) {
      setError("Please enter a bundle name.");
      return;
    }

    const selectedItems = listings
      .filter((listing) => selected[listing.id])
      .map((listing) => ({
        listingId: listing.id,
        quantity: quantities[listing.id] || 1,
      }));

    if (selectedItems.length === 0) {
      setError("Please select at least one listing.");
      return;
    }

    const priceNumber = Number(price);

    if (
      !Number.isFinite(priceNumber) ||
      priceNumber <= 0 ||
      !Number.isSafeInteger(Math.round(priceNumber * 100))
    ) {
      setError("Please enter a valid bundle price.");
      return;
    }

    const priceKobo = Math.round(priceNumber * 100);

    setLoading(true);

    try {
      const response = await fetch("/api/vendor/bundles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          priceKobo,
          items: selectedItems,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Could not create your bundle."
        );
      }

      setSuccess(
        `Your bundle "${result.data.title}" has been created successfully as a draft.`
      );

      setTitle("");
      setDescription("");
      setPrice("");
      setSelected({});
      setQuantities({});
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* BUNDLE DETAILS */}
      <section className="rounded-3xl border border-[#F0E3E9] bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-xl font-bold text-[#29232A]">
          1. Bundle Details
        </h2>

        <p className="mt-2 text-sm text-[#737373]">
          Give your package a name and explain what customers
          will receive.
        </p>

        <div className="mt-6 space-y-5">
          <div>
            <label
              htmlFor="bundle-title"
              className="mb-2 block text-sm font-semibold text-[#29232A]"
            >
              Bundle Name
            </label>

            <input
              id="bundle-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Complete Photography Package"
              maxLength={100}
              required
              className="w-full rounded-xl border border-[#EAC6D5] bg-white px-4 py-3 text-[#29232A] outline-none transition focus:border-[#B60152] focus:ring-2 focus:ring-[#B60152]/10"
            />
          </div>

          <div>
            <label
              htmlFor="bundle-description"
              className="mb-2 block text-sm font-semibold text-[#29232A]"
            >
              Description
            </label>

            <textarea
              id="bundle-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe what is included in this package..."
              rows={4}
              maxLength={1000}
              className="w-full resize-y rounded-xl border border-[#EAC6D5] bg-white px-4 py-3 text-[#29232A] outline-none transition focus:border-[#B60152] focus:ring-2 focus:ring-[#B60152]/10"
            />
          </div>
        </div>
      </section>

      {/* LISTING SELECTION */}
      <section className="rounded-3xl border border-[#F0E3E9] bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-bold text-[#29232A]">
              2. Select Bundle Items
            </h2>

            <p className="mt-2 text-sm text-[#737373]">
              Choose the listings you want to include.
            </p>
          </div>

          <span className="w-fit rounded-full bg-[#FCEBF2] px-4 py-2 text-sm font-semibold text-[#B60152]">
            {selectedCount} selected
          </span>
        </div>

        {listings.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-[#EAC6D5] bg-[#FFF9FB] p-8 text-center">
            <h3 className="font-bold text-[#29232A]">
              No eligible listings found
            </h3>

            <p className="mt-2 text-sm text-[#737373]">
              You need published and available listings before
              you can create a bundle.
            </p>

            <Link
              href="/vendor/listings"
              className="mt-5 inline-flex rounded-xl bg-[#B60152] px-5 py-3 text-sm font-semibold text-white hover:bg-[#C40032]"
            >
              Manage My Listings
            </Link>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className={`rounded-2xl border p-5 transition ${
                  selected[listing.id]
                    ? "border-[#B60152] bg-[#FFF9FB]"
                    : "border-[#F0E3E9] bg-white"
                }`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={Boolean(selected[listing.id])}
                      onChange={() => toggleListing(listing.id)}
                      className="mt-1 h-5 w-5 accent-[#B60152]"
                    />

                    <span>
                      <span className="block text-xs font-semibold uppercase tracking-wide text-[#B60152]">
                        {listing.category}
                      </span>

                      <span className="mt-1 block font-bold text-[#29232A]">
                        {listing.title}
                      </span>

                      {listing.description && (
                        <span className="mt-1 block text-sm text-[#737373]">
                          {listing.description}
                        </span>
                      )}

                      <span className="mt-2 block text-sm font-semibold text-[#29232A]">
                        {formatNaira(listing.priceKobo)}
                        {listing.pricingUnit
                          ? ` / ${listing.pricingUnit}`
                          : ""}
                      </span>
                    </span>
                  </label>

                  {selected[listing.id] && (
                    <div className="sm:w-32">
                      <label
                        htmlFor={`quantity-${listing.id}`}
                        className="mb-2 block text-sm font-semibold text-[#29232A]"
                      >
                        Quantity
                      </label>

                      <input
                        id={`quantity-${listing.id}`}
                        type="number"
                        min={1}
                        max={100}
                        step={1}
                        value={quantities[listing.id] || 1}
                        onChange={(event) =>
                          updateQuantity(listing.id, event.target.value)
                        }
                        className="w-full rounded-xl border border-[#EAC6D5] px-3 py-2 text-[#29232A] outline-none focus:border-[#B60152]"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* PACKAGE PRICE */}
      <section className="rounded-3xl border border-[#F0E3E9] bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-xl font-bold text-[#29232A]">
          3. Set Your Bundle Price
        </h2>

        <p className="mt-2 text-sm leading-6 text-[#737373]">
          This is the fixed price customers will pay for the
          entire package. It does not have to equal the combined
          prices of the individual listings.
        </p>

        <div className="mt-6 max-w-md">
          <label
            htmlFor="bundle-price"
            className="mb-2 block text-sm font-semibold text-[#29232A]"
          >
            Bundle Price (₦)
          </label>

          <div className="flex overflow-hidden rounded-xl border border-[#EAC6D5] focus-within:border-[#B60152]">
            <span className="flex items-center border-r border-[#EAC6D5] bg-[#FFF9FB] px-4 font-semibold text-[#737373]">
              ₦
            </span>

            <input
              id="bundle-price"
              type="number"
              min="0.01"
              step="0.01"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              placeholder="150000"
              required
              className="w-full px-4 py-3 text-[#29232A] outline-none"
            />
          </div>
        </div>
      </section>

      {/* FEEDBACK */}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700"
        >
          {success}
          <p className="mt-2">
            You can manage your listings while we build the bundle
            management page.
          </p>
        </div>
      )}

      {/* ACTIONS */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Link
          href="/vendor/listings"
          className="inline-flex items-center justify-center rounded-xl border border-[#EAC6D5] bg-white px-6 py-3 font-semibold text-[#29232A] transition hover:bg-[#FFF9FB]"
        >
          Cancel
        </Link>

        <button
          type="submit"
          disabled={loading || listings.length === 0}
          className="rounded-xl bg-[#B60152] px-7 py-3 font-semibold text-white shadow-sm transition hover:bg-[#C40032] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Creating Bundle..." : "Create Bundle"}
        </button>
      </div>
    </form>
  );
}
