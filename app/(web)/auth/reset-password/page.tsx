"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [email, setEmail] =
    useState("");

  const [emailLoaded, setEmailLoaded] =
    useState(false);

  const [code, setCode] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [error, setError] =
    useState("");

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  /*
    Read the email only after the page
    has loaded in the browser.

    This avoids useSearchParams during
    Next.js production prerendering.
  */
  useEffect(() => {
    const params =
      new URLSearchParams(
        window.location.search
      );

    const emailParam =
      params.get("email") ?? "";

    setEmail(
      emailParam.trim().toLowerCase()
    );

    setEmailLoaded(true);
  }, []);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!email) {
      setError(
        "Your email address is missing. Please restart the password reset process."
      );

      return;
    }

    if (!code.trim()) {
      setError(
        "Enter your verification code."
      );

      return;
    }

    if (password.length < 8) {
      setError(
        "Password must be at least 8 characters."
      );

      return;
    }

    if (
      password !== confirmPassword
    ) {
      setError(
        "Passwords do not match."
      );

      return;
    }

    setIsSubmitting(true);

    try {
      const response =
        await fetch(
          "/api/auth/password/reset",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              email,
              code: code.trim(),
              password,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Could not reset password."
        );

        return;
      }

      router.replace(
        "/auth/login?reset=1"
      );
    } catch (error) {
      console.error(
        "Reset password error:",
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
            Password reset
          </p>

          <h1 className="mt-3 text-4xl font-bold text-gray-900">
            Choose a new password
          </h1>

          {!emailLoaded ? (
            <p className="mt-3 text-gray-500">
              Loading your password reset request...
            </p>
          ) : email ? (
            <p className="mt-3 text-gray-500">
              Enter the code sent to{" "}
              <span className="font-semibold text-gray-700">
                {email}
              </span>
              .
            </p>
          ) : (
            <p className="mt-3 text-red-600">
              Your email address is missing.
              Please restart the password reset process.
            </p>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-10 rounded-3xl border border-gray-100 bg-white p-8 shadow-sm"
        >
          <div>
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
              onChange={(event) =>
                setCode(
                  event.target.value
                )
              }
              placeholder="123456"
              className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-center text-xl font-semibold tracking-[0.3em] outline-none focus:border-[#4f2a91]"
            />
          </div>

          <div className="mt-6">
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-700"
            >
              New password
            </label>

            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              placeholder="At least 8 characters"
              className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#4f2a91]"
            />
          </div>

          <div className="mt-6">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-semibold text-gray-700"
            >
              Confirm new password
            </label>

            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(
                  event.target.value
                )
              }
              placeholder="Repeat your password"
              className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#4f2a91]"
            />
          </div>

          {error && (
            <div className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={
              isSubmitting ||
              !emailLoaded ||
              !email
            }
            className="mt-8 w-full rounded-xl bg-[#4f2a91] px-6 py-3.5 font-semibold text-white transition hover:bg-[#3e2174] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting
              ? "Changing password..."
              : "Change password"}
          </button>
        </form>
      </div>
    </main>
  );
}