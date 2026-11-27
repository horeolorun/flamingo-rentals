"use client";

import { FormEvent, useEffect, useState } from "react";
import { Calendar, CheckCircle2, AlertCircle, X } from "lucide-react";

export type BookingDetailsModalProps = {
  isOpen: boolean;
  mode: "add" | "edit";
  listingId: string;
  listingTitle: string;
  priceKobo: number;
  pricingUnit: string | null;
  totalQuantity: number;
  initialStartDate?: string | null;
  initialEndDate?: string | null;
  initialQuantity?: number;
  cartItemId?: string;
  onClose: () => void;
  onCompleted: (message: string) => void;
};

type AvailabilityState = {
  key: string;
  available: boolean | null;
  remainingQuantity: number | null;
  reason: string | null;
};

function formatNaira(amountKobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amountKobo / 100);
}

function toInputDate(value?: string | null): string {
  if (!value) return "";
  return String(value).slice(0, 10);
}

function BookingDetailsModalInner({
  mode,
  listingId,
  listingTitle,
  priceKobo,
  pricingUnit,
  totalQuantity,
  initialStartDate,
  initialEndDate,
  initialQuantity = 1,
  cartItemId,
  onClose,
  onCompleted,
}: Omit<BookingDetailsModalProps, "isOpen">) {
  const [startDate, setStartDate] = useState(() => toInputDate(initialStartDate));
  const [endDate, setEndDate] = useState(() => toInputDate(initialEndDate));
  const [quantity, setQuantity] = useState<number>(() =>
    Math.max(1, initialQuantity || 1)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [availability, setAvailability] = useState<AvailabilityState | null>(
    null
  );

  const hasBothDates = Boolean(startDate && endDate);
  const hasInvalidOrder = hasBothDates && endDate < startDate;
  const activeQueryKey =
    hasBothDates && !hasInvalidOrder
      ? `${listingId}:${startDate}:${endDate}:${quantity}`
      : "";

  useEffect(() => {
    if (!activeQueryKey) return;

    let cancelled = false;
    const controller = new AbortController();

    const params = new URLSearchParams({
      listingId,
      startDate,
      endDate,
      quantity: String(quantity),
    });

    fetch(`/api/availability/check?${params.toString()}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        const json = await response.json();
        if (cancelled) return;

        if (!response.ok) {
          setAvailability({
            key: activeQueryKey,
            available: false,
            remainingQuantity: 0,
            reason: json.message || "Could not verify availability.",
          });
          return;
        }

        setAvailability({
          key: activeQueryKey,
          available: json.data.available,
          remainingQuantity: json.data.remainingQuantity,
          reason: json.data.reason,
        });
      })
      .catch((err) => {
        if (cancelled || (err instanceof Error && err.name === "AbortError")) {
          return;
        }
        setAvailability({
          key: activeQueryKey,
          available: null,
          remainingQuantity: null,
          reason: "Unable to verify availability right now.",
        });
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [activeQueryKey, listingId, startDate, endDate, quantity]);

  const todayIso = new Date().toISOString().slice(0, 10);
  const maxStock = Math.min(99, Math.max(1, totalQuantity || 1));
  const estimatedTotal = priceKobo * quantity;
  const isCheckingAvailability =
    Boolean(activeQueryKey) && availability?.key !== activeQueryKey;
  const currentAvailability =
    availability?.key === activeQueryKey ? availability : null;

  async function handleSaveWithDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!startDate || !endDate) {
      setError("Please select both a start date and an end date.");
      return;
    }

    if (endDate < startDate) {
      setError("End date cannot be before the start date.");
      return;
    }

    if (quantity < 1 || quantity > maxStock) {
      setError(`Quantity must be between 1 and ${maxStock}.`);
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "add") {
        const response = await fetch("/api/cart/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            listingId,
            quantity,
            startDate,
            endDate,
          }),
        });
        const result = await response.json();

        if (!response.ok) {
          setError(result.message || "Could not add this item to your cart.");
          return;
        }

        window.dispatchEvent(new Event("flamingo:cart-updated"));
        onCompleted("Item added to your booking cart.");
        onClose();
      } else {
        if (!cartItemId) {
          setError("Cart item identifier is missing.");
          return;
        }

        const response = await fetch(`/api/cart/items/${cartItemId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quantity,
            startDate,
            endDate,
          }),
        });
        const result = await response.json();

        if (!response.ok) {
          setError(result.message || "Could not update booking details.");
          return;
        }

        window.dispatchEvent(new Event("flamingo:cart-updated"));
        onCompleted("Booking details updated.");
        onClose();
      }
    } catch (err) {
      console.error("Save booking details error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAddWithoutDates() {
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          quantity: Math.min(maxStock, Math.max(1, quantity)),
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Could not add this item to your cart.");
        return;
      }

      window.dispatchEvent(new Event("flamingo:cart-updated"));
      onCompleted(
        "Added to cart. Remember to add booking dates before checkout."
      );
      onClose();
    } catch (err) {
      console.error("Add without dates error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#29232A]/50 px-4 py-6 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-details-title"
    >
      <div className="w-full max-w-lg rounded-3xl border border-[#F0E3E9] bg-white p-6 shadow-2xl sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#B60152]">
              {mode === "add" ? "Booking Details" : "Edit Booking Details"}
            </p>
            <h2
              id="booking-details-title"
              className="mt-1 text-xl font-bold text-[#29232A]"
            >
              {listingTitle}
            </h2>
            <p className="mt-1 text-sm text-[#737373]">
              {formatNaira(priceKobo)}
              {pricingUnit ? ` per ${pricingUnit}` : ""} • {maxStock} total{" "}
              {maxStock === 1 ? "unit" : "units"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close booking details"
            className="rounded-xl p-2 text-gray-400 transition hover:bg-[#FFF6F9] hover:text-[#29232A]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSaveWithDetails} className="mt-6 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="booking-start-date"
                className="flex items-center gap-1.5 text-sm font-semibold text-[#29232A]"
              >
                <Calendar className="h-4 w-4 text-[#B60152]" />
                Event start date
              </label>
              <input
                id="booking-start-date"
                type="date"
                min={todayIso}
                value={startDate}
                onChange={(e) => {
                  const next = e.target.value;
                  setStartDate(next);
                  if (!endDate || endDate < next) {
                    setEndDate(next);
                  }
                }}
                className="mt-2 w-full rounded-xl border border-[#F0E3E9] bg-white px-3.5 py-2.5 text-sm text-[#29232A] outline-none focus:border-[#B60152]"
              />
            </div>

            <div>
              <label
                htmlFor="booking-end-date"
                className="flex items-center gap-1.5 text-sm font-semibold text-[#29232A]"
              >
                <Calendar className="h-4 w-4 text-[#B60152]" />
                Event end date
              </label>
              <input
                id="booking-end-date"
                type="date"
                min={startDate || todayIso}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-2 w-full rounded-xl border border-[#F0E3E9] bg-white px-3.5 py-2.5 text-sm text-[#29232A] outline-none focus:border-[#B60152]"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="booking-quantity"
              className="block text-sm font-semibold text-[#29232A]"
            >
              Quantity
            </label>
            <input
              id="booking-quantity"
              type="number"
              min={1}
              max={maxStock}
              value={quantity}
              onChange={(e) => {
                const parsed = Number.parseInt(e.target.value, 10);
                setQuantity(
                  Number.isNaN(parsed)
                    ? 1
                    : Math.min(maxStock, Math.max(1, parsed))
                );
              }}
              className="mt-2 w-full rounded-xl border border-[#F0E3E9] bg-white px-3.5 py-2.5 text-sm text-[#29232A] outline-none focus:border-[#B60152]"
            />
          </div>

          {/* LIVE AVAILABILITY FEEDBACK */}
          {hasInvalidOrder ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <div className="flex items-center gap-2 font-medium">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                <span>End date cannot be before the start date.</span>
              </div>
            </div>
          ) : hasBothDates ? (
            <div
              className={`rounded-2xl border px-4 py-3 text-sm ${
                isCheckingAvailability
                  ? "border-[#F0E3E9] bg-[#FFF9FB] text-[#737373]"
                  : currentAvailability?.available
                    ? "border-green-200 bg-green-50 text-green-800"
                    : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {isCheckingAvailability ? (
                <span>Checking availability for selected dates...</span>
              ) : currentAvailability?.available ? (
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-green-700" />
                  <span>
                    Available ({currentAvailability.remainingQuantity} of{" "}
                    {maxStock} {maxStock === 1 ? "unit" : "units"} free on
                    these dates)
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 font-medium">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                  <span>
                    {currentAvailability?.reason ||
                      "Unavailable for the selected dates."}
                  </span>
                </div>
              )}
            </div>
          ) : null}

          {/* ESTIMATE */}
          <div className="flex items-center justify-between rounded-2xl bg-[#FFF6F9] px-4 py-3.5">
            <span className="text-sm font-medium text-[#737373]">
              Estimated item total
            </span>
            <span className="text-lg font-bold text-[#B60152]">
              {formatNaira(estimatedTotal)}
            </span>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <div className="space-y-2.5 pt-1">
            <button
              type="submit"
              disabled={
                isSubmitting ||
                isCheckingAvailability ||
                hasInvalidOrder ||
                (hasBothDates && currentAvailability?.available === false)
              }
              className="w-full rounded-xl bg-[#B60152] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#C40032] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting
                ? "Saving..."
                : mode === "add"
                  ? "Save details & add to cart"
                  : "Save booking details"}
            </button>

            {mode === "add" && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleAddWithoutDates}
                className="w-full rounded-xl border border-[#F0E3E9] bg-white px-5 py-2.5 text-sm font-semibold text-[#737373] transition hover:border-[#B60152]/30 hover:text-[#29232A] disabled:opacity-50"
              >
                Add to cart without dates for now
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default function BookingDetailsModal(props: BookingDetailsModalProps) {
  if (!props.isOpen) return null;

  return (
    <BookingDetailsModalInner
      key={`${props.mode}:${props.listingId}:${props.cartItemId ?? "new"}`}
      mode={props.mode}
      listingId={props.listingId}
      listingTitle={props.listingTitle}
      priceKobo={props.priceKobo}
      pricingUnit={props.pricingUnit}
      totalQuantity={props.totalQuantity}
      initialStartDate={props.initialStartDate}
      initialEndDate={props.initialEndDate}
      initialQuantity={props.initialQuantity}
      cartItemId={props.cartItemId}
      onClose={props.onClose}
      onCompleted={props.onCompleted}
    />
  );
}
