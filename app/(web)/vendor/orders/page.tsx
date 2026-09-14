import { redirect } from "next/navigation";

import { getCurrentUser } from "@/app/lib/session";

export default async function VendorOrdersPage() {
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
          Orders
        </h1>

        <p className="mt-3 text-gray-500">
          Customer requests requiring your acceptance or rejection will
          appear here.
        </p>

        <div className="mt-10 rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">
            No orders yet
          </h2>

          <p className="mt-2 text-gray-500">
            Orders will appear here once the marketplace ordering system
            is connected.
          </p>
        </div>
      </div>
    </main>
  );
}