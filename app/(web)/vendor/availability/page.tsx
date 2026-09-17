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

  reason:
    | string
    | null;

  source:
    | "MANUAL"
    | "BOOKING";
};

function formatDate(
  value: string
) {
  const date = new Date(
    `${value}T00:00:00`
  );

  return new Intl.DateTimeFormat(
    "en-NG",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  ).format(date);
}

export default function VendorAvailabilityPage() {
  const router =
    useRouter();

  const [
    blocks,
    setBlocks,
  ] =
    useState<
      AvailabilityBlock[]
    >([]);

  const [
    startDate,
    setStartDate,
  ] =
    useState("");

  const [
    endDate,
    setEndDate,
  ] =
    useState("");

  const [
    reason,
    setReason,
  ] =
    useState("");

  const [
    isLoading,
    setIsLoading,
  ] =
    useState(true);

  const [
    isSaving,
    setIsSaving,
  ] =
    useState(false);

  const [
    deletingId,
    setDeletingId,
  ] =
    useState<
      string | null
    >(null);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    success,
    setSuccess,
  ] =
    useState("");

  /*
    LOAD AVAILABILITY
  */
  const loadAvailability =
    useCallback(
      async () => {
        setIsLoading(true);

        try {
          const response =
            await fetch(
              "/api/vendor/availability",
              {
                method:
                  "GET",

                cache:
                  "no-store",
              }
            );

          const data =
            await response.json();

          if (
            response.status ===
            401
          ) {
            router.replace(
              "/auth/login"
            );

            return;
          }

          if (
            response.status ===
            403
          ) {
            router.replace(
              "/#explore"
            );

            return;
          }

          if (
            !response.ok
          ) {
            setError(
              data.message ||
                "Could not load availability."
            );

            return;
          }

          setBlocks(
            data.data ?? []
          );
        } catch (error) {
          console.error(
            "Availability load error:",
            error
          );

          setError(
            "Could not load availability."
          );
        } finally {
          setIsLoading(
            false
          );
        }
      },
      [router]
    );

  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

  /*
    ADD UNAVAILABLE DATES
  */
  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (
      !startDate ||
      !endDate
    ) {
      setError(
        "Please select both a start date and an end date."
      );

      return;
    }

    if (
      endDate <
      startDate
    ) {
      setError(
        "End date cannot be before the start date."
      );

      return;
    }

    setIsSaving(true);

    try {
      const response =
        await fetch(
          "/api/vendor/availability",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                startDate,
                endDate,
                reason:
                  reason.trim(),
              }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Could not save unavailable dates."
        );

        return;
      }

      setStartDate("");
      setEndDate("");
      setReason("");

      setSuccess(
        "Unavailable dates added successfully."
      );

      await loadAvailability();
    } catch (error) {
      console.error(
        "Availability save error:",
        error
      );

      setError(
        "Could not save unavailable dates."
      );
    } finally {
      setIsSaving(
        false
      );
    }
  }

  /*
    REMOVE MANUAL BLOCK
  */
  async function removeBlock(
    blockId: string
  ) {
    setError("");
    setSuccess("");

    setDeletingId(
      blockId
    );

    try {
      const response =
        await fetch(
          "/api/vendor/availability",
          {
            method:
              "DELETE",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                id: blockId,
              }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Could not remove unavailable dates."
        );

        return;
      }

      setBlocks(
        (current) =>
          current.filter(
            (block) =>
              block.id !==
              blockId
          )
      );

      setSuccess(
        "Unavailable dates removed."
      );
    } catch (error) {
      console.error(
        "Availability delete error:",
        error
      );

      setError(
        "Could not remove unavailable dates."
      );
    } finally {
      setDeletingId(
        null
      );
    }
  }

  return (
    <main className="min-h-[calc(100vh-76px)] bg-[#faf9fc] px-6 py-14">

      <div className="mx-auto max-w-6xl">

        {/* PAGE HEADER */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#4f2a91]">
            Vendor
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900">
            Availability
          </h1>

          <p className="mt-3 max-w-2xl leading-7 text-gray-500">
            Mark dates when your business is unavailable. Customers
            searching for vendors for those event dates will not see
            your business as available.
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">

          {/* ============================== */}
          {/* ADD UNAVAILABLE PERIOD */}
          {/* ============================== */}
          <section className="rounded-3xl border border-gray-100 bg-white p-7 shadow-sm">

            <h2 className="text-xl font-bold text-gray-900">
              Block dates
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Select the full period during which your business should
              appear unavailable.
            </p>

            <form
              onSubmit={
                handleSubmit
              }
              className="mt-7 space-y-5"
            >

              {/* START */}
              <div>
                <label
                  htmlFor="startDate"
                  className="block text-sm font-semibold text-gray-700"
                >
                  Start date
                </label>

                <input
                  id="startDate"
                  type="date"
                  value={
                    startDate
                  }
                  onChange={(
                    event
                  ) =>
                    setStartDate(
                      event
                        .target
                        .value
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none transition focus:border-[#4f2a91] focus:ring-4 focus:ring-[#4f2a91]/5"
                />
              </div>

              {/* END */}
              <div>
                <label
                  htmlFor="endDate"
                  className="block text-sm font-semibold text-gray-700"
                >
                  End date
                </label>

                <input
                  id="endDate"
                  type="date"
                  value={
                    endDate
                  }
                  min={
                    startDate ||
                    undefined
                  }
                  onChange={(
                    event
                  ) =>
                    setEndDate(
                      event
                        .target
                        .value
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none transition focus:border-[#4f2a91] focus:ring-4 focus:ring-[#4f2a91]/5"
                />
              </div>

              {/* REASON */}
              <div>
                <label
                  htmlFor="reason"
                  className="block text-sm font-semibold text-gray-700"
                >
                  Reason{" "}
                  <span className="font-normal text-gray-400">
                    (optional)
                  </span>
                </label>

                <textarea
                  id="reason"
                  value={reason}
                  maxLength={150}
                  rows={3}
                  onChange={(
                    event
                  ) =>
                    setReason(
                      event
                        .target
                        .value
                    )
                  }
                  placeholder="e.g. Already booked for a private event"
                  className="mt-2 w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none transition focus:border-[#4f2a91] focus:ring-4 focus:ring-[#4f2a91]/5"
                />

                <p className="mt-2 text-right text-xs text-gray-400">
                  {
                    reason.length
                  }
                  /150
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
                disabled={
                  isSaving
                }
                className="w-full rounded-xl bg-[#4f2a91] px-6 py-3.5 font-semibold text-white transition hover:bg-[#3e2174] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving
                  ? "Saving..."
                  : "Mark as unavailable"}
              </button>
            </form>
          </section>

          {/* ============================== */}
          {/* CURRENT CALENDAR BLOCKS */}
          {/* ============================== */}
          <section className="rounded-3xl border border-gray-100 bg-white p-7 shadow-sm">

            <div className="flex flex-wrap items-start justify-between gap-4">

              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Unavailable dates
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  These periods are excluded when customers search by
                  event date.
                </p>
              </div>

              {!isLoading && (
                <span className="rounded-full bg-[#f3edfb] px-3 py-1.5 text-xs font-semibold text-[#4f2a91]">
                  {blocks.length}{" "}
                  {blocks.length ===
                  1
                    ? "period"
                    : "periods"}
                </span>
              )}
            </div>

            {/* LOADING */}
            {isLoading && (
              <div className="mt-8 space-y-4">

                {[1, 2, 3].map(
                  (item) => (
                    <div
                      key={
                        item
                      }
                      className="h-28 animate-pulse rounded-2xl bg-gray-100"
                    />
                  )
                )}
              </div>
            )}

            {/* EMPTY */}
            {!isLoading &&
              blocks.length ===
                0 && (
                <div className="mt-8 rounded-2xl border border-dashed border-gray-200 bg-[#fafafa] px-6 py-10 text-center">

                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-xl">
                    ✓
                  </div>

                  <h3 className="mt-4 font-bold text-gray-900">
                    No unavailable dates
                  </h3>

                  <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
                    Your business currently appears available for all
                    dates.
                  </p>
                </div>
              )}

            {/* BLOCK LIST */}
            {!isLoading &&
              blocks.length >
                0 && (
                <div className="mt-8 space-y-4">

                  {blocks.map(
                    (block) => (
                      <article
                        key={
                          block.id
                        }
                        className="rounded-2xl border border-gray-100 bg-[#fafafa] p-5"
                      >

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                          <div>

                            <div className="flex flex-wrap items-center gap-2">

                              <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                                Unavailable
                              </span>

                              {block.source ===
                              "BOOKING" ? (
                                <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-[#4f2a91]">
                                  Booking
                                </span>
                              ) : (
                                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                                  Manual
                                </span>
                              )}
                            </div>

                            <p className="mt-3 font-bold text-gray-900">
                              {formatDate(
                                block.startDate
                              )}

                              {block.startDate !==
                                block.endDate && (
                                <>
                                  {" "}
                                  →{" "}
                                  {formatDate(
                                    block.endDate
                                  )}
                                </>
                              )}
                            </p>

                            {block.reason && (
                              <p className="mt-2 text-sm leading-6 text-gray-500">
                                {
                                  block.reason
                                }
                              </p>
                            )}
                          </div>

                          {block.source ===
                            "MANUAL" && (
                            <button
                              type="button"
                              disabled={
                                deletingId ===
                                block.id
                              }
                              onClick={() =>
                                removeBlock(
                                  block.id
                                )
                              }
                              className="shrink-0 rounded-xl border border-red-100 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                            >
                              {deletingId ===
                              block.id
                                ? "Removing..."
                                : "Remove"}
                            </button>
                          )}
                        </div>
                      </article>
                    )
                  )}
                </div>
              )}
          </section>
        </div>

        {/* HOW THIS WILL WORK */}
        <section className="mt-8 rounded-3xl border border-purple-100 bg-[#faf7ff] p-7">

          <h2 className="font-bold text-gray-900">
            How Flamingo uses your availability
          </h2>

          <div className="mt-5 grid gap-5 md:grid-cols-3">

            <div>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#4f2a91] text-sm font-bold text-white">
                1
              </span>

              <p className="mt-3 font-semibold text-gray-900">
                You block dates
              </p>

              <p className="mt-1 text-sm leading-6 text-gray-500">
                Add dates when your business cannot accept an event.
              </p>
            </div>

            <div>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#4f2a91] text-sm font-bold text-white">
                2
              </span>

              <p className="mt-3 font-semibold text-gray-900">
                Customers choose dates
              </p>

              <p className="mt-1 text-sm leading-6 text-gray-500">
                Customers provide the dates of their event while
                searching for vendors.
              </p>
            </div>

            <div>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#4f2a91] text-sm font-bold text-white">
                3
              </span>

              <p className="mt-3 font-semibold text-gray-900">
                Flamingo matches
              </p>

              <p className="mt-1 text-sm leading-6 text-gray-500">
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