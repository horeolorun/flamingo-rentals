import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { vendors } from "@/app/data/vendor";

type VendorPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function VendorPage({
  params,
}: VendorPageProps) {
  const { slug } = await params;

  const vendor = vendors.find(
    (vendor) => vendor.slug === slug
  );

  if (!vendor) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#faf9fc]">
      {/* HERO IMAGE */}
      <section className="relative h-[360px] w-full overflow-hidden">
        <Image
          src={vendor.imageUrl}
          alt={vendor.businessName}
          fill
          priority
          className="object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0">
          <div className="mx-auto max-w-7xl px-6 pb-10">
            <Link
              href="/"
              className="mb-5 inline-block text-sm font-medium text-white/90 hover:text-white"
            >
              ← Back to marketplace
            </Link>

            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-white/90 px-3 py-1 text-sm font-medium text-[#4f2a91]">
                {vendor.category}
              </span>

              {vendor.verified && (
                <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                  Verified vendor
                </span>
              )}
            </div>

            <h1 className="mt-4 text-4xl font-bold text-white md:text-5xl">
              {vendor.businessName}
            </h1>

            <p className="mt-3 text-white/90">
              {vendor.city}, {vendor.region}
            </p>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-12 lg:grid-cols-[1fr_340px]">

        {/* MAIN DETAILS */}
        <div>
          <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#4f2a91]">
              About this vendor
            </p>

            <h2 className="mt-3 text-2xl font-bold text-gray-900">
              {vendor.businessName}
            </h2>

            <p className="mt-4 leading-7 text-gray-600">
              Explore services from {vendor.businessName}.
              This vendor provides {vendor.category.toLowerCase()} services
              for events in {vendor.city}.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-[#faf9fc] p-5">
                <p className="text-sm text-gray-500">
                  Rating
                </p>

                <p className="mt-2 text-xl font-bold text-gray-900">
                  ★ {vendor.rating}
                </p>
              </div>

              <div className="rounded-2xl bg-[#faf9fc] p-5">
                <p className="text-sm text-gray-500">
                  Customers
                </p>

                <p className="mt-2 text-xl font-bold text-gray-900">
                  {vendor.customerCount}
                </p>
              </div>

              <div className="rounded-2xl bg-[#faf9fc] p-5">
                <p className="text-sm text-gray-500">
                  Category
                </p>

                <p className="mt-2 text-xl font-bold text-gray-900">
                  {vendor.category}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900">
              Services & packages
            </h2>

            <p className="mt-3 text-gray-500">
              Vendor listings and packages will appear here once we connect
              the marketplace listings database.
            </p>
          </div>
        </div>

        {/* SIDEBAR */}
        <aside>
          <div className="sticky top-24 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Interested in this vendor?
            </p>

            <h3 className="mt-2 text-xl font-bold text-gray-900">
              Start planning your event
            </h3>

            <button
              type="button"
              className="mt-6 w-full rounded-xl bg-[#4f2a91] px-5 py-3.5 font-semibold text-white transition hover:bg-[#3e2174]"
            >
              View services
            </button>

            <button
              type="button"
              className="mt-3 w-full rounded-xl border border-gray-200 px-5 py-3.5 font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Contact vendor
            </button>

            <div className="mt-6 border-t border-gray-100 pt-5">
              <p className="text-sm text-gray-500">
                Location
              </p>

              <p className="mt-1 font-medium text-gray-900">
                {vendor.city}, {vendor.region}
              </p>
            </div>
          </div>
        </aside>

      </section>
    </main>
  );
}