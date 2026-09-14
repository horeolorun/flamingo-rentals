import { redirect } from "next/navigation";

import { getCurrentUser } from "@/app/lib/session";

export default async function VendorListingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  if (user.role !== "VENDOR") {
    redirect("/customer/account");
  }

  return (
    <main className="min-h-[calc(100vh-73px)] bg-[#faf9fc] px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#4f2a91]">
          Vendor
        </p>

        <h1 className="mt-3 text-4xl font-bold text-gray-900">
          Listings
        </h1>

        <p className="mt-3 text-gray-500">
          Your services, products and event packages will be managed here.
        </p>
      </div>
    </main>
  );
}