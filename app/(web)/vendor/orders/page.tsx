
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
    <main className="min-h-[calc(100vh-73px)] bg-[#FFF9FB] px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#B60152]">
          Vendor
        </p>

        <h1 className="mt-3 text-4xl font-bold text-[#29232A]">
          Orders
        </h1>

        <p className="mt-3 max-w-2xl leading-7 text-[#737373]">
          Customer requests requiring your acceptance or rejection will
          appear here.
        </p>

        <div className="mt-10 rounded-3xl border border-[#F0E3E9] bg-white p-8 shadow-sm">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FCEBF2] text-[#B60152]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M8 6h13" />
              <path d="M8 12h13" />
              <path d="M8 18h13" />
              <path d="M3 6h.01" />
              <path d="M3 12h.01" />
              <path d="M3 18h.01" />
            </svg>
          </div>

          <h2 className="text-xl font-bold text-[#29232A]">
            No orders yet
          </h2>

          <p className="mt-2 max-w-xl leading-7 text-[#737373]">
            Orders will appear here once the marketplace ordering system
            is connected.
          </p>
        </div>
      </div>
    </main>
  );
}
