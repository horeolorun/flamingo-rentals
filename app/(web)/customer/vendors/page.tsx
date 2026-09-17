import Link from "next/link";

import VendorCard from "@/components/VendorCard";
import { vendorSegments } from "@/app/data/vendorSegments";
import { db } from "@/app/lib/db";

type VendorsPageProps = {
  searchParams: Promise<{
    q?: string;
    segment?: string;
    verified?: string;
  }>;
};

export default async function VendorsPage({
  searchParams,
}: VendorsPageProps) {
  const params =
    await searchParams;

  const search =
    String(
      params.q ?? ""
    ).trim();

  const segment =
    String(
      params.segment ?? ""
    ).trim();

  const verified =
    params.verified === "true";

  const vendors =
    await db.vendorProfile.findMany({
      where: {
        user: {
          role: "VENDOR",
          status: "ACTIVE",
        },

        ...(segment
          ? {
              segments: {
                has: segment,
              },
            }
          : {}),

        ...(verified
          ? {
              kycStatus:
                "VERIFIED",
            }
          : {}),

        ...(search
          ? {
              OR: [
                {
                  businessName: {
                    contains:
                      search,
                    mode:
                      "insensitive",
                  },
                },

                {
                  user: {
                    fullName: {
                      contains:
                        search,
                      mode:
                        "insensitive",
                    },
                  },
                },
              ],
            }
          : {}),
      },

      include: {
        user: true,

        listings: {
          where: {
            isAvailable: true,
          },
        },
      },

      orderBy: {
        createdAt:
          "desc",
      },
    });

  return (
    <main className="min-h-screen bg-[#faf9fc]">

      {/* PAGE HEADER */}
      <section className="border-b border-purple-100 bg-gradient-to-br from-[#f5f0fb] via-white to-[#eef9f2]">
        <div className="mx-auto max-w-7xl px-6 py-14">

          <p className="text-sm font-semibold uppercase tracking-wide text-[#4f2a91]">
            Flamingo marketplace
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-950 md:text-5xl">
            Find the right vendor
            for your event
          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-8 text-gray-600">
            Browse event businesses,
            compare their services and
            narrow your search to what
            your event needs.
          </p>

          {/* SEARCH */}
          <form
            action="/customer/vendors"
            method="GET"
            className="mt-8 flex max-w-2xl gap-3"
          >
            {segment && (
              <input
                type="hidden"
                name="segment"
                value={segment}
              />
            )}

            {verified && (
              <input
                type="hidden"
                name="verified"
                value="true"
              />
            )}

            <input
              type="search"
              name="q"
              defaultValue={search}
              placeholder="Search vendors..."
              className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3.5 outline-none transition focus:border-[#4f2a91]"
            />

            <button
              type="submit"
              className="rounded-xl bg-[#4f2a91] px-6 py-3.5 font-semibold text-white transition hover:bg-[#3e2174]"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">

        {/* FILTERS */}
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">

          <div className="flex flex-col gap-6">

            {/* SEGMENT FILTER */}
            <div>
              <p className="text-sm font-bold text-gray-900">
                Service
              </p>

              <div className="mt-3 flex flex-wrap gap-2">

                <Link
                  href="/customer/vendors"
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    !segment
                      ? "border-[#4f2a91] bg-[#4f2a91] text-white"
                      : "border-gray-200 bg-white text-gray-600 hover:border-[#4f2a91]/30 hover:text-[#4f2a91]"
                  }`}
                >
                  All
                </Link>

                {vendorSegments.map(
                  (
                    vendorSegment
                  ) => (
                    <Link
                      key={
                        vendorSegment
                      }
                      href={`/customer/vendors?segment=${encodeURIComponent(
                        vendorSegment
                      )}`}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                        segment ===
                        vendorSegment
                          ? "border-[#4f2a91] bg-[#4f2a91] text-white"
                          : "border-gray-200 bg-white text-gray-600 hover:border-[#4f2a91]/30 hover:text-[#4f2a91]"
                      }`}
                    >
                      {
                        vendorSegment
                      }
                    </Link>
                  )
                )}
              </div>
            </div>

            {/* VERIFIED */}
            <div className="border-t border-gray-100 pt-5">
              <div className="flex flex-wrap items-center gap-3">

                <p className="mr-2 text-sm font-bold text-gray-900">
                  Verification
                </p>

                <Link
                  href={
                    segment
                      ? `/customer/vendors?segment=${encodeURIComponent(
                          segment
                        )}`
                      : "/customer/vendors"
                  }
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    !verified
                      ? "border-[#4f2a91] bg-[#f5f0fc] text-[#4f2a91]"
                      : "border-gray-200 text-gray-600"
                  }`}
                >
                  All vendors
                </Link>

                <Link
                  href={`/customer/vendors?${new URLSearchParams({
                    ...(segment
                      ? {
                          segment,
                        }
                      : {}),

                    verified:
                      "true",
                  }).toString()}`}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    verified
                      ? "border-green-600 bg-green-50 text-green-700"
                      : "border-gray-200 text-gray-600"
                  }`}
                >
                  ✓ Verified only
                </Link>

              </div>
            </div>
          </div>
        </div>

        {/* RESULTS INFO */}
        <div className="mt-10 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#4f2a91]">
              Vendors
            </p>

            <h2 className="mt-1 text-3xl font-bold text-gray-900">
              {segment
                ? `${segment} vendors`
                : "All vendors"}
            </h2>
          </div>

          <p className="text-sm text-gray-500">
            {vendors.length ===
            1
              ? "1 vendor found"
              : `${vendors.length} vendors found`}
          </p>
        </div>

        {/* VENDOR GRID */}
        {vendors.length >
        0 ? (
          <div className="mt-8 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
            {vendors.map(
              (vendor) => {
                const businessName =
                  vendor.businessName?.trim() ||
                  `${vendor.user.fullName}'s Business`;

                return (
                  <VendorCard
                    key={
                      vendor.id
                    }
                    businessName={
                      businessName
                    }
                    slug={
                      vendor.id
                    }
                    segments={
                      vendor.segments
                    }
                    listingCount={
                      vendor.listings
                        .length
                    }
                    verified={
                      vendor.kycStatus ===
                      "VERIFIED"
                    }
                    imageUrl="/home/hero-venue.jpg"
                  />
                );
              }
            )}
          </div>
        ) : (
          <div className="mt-8 rounded-3xl border border-dashed border-gray-200 bg-white px-8 py-16 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f3edfb] text-2xl">
              🔎
            </div>

            <h3 className="mt-5 text-xl font-bold text-gray-900">
              No vendors found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              Try changing your
              search or selecting a
              different service.
            </p>

            <Link
              href="/customer/vendors"
              className="mt-6 inline-flex rounded-xl bg-[#4f2a91] px-5 py-3 text-sm font-semibold text-white"
            >
              Clear filters
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}