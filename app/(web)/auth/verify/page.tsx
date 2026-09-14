"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

export default function VerifyPage() {
  const router = useRouter();

  const [identifier, setIdentifier] = useState("");
  const [code, setCode] = useState("");
  const [devOtp, setDevOtp] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search
    );

    const identifierFromUrl =
      params.get("identifier");

    if (identifierFromUrl) {
      setIdentifier(identifierFromUrl);
    }

    const storedOtp =
      sessionStorage.getItem("flamingoDevOtp");

    if (storedOtp) {
      setDevOtp(storedOtp);
    }
  }, []);

  async function verifyOtp(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch(
        "/api/auth/verify-otp",
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
          data.message || "Verification failed"
        );
        return;
      }

      sessionStorage.removeItem(
        "flamingoDevOtp"
      );

      setDevOtp("");

      setMessage(
        "Your account has been verified successfully."
      );

      setTimeout(() => {
       router.push("/auth/login");
      }, 1500);
    } catch (error) {
      console.error(
        "Verification error:",
        error
      );

      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function resendOtp() {
    setError("");
    setMessage("");
    setIsResending(true);

    try {
      const response = await fetch(
        "/api/auth/send-otp",
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
            "Unable to send another code"
        );
        return;
      }

      if (data.devOtp) {
        sessionStorage.setItem(
          "flamingoDevOtp",
          data.devOtp
        );

        setDevOtp(data.devOtp);
      }

      setMessage(
        "A new verification code has been generated."
      );
    } catch (error) {
      console.error(
        "Resend OTP error:",
        error
      );

      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setIsResending(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-73px)] bg-[#faf9fc]">
      <div className="mx-auto flex max-w-7xl justify-center px-6 py-20">

        <section className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-8 shadow-xl shadow-purple-900/5">

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-[#4f2a91]">
            <ShieldCheck size={24} />
          </div>

          <h1 className="mt-5 text-3xl font-bold text-gray-900">
            Verify your account
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            Enter the six-digit verification code.
          </p>

          <form
            onSubmit={verifyOtp}
            className="mt-7 space-y-5"
          >
            <div>
              <label className="text-sm font-medium text-gray-700">
                Email or phone number
              </label>

              <input
                type="text"
                value={identifier}
                onChange={(event) =>
                  setIdentifier(event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#4f2a91] focus:ring-4 focus:ring-purple-100"
              />
            </div>

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
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-center text-2xl font-semibold tracking-[0.5em] outline-none focus:border-[#4f2a91] focus:ring-4 focus:ring-purple-100"
              />
            </div>

            <button
              type="submit"
              disabled={
                isSubmitting ||
                code.length !== 6
              }
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#4f2a91] px-5 py-3.5 font-medium text-white transition hover:bg-[#3e2174] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting
                ? "Verifying..."
                : "Verify account"}

              {!isSubmitting && (
                <CheckCircle2 size={18} />
              )}
            </button>
          </form>

          {devOtp && (
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                Development only
              </p>

              <p className="mt-1 text-sm text-amber-800">
                Test OTP:{" "}
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

          <button
            type="button"
            onClick={resendOtp}
            disabled={
              isResending ||
              !identifier
            }
            className="mt-6 flex w-full items-center justify-center gap-2 text-sm font-semibold text-[#4f2a91] disabled:opacity-40"
          >
            <RefreshCw size={16} />

            {isResending
              ? "Generating new code..."
              : "Send another code"}
          </button>

        </section>

      </div>
    </main>
  );
}