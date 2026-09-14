import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/app/lib/session";

export default async function VendorOnboardingPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  if (user.role !== "VENDOR") {
    redirect("/customer/account");
  }

  const profile = user.vendorProfile;

  if (!profile) {
    redirect("/auth/signup");
  }

  const businessComplete =
    Boolean(profile.businessName);

  const kycComplete =
    profile.kycStatus === "VERIFIED";

  const payoutComplete =
    profile.payoutStatus === "VERIFIED";

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#faf9fc] px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#4f2a91]">
          Vendor Setup
        </p>

        <h1 className="mt-2 text-4xl font-bold text-gray-900">
          Complete your business setup
        </h1>

        <p className="mt-3 max-w-2xl text-gray-500">
          Before you can publish listings and receive bookings,
          we need a few additional details about your business.
        </p>

        <div className="mt-10 space-y-4">

          {/* BUSINESS PROFILE */}
          <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div>
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f3edfb] font-bold text-[#4f2a91]">
                  1
                </span>

                <h2 className="text-lg font-bold text-gray-900">
                  Business Profile
                </h2>
              </div>

              <p className="mt-2 pl-12 text-sm text-gray-500">
                Tell customers about your business.
              </p>
            </div>

            {businessComplete ? (
              <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
                Complete
              </span>
            ) : (
              <Link
                href="/vendor/onboarding/business"
                className="rounded-xl bg-[#4f2a91] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3e2174]"
              >
                Start
              </Link>
            )}
          </div>

          {/* KYC */}
          <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div>
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f3edfb] font-bold text-[#4f2a91]">
                  2
                </span>

                <h2 className="text-lg font-bold text-gray-900">
                  Identity Verification
                </h2>
              </div>

              <p className="mt-2 pl-12 text-sm text-gray-500">
                Verify the person responsible for the business.
              </p>
            </div>

            {kycComplete ? (
              <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
                Verified
              </span>
            ) : (
              <span className="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-500">
                Not started
              </span>
            )}
          </div>

          {/* PAYOUT */}
          <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div>
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f3edfb] font-bold text-[#4f2a91]">
                  3
                </span>

                <h2 className="text-lg font-bold text-gray-900">
                  Payout Setup
                </h2>
              </div>

              <p className="mt-2 pl-12 text-sm text-gray-500">
                Add the bank account where Flamingo will send your payouts.
              </p>
            </div>

            {payoutComplete ? (
              <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
                Complete
              </span>
            ) : (
              <span className="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-500">
                Not started
              </span>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}