"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, CheckCircle2, X, XCircle } from "lucide-react";

type VendorBooking = {
  id: string;
  startDate: string;
  endDate: string;
  quantity: number;
  totalPriceKobo: number;
  status: string;
  cancellationReason: string | null;
  cancelledBy: string | null;
  cancelledAt: string | null;
  refundStatus: string;
  refundAmountKobo: number | null;
  createdAt: string;
  listing: {
    id: string;
    title: string;
    category: string;
    pricingUnit: string | null;
  };
  customer: {
    id: string;
    fullName: string;
    email: string | null;
    phone: string | null;
  };
};

function formatNaira(amountKobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amountKobo / 100);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));
}

export default function VendorBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<VendorBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelTarget, setCancelTarget] = useState<VendorBooking | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelError, setCancelError] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  const loadBookings = useCallback(async () => {
    try {
      const response = await fetch("/api/bookings", {
        cache: "no-store",
      });

      if (response.status === 401) {
        router.replace("/auth/login");
        return;
      }

      if (response.status === 403) {
        router.replace("/customer/account");
        return;
      }

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Could not load bookings.");
      }

      setError("");
      setBookings(result.data ?? []);
    } catch (err) {
      console.error("Load vendor bookings error:", err);
      setError(
        err instanceof Error ? err.message : "Could not load bookings."
      );
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    let active = true;

    fetch("/api/bookings", { cache: "no-store" })
      .then(async (response) => {
        if (!active) return;
        if (response.status === 401) {
          router.replace("/auth/login");
          return;
        }
        if (response.status === 403) {
          router.replace("/customer/account");
          return;
        }
        const result = await response.json();
        if (!active) return;
        if (!response.ok) {
          throw new Error(result.message || "Could not load bookings.");
        }
        setBookings(result.data ?? []);
      })
      .catch((err) => {
        if (!active) return;
        console.error("Load vendor bookings error:", err);
        setError(
          err instanceof Error ? err.message : "Could not load bookings."
        );
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [router]);

  async function handleVendorCancel(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!cancelTarget) return;

    const cleanReason = cancelReason.trim();
    if (cleanReason.length < 3) {
      setCancelError(
        "Please provide a clear cancellation reason (at least 3 characters)."
      );
      return;
    }

    setCancelError("");
    setIsCancelling(true);

    try {
      const response = await fetch(`/api/bookings/${cancelTarget.id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: cleanReason }),
      });

      const result = await response.json();
      if (!response.ok) {
        setCancelError(result.message || "Could not cancel booking.");
        return;
      }

      setCancelTarget(null);
      setCancelReason("");
      await loadBookings();
    } catch (err) {
      console.error("Vendor cancel error:", err);
      setCancelError("Something went wrong while cancelling this booking.");
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-73px)] bg-[#FFF9FB] px-6 py-14">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#B60152]">
          Vendor
        </p>

        <h1 className="mt-2 text-4xl font-bold text-[#29232A]">Bookings</h1>

        <p className="mt-3 max-w-2xl leading-7 text-[#737373]">
          All bookings shown here have been paid and confirmed automatically.
          If you are unable to fulfil a confirmed booking, you may cancel it
          with a mandatory reason for the customer.
        </p>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="mt-8 space-y-4">
            <div className="h-36 animate-pulse rounded-2xl bg-white" />
            <div className="h-36 animate-pulse rounded-2xl bg-white" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-[#F0E3E9] bg-white p-10 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FCEBF2] text-[#B60152]">
              <Calendar className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-[#29232A]">
              No confirmed bookings yet
            </h2>
            <p className="mt-2 max-w-xl leading-7 text-[#737373]">
              Bookings appear here immediately after a customer completes
              checkout and payment verification succeeds.
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {bookings.map((booking) => (
              <article
                key={booking.id}
                className="rounded-2xl border border-[#F0E3E9] bg-white p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      {booking.status === "PAID" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Confirmed (Paid)
                        </span>
                      ) : (
                        <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
                          {booking.status}
                        </span>
                      )}

                      <span className="text-xs font-medium text-[#737373]">
                        {booking.listing.category}
                      </span>
                    </div>

                    <h2 className="mt-3 text-xl font-bold text-[#29232A]">
                      {booking.listing.title}
                    </h2>

                    <p className="mt-1 text-sm text-[#737373]">
                      Customer: {booking.customer.fullName}
                      {booking.customer.email
                        ? ` • ${booking.customer.email}`
                        : ""}
                      {booking.customer.phone
                        ? ` • ${booking.customer.phone}`
                        : ""}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-2xl font-bold text-[#29232A]">
                      {formatNaira(booking.totalPriceKobo)}
                    </p>
                    <p className="mt-1 text-xs text-[#737373]">
                      Quantity: {booking.quantity}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-[#F0E3E9] pt-4">
                  <div className="inline-flex items-center gap-2 text-sm font-medium text-[#29232A]">
                    <Calendar className="h-4 w-4 text-[#B60152]" />
                    <span>
                      {formatDate(booking.startDate)} –{" "}
                      {formatDate(booking.endDate)}
                    </span>
                  </div>

                  {booking.status === "PAID" && (
                    <button
                      type="button"
                      onClick={() => {
                        setCancelTarget(booking);
                        setCancelReason("");
                        setCancelError("");
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4" />
                      Cancel booking
                    </button>
                  )}
                </div>

                {booking.status === "CANCELLED" && (
                  <div className="mt-4 rounded-xl border border-red-100 bg-red-50/70 px-4 py-3 text-xs text-red-800">
                    <p className="font-semibold">
                      Cancelled by{" "}
                      {booking.cancelledBy === "VENDOR"
                        ? "vendor"
                        : "customer"}
                      {booking.refundStatus !== "NOT_REQUIRED"
                        ? ` • Refund status: ${booking.refundStatus}`
                        : ""}
                    </p>
                    {booking.cancellationReason && (
                      <p className="mt-1">
                        Reason: {booking.cancellationReason}
                      </p>
                    )}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>

      {/* MANDATORY CANCELLATION REASON MODAL */}
      {cancelTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#29232A]/50 px-4 py-6 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="vendor-cancel-title"
        >
          <div className="w-full max-w-md rounded-3xl border border-[#F0E3E9] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-red-700">
                  Cancel Confirmed Booking
                </p>
                <h2
                  id="vendor-cancel-title"
                  className="mt-1 text-lg font-bold text-[#29232A]"
                >
                  {cancelTarget.listing.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setCancelTarget(null)}
                aria-label="Close cancellation dialog"
                className="rounded-xl p-1.5 text-gray-400 hover:bg-[#FFF6F9] hover:text-[#29232A]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleVendorCancel} className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="vendor-cancel-reason"
                  className="block text-sm font-semibold text-[#29232A]"
                >
                  Cancellation reason (required)
                </label>
                <textarea
                  id="vendor-cancel-reason"
                  rows={4}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Explain why you need to cancel this confirmed booking..."
                  className="mt-2 w-full rounded-xl border border-[#F0E3E9] px-3.5 py-2.5 text-sm text-[#29232A] outline-none focus:border-[#B60152]"
                />
              </div>

              {cancelError && (
                <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700">
                  {cancelError}
                </p>
              )}

              <div className="flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setCancelTarget(null)}
                  disabled={isCancelling}
                  className="rounded-xl border border-[#F0E3E9] px-4 py-2 text-sm font-semibold text-[#737373]"
                >
                  Keep booking
                </button>
                <button
                  type="submit"
                  disabled={isCancelling}
                  className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {isCancelling ? "Cancelling..." : "Confirm cancellation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
