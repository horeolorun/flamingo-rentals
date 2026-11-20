
import { redirect } from "next/navigation";

import { db } from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/session";

import BundleForm from "./bundle-form";

export default async function NewVendorBundlePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  if (user.role !== "VENDOR") {
    redirect("/customer/account");
  }

  if (!user.vendorProfile) {
    redirect("/vendor/listings");
  }

  const listings = await db.listing.findMany({
    where: {
      vendorProfileId: user.vendorProfile.id,
      status: "ACTIVE",
      isAvailable: true,
    },
    select: {
      id: true,
      title: true,
      category: true,
      description: true,
      priceKobo: true,
      pricingUnit: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="min-h-[calc(100vh-74px)] bg-[#FFF9FB] px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#B60152]">
            Vendor
          </p>

          <h1 className="mt-2 text-4xl font-bold text-[#29232A]">
            Create a Bundle
          </h1>

          <p className="mt-3 max-w-2xl text-[#737373]">
            Combine your existing listings into one package and
            offer customers a fixed bundle price.
          </p>
        </div>

        <div className="mt-8">
          <BundleForm listings={listings} />
        </div>
      </div>
    </main>
  );
}
