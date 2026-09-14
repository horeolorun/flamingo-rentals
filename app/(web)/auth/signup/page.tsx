"use client";

import {
  FormEvent,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { vendorSegments } from "@/app/data/vendorSegments";

type AccountType =
  | "CUSTOMER"
  | "VENDOR";

type ContactMethod =
  | "EMAIL"
  | "PHONE";

export default function SignupPage() {
  const router = useRouter();

  const [accountType, setAccountType] =
    useState<AccountType>(
      "CUSTOMER"
    );

  const [
    contactMethod,
    setContactMethod,
  ] = useState<ContactMethod>(
    "EMAIL"
  );

  const [fullName, setFullName] =
    useState("");

  const [identifier, setIdentifier] =
    useState("");

  const [
    selectedSegments,
    setSelectedSegments,
  ] = useState<string[]>([]);

  const [error, setError] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  function toggleSegment(
    segment: string
  ) {
    setSelectedSegments(
      (current) =>
        current.includes(segment)
          ? current.filter(
              (item) =>
                item !== segment
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

    const cleanIdentifier =
      identifier.trim();

    if (!fullName.trim()) {
      setError(
        "Please enter your full name."
      );

      return;
    }

    if (!cleanIdentifier) {
      setError(
        contactMethod === "EMAIL"
          ? "Please enter your email address."
          : "Please enter your phone number."
      );

      return;
    }

    if (
      accountType === "VENDOR" &&
      selectedSegments.length === 0
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
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              fullName:
                fullName.trim(),

              role: accountType,

              email:
                contactMethod ===
                "EMAIL"
                  ? cleanIdentifier
                  : null,

              phone:
                contactMethod ===
                "PHONE"
                  ? cleanIdentifier
                  : null,

              segments:
                accountType ===
                "VENDOR"
                  ? selectedSegments
                  : [],
            }),
          }
        );

      const registerData =
        await registerResponse.json();

      if (!registerResponse.ok) {
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
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              identifier:
                cleanIdentifier,
            }),
          }
        );

      const otpData =
  await otpResponse.json();

if (!otpResponse.ok) {
  setError(
    otpData.message ||
      "Account created, but we could not send the verification code."
  );

  return;
}

if (otpData.devOtp) {
  alert(
    `Development OTP: ${otpData.devOtp}`
  );
}

router.push(
  `/auth/verify?identifier=${encodeURIComponent(
    cleanIdentifier
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
    <main className="min-h-[calc(100vh-72px)] bg-[#faf9fc] px-6 py-12">
      <div className="mx-auto max-w-2xl">

        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#4f2a91]">
            Join Flamingo
          </p>

          <h1 className="mt-3 text-4xl font-bold text-gray-900">
            Create your account
          </h1>

          <p className="mt-3 text-gray-500">
            Find everything for your event
            or grow your event business.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
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
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
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
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                Vendor
              </button>
            </div>
          </div>

          {/* NAME */}

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
              onChange={(event) =>
                setFullName(
                  event.target.value
                )
              }
              placeholder="Enter your full name"
              className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#4f2a91]"
            />
          </div>

          {/* CONTACT METHOD */}

          <div className="mt-6">
            <p className="text-sm font-semibold text-gray-700">
              Verify using
            </p>

            <div className="mt-3 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setContactMethod(
                    "EMAIL"
                  );

                  setIdentifier("");
                }}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  contactMethod ===
                  "EMAIL"
                    ? "bg-[#4f2a91] text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                Email
              </button>

              <button
                type="button"
                onClick={() => {
                  setContactMethod(
                    "PHONE"
                  );

                  setIdentifier("");
                }}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  contactMethod ===
                  "PHONE"
                    ? "bg-[#4f2a91] text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                Phone
              </button>
            </div>

            <input
              type={
                contactMethod ===
                "EMAIL"
                  ? "email"
                  : "tel"
              }
              value={identifier}
              onChange={(event) =>
                setIdentifier(
                  event.target.value
                )
              }
              placeholder={
                contactMethod ===
                "EMAIL"
                  ? "you@example.com"
                  : "+234..."
              }
              className="mt-3 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#4f2a91]"
            />
          </div>

          {/* VENDOR SEGMENTS */}

          {accountType ===
            "VENDOR" && (
            <div className="mt-8 border-t border-gray-100 pt-7">
              <h2 className="text-lg font-bold text-gray-900">
                What does your business
                provide?
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Select all that apply.
                You can update these later.
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
                            : "border-gray-200 bg-white text-gray-600 hover:border-[#4f2a91]/40"
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

          {/* ERROR */}

          {error && (
            <div className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {/* SUBMIT */}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-8 w-full rounded-xl bg-[#4f2a91] px-6 py-3.5 font-semibold text-white shadow-sm transition hover:bg-[#3e2174] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting
              ? "Creating account..."
              : "Continue"}
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