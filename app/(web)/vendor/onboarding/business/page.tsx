import Link from "next/link";
import { redirect } from "next/navigation";

import BusinessProfileForm from "@/components/vendor/BusinessProfileForm";
import { getCurrentUser } from "@/app/lib/session";

export default async function VendorBusinessOnboardingPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  if (user.role !== "VENDOR") {
    redirect("/customer/account");
  }

  if (!user.vendorProfile) {
    redirect("/vendor/dashboard");
  }

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#faf9fc] px-6 py-12">
      <div className="mx-auto max-w-3xl">

        <Link
          href="/vendor/onboarding"
          className="text-sm font-semibold text-[#4f2a91]"
        >
          ← Back to setup
        </Link>

        <p className="mt-8 text-sm font-semibold uppercase tracking-wide text-[#4f2a91]">
          Step 1 of 3
        </p>

        <h1 className="mt-2 text-4xl font-bold text-gray-900">
          Business Profile
        </h1>

        <p className="mt-3 text-gray-500">
          Tell us how your business
          should appear to customers
          on Flamingo.
        </p>

        <div className="mt-10 rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
          <BusinessProfileForm
            initialBusinessName={
              user.vendorProfile
                .businessName ?? ""
            }
            initialSegments={
              user.vendorProfile
                .segments
            }
          />
        </div>
      </div>
    </main>
  );
}