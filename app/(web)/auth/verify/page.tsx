"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

export default function VerifyPage() {
  const router =
    useRouter();

  const [
    email,
    setEmail,
  ] =
    useState("");

  const [
    emailLoaded,
    setEmailLoaded,
  ] =
    useState(false);

  const [
    code,
    setCode,
  ] =
    useState("");

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    message,
    setMessage,
  ] =
    useState("");

  const [
    isSubmitting,
    setIsSubmitting,
  ] =
    useState(false);

  const [
    isResending,
    setIsResending,
  ] =
    useState(false);

  useEffect(() => {
    const params =
      new URLSearchParams(
        window.location.search
      );

    const emailParam =
      params.get("email") ?? "";

    setEmail(
      emailParam
        .trim()
        .toLowerCase()
    );

    setEmailLoaded(true);
  }, []);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!email) {
      setError(
        "Your email address is missing. Please restart the signup process."
      );

      return;
    }

    if (!code.trim()) {
      setError(
        "Enter the verification code."
      );

      return;
    }

    setIsSubmitting(true);

    try {
      const response =
        await fetch(
          "/api/auth/verify-otp",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                email,

                code:
                  code.trim(),
              }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Could not verify your email."
        );

        return;
      }

      router.replace(
        "/auth/login?verified=1"
      );
    } catch (error) {
      console.error(
        "Verification error:",
        error
      );

      setError(
        "Something went wrong while verifying your email."
      );
    } finally {
      setIsSubmitting(
        false
      );
    }
  }

  async function resendCode() {
    setError("");
    setMessage("");

    if (!email) {
      setError(
        "Your email address is missing. Please restart the signup process."
      );

      return;
    }

    setIsResending(true);

    try {
      const response =
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
                email,
              }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Could not resend code."
        );

        return;
      }

      if (data.devOtp) {
        alert(
          `Development OTP: ${data.devOtp}`
        );
      }

      setMessage(
        "A new verification code has been generated."
      );
    } catch (error) {
      console.error(
        "Resend error:",
        error
      );

      setError(
        "Could not resend verification code."
      );
    } finally {
      setIsResending(
        false
      );
    }
  }

  return (
    <main className="min-h-[calc(100vh-76px)] bg-[#faf9fc] px-6 py-16">
      <div className="mx-auto max-w-md">

        <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">

          <p className="text-sm font-semibold uppercase tracking-wide text-[#4f2a91]">
            Email verification
          </p>

          <h1 className="mt-3 text-3xl font-bold text-gray-900">
            Check your email
          </h1>

          {!emailLoaded ? (
            <p className="mt-3 text-sm leading-6 text-gray-500">
              Loading your verification request...
            </p>
          ) : email ? (
            <p className="mt-3 text-sm leading-6 text-gray-500">
              Enter the six-digit verification code sent to{" "}

              <span className="font-semibold text-gray-700">
                {email}
              </span>
              .
            </p>
          ) : (
            <p className="mt-3 text-sm leading-6 text-red-600">
              Your email address is missing. Please restart the signup process.
            </p>
          )}

          <form
            onSubmit={
              handleSubmit
            }
            className="mt-8"
          >
            <label
              htmlFor="code"
              className="block text-sm font-semibold text-gray-700"
            >
              Verification code
            </label>

            <input
              id="code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(
                event
              ) =>
                setCode(
                  event.target
                    .value
                )
              }
              placeholder="123456"
              className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-center text-2xl font-semibold tracking-[0.35em] outline-none focus:border-[#4f2a91]"
            />

            {error && (
              <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            {message && (
              <div className="mt-5 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={
                isSubmitting ||
                !emailLoaded ||
                !email
              }
              className="mt-6 w-full rounded-xl bg-[#4f2a91] px-6 py-3.5 font-semibold text-white transition hover:bg-[#3e2174] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting
                ? "Verifying..."
                : "Verify email"}
            </button>
          </form>

          <button
            type="button"
            onClick={
              resendCode
            }
            disabled={
              isResending ||
              !emailLoaded ||
              !email
            }
            className="mt-5 w-full text-sm font-semibold text-[#4f2a91] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isResending
              ? "Sending..."
              : "Resend code"}
          </button>
        </div>
      </div>
    </main>
  );
}