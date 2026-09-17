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
  const router =
    useRouter();

  const [
    email,
    setEmail,
  ] =
    useState("");

  const [
    password,
    setPassword,
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

    if (
      !cleanEmail ||
      !password
    ) {
      setError(
        "Enter your email and password."
      );

      return;
    }

    setIsSubmitting(true);

    try {
      const response =
        await fetch(
          "/api/auth/login",
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

                password,
              }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Could not sign in."
        );

        return;
      }

      if (
        data.user?.role ===
        "VENDOR"
      ) {
        router.replace(
          "/vendor/dashboard"
        );
      } else if (
        data.user?.role ===
        "CUSTOMER"
      ) {
        router.replace(
          "/#explore"
        );
      } else {
        setError(
          "Your account type could not be identified."
        );

        return;
      }

      router.refresh();
    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      setError(
        "Something went wrong while signing in."
      );
    } finally {
      setIsSubmitting(
        false
      );
    }
  }

  return (
    <main className="min-h-[calc(100vh-76px)] bg-[#faf9fc] px-6 py-16">

      <div className="mx-auto max-w-md">

        <div className="text-center">

          <p className="text-sm font-semibold uppercase tracking-wide text-[#4f2a91]">
            Welcome back
          </p>

          <h1 className="mt-3 text-4xl font-bold text-gray-900">
            Sign in to Flamingo
          </h1>

          <p className="mt-3 text-gray-500">
            Continue planning or managing your event business.
          </p>
        </div>

        <form
          onSubmit={
            handleSubmit
          }
          className="mt-10 rounded-3xl border border-gray-100 bg-white p-8 shadow-sm"
        >

          {wasVerified && (
            <div className="mb-6 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
              ✓ Email verified successfully. Your account is ready.
              Sign in to continue.
            </div>
          )}

          {wasReset && (
            <div className="mb-6 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
              ✓ Your password has been changed successfully.
              Sign in with your new password.
            </div>
          )}

          <div>

            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-700"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(
                event
              ) =>
                setEmail(
                  event.target
                    .value
                )
              }
              placeholder="you@example.com"
              className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#4f2a91] focus:ring-4 focus:ring-[#4f2a91]/5"
            />
          </div>

          <div className="mt-6">

            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-700"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={
                password
              }
              onChange={(
                event
              ) =>
                setPassword(
                  event.target
                    .value
                )
              }
              placeholder="Enter your password"
              className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#4f2a91] focus:ring-4 focus:ring-[#4f2a91]/5"
            />

            <div className="mt-3 text-right">

              <Link
                href="/auth/forgot-password"
                className="text-sm font-semibold text-[#4f2a91] transition hover:text-[#3e2174]"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          {error && (
            <div className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={
              isSubmitting
            }
            className="mt-8 w-full rounded-xl bg-[#4f2a91] px-6 py-3.5 font-semibold text-white transition hover:bg-[#3e2174] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting
              ? "Signing in..."
              : "Sign in"}
          </button>

          <p className="mt-6 text-center text-sm text-gray-500">

            Don&apos;t have an account?{" "}

            <Link
              href="/auth/signup"
              className="font-semibold text-[#4f2a91]"
            >
              Create one
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}