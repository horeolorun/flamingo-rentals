
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/app/lib/session";

export default async function VendorAnalyticsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  if (user.role !== "VENDOR") {
    redirect("/customer/account");
  }

  return (
    <main className="min-h-[calc(100vh-73px)] bg-[#FFF9FB] px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#B60152]">
          Vendor
        </p>

        <h1 className="mt-3 text-4xl font-bold text-[#29232A]">
          Analytics
        </h1>

        <p className="mt-3 text-[#737373]">
          Performance information for your Flamingo business.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-[#F0E3E9] bg-white p-6 shadow-sm">
            <p className="text-sm text-[#737373]">
              Total orders
            </p>

            <p className="mt-2 text-3xl font-bold text-[#29232A]">
              0
            </p>
          </div>

          <div className="rounded-2xl border border-[#F0E3E9] bg-white p-6 shadow-sm">
            <p className="text-sm text-[#737373]">
              Customers
            </p>

            <p className="mt-2 text-3xl font-bold text-[#29232A]">
              0
            </p>
          </div>

          <div className="rounded-2xl border border-[#F0E3E9] bg-white p-6 shadow-sm">
            <p className="text-sm text-[#737373]">
              Revenue
            </p>

            <p className="mt-2 text-3xl font-bold text-[#B60152]">
              ₦0
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
