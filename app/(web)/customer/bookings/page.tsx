"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, CheckCircle2, XCircle } from "lucide-react";

type CustomerBooking = {
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
  vendor: {
    id: string;
    businessName: string | null;
    state: string | null;
    city: string | null;
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

function statusBadge(status: string) {
  if (status === "PAID") {
    return "bg-green-50 text-green-700 border-green-200";
  }
  if (status === "CANCELLED") {
    return "bg-red-50 text-red-700 border-red-200";
  }
  if (status === "COMPLETED") {
    return "bg-purple-50 text-purple-700 border-purple-200";
  }
  return "bg-gray-100 text-gray-700 border-gray-200";
}

export default function CustomerBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<CustomerBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [justConfirmed, setJustConfirmed] = useState(false);

  const loadBookings = useCallback(async () => {
    try {
      const response = await fetch("/api/bookings", {
        cache: "no-store",
      });

      if (response.status === 401) {
        router.replace("/auth/login?next=/customer/bookings");
        return;
      }

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Could not load bookings.");
      }

      setError("");
      setBookings(result.data ?? []);
    } catch (err) {
      console.error("Load customer bookings error:", err);
      setError(
        err instanceof Error ? err.message : "Could not load your bookings."
      );
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    let active = true;
    const confirmedParam =
      new URLSearchParams(window.location.search).get("confirmed") === "1";

    fetch("/api/bookings", { cache: "no-store" })
      .then(async (response) => {
        if (!active) return;
        if (response.status === 401) {
          router.replace("/auth/login?next=/customer/bookings");
          return;
        }
        const result = await response.json();
        if (!active) return;
        if (!response.ok) {
          throw new Error(result.message || "Could not load bookings.");
        }
        setJustConfirmed(confirmedParam);
        setBookings(result.data ?? []);
      })
      .catch((err) => {
        if (!active) return;
        console.error("Load customer bookings error:", err);
        setError(
          err instanceof Error ? err.message : "Could not load your bookings."
        );
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [router]);

  async function handleCancelBooking(bookingId: string) {
    setCancellingId(bookingId);
    setError("");

    try {
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: "Cancelled by customer",
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Could not cancel booking.");
      }

      setConfirmCancelId(null);
      await loadBookings();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not cancel booking."
      );
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <main className="min-h-[calc(100vh-73px)] bg-[#FFF9FB] px-6 py-14">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#B60152]">
              Customer Bookings
            </p>
            <h1 className="mt-2 text-4xl font-bold text-[#29232A]">
              My Bookings
            </h1>
            <p className="mt-2 text-[#737373]">
              View your confirmed rentals and service bookings.
            </p>
          </div>

          <Link
            href="/customer/vendors"
            className="rounded-xl bg-[#B60152] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#C40032]"
          >
            Browse Vendors
          </Link>
        </div>

        {justConfirmed && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-800">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-green-700" />
            <span>
              Your payment was verified on the server and your booking is now
              confirmed.
            </span>
          </div>
        )}

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
          <div className="mt-10 rounded-3xl border border-[#F0E3E9] bg-white px-6 py-14 text-center shadow-sm">
            <h2 className="text-xl font-bold text-[#29232A]">
              No bookings yet
            </h2>
            <p className="mt-2 text-sm text-[#737373]">
              Once you verify payment at checkout, your confirmed bookings will
              appear here.
            </p>
            <Link
              href="/customer/cart"
              className="mt-6 inline-flex rounded-xl border border-[#EAC6D5] bg-[#FFF9FB] px-5 py-2.5 text-sm font-semibold text-[#B60152] transition hover:bg-[#FCEBF2]"
            >
              Go to booking cart
            </Link>
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
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-bold ${statusBadge(
                          booking.status
                        )}`}
                      >
                        {booking.status === "PAID"
                          ? "Confirmed (Paid)"
                          : booking.status}
                      </span>
                      <span className="text-xs font-medium text-[#737373]">
                        {booking.listing.category}
                      </span>
                    </div>

                    <h2 className="mt-3 text-xl font-bold text-[#29232A]">
                      {booking.listing.title}
                    </h2>

                    <p className="mt-1 text-sm text-[#737373]">
                      Vendor: {booking.vendor.businessName || "Vendor"}
                      {booking.vendor.city || booking.vendor.state
                        ? ` • ${[booking.vendor.city, booking.vendor.state]
                            .filter(Boolean)
                            .join(", ")}`
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
                    confirmCancelId === booking.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCancelBooking(booking.id)}
                          disabled={cancellingId === booking.id}
                          className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          {cancellingId === booking.id
                            ? "Cancelling..."
                            : "Confirm cancel"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmCancelId(null)}
                          className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600"
                        >
                          Keep booking
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmCancelId(booking.id)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4" />
                        Cancel booking
                      </button>
                    )
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
    </main>
  );
}
