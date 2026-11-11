
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

  const businessComplete = Boolean(profile.businessName);

  const kycComplete = profile.kycStatus === "VERIFIED";

  const payoutComplete = profile.payoutStatus === "VERIFIED";

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#FFF9FB] px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#B60152]">
          Vendor Setup
        </p>

        <h1 className="mt-2 text-4xl font-bold text-[#29232A]">
          Complete your business setup
        </h1>

        <p className="mt-3 max-w-2xl leading-7 text-[#737373]">
          Before you can publish listings and receive bookings,
          we need a few additional details about your business.
        </p>

        <div className="mt-10 space-y-4">

          {/* BUSINESS PROFILE */}
          <div className="flex flex-col gap-5 rounded-2xl border border-[#F0E3E9] bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FCEBF2] font-bold text-[#B60152]">
                  1
                </span>

                <h2 className="text-lg font-bold text-[#29232A]">
                  Business Profile
                </h2>
              </div>

              <p className="mt-2 pl-12 text-sm text-[#737373]">
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
                className="rounded-xl bg-[#B60152] px-5 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[#C40032]"
              >
                Start
              </Link>
            )}
          </div>

          {/* KYC */}
          <div className="flex flex-col gap-5 rounded-2xl border border-[#F0E3E9] bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FCEBF2] font-bold text-[#B60152]">
                  2
                </span>

                <h2 className="text-lg font-bold text-[#29232A]">
                  Identity Verification
                </h2>
              </div>

              <p className="mt-2 pl-12 text-sm text-[#737373]">
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
          <div className="flex flex-col gap-5 rounded-2xl border border-[#F0E3E9] bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FCEBF2] font-bold text-[#B60152]">
                  3
                </span>

                <h2 className="text-lg font-bold text-[#29232A]">
                  Payout Setup
                </h2>
              </div>

              <p className="mt-2 pl-12 text-sm text-[#737373]">
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
