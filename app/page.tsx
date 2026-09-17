import Image from "next/image";
import Link from "next/link";

import SearchBar from "@/components/SearchBar";
import VendorCard from "@/components/VendorCard";
import { db } from "@/app/lib/db";

const categories = [
  {
    name: "Rentals",
    icon: "🪑",
    description:
      "Chairs, tables, tents and event equipment",
  },
  {
    name: "Catering",
    icon: "🍽️",
    description:
      "Food, drinks and catering services",
  },
  {
    name: "Decor",
    icon: "✨",
    description:
      "Beautiful styling for every occasion",
  },
  {
    name: "Photography",
    icon: "📸",
    description:
      "Capture every important moment",
  },
  {
    name: "Sound & DJ",
    icon: "🎧",
    description:
      "Music, DJs and professional sound",
  },
  {
    name: "Venues",
    icon: "🏛️",
    description:
      "Find the perfect space for your event",
  },
];

export default async function Home() {
  /*
    LOAD REAL VENDORS FROM THE DATABASE

    For now:
    - Vendor must have an ACTIVE account.
    - Vendor must have at least one available listing.
    - We show only the first 3 vendors.

    Later this section will become genuinely
    "Popular Vendors" or "Top Rated Vendors"
    once ratings and completed bookings exist.
  */
  const vendorProfiles =
    await db.vendorProfile.findMany({
      include: {
        user: true,

        listings: {
          where: {
            isAvailable: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

  const featuredVendors =
    vendorProfiles
      .filter(
        (profile) =>
          profile.user.role === "VENDOR" &&
          profile.user.status === "ACTIVE" &&
          profile.listings.length > 0
      )
      .slice(0, 3)
      .map((profile) => ({
        id: profile.id,

        slug: profile.id,

        businessName:
          profile.businessName?.trim() ||
          `${profile.user.fullName}'s Business`,

        segments: profile.segments,

        listingCount:
          profile.listings.length,

        verified:
          profile.kycStatus === "VERIFIED",

        imageUrl:
          "/home/hero-venue.jpg",
      }));

  return (
    <main className="bg-[#faf9fc]">

      {/* ====================================== */}
      {/* HERO */}
      {/* ====================================== */}
      <section className="relative w-full overflow-x-hidden bg-gradient-to-br from-[#f5f0fb] via-white to-[#eef9f2]">

        <div className="pointer-events-none absolute -left-32 top-12 h-80 w-80 rounded-full bg-[#4f2a91]/10 blur-3xl" />

        <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-green-200/30 blur-3xl" />

        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-10 px-6 py-16 md:px-8 md:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12 lg:px-10">

          {/* LEFT SIDE */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#4f2a91]/10 bg-white/80 px-4 py-2 text-sm font-semibold text-[#4f2a91] shadow-sm backdrop-blur">

              <span className="h-2 w-2 rounded-full bg-green-500" />

              Plan better events with trusted vendors
            </div>

            <h1 className="mt-7 max-w-2xl text-5xl font-bold leading-[1.02] tracking-tight text-gray-950 md:text-6xl lg:text-[64px]">

              Everything your event needs,

              <span className="block text-[#4f2a91]">
                all in one place.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600">
              Discover trusted event vendors, compare services and
              build your perfect event from one simple marketplace.
            </p>

            {/* SEARCH */}
            <div className="mt-8 max-w-2xl rounded-3xl border border-white/70 bg-white p-3 shadow-xl shadow-purple-900/5">
              <SearchBar />
            </div>

            {/* TRUST POINTS */}
            <div className="mt-6 flex flex-wrap gap-x-7 gap-y-3 text-sm text-gray-500">

              <span className="flex items-center gap-2">
                <span className="text-green-600">
                  ✓
                </span>

                Verified vendors
              </span>

              <span className="flex items-center gap-2">
                <span className="text-green-600">
                  ✓
                </span>

                Multiple services
              </span>

              <span className="flex items-center gap-2">
                <span className="text-green-600">
                  ✓
                </span>

                One booking cart
              </span>
            </div>
          </div>

          {/* RIGHT SIDE - IMAGE COLLAGE */}
          <div className="relative mx-auto hidden h-[520px] w-full max-w-[520px] lg:block">

            {/* MAIN IMAGE */}
            <div className="absolute right-0 top-0 h-[390px] w-[80%] overflow-hidden rounded-[32px] shadow-2xl shadow-purple-900/10">

              <Image
                src="/home/hero-venue.jpg"
                alt="Beautifully decorated event venue"
                fill
                priority
                sizes="520px"
                className="object-cover"
              />
            </div>

            {/* CATERING IMAGE */}
            <div className="absolute bottom-0 left-0 h-[230px] w-[48%] overflow-hidden rounded-[28px] border-8 border-white shadow-xl">

              <Image
                src="/home/hero-catering.jpg"
                alt="Event catering display"
                fill
                sizes="280px"
                className="object-cover"
              />
            </div>

            {/* DETAIL IMAGE */}
            <div className="absolute bottom-8 right-0 h-[190px] w-[38%] overflow-hidden rounded-[26px] border-8 border-white shadow-xl">

              <Image
                src="/home/hero-detail.jpg"
                alt="Elegant event table setting"
                fill
                sizes="220px"
                className="object-cover"
              />
            </div>

            {/* FLOATING RATING CARD */}
            <div className="absolute left-3 top-16 rounded-2xl bg-white px-5 py-4 shadow-xl">

              <p className="text-sm font-semibold text-gray-900">
                ★ 4.9
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Top-rated vendors
              </p>
            </div>

            {/* VERIFIED CARD */}
            <div className="absolute right-5 top-[385px] rounded-2xl bg-white px-5 py-3 shadow-xl">

              <p className="text-sm font-semibold text-green-700">
                ✓ Verified vendors
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================== */}
      {/* EXPLORE / CATEGORIES */}
      {/* ====================================== */}
      <section
        id="explore"
        className="scroll-mt-28 mx-auto max-w-7xl px-6 py-20"
      >

        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#4f2a91]">
              Explore
            </p>

            <h2 className="mt-2 text-3xl font-bold text-gray-900 md:text-4xl">
              What are you looking for?
            </h2>

            <p className="mt-3 text-gray-500">
              Browse vendors by the services you need for your event.
            </p>
          </div>

          {/* IMPORTANT:
              This link is NOT inside categories.map(),
              therefore it does not use category.name.
          */}
          <Link
            href="/customer/vendors"
            className="text-sm font-semibold text-[#4f2a91] transition hover:text-[#3e2174]"
          >
            View all vendors →
          </Link>
        </div>

        {/* CATEGORY CARDS */}
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

          {categories.map(
            (category) => (
              <Link
                key={
                  category.name
                }
                href={`/customer/vendors?segment=${encodeURIComponent(
                  category.name
                )}`}
                className="group rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#4f2a91]/20 hover:shadow-lg"
              >

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f3edfb] text-2xl transition group-hover:scale-105">
                  {category.icon}
                </div>

                <h3 className="mt-5 text-xl font-bold text-gray-900 transition group-hover:text-[#4f2a91]">
                  {category.name}
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  {category.description}
                </p>

                <p className="mt-5 text-sm font-semibold text-[#4f2a91]">
                  Explore {category.name} →
                </p>
              </Link>
            )
          )}
        </div>
      </section>

      {/* ====================================== */}
      {/* FEATURED VENDORS */}
      {/* ====================================== */}
      <section
        id="featured-vendors"
        className="border-y border-gray-100 bg-white"
      >

        <div className="mx-auto max-w-7xl px-6 py-20">

          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">

            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[#4f2a91]">
                Discover
              </p>

              <h2 className="mt-2 text-3xl font-bold text-gray-900 md:text-4xl">
                Featured vendors
              </h2>

              <p className="mt-3 max-w-2xl text-gray-500">
                Discover a selection of event businesses currently
                available on Flamingo.
              </p>
            </div>

            <Link
              href="/customer/vendors"
              className="text-sm font-semibold text-[#4f2a91] transition hover:text-[#3e2174]"
            >
              Browse all vendors →
            </Link>
          </div>

          {featuredVendors.length >
          0 ? (
            <div className="mt-10 grid gap-7 md:grid-cols-2 lg:grid-cols-3">

              {featuredVendors.map(
                (vendor) => (
                  <VendorCard
                    key={
                      vendor.id
                    }
                    businessName={
                      vendor.businessName
                    }
                    slug={
                      vendor.slug
                    }
                    segments={
                      vendor.segments
                    }
                    listingCount={
                      vendor.listingCount
                    }
                    verified={
                      vendor.verified
                    }
                    imageUrl={
                      vendor.imageUrl
                    }
                  />
                )
              )}
            </div>
          ) : (
            <div className="mt-10 rounded-3xl border border-dashed border-purple-200 bg-[#faf7ff] px-8 py-12 text-center">

              <h3 className="text-xl font-bold text-gray-900">
                Vendors are getting ready
              </h3>

              <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-gray-500">
                Vendors with available listings will appear here
                automatically.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ====================================== */}
      {/* HOW IT WORKS */}
      {/* ====================================== */}
      <section
        id="how-it-works"
        className="scroll-mt-28 mx-auto max-w-7xl px-6 py-20"
      >

        <div className="mx-auto max-w-2xl text-center">

          <p className="text-sm font-semibold uppercase tracking-wide text-[#4f2a91]">
            Simple planning
          </p>

          <h2 className="mt-2 text-3xl font-bold text-gray-900 md:text-4xl">
            From idea to event in three steps
          </h2>

          <p className="mt-3 text-gray-500">
            Flamingo helps you discover, organise and book everything
            your event needs.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">

          {/* STEP 1 */}
          <div className="relative rounded-3xl border border-gray-100 bg-white p-7 shadow-sm">

            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#4f2a91] font-bold text-white">
              1
            </span>

            <h3 className="mt-5 text-xl font-bold text-gray-900">
              Discover
            </h3>

            <p className="mt-2 leading-6 text-gray-500">
              Search by service, category and location to find vendors
              that fit your event.
            </p>
          </div>

          {/* STEP 2 */}
          <div className="relative rounded-3xl border border-gray-100 bg-white p-7 shadow-sm">

            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#4f2a91] font-bold text-white">
              2
            </span>

            <h3 className="mt-5 text-xl font-bold text-gray-900">
              Build your event
            </h3>

            <p className="mt-2 leading-6 text-gray-500">
              Add services and products from different vendors to your
              booking cart.
            </p>
          </div>

          {/* STEP 3 */}
          <div className="relative rounded-3xl border border-gray-100 bg-white p-7 shadow-sm">

            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#4f2a91] font-bold text-white">
              3
            </span>

            <h3 className="mt-5 text-xl font-bold text-gray-900">
              Book with confidence
            </h3>

            <p className="mt-2 leading-6 text-gray-500">
              Vendors review your requests before your booking is
              confirmed.
            </p>
          </div>
        </div>
      </section>

      {/* ====================================== */}
      {/* VENDOR CTA */}
      {/* ====================================== */}
      <section className="mx-auto max-w-7xl px-6 pb-20">

        <div className="relative min-h-[420px] overflow-hidden rounded-[32px]">

          {/* BACKGROUND IMAGE */}
          <Image
            src="/home/vendor-cta.jpg"
            alt="Professional event setup"
            fill
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="object-cover"
          />

          {/* PURPLE OVERLAY */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#4f2a91] via-[#4f2a91]/90 to-[#4f2a91]/20" />

          {/* CONTENT */}
          <div className="relative flex min-h-[420px] items-center px-8 py-12 md:px-14">

            <div className="max-w-2xl text-white">

              <p className="text-sm font-semibold uppercase tracking-wide text-purple-200">
                For event businesses
              </p>

              <h2 className="mt-3 text-3xl font-bold md:text-5xl">
                Grow your business with Flamingo
              </h2>

              <p className="mt-5 max-w-xl text-base leading-7 text-purple-100 md:text-lg">
                Create listings, build packages, receive booking
                requests and connect with customers looking for
                exactly what you provide.
              </p>

              <Link
                href="/auth/signup"
                className="mt-8 inline-flex rounded-xl bg-white px-6 py-3.5 font-semibold text-[#4f2a91] shadow-sm transition hover:-translate-y-0.5 hover:bg-purple-50"
              >
                Become a vendor
              </Link>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}