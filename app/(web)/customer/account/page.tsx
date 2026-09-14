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
    <main className="min-h-[calc(100vh-73px)] bg-[#faf9fc] px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#4f2a91]">
          Customer account
        </p>

        <h1 className="mt-3 text-4xl font-bold text-gray-900">
          Welcome, {user.fullName}
        </h1>

        <p className="mt-3 text-gray-500">
          Manage your Flamingo customer account.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Account type
            </p>

            <p className="mt-2 text-lg font-semibold text-gray-900">
              {user.role}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Email
            </p>

            <p className="mt-2 text-lg font-semibold text-gray-900">
              {user.email || "Not provided"}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}