
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

  const statistics = [
    {
      label: "Total orders",
      value: "0",
      description: "All orders received",
      valueColour: "text-[#29232A]",
    },
    {
      label: "Customers",
      value: "0",
      description: "Customers who have ordered",
      valueColour: "text-[#29232A]",
    },
    {
      label: "Revenue",
      value: "₦0",
      description: "Total earnings from orders",
      valueColour: "text-[#B60152]",
    },
  ];

  return (
    <main className="min-h-[calc(100vh-73px)] bg-[#FFF9FB] px-5 py-12 sm:px-6 lg:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10">
          <p className="text-sm font-bold uppercase tracking-[0.15em] text-[#B60152]">
            Vendor dashboard
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#29232A] sm:text-4xl">
            Analytics
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#737373] sm:text-base">
            Track your business performance and monitor your activity on
            Flamingo Rentals.
          </p>
        </div>

        <div className="mb-8 h-px bg-[#F0E3E9]" />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {statistics.map((statistic) => (
            <div
              key={statistic.label}
              className="rounded-2xl border border-[#F0E3E9] bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <p className="text-sm font-medium text-[#737373]">
                {statistic.label}
              </p>

              <p
                className={`mt-4 text-3xl font-bold tracking-tight ${statistic.valueColour}`}
              >
                {statistic.value}
              </p>

              <p className="mt-2 text-xs text-[#999199]">
                {statistic.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-[#F0E3E9] bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-bold text-[#29232A]">
            Business performance
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#737373]">
            Your business performance information will appear here as
            customer orders and transactions are recorded.
          </p>

          <div className="mt-6 rounded-xl border border-dashed border-[#EAC6D5] bg-[#FFF9FB] px-5 py-10 text-center">
            <p className="text-sm font-semibold text-[#B60152]">
              No analytics available yet
            </p>
            <p className="mt-2 text-xs text-[#737373]">
              Your statistics will update as your business grows.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
