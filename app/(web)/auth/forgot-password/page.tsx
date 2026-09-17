"use client";

import {
  FormEvent,
  useState,
} from "react";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

export default function ForgotPasswordPage() {
  const router =
    useRouter();

  const [
    email,
    setEmail,
  ] =
    useState("");

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    isSubmitting,
    setIsSubmitting,
  ] =
    useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    const cleanEmail =
      email
        .trim()
        .toLowerCase();

    if (!cleanEmail) {
      setError(
        "Please enter your email address."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response =
        await fetch(
          "/api/auth/password/request-reset",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                email:
                  cleanEmail,
              }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Could not request a password reset."
        );

        return;
      }

      if (data.devOtp) {
        alert(
          `Development reset OTP: ${data.devOtp}`
        );
      }

      router.push(
        `/auth/reset-password?email=${encodeURIComponent(
          cleanEmail
        )}`
      );
    } catch (error) {
      console.error(
        "Forgot password error:",
        error
      );

      setError(
        "Something went wrong."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-76px)] bg-[#faf9fc] px-6 py-16">
      <div className="mx-auto max-w-md">

        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#4f2a91]">
            Account recovery
          </p>

          <h1 className="mt-3 text-4xl font-bold text-gray-900">
            Forgot your password?
          </h1>

          <p className="mt-3 text-gray-500">
            Enter your email and we&apos;ll send you a verification code.
          </p>
        </div>

        <form
          onSubmit={
            handleSubmit
          }
          className="mt-10 rounded-3xl border border-gray-100 bg-white p-8 shadow-sm"
        >
          <label
            htmlFor="email"
            className="block text-sm font-semibold text-gray-700"
          >
            Email
          </label>

          <input
            id="email"
            type="email"
            value={email}
            onChange={(
              event
            ) =>
              setEmail(
                event.target.value
              )
            }
            placeholder="you@example.com"
            className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#4f2a91]"
          />

          {error && (
            <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={
              isSubmitting
            }
            className="mt-6 w-full rounded-xl bg-[#4f2a91] px-6 py-3.5 font-semibold text-white transition hover:bg-[#3e2174] disabled:opacity-50"
          >
            {isSubmitting
              ? "Sending code..."
              : "Send reset code"}
          </button>

          <p className="mt-6 text-center text-sm text-gray-500">
            Remember your password?{" "}
            <Link
              href="/auth/login"
              className="font-semibold text-[#4f2a91]"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}