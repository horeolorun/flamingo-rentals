
"use client";

import {
  FormEvent,
  useState,
} from "react";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

type LoginFormProps = {
  wasVerified: boolean;
  wasReset: boolean;
};

export default function LoginForm({
  wasVerified,
  wasReset,
}: LoginFormProps) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError("Enter your email and password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: cleanEmail,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Could not sign in.");
        return;
      }

      if (data.user?.role === "VENDOR") {
        router.replace("/vendor/dashboard");
      } else if (data.user?.role === "CUSTOMER") {
        router.replace("/#explore");
      } else {
        setError("Your account type could not be identified.");
        return;
      }

      router.refresh();
    } catch (error) {
      console.error("Login error:", error);

      setError("Something went wrong while signing in.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-[#F0E3E9] bg-white px-4 py-3 text-[#29232A] outline-none transition placeholder:text-gray-400 focus:border-[#B60152] focus:ring-4 focus:ring-[#B60152]/5";

  return (
    <main className="min-h-[calc(100vh-76px)] bg-[#FFF9FB] px-5 py-16 sm:px-6">
      <div className="mx-auto max-w-md">

        {/* PAGE HEADER */}
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.15em] text-[#B60152]">
            Welcome back
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#29232A] sm:text-4xl">
            Sign in to Flamingo
          </h1>

          <p className="mt-3 leading-6 text-[#737373]">
            Continue planning or managing your event business.
          </p>
        </div>

        {/* LOGIN FORM */}
        <form
          onSubmit={handleSubmit}
          className="mt-10 rounded-3xl border border-[#F0E3E9] bg-white p-7 shadow-sm sm:p-8"
        >
          {wasVerified && (
            <div className="mb-6 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm font-medium leading-6 text-green-700">
              ✓ Email verified successfully. Your account is ready.
              Sign in to continue.
            </div>
          )}

          {wasReset && (
            <div className="mb-6 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm font-medium leading-6 text-green-700">
              ✓ Your password has been changed successfully.
              Sign in with your new password.
            </div>
          )}

          {/* EMAIL */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-[#29232A]"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className={inputClass}
            />
          </div>

          {/* PASSWORD */}
          <div className="mt-6">
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-[#29232A]"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              className={inputClass}
            />

            <div className="mt-3 text-right">
              <Link
                href="/auth/forgot-password"
                className="text-sm font-semibold text-[#B60152] transition hover:text-[#970143] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          {/* ERROR MESSAGE */}
          {error && (
            <div className="mt-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-8 w-full rounded-xl bg-[#B60152] px-6 py-3.5 font-semibold text-white shadow-sm transition hover:bg-[#970143] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>

          {/* SIGNUP LINK */}
          <p className="mt-6 text-center text-sm text-[#737373]">
            Don&apos;t have an account?{" "}

            <Link
              href="/auth/signup"
              className="font-semibold text-[#B60152] transition hover:underline"
            >
              Create one
            </Link>
          </p>
        </form>

        <p className="mt-6 text-center text-xs text-[#999199]">
          Welcome to Flamingo Rentals.
        </p>
      </div>
    </main>
  );
}
