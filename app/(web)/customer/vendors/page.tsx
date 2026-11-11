
import Link from "next/link";

import VendorCard from "@/components/VendorCard";
import VendorDiscoveryFilters from "./VendorDiscoveryFilters";
import { vendorSegments } from "@/app/data/vendorSegments";
import { db } from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/session";

type VendorsPageProps = {
  searchParams: Promise<{
    q?: string;
    segment?: string;
    state?: string;
    city?: string;
  }>;
};

const nigerianStates = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "Federal Capital Territory",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default async function VendorsPage({
  searchParams,
}: VendorsPageProps) {
  const [params, currentUser] = await Promise.all([
    searchParams,
    getCurrentUser(),
  ]);

  const search = String(params.q ?? "").trim();
  const segment = String(params.segment ?? "").trim();

  // Use the customer's saved location unless the URL
  // explicitly contains a location selection.
  const hasStateParam = Object.prototype.hasOwnProperty.call(
    params,
    "state"
  );

  const hasCityParam = Object.prototype.hasOwnProperty.call(
    params,
    "city"
  );

  const savedState =
    currentUser?.role === "CUSTOMER"
      ? currentUser.state ?? ""
      : "";

  const savedCity =
    currentUser?.role === "CUSTOMER"
      ? currentUser.city ?? ""
      : "";

  const selectedState = hasStateParam
    ? String(params.state ?? "").trim()
    : savedState;

  const selectedCity = hasCityParam
    ? String(params.city ?? "").trim()
    : hasStateParam
      ? ""
      : savedCity;

  const locationFilter = {
    ...(selectedState ? { state: selectedState } : {}),
    ...(selectedCity ? { city: selectedCity } : {}),
  };

  // All displayed vendors must have an active account
  // and completed KYC verification.
  const baseWhere = {
    user: {
      role: "VENDOR" as const,
      status: "ACTIVE" as const,
    },
    kycStatus: "VERIFIED" as const,
    ...locationFilter,
  };

  const [vendors, featuredVendors, cityRecords] = await Promise.all([
    // All vendors matching the selected search,
    // service and location filters.
    db.vendorProfile.findMany({
      where: {
        ...baseWhere,

        ...(segment
          ? {
              segments: {
                has: segment,
              },
            }
          : {}),

        ...(search
          ? {
              OR: [
                {
                  businessName: {
                    contains: search,
                    mode: "insensitive" as const,
                  },
                },
                {
                  user: {
                    fullName: {
                      contains: search,
                      mode: "insensitive" as const,
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

      orderBy: [
        { averageRating: "desc" },
        { reviewCount: "desc" },
        { createdAt: "desc" },
      ],
    }),

    // Only manually featured vendors appear here.
    // Location applies, but search and service filters do not.
    db.vendorProfile.findMany({
      where: {
        ...baseWhere,
        isFeatured: true,
      },

      take: 10,

      include: {
        user: true,
        listings: {
          where: {
            isAvailable: true,
          },
        },
      },

      orderBy: [
        { averageRating: "desc" },
        { reviewCount: "desc" },
        { createdAt: "desc" },
      ],
    }),

    // Retrieve actual vendor cities within the selected state.
    selectedState
      ? db.vendorProfile.findMany({
          where: {
            user: {
              role: "VENDOR",
              status: "ACTIVE",
            },
            kycStatus: "VERIFIED",
            state: selectedState,
            city: {
              not: null,
            },
          },

          select: {
            city: true,
          },

          distinct: ["city"],

          orderBy: {
            city: "asc",
          },
        })
      : Promise.resolve([]),
  ]);

  const cities = cityRecords
    .map((record) => record.city)
    .filter((city): city is string => Boolean(city));

  const locationLabel = selectedCity
    ? `${selectedCity}, ${selectedState}`
    : selectedState || "All locations";

  return (
    <main className="min-h-screen bg-[#FFF9FB]">
      {/* PAGE INTRODUCTION */}
      <section className="border-b border-[#F0E3E9] bg-gradient-to-br from-[#FCEBF2] via-white to-[#FFF6F9]">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-12">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#B60152]">
            Flamingo marketplace
          </p>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[#29232A] sm:text-4xl">
                Find the right vendor
                <br className="hidden sm:block" /> for your event.
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-[#737373] sm:text-base">
                Discover trusted event professionals, explore their
                services and find the right people to bring your
                plans together.
              </p>
            </div>

            <p className="text-sm font-medium text-[#737373]">
              Showing vendors in{" "}
              <span className="font-bold text-[#B60152]">
                {locationLabel}
              </span>
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 sm:py-10">
        {/* SEARCH, SERVICE AND LOCATION FILTERS */}
        <VendorDiscoveryFilters
          segments={vendorSegments}
          selectedSegment={segment}
          search={search}
          selectedState={selectedState}
          selectedCity={selectedCity}
          states={nigerianStates}
          cities={cities}
        />

        {/* FEATURED VENDORS */}
        <section className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#B60152]">
                Handpicked for you
              </p>

              <h2 className="mt-1 text-2xl font-bold text-[#29232A]">
                Featured vendors
              </h2>

              <p className="mt-1 text-sm text-[#737373]">
                Discover businesses selected by Flamingo in{" "}
                {locationLabel}.
              </p>
            </div>

            <span className="rounded-full bg-[#FCEBF2] px-3 py-1.5 text-xs font-semibold text-[#B60152]">
              Featured selection
            </span>
          </div>

          {featuredVendors.length > 0 ? (
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {featuredVendors.map((vendor) => {
                const businessName =
                  vendor.businessName?.trim() ||
                  `${vendor.user.fullName}'s Business`;

                const initials = getInitials(businessName);

                const location = [
                  vendor.city,
                  vendor.state,
                ]
                  .filter(Boolean)
                  .join(", ");

                return (
                  <Link
                    key={vendor.id}
                    href={`/customer/vendors/${vendor.id}`}
                    className="group rounded-2xl border border-[#F0E3E9] bg-white p-3 transition hover:-translate-y-1 hover:border-[#E7B5CC] hover:shadow-md sm:p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      {vendor.logoUrl ? (
                        <img
                          src={vendor.logoUrl}
                          alt={`${businessName} logo`}
                          className="h-11 w-11 shrink-0 rounded-xl border border-[#F0E3E9] object-cover sm:h-12 sm:w-12"
                        />
                      ) : (
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FCEBF2] text-sm font-bold text-[#B60152] sm:h-12 sm:w-12">
                          {initials || "F"}
                        </div>
                      )}

                      <span className="rounded-full bg-green-50 px-2 py-1 text-[10px] font-bold text-green-700">
                        Verified
                      </span>
                    </div>

                    <h3 className="mt-3 line-clamp-2 text-sm font-bold text-[#29232A] group-hover:text-[#B60152]">
                      {businessName}
                    </h3>

                    <div className="mt-2 flex min-h-8 flex-wrap gap-1">
                      {vendor.segments.slice(0, 2).map((service) => (
                        <span
                          key={service}
                          className="rounded-full bg-[#FFF6F9] px-2 py-1 text-[10px] font-medium text-[#8A526C]"
                        >
                          {service}
                        </span>
                      ))}
                    </div>

                    <p className="mt-2 truncate text-xs text-[#737373]">
                      <span className="mr-1">⌖</span>
                      {location || "Location not provided"}
                    </p>

                    <div className="mt-3 flex items-center justify-between border-t border-[#F5EAF0] pt-3">
                      <span className="text-xs font-bold text-[#29232A]">
                        <span className="mr-1 text-amber-500">★</span>
                        {vendor.averageRating > 0
                          ? vendor.averageRating.toFixed(1)
                          : "New"}
                      </span>

                      <span className="text-[10px] text-[#737373]">
                        {vendor.reviewCount}{" "}
                        {vendor.reviewCount === 1 ? "review" : "reviews"}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-[#F0E3E9] bg-white px-6 py-10 text-center">
              <p className="font-semibold text-[#29232A]">
                No featured vendors in this location yet.
              </p>

              <p className="mt-1 text-sm text-[#737373]">
                Featured businesses will appear here when selected
                by Flamingo.
              </p>
            </div>
          )}
        </section>

        {/* ALL MATCHING VENDORS */}
        <section className="mt-12 border-t border-[#F0E3E9] pt-9">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#B60152]">
                Explore the marketplace
              </p>

              <h2 className="mt-1 text-2xl font-bold text-[#29232A]">
                {segment ? `${segment} vendors` : "All matching vendors"}
              </h2>

              <p className="mt-1 text-sm text-[#737373]">
                {search
                  ? `Search results for "${search}"`
                  : "Explore verified vendors that match your filters."}
              </p>
            </div>

            <p className="text-sm font-semibold text-[#737373]">
              {vendors.length}{" "}
              {vendors.length === 1 ? "vendor" : "vendors"} found
            </p>
          </div>

          {vendors.length > 0 ? (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {vendors.map((vendor) => {
                const businessName =
                  vendor.businessName?.trim() ||
                  `${vendor.user.fullName}'s Business`;

                return (
                  <VendorCard
                    key={vendor.id}
                    businessName={businessName}
                    slug={vendor.id}
                    segments={vendor.segments}
                    listingCount={vendor.listings.length}
                    verified={true}
                    imageUrl={
                      vendor.logoUrl || "/home/hero-venue.jpg"
                    }
                  />
                );
              })}
            </div>
          ) : (
            <div className="mt-6 rounded-3xl border border-dashed border-[#F0E3E9] bg-white px-8 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FCEBF2] text-2xl">
                🔎
              </div>

              <h3 className="mt-5 text-xl font-bold text-[#29232A]">
                No matching vendors found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#737373]">
                Try changing your search, service or location to see
                more vendors.
              </p>

              <Link
                href="/customer/vendors"
                className="mt-6 inline-flex rounded-xl bg-[#B60152] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#C40032]"
              >
                Clear filters
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
