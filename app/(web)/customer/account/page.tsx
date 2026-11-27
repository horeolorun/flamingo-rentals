
import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/app/lib/session";

export default async function CustomerAccountPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  if (user.role === "VENDOR") {
    redirect("/vendor/dashboard");
  }

  return (
    <main className="min-h-[calc(100vh-73px)] bg-[#FFF9FB] px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#B60152]">
          Customer account
        </p>

        <h1 className="mt-3 text-4xl font-bold text-[#29232A]">
          Welcome, {user.fullName}
        </h1>

        <p className="mt-3 text-[#737373]">
          Manage your Flamingo customer account and bookings.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/customer/bookings"
            className="rounded-xl bg-[#B60152] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#C40032]"
          >
            View My Bookings
          </Link>
          <Link
            href="/customer/cart"
            className="rounded-xl border border-[#EAC6D5] bg-white px-5 py-3 text-sm font-semibold text-[#B60152] transition hover:bg-[#FCEBF2]"
          >
            Open Booking Cart
          </Link>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-[#F0E3E9] bg-white p-6 shadow-sm">
            <p className="text-sm text-[#737373]">
              Account type
            </p>

            <p className="mt-2 text-lg font-semibold text-[#29232A]">
              {user.role}
            </p>
          </div>

          <div className="rounded-2xl border border-[#F0E3E9] bg-white p-6 shadow-sm">
            <p className="text-sm text-[#737373]">
              Email
            </p>

            <p className="mt-2 text-lg font-semibold text-[#29232A]">
              {user.email || "Not provided"}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
