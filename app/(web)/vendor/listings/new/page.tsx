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
  redirect(
    "/vendor/onboarding/business"
  );
}
  return (
    <main className="min-h-[calc(100vh-74px)] bg-[#faf9fc] px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#4f2a91]">
          Vendor
        </p>

        <h1 className="mt-2 text-4xl font-bold text-gray-900">
          Add Listing
        </h1>

        <p className="mt-3 text-gray-500">
          Add a product or service customers can discover and book.
        </p>

        <div className="mt-10 rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
          <AddListingForm />
        </div>
      </div>
    </main>
  );
}