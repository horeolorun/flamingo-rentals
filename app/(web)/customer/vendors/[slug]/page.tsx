import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { db } from "@/app/lib/db";

type VendorPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function formatNaira(
  priceKobo: number
) {
  return new Intl.NumberFormat(
    "en-NG",
    {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }
  ).format(
    priceKobo / 100
  );
}

export default async function VendorPage({
  params,
}: VendorPageProps) {
  const { slug } =
    await params;

  const vendor =
    await db.vendorProfile.findUnique({
      where: {
        id: slug,
      },

      include: {
        user: true,

        listings: {
          where: {
            isAvailable: true,
          },

          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

  if (
    !vendor ||
    vendor.user.role !==
      "VENDOR" ||
    vendor.user.status !==
      "ACTIVE"
  ) {
    notFound();
  }

  const businessName =
    vendor.businessName?.trim() ||
    `${vendor.user.fullName}'s Business`;

  return (
    <main className="min-h-screen bg-[#faf9fc]">

      {/* VENDOR HERO */}
      <section className="border-b border-gray-100 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">

          <div className="relative h-[320px] overflow-hidden rounded-3xl">
            <Image
              src="/home/hero-venue.jpg"
              alt={businessName}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
          </div>

          <div>
            <Link
              href="/#vendors"
              className="text-sm font-semibold text-[#4f2a91]"
            >
              ← Back to vendors
            </Link>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              {vendor.segments.map(
                (segment) => (
                  <span
                    key={
                      segment
                    }
                    className="rounded-full bg-[#f3edfb] px-3 py-1.5 text-xs font-semibold text-[#4f2a91]"
                  >
                    {segment}
                  </span>
                )
              )}

              {vendor.kycStatus ===
                "VERIFIED" && (
                <span className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                  ✓ Verified
                </span>
              )}
            </div>

            <h1 className="mt-5 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
              {businessName}
            </h1>

            <p className="mt-4 max-w-2xl leading-7 text-gray-500">
              Explore available products and services from this
              Flamingo vendor.
            </p>

            <div className="mt-6 inline-flex rounded-xl bg-[#faf7ff] px-4 py-3 text-sm font-semibold text-[#4f2a91]">
              {vendor.listings.length ===
              1
                ? "1 available listing"
                : `${vendor.listings.length} available listings`}
            </div>
          </div>
        </div>
      </section>

      {/* LISTINGS */}
      <section className="mx-auto max-w-7xl px-6 py-16">

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#4f2a91]">
            Services & products
          </p>

          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            Available listings
          </h2>
        </div>

        {vendor.listings.length >
        0 ? (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {vendor.listings.map(
              (listing) => (
                <article
                  key={
                    listing.id
                  }
                  className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"
                >
                  <span className="rounded-full bg-[#f3edfb] px-3 py-1.5 text-xs font-semibold text-[#4f2a91]">
                    {
                      listing.category
                    }
                  </span>

                  <h3 className="mt-5 text-xl font-bold text-gray-900">
                    {listing.title}
                  </h3>

                  {listing.description && (
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-500">
                      {
                        listing.description
                      }
                    </p>
                  )}

                  <div className="mt-6 border-t border-gray-100 pt-5">
                    <p className="text-2xl font-bold text-gray-900">
                      {formatNaira(
                        listing.priceKobo
                      )}
                    </p>

                    {listing.pricingUnit && (
                      <p className="mt-1 text-sm text-gray-500">
                        per{" "}
                        {
                          listing.pricingUnit
                        }
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    className="mt-6 w-full rounded-xl bg-[#4f2a91] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3e2174]"
                  >
                    Add to booking cart
                  </button>
                </article>
              )
            )}
          </div>
        ) : (
          <div className="mt-10 rounded-3xl border border-dashed border-gray-200 bg-white px-8 py-12 text-center">
            <h3 className="font-bold text-gray-900">
              No listings available yet
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              This vendor has not added any available listings.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}