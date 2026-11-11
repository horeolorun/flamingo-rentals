
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/app/lib/session";

export default async function VendorMessagesPage() {
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
          Messages
        </h1>

        <p className="mt-3 text-[#737373]">
          Customer conversations will appear here.
        </p>

        <div className="mt-10 rounded-3xl border border-[#F0E3E9] bg-white p-8 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FCEBF2] text-xl text-[#B60152]">
            <span>✉</span>
          </div>

          <h2 className="mt-5 text-xl font-bold text-[#29232A]">
            No conversations yet
          </h2>

          <p className="mt-2 max-w-xl leading-7 text-[#737373]">
            Messages between customers and your business will be shown
            here once chat is connected.
          </p>
        </div>
      </div>
    </main>
  );
}
