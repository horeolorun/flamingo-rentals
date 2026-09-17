import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/app/lib/session";

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function statusClasses(status: string) {
  if (status === "VERIFIED") {
    return "bg-green-50 text-green-700";
  }

  if (status === "PENDING") {
    return "bg-yellow-50 text-yellow-700";
  }

  if (status === "REJECTED") {
    return "bg-red-50 text-red-700";
  }

  return "bg-gray-100 text-gray-600";
}

export default async function VendorDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  if (user.role !== "VENDOR") {
    redirect("/customer/account");
  }

  const profile = user.vendorProfile;

  const businessComplete = Boolean(
    profile?.businessName
  );

  const kycStatus =
    profile?.kycStatus ?? "NOT_STARTED";

  const payoutStatus =
    profile?.payoutStatus ?? "NOT_STARTED";

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#faf9fc] px-6 py-10">
      <div className="mx-auto max-w-7xl">

        {/* WELCOME */}
        <section className="rounded-3xl bg-gradient-to-br from-[#4f2a91] to-[#7146b5] px-8 py-9 text-white shadow-sm">
          <p className="text-sm font-semibold text-white/70">
            Vendor Dashboard
          </p>

          <h1 className="mt-2 text-3xl font-bold md:text-4xl">
            Welcome, {user.fullName}
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80 md:text-base">
            Manage your business, listings and bookings
            from one place.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/vendor/listings"
              className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#4f2a91] transition hover:bg-white/90"
            >
              View Listings
            </Link>

            <Link
              href="/vendor/listings/new"
              className="rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              + Add Listing
            </Link>
          </div>
        </section>

        {/* OVERVIEW */}
        <section className="mt-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[#4f2a91]">
                Overview
              </p>

              <h2 className="mt-1 text-2xl font-bold text-gray-900">
                Your business
              </h2>
            </div>

            <Link
              href="/vendor/profile"
              className="text-sm font-semibold text-[#4f2a91] transition hover:underline"
            >
              View profile
            </Link>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-3">

            {/* BUSINESS */}
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f3edfb] text-xl text-[#4f2a91]">
                🏪
              </div>

              <p className="mt-5 text-sm font-medium text-gray-500">
                Business
              </p>

              <p className="mt-2 text-lg font-bold text-gray-900">
                {profile?.businessName ||
                  "Business profile incomplete"}
              </p>

              {!businessComplete && (
                <Link
                  href="/vendor/onboarding/business"
                  className="mt-4 inline-block text-sm font-semibold text-[#4f2a91] transition hover:underline"
                >
                  Complete profile →
                </Link>
              )}
            </div>

            {/* KYC */}
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f3edfb] text-xl font-bold text-[#4f2a91]">
                ✓
              </div>

              <p className="mt-5 text-sm font-medium text-gray-500">
                Identity verification
              </p>

              <div className="mt-3">
                <span
                  className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${statusClasses(
                    kycStatus
                  )}`}
                >
                  {formatStatus(kycStatus)}
                </span>
              </div>

              {kycStatus === "NOT_STARTED" &&
                businessComplete && (
                  <Link
                    href="/vendor/onboarding"
                    className="mt-4 inline-block text-sm font-semibold text-[#4f2a91] transition hover:underline"
                  >
                    Complete setup →
                  </Link>
                )}
            </div>

            {/* PAYOUT */}
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f3edfb] text-xl font-bold text-[#4f2a91]">
                ₦
              </div>

              <p className="mt-5 text-sm font-medium text-gray-500">
                Payout setup
              </p>

              <div className="mt-3">
                <span
                  className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${statusClasses(
                    payoutStatus
                  )}`}
                >
                  {formatStatus(payoutStatus)}
                </span>
              </div>

              {payoutStatus === "NOT_STARTED" && (
                <Link
                  href="/vendor/onboarding"
                  className="mt-4 inline-block text-sm font-semibold text-[#4f2a91] transition hover:underline"
                >
                  Complete setup →
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* SEGMENTS */}
        {profile?.segments &&
          profile.segments.length > 0 && (
            <section className="mt-8 rounded-3xl border border-gray-100 bg-white p-7 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900">
                Business segments
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Categories you selected for your business.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {profile.segments.map((segment) => (
                  <span
                    key={segment}
                    className="rounded-full bg-[#f3edfb] px-4 py-2 text-sm font-semibold text-[#4f2a91]"
                  >
                    {segment}
                  </span>
                ))}
              </div>
            </section>
          )}

        {/* QUICK ACTIONS */}
        <section className="mt-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#4f2a91]">
              Manage
            </p>

            <h2 className="mt-1 text-2xl font-bold text-gray-900">
              Quick actions
            </h2>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <Link
              href="/vendor/listings"
              className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#4f2a91]/20 hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f3edfb] text-lg text-[#4f2a91]">
                ▦
              </div>

              <p className="mt-4 font-bold text-gray-900 transition group-hover:text-[#4f2a91]">
                Listings
              </p>

              <p className="mt-1 text-sm leading-5 text-gray-500">
                Manage products and services
              </p>
            </Link>

            <Link
              href="/vendor/bookings"
              className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#4f2a91]/20 hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f3edfb] text-lg text-[#4f2a91]">
                ◫
              </div>

              <p className="mt-4 font-bold text-gray-900 transition group-hover:text-[#4f2a91]">
                Bookings
              </p>

              <p className="mt-1 text-sm leading-5 text-gray-500">
                Review customer requests
              </p>
            </Link>

            <Link
              href="/vendor/messages"
              className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#4f2a91]/20 hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f3edfb] text-lg text-[#4f2a91]">
                ✉
              </div>

              <p className="mt-4 font-bold text-gray-900 transition group-hover:text-[#4f2a91]">
                Messages
              </p>

              <p className="mt-1 text-sm leading-5 text-gray-500">
                Talk with customers
              </p>
            </Link>

            <Link
              href="/vendor/analytics"
              className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#4f2a91]/20 hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f3edfb] text-lg text-[#4f2a91]">
                ↗
              </div>

              <p className="mt-4 font-bold text-gray-900 transition group-hover:text-[#4f2a91]">
                Analytics
              </p>

              <p className="mt-1 text-sm leading-5 text-gray-500">
                View business performance
              </p>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}