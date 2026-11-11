
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/app/lib/session";
import AddListingForm from "@/components/vendor/AddListingForm";

export default async function NewListingPage() {
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

  if (!user.vendorProfile.businessName) {
    redirect("/vendor/onboarding/business");
  }

  return (
    <main className="min-h-[calc(100vh-74px)] bg-[#FFF9FB] px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#B60152]">
          Vendor
        </p>

        <h1 className="mt-2 text-4xl font-bold text-[#29232A]">
          Add Listing
        </h1>

        <p className="mt-3 text-[#737373]">
          Add a product or service customers can discover and book.
        </p>

        <div className="mt-10 rounded-3xl border border-[#F0E3E9] bg-white p-8 shadow-sm">
          <AddListingForm />
        </div>
      </div>
    </main>
  );
}
