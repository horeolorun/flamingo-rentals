
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

const nigerianStates = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "Federal Capital Territory",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

type AccountType =
  | "CUSTOMER"
  | "VENDOR";

export default function SignupPage() {
  const router = useRouter();

  const [
    accountType,
    setAccountType,
  ] = useState<AccountType>("CUSTOMER");

  const [
    fullName,
    setFullName,
  ] = useState("");

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    phone,
    setPhone,
  ] = useState("");

  const [
    state,
    setState,
  ] = useState("");

  const [
    city,
    setCity,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    selectedSegments,
    setSelectedSegments,
  ] = useState<string[]>([]);

  const [
    marketingEmailsOptIn,
    setMarketingEmailsOptIn,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  function toggleSegment(segment: string) {
    setSelectedSegments((current) =>
      current.includes(segment)
        ? current.filter((item) => item !== segment)
        : [...current, segment]
    );
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    const cleanName = fullName.trim();

    const cleanEmail = email.trim().toLowerCase();

    const cleanPhone = phone.trim();

    const cleanCity = city.trim();

    if (!cleanName) {
      setError("Please enter your full name.");
      return;
    }

    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (
      accountType === "VENDOR" &&
      !cleanPhone
    ) {
      setError("Please enter your phone number.");
      return;
    }

    if (
      accountType === "CUSTOMER" &&
      !state
    ) {
      setError("Please select your state.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (
      accountType === "VENDOR" &&
      selectedSegments.length === 0
    ) {
      setError("Please select at least one business segment.");
      return;
    }

    setIsSubmitting(true);

    try {
      const registerResponse = await fetch(
        "/api/auth/register",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            fullName: cleanName,

            email: cleanEmail,

            phone:
              accountType === "VENDOR"
                ? cleanPhone
                : null,

            state:
              accountType === "CUSTOMER"
                ? state
                : null,

            city:
              accountType === "CUSTOMER"
                ? cleanCity || null
                : null,

            password,

            role: accountType,

            segments:
              accountType === "VENDOR"
                ? selectedSegments
                : [],

            marketingEmailsOptIn,
          }),
        }
      );

      const registerData = await registerResponse.json();

      if (!registerResponse.ok) {
        setError(
          registerData.message ||
            "Could not create account."
        );
        return;
      }

      const otpResponse = await fetch(
        "/api/auth/send-otp",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: cleanEmail,
          }),
        }
      );

      const otpData = await otpResponse.json();

      if (!otpResponse.ok) {
        setError(
          otpData.message ||
            "Account created, but the verification code could not be sent."
        );
        return;
      }

      if (otpData.devOtp) {
        alert(`Development OTP: ${otpData.devOtp}`);
      }

      router.push(
        `/auth/verify?email=${encodeURIComponent(cleanEmail)}`
      );
    } catch (error) {
      console.error("Signup error:", error);

      setError(
        "Something went wrong while creating your account."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-76px)] bg-[#FFF9FB] px-6 py-12">
      <div className="mx-auto max-w-2xl">

        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#B60152]">
            Join Flamingo
          </p>

          <h1 className="mt-3 text-4xl font-bold text-[#29232A]">
            Create your account
          </h1>

          <p className="mt-3 text-[#737373]">
            Plan your event or grow your event business.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-10 rounded-3xl border border-[#F0E3E9] bg-white p-8 shadow-sm"
        >

          {/* ACCOUNT TYPE */}
          <div>
            <p className="text-sm font-semibold text-[#29232A]">
              I want to use Flamingo as
            </p>

            <div className="mt-3 grid grid-cols-2 gap-3">

              <button
                type="button"
                onClick={() => setAccountType("CUSTOMER")}
                className={`rounded-xl border px-4 py-4 text-sm font-semibold transition ${
                  accountType === "CUSTOMER"
                    ? "border-[#B60152] bg-[#FCEBF2] text-[#B60152]"
                    : "border-[#F0E3E9] text-[#737373] hover:border-[#B60152]/40"
                }`}
              >
                Customer
              </button>

              <button
                type="button"
                onClick={() => setAccountType("VENDOR")}
                className={`rounded-xl border px-4 py-4 text-sm font-semibold transition ${
                  accountType === "VENDOR"
                    ? "border-[#B60152] bg-[#FCEBF2] text-[#B60152]"
                    : "border-[#F0E3E9] text-[#737373] hover:border-[#B60152]/40"
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
              className="block text-sm font-semibold text-[#29232A]"
            >
              Full name
            </label>

            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Enter your full name"
              className="mt-2 w-full rounded-xl border border-[#F0E3E9] px-4 py-3 outline-none transition focus:border-[#B60152] focus:ring-2 focus:ring-[#B60152]/10"
            />
          </div>

          {/* EMAIL */}
          <div className="mt-6">
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-[#29232A]"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="mt-2 w-full rounded-xl border border-[#F0E3E9] px-4 py-3 outline-none transition focus:border-[#B60152] focus:ring-2 focus:ring-[#B60152]/10"
            />
          </div>

          {/* CUSTOMER LOCATION */}
          {accountType === "CUSTOMER" && (
            <div className="mt-6 rounded-2xl border border-[#F0E3E9] bg-[#FFF9FB] p-5">

              <h2 className="text-base font-bold text-[#29232A]">
                Where are you based?
              </h2>

              <p className="mt-1 text-sm text-[#737373]">
                We'll use this location to help you find vendors
                offering services in your area.
              </p>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">

                <div>
                  <label
                    htmlFor="state"
                    className="block text-sm font-semibold text-[#29232A]"
                  >
                    State
                  </label>

                  <select
                    id="state"
                    value={state}
                    onChange={(event) => setState(event.target.value)}
                    required
                    className="mt-2 w-full rounded-xl border border-[#F0E3E9] bg-white px-4 py-3 outline-none transition focus:border-[#B60152] focus:ring-2 focus:ring-[#B60152]/10"
                  >
                    <option value="">
                      Select your state
                    </option>

                    {nigerianStates.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="city"
                    className="block text-sm font-semibold text-[#29232A]"
                  >
                    City / Town
                    <span className="ml-1 font-normal text-[#737373]">
                      (Optional)
                    </span>
                  </label>

                  <input
                    id="city"
                    type="text"
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    placeholder="e.g. Ikeja"
                    className="mt-2 w-full rounded-xl border border-[#F0E3E9] bg-white px-4 py-3 outline-none transition focus:border-[#B60152] focus:ring-2 focus:ring-[#B60152]/10"
                  />
                </div>

              </div>
            </div>
          )}

          {/* VENDOR PHONE */}
          {accountType === "VENDOR" && (
            <div className="mt-6">
              <label
                htmlFor="phone"
                className="block text-sm font-semibold text-[#29232A]"
              >
                Phone number
              </label>

              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+234..."
                className="mt-2 w-full rounded-xl border border-[#F0E3E9] px-4 py-3 outline-none transition focus:border-[#B60152]"
              />

              <p className="mt-2 text-xs text-[#737373]">
                Required for vendor accounts.
              </p>
            </div>
          )}

          {/* PASSWORD */}
          <div className="mt-6 grid gap-5 sm:grid-cols-2">

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-[#29232A]"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 8 characters"
                className="mt-2 w-full rounded-xl border border-[#F0E3E9] px-4 py-3 outline-none transition focus:border-[#B60152]"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-semibold text-[#29232A]"
              >
                Confirm password
              </label>

              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Repeat password"
                className="mt-2 w-full rounded-xl border border-[#F0E3E9] px-4 py-3 outline-none transition focus:border-[#B60152]"
              />
            </div>

          </div>

          {/* VENDOR SEGMENTS */}
          {accountType === "VENDOR" && (
            <div className="mt-8 border-t border-[#F0E3E9] pt-7">

              <h2 className="text-lg font-bold text-[#29232A]">
                What does your business provide?
              </h2>

              <p className="mt-1 text-sm text-[#737373]">
                Select all that apply.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">

                {vendorSegments.map((segment) => {
                  const selected = selectedSegments.includes(segment);

                  return (
                    <button
                      key={segment}
                      type="button"
                      onClick={() => toggleSegment(segment)}
                      className={`rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
                        selected
                          ? "border-[#B60152] bg-[#B60152] text-white"
                          : "border-[#F0E3E9] bg-white text-[#737373] hover:border-[#B60152]/40"
                      }`}
                    >
                      {selected && "✓ "}
                      {segment}
                    </button>
                  );
                })}

              </div>
            </div>
          )}

          {/* MARKETING EMAIL */}
          <label className="mt-8 flex cursor-pointer items-start gap-3 rounded-2xl bg-[#FFF9FB] p-4">

            <input
              type="checkbox"
              checked={marketingEmailsOptIn}
              onChange={(event) =>
                setMarketingEmailsOptIn(event.target.checked)
              }
              className="mt-1 h-4 w-4 accent-[#B60152]"
            />

            <span className="text-sm leading-6 text-[#737373]">
              I'd like to receive Flamingo updates,
              offers and event inspiration by email.
            </span>

          </label>

          {/* ERROR MESSAGE */}
          {error && (
            <div className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-8 w-full rounded-xl bg-[#B60152] px-6 py-3.5 font-semibold text-white transition hover:bg-[#C40032] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting
              ? "Creating account..."
              : "Create account"}
          </button>

          <p className="mt-6 text-center text-sm text-[#737373]">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-semibold text-[#B60152] hover:text-[#C40032]"
            >
              Sign in
            </Link>
          </p>

        </form>
      </div>
    </main>
  );
}
