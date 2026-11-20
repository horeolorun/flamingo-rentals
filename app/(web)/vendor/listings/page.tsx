
import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { db } from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/session";

// Server action: publish a vendor listing.
async function publishListing(formData: FormData) {
  "use server";

  const listingId = formData.get("listingId");

  if (typeof listingId !== "string" || !listingId) {
    return;
  }

  const user = await getCurrentUser();

  if (
    !user ||
    user.role !== "VENDOR" ||
    !user.vendorProfile
  ) {
    redirect("/auth/login");
  }

  // Only verified vendors can publish listings.
  if (user.vendorProfile.kycStatus !== "VERIFIED") {
    return;
  }

  // Only publish listings belonging to this vendor.
  // Unavailable listings cannot be published.
  await db.listing.updateMany({
    where: {
      id: listingId,
      vendorProfileId: user.vendorProfile.id,
      status: {
        in: ["DRAFT", "INACTIVE"],
      },
      isAvailable: true,
    },
    data: {
      status: "ACTIVE",
    },
  });

  revalidatePath("/vendor/listings");
  revalidatePath(`/customer/vendors/${user.vendorProfile.id}`);
}

function formatNaira(priceKobo: number) {
  const naira = priceKobo / 100;

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(naira);
}

export default async function VendorListingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  if (user.role !== "VENDOR") {
    redirect("/customer/account");
  }

  if (!user.vendorProfile) {
    return (
      <main className="min-h-screen bg-[#FFF9FB] px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold text-[#29232A]">
            Vendor profile not found
          </h1>
        </div>
      </main>
    );
  }

  const vendorProfile = user.vendorProfile;
  const isVerified = vendorProfile.kycStatus === "VERIFIED";

  const listings = await db.listing.findMany({
    where: {
      vendorProfileId: vendorProfile.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const activeCount = listings.filter(
    (listing) => listing.status === "ACTIVE"
  ).length;

  const draftCount = listings.filter(
    (listing) => listing.status === "DRAFT"
  ).length;

  return (
    <main className="min-h-[calc(100vh-74px)] bg-[#FFF9FB] px-6 py-12">
      <div className="mx-auto max-w-7xl">

        {/* PAGE HEADER */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#B60152]">
              Vendor
            </p>

            <h1 className="mt-2 text-4xl font-bold text-[#29232A]">
              My Listings
            </h1>

            <p className="mt-3 text-[#737373]">
              Manage the services and products customers can book from
              your business.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
  <Link
    href="/vendor/bundles/new"
    className="inline-flex items-center justify-center rounded-xl border border-[#EAC6D5] bg-white px-6 py-3 font-semibold text-[#B60152] transition hover:bg-[#FFF9FB]"
  >
    + Create Bundle
  </Link>

  <Link
    href="/vendor/listings/new"
    className="inline-flex items-center justify-center rounded-xl bg-[#B60152] px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-[#C40032]"
  >
    + Add Listing
  </Link>
</div>
        </div>

        {/* SUMMARY */}
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#F0E3E9] bg-white p-6 shadow-sm">
            <p className="text-sm text-[#737373]">
              Total listings
            </p>
            <p className="mt-2 text-3xl font-bold text-[#29232A]">
              {listings.length}
            </p>
          </div>

          <div className="rounded-2xl border border-[#F0E3E9] bg-white p-6 shadow-sm">
            <p className="text-sm text-[#737373]">
              Published
            </p>
            <p className="mt-2 text-3xl font-bold text-green-700">
              {activeCount}
            </p>
          </div>

          <div className="rounded-2xl border border-[#F0E3E9] bg-white p-6 shadow-sm">
            <p className="text-sm text-[#737373]">
              Drafts
            </p>
            <p className="mt-2 text-3xl font-bold text-yellow-600">
              {draftCount}
            </p>
          </div>
        </div>

        {/* VERIFICATION NOTICE */}
        {!isVerified && (
          <div className="mt-8 rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
            <h2 className="font-bold text-yellow-800">
              Vendor verification required
            </h2>
            <p className="mt-2 text-sm leading-6 text-yellow-800">
              Your vendor profile must be verified before you can
              publish listings for customers to discover and book.
            </p>
          </div>
        )}

        {/* EMPTY STATE */}
        {listings.length === 0 && (
          <div className="mt-8 rounded-3xl border border-dashed border-[#F0E3E9] bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FCEBF2] text-2xl text-[#B60152]">
              +
            </div>

            <h2 className="mt-5 text-2xl font-bold text-[#29232A]">
              You have no listings yet
            </h2>

            <p className="mt-3 text-[#737373]">
              Create your first listing so customers can discover
              what your business offers.
            </p>

            <Link
              href="/vendor/listings/new"
              className="mt-6 inline-flex rounded-xl bg-[#B60152] px-6 py-3 font-semibold text-white transition hover:bg-[#C40032]"
            >
              Create first listing
            </Link>
          </div>
        )}

        {/* LISTINGS */}
        {listings.length > 0 && (
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="rounded-3xl border border-[#F0E3E9] bg-white p-6 shadow-sm transition hover:border-[#F8DCE8] hover:shadow-md"
              >
                {/* TITLE AND STATUS */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-[#B60152]">
                      {listing.category}
                    </p>

                    <h2 className="mt-2 text-xl font-bold text-[#29232A]">
                      {listing.title}
                    </h2>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                      listing.status === "ACTIVE"
                        ? "bg-green-100 text-green-700"
                        : listing.status === "INACTIVE"
                        ? "bg-gray-100 text-gray-600"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {listing.status === "ACTIVE"
                      ? "PUBLISHED"
                      : listing.status}
                  </span>
                </div>

                {/* DESCRIPTION */}
                {listing.description && (
                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-[#737373]">
                    {listing.description}
                  </p>
                )}

                {/* PRICE */}
                <div className="mt-6 border-t border-[#F0E3E9] pt-5">
                  <p className="text-2xl font-bold text-[#29232A]">
                    {formatNaira(listing.priceKobo)}
                  </p>

                  {listing.pricingUnit && (
                    <p className="mt-1 text-sm text-[#737373]">
                      {listing.pricingUnit}
                    </p>
                  )}
                </div>

                {/* AVAILABILITY */}
                <div className="mt-5">
                  <span
                    className={`text-sm font-medium ${
                      listing.isAvailable
                        ? "text-green-700"
                        : "text-gray-400"
                    }`}
                  >
                    {listing.isAvailable
                      ? "● Available"
                      : "● Unavailable"}
                  </span>
                </div>

                {/* PUBLISH ACTION */}
                <div className="mt-6 border-t border-[#F0E3E9] pt-5">
                  {listing.status === "ACTIVE" ? (
                    <div className="rounded-xl bg-green-50 px-4 py-3 text-center text-sm font-semibold text-green-700">
                      ✓ This listing is published
                    </div>
                  ) : listing.isAvailable && isVerified ? (
                    <form action={publishListing}>
                      <input
                        type="hidden"
                        name="listingId"
                        value={listing.id}
                      />

                      <button
                        type="submit"
                        className="w-full rounded-xl bg-[#B60152] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#C40032]"
                      >
                        Publish Listing
                      </button>
                    </form>
                  ) : !isVerified ? (
                    <button
                      type="button"
                      disabled
                      className="w-full cursor-not-allowed rounded-xl bg-gray-200 px-5 py-3 text-sm font-semibold text-gray-500"
                    >
                      Verification required
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="w-full cursor-not-allowed rounded-xl bg-gray-200 px-5 py-3 text-sm font-semibold text-gray-500"
                    >
                      Mark listing available first
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
