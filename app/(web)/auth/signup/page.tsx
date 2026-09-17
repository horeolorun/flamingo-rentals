"use client";

import {
  FormEvent,
  useState,
} from "react";

import Link from "next/link";
import {
  useRouter,
} from "next/navigation";

import {
  vendorSegments,
} from "@/app/data/vendorSegments";

type AccountType =
  | "CUSTOMER"
  | "VENDOR";

export default function SignupPage() {
  const router =
    useRouter();

  const [
    accountType,
    setAccountType,
  ] =
    useState<AccountType>(
      "CUSTOMER"
    );

  const [
    fullName,
    setFullName,
  ] =
    useState("");

  const [
    email,
    setEmail,
  ] =
    useState("");

  const [
    phone,
    setPhone,
  ] =
    useState("");

  const [
    password,
    setPassword,
  ] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] =
    useState("");

  const [
    selectedSegments,
    setSelectedSegments,
  ] =
    useState<string[]>([]);

  const [
    marketingEmailsOptIn,
    setMarketingEmailsOptIn,
  ] =
    useState(false);

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

  function toggleSegment(
    segment: string
  ) {
    setSelectedSegments(
      (current) =>
        current.includes(
          segment
        )
          ? current.filter(
              (item) =>
                item !==
                segment
            )
          : [
              ...current,
              segment,
            ]
    );
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    const cleanName =
      fullName.trim();

    const cleanEmail =
      email
        .trim()
        .toLowerCase();

    const cleanPhone =
      phone.trim();

    if (!cleanName) {
      setError(
        "Please enter your full name."
      );
      return;
    }

    if (!cleanEmail) {
      setError(
        "Please enter your email address."
      );
      return;
    }

    if (
      accountType ===
        "VENDOR" &&
      !cleanPhone
    ) {
      setError(
        "Please enter your phone number."
      );
      return;
    }

    if (
      password.length < 8
    ) {
      setError(
        "Password must be at least 8 characters."
      );
      return;
    }

    if (
      password !==
      confirmPassword
    ) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    if (
      accountType ===
        "VENDOR" &&
      selectedSegments.length ===
        0
    ) {
      setError(
        "Please select at least one business segment."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const registerResponse =
        await fetch(
          "/api/auth/register",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                fullName:
                  cleanName,

                email:
                  cleanEmail,

                phone:
                  accountType ===
                  "VENDOR"
                    ? cleanPhone
                    : null,

                password,

                role:
                  accountType,

                segments:
                  accountType ===
                  "VENDOR"
                    ? selectedSegments
                    : [],

                marketingEmailsOptIn,
              }),
          }
        );

      const registerData =
        await registerResponse.json();

      if (
        !registerResponse.ok
      ) {
        setError(
          registerData.message ||
            "Could not create account."
        );

        return;
      }

      const otpResponse =
        await fetch(
          "/api/auth/send-otp",
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

      const otpData =
        await otpResponse.json();

      if (!otpResponse.ok) {
        setError(
          otpData.message ||
            "Account created, but the verification code could not be sent."
        );

        return;
      }

      if (otpData.devOtp) {
        alert(
          `Development OTP: ${otpData.devOtp}`
        );
      }

      router.push(
        `/auth/verify?email=${encodeURIComponent(
          cleanEmail
        )}`
      );
    } catch (error) {
      console.error(
        "Signup error:",
        error
      );

      setError(
        "Something went wrong while creating your account."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-76px)] bg-[#faf9fc] px-6 py-12">
      <div className="mx-auto max-w-2xl">

        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#4f2a91]">
            Join Flamingo
          </p>

          <h1 className="mt-3 text-4xl font-bold text-gray-900">
            Create your account
          </h1>

          <p className="mt-3 text-gray-500">
            Plan your event or grow your event business.
          </p>
        </div>

        <form
          onSubmit={
            handleSubmit
          }
          className="mt-10 rounded-3xl border border-gray-100 bg-white p-8 shadow-sm"
        >

          {/* ACCOUNT TYPE */}
          <div>
            <p className="text-sm font-semibold text-gray-700">
              I want to use Flamingo as
            </p>

            <div className="mt-3 grid grid-cols-2 gap-3">

              <button
                type="button"
                onClick={() =>
                  setAccountType(
                    "CUSTOMER"
                  )
                }
                className={`rounded-xl border px-4 py-4 text-sm font-semibold transition ${
                  accountType ===
                  "CUSTOMER"
                    ? "border-[#4f2a91] bg-[#f5f0fc] text-[#4f2a91]"
                    : "border-gray-200 text-gray-600"
                }`}
              >
                Customer
              </button>

              <button
                type="button"
                onClick={() =>
                  setAccountType(
                    "VENDOR"
                  )
                }
                className={`rounded-xl border px-4 py-4 text-sm font-semibold transition ${
                  accountType ===
                  "VENDOR"
                    ? "border-[#4f2a91] bg-[#f5f0fc] text-[#4f2a91]"
                    : "border-gray-200 text-gray-600"
                }`}
              >
                Vendor
              </button>
            </div>
          </div>

          {/* FULL NAME */}
          <div className="mt-6">
            <label
              htmlFor="fullName"
              className="block text-sm font-semibold text-gray-700"
            >
              Full name
            </label>

            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(
                event
              ) =>
                setFullName(
                  event.target
                    .value
                )
              }
              placeholder="Enter your full name"
              className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#4f2a91]"
            />
          </div>

          {/* EMAIL */}
          <div className="mt-6">
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
                  event.target
                    .value
                )
              }
              placeholder="you@example.com"
              className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#4f2a91]"
            />
          </div>

          {/* VENDOR PHONE */}
          {accountType ===
            "VENDOR" && (
            <div className="mt-6">
              <label
                htmlFor="phone"
                className="block text-sm font-semibold text-gray-700"
              >
                Phone number
              </label>

              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(
                  event
                ) =>
                  setPhone(
                    event.target
                      .value
                  )
                }
                placeholder="+234..."
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#4f2a91]"
              />

              <p className="mt-2 text-xs text-gray-500">
                Required for vendor accounts.
              </p>
            </div>
          )}

          {/* PASSWORD */}
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
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
                placeholder="At least 8 characters"
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#4f2a91]"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-semibold text-gray-700"
              >
                Confirm password
              </label>

              <input
                id="confirmPassword"
                type="password"
                value={
                  confirmPassword
                }
                onChange={(
                  event
                ) =>
                  setConfirmPassword(
                    event.target
                      .value
                  )
                }
                placeholder="Repeat password"
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#4f2a91]"
              />
            </div>
          </div>

          {/* VENDOR SEGMENTS */}
          {accountType ===
            "VENDOR" && (
            <div className="mt-8 border-t border-gray-100 pt-7">
              <h2 className="text-lg font-bold text-gray-900">
                What does your business provide?
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Select all that apply.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                {vendorSegments.map(
                  (segment) => {
                    const selected =
                      selectedSegments.includes(
                        segment
                      );

                    return (
                      <button
                        key={
                          segment
                        }
                        type="button"
                        onClick={() =>
                          toggleSegment(
                            segment
                          )
                        }
                        className={`rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
                          selected
                            ? "border-[#4f2a91] bg-[#4f2a91] text-white"
                            : "border-gray-200 bg-white text-gray-600"
                        }`}
                      >
                        {selected &&
                          "✓ "}
                        {segment}
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          )}

          {/* MARKETING EMAIL */}
          <label className="mt-8 flex cursor-pointer items-start gap-3 rounded-2xl bg-[#faf9fc] p-4">
            <input
              type="checkbox"
              checked={
                marketingEmailsOptIn
              }
              onChange={(
                event
              ) =>
                setMarketingEmailsOptIn(
                  event.target
                    .checked
                )
              }
              className="mt-1 h-4 w-4 accent-[#4f2a91]"
            />

            <span className="text-sm leading-6 text-gray-600">
              I&apos;d like to receive Flamingo updates,
              offers and event inspiration by email.
            </span>
          </label>

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
            className="mt-8 w-full rounded-xl bg-[#4f2a91] px-6 py-3.5 font-semibold text-white transition hover:bg-[#3e2174] disabled:opacity-50"
          >
            {isSubmitting
              ? "Creating account..."
              : "Create account"}
          </button>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
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