"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ArrowRight,
  KeyRound,
  RefreshCw,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [identifier, setIdentifier] = useState("");
  const [code, setCode] = useState("");

  const [step, setStep] =
    useState<"identifier" | "otp">("identifier");

  const [devOtp, setDevOtp] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  async function requestOtp(
    event?: FormEvent<HTMLFormElement>
  ) {
    event?.preventDefault();

    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch(
        "/api/auth/login/request-otp",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            identifier,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to generate login code"
        );

        return;
      }

      if (data.devOtp) {
        setDevOtp(data.devOtp);
      }

      setStep("otp");

      setMessage(
        "Your login verification code has been generated."
      );
    } catch (error) {
      console.error(
        "Login OTP request error:",
        error
      );

      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function verifyLogin(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch(
        "/api/auth/login/verify-otp",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            identifier,
            code,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Unable to sign in"
        );

        return;
      }

      if (data.user.role === "VENDOR") {
        router.push("/vendor/dashboard");
      } else {
   router.push("/customer/account");
      }

      router.refresh();
    } catch (error) {
      console.error(
        "Login verification error:",
        error
      );

      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-73px)] bg-[#faf9fc]">
      <div className="mx-auto flex max-w-7xl justify-center px-6 py-20">

        <section className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-8 shadow-xl shadow-purple-900/5">

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-[#4f2a91]">
            <KeyRound size={24} />
          </div>

          <h1 className="mt-5 text-3xl font-bold text-gray-900">
            Welcome back
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            Sign in to Flamingo using your email or phone number.
          </p>

          {step === "identifier" && (
            <form
              onSubmit={requestOtp}
              className="mt-7 space-y-5"
            >
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Email or phone number
                </label>

                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(event) =>
                    setIdentifier(
                      event.target.value
                    )
                  }
                  placeholder="you@example.com or +234..."
                  className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#4f2a91] focus:ring-4 focus:ring-purple-100"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#4f2a91] px-5 py-3.5 font-medium text-white transition hover:bg-[#3e2174] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting
                  ? "Generating code..."
                  : "Continue"}

                {!isSubmitting && (
                  <ArrowRight size={18} />
                )}
              </button>
            </form>
          )}

          {step === "otp" && (
            <form
              onSubmit={verifyLogin}
              className="mt-7 space-y-5"
            >
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Verification code
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(event) =>
                    setCode(
                      event.target.value.replace(
                        /\D/g,
                        ""
                      )
                    )
                  }
                  placeholder="000000"
                  className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-center text-2xl font-semibold tracking-[0.5em] outline-none transition focus:border-[#4f2a91] focus:ring-4 focus:ring-purple-100"
                />
              </div>

              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  code.length !== 6
                }
                className="flex w-full items-center justify-center rounded-xl bg-[#4f2a91] px-5 py-3.5 font-medium text-white transition hover:bg-[#3e2174] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting
                  ? "Signing in..."
                  : "Sign in"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("identifier");
                  setCode("");
                  setDevOtp("");
                  setError("");
                  setMessage("");
                }}
                className="w-full text-sm font-semibold text-gray-500"
              >
                Use a different email or phone
              </button>
            </form>
          )}

          {devOtp && (
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                Development only
              </p>

              <p className="mt-1 text-sm text-amber-800">
                Login OTP:{" "}
                <strong>{devOtp}</strong>
              </p>
            </div>
          )}

          {error && (
            <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {message && (
            <div className="mt-5 rounded-xl bg-green-50 p-4 text-sm text-green-700">
              {message}
            </div>
          )}

          {step === "otp" && (
            <button
              type="button"
              onClick={() => requestOtp()}
              disabled={isSubmitting}
              className="mt-5 flex w-full items-center justify-center gap-2 text-sm font-semibold text-[#4f2a91] disabled:opacity-50"
            >
              <RefreshCw size={16} />
              Send another code
            </button>
          )}

          <p className="mt-7 text-center text-sm text-gray-500">
            Don't have an account?{" "}
           <Link
  href="/auth/signup"
              className="font-semibold text-[#4f2a91]"
            >
              Sign up
            </Link>
          </p>

        </section>

      </div>
    </main>
  );
}