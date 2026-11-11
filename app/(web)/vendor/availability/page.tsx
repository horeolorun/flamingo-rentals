
"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

type AvailabilityBlock = {
  id: string;
  startDate: string;
  endDate: string;
  reason: string | null;
  source: "MANUAL" | "BOOKING";
};

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`);

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default function VendorAvailabilityPage() {
  const router = useRouter();

  const [blocks, setBlocks] = useState<AvailabilityBlock[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /*
    LOAD AVAILABILITY
  */
  const loadAvailability = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await fetch(
        "/api/vendor/availability",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        router.replace("/auth/login");
        return;
      }

      if (response.status === 403) {
        router.replace("/#explore");
        return;
      }

      if (!response.ok) {
        setError(data.message || "Could not load availability.");
        return;
      }

      setBlocks(data.data ?? []);
    } catch (error) {
      console.error("Availability load error:", error);
      setError("Could not load availability.");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

  /*
    ADD UNAVAILABLE DATES
  */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!startDate || !endDate) {
      setError("Please select both a start date and an end date.");
      return;
    }

    if (endDate < startDate) {
      setError("End date cannot be before the start date.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(
        "/api/vendor/availability",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            startDate,
            endDate,
            reason: reason.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Could not save unavailable dates.");
        return;
      }

      setStartDate("");
      setEndDate("");
      setReason("");

      setSuccess("Unavailable dates added successfully.");

      await loadAvailability();
    } catch (error) {
      console.error("Availability save error:", error);
      setError("Could not save unavailable dates.");
    } finally {
      setIsSaving(false);
    }
  }

  /*
    REMOVE MANUAL BLOCK
  */
  async function removeBlock(blockId: string) {
    setError("");
    setSuccess("");

    setDeletingId(blockId);

    try {
      const response = await fetch(
        "/api/vendor/availability",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: blockId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Could not remove unavailable dates.");
        return;
      }

      setBlocks((current) =>
        current.filter((block) => block.id !== blockId)
      );

      setSuccess("Unavailable dates removed.");
    } catch (error) {
      console.error("Availability delete error:", error);
      setError("Could not remove unavailable dates.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="min-h-[calc(100vh-76px)] bg-[#FFF9FB] px-6 py-14">
      <div className="mx-auto max-w-6xl">

        {/* PAGE HEADER */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#B60152]">
            Vendor
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#29232A]">
            Availability
          </h1>

          <p className="mt-3 max-w-2xl leading-7 text-[#737373]">
            Mark dates when your business is unavailable. Customers
            searching for vendors for those event dates will not see
            your business as available.
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">

          {/* ADD UNAVAILABLE PERIOD */}
          <section className="rounded-3xl border border-[#F0E3E9] bg-white p-7 shadow-sm">
            <h2 className="text-xl font-bold text-[#29232A]">
              Block dates
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#737373]">
              Select the full period during which your business should
              appear unavailable.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-7 space-y-5"
            >
              {/* START */}
              <div>
                <label
                  htmlFor="startDate"
                  className="block text-sm font-semibold text-[#29232A]"
                >
                  Start date
                </label>

                <input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-[#F0E3E9] bg-white px-4 py-3 text-[#29232A] outline-none transition focus:border-[#B60152] focus:ring-4 focus:ring-[#B60152]/10"
                />
              </div>

              {/* END */}
              <div>
                <label
                  htmlFor="endDate"
                  className="block text-sm font-semibold text-[#29232A]"
                >
                  End date
                </label>

                <input
                  id="endDate"
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  onChange={(event) => setEndDate(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-[#F0E3E9] bg-white px-4 py-3 text-[#29232A] outline-none transition focus:border-[#B60152] focus:ring-4 focus:ring-[#B60152]/10"
                />
              </div>

              {/* REASON */}
              <div>
                <label
                  htmlFor="reason"
                  className="block text-sm font-semibold text-[#29232A]"
                >
                  Reason{" "}
                  <span className="font-normal text-[#737373]">
                    (optional)
                  </span>
                </label>

                <textarea
                  id="reason"
                  value={reason}
                  maxLength={150}
                  rows={3}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="e.g. Already booked for a private event"
                  className="mt-2 w-full resize-none rounded-xl border border-[#F0E3E9] bg-white px-4 py-3 text-[#29232A] outline-none transition placeholder:text-gray-400 focus:border-[#B60152] focus:ring-4 focus:ring-[#B60152]/10"
                />

                <p className="mt-2 text-right text-xs text-[#737373]">
                  {reason.length}/150
                </p>
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                  ✓ {success}
                </div>
              )}

              <button
                type="submit"
                disabled={isSaving}
                className="w-full rounded-xl bg-[#B60152] px-6 py-3.5 font-semibold text-white transition hover:bg-[#C40032] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Mark as unavailable"}
              </button>
            </form>
          </section>

          {/* CURRENT CALENDAR BLOCKS */}
          <section className="rounded-3xl border border-[#F0E3E9] bg-white p-7 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-[#29232A]">
                  Unavailable dates
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#737373]">
                  These periods are excluded when customers search by
                  event date.
                </p>
              </div>

              {!isLoading && (
                <span className="rounded-full bg-[#FCEBF2] px-3 py-1.5 text-xs font-semibold text-[#B60152]">
                  {blocks.length}{" "}
                  {blocks.length === 1 ? "period" : "periods"}
                </span>
              )}
            </div>

            {/* LOADING */}
            {isLoading && (
              <div className="mt-8 space-y-4">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-28 animate-pulse rounded-2xl bg-[#FFF6F9]"
                  />
                ))}
              </div>
            )}

            {/* EMPTY */}
            {!isLoading && blocks.length === 0 && (
              <div className="mt-8 rounded-2xl border border-dashed border-[#F0E3E9] bg-[#FFF9FB] px-6 py-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-xl text-green-600">
                  ✓
                </div>

                <h3 className="mt-4 font-bold text-[#29232A]">
                  No unavailable dates
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#737373]">
                  Your business currently appears available for all
                  dates.
                </p>
              </div>
            )}

            {/* BLOCK LIST */}
            {!isLoading && blocks.length > 0 && (
              <div className="mt-8 space-y-4">
                {blocks.map((block) => (
                  <article
                    key={block.id}
                    className="rounded-2xl border border-[#F0E3E9] bg-[#FFF9FB] p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                            Unavailable
                          </span>

                          {block.source === "BOOKING" ? (
                            <span className="rounded-full bg-[#FCEBF2] px-3 py-1 text-xs font-semibold text-[#B60152]">
                              Booking
                            </span>
                          ) : (
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                              Manual
                            </span>
                          )}
                        </div>

                        <p className="mt-3 font-bold text-[#29232A]">
                          {formatDate(block.startDate)}

                          {block.startDate !== block.endDate && (
                            <>
                              {" "}
                              →{" "}
                              {formatDate(block.endDate)}
                            </>
                          )}
                        </p>

                        {block.reason && (
                          <p className="mt-2 text-sm leading-6 text-[#737373]">
                            {block.reason}
                          </p>
                        )}
                      </div>

                      {block.source === "MANUAL" && (
                        <button
                          type="button"
                          disabled={deletingId === block.id}
                          onClick={() => removeBlock(block.id)}
                          className="shrink-0 rounded-xl border border-red-100 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                        >
                          {deletingId === block.id
                            ? "Removing..."
                            : "Remove"}
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* HOW THIS WILL WORK */}
        <section className="mt-8 rounded-3xl border border-[#F0E3E9] bg-[#FFF6F9] p-7">
          <h2 className="font-bold text-[#29232A]">
            How Flamingo uses your availability
          </h2>

          <div className="mt-5 grid gap-5 md:grid-cols-3">
            <div>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#B60152] text-sm font-bold text-white">
                1
              </span>

              <p className="mt-3 font-semibold text-[#29232A]">
                You block dates
              </p>

              <p className="mt-1 text-sm leading-6 text-[#737373]">
                Add dates when your business cannot accept an event.
              </p>
            </div>

            <div>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#B60152] text-sm font-bold text-white">
                2
              </span>

              <p className="mt-3 font-semibold text-[#29232A]">
                Customers choose dates
              </p>

              <p className="mt-1 text-sm leading-6 text-[#737373]">
                Customers provide the dates of their event while
                searching for vendors.
              </p>
            </div>

            <div>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#B60152] text-sm font-bold text-white">
                3
              </span>

              <p className="mt-3 font-semibold text-[#29232A]">
                Flamingo matches
              </p>

              <p className="mt-1 text-sm leading-6 text-[#737373]">
                Vendors whose blocked dates overlap the event are
                excluded from available results.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
