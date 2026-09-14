"use client";


import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import Link from "next/link";

import {
  ArrowRight,
  Building2,
  Check,
  ChevronLeft,
  Landmark,
  ShieldCheck,
  Store,
  UserRound,
} from "lucide-react";

type AccountType = "customer" | "vendor";

export default function SignupPage() {
    const router = useRouter();

  const [accountType, setAccountType] =
    useState<AccountType>("customer");

  const [vendorStep, setVendorStep] = useState(1);

  async function beginVerification(
  identifier: string
) {
  const response = await fetch(
    "/api/auth/send-otp",
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        identifier,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Unable to generate verification code"
    );
  }

  if (data.devOtp) {
    sessionStorage.setItem(
      "flamingoDevOtp",
      data.devOtp
    );
  }

  router.push(
  `/auth/verify?identifier=${encodeURIComponent(
    identifier
  )}`
);
}

  // CUSTOMER
  const [customerName, setCustomerName] = useState("");
  const [customerContact, setCustomerContact] = useState("");

  // VENDOR
  const [vendorName, setVendorName] = useState("");
  const [vendorBusinessName, setVendorBusinessName] = useState("");
  const [vendorEmail, setVendorEmail] = useState("");
  const [vendorPhone, setVendorPhone] = useState("");
  const [vendorCategory, setVendorCategory] = useState("");

  // SHARED UI STATE
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signupMessage, setSignupMessage] = useState("");
  const [signupError, setSignupError] = useState("");

  function clearMessages() {
    setSignupMessage("");
    setSignupError("");
  }

  async function handleCustomerSignup(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    clearMessages();
    setIsSubmitting(true);

    try {
      const contact = customerContact.trim();
      const isEmail = contact.includes("@");

      const response = await fetch("/api/auth/register", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          fullName: customerName.trim(),
          email: isEmail ? contact : undefined,
          phone: isEmail ? undefined : contact,
          accountType: "customer",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setSignupError(
          data.message || "Unable to create your account."
        );
        return;
      }

     const verificationIdentifier =
  isEmail
    ? contact.toLowerCase()
    : contact;

await beginVerification(
  verificationIdentifier
);

    } catch (error) {
      console.error("Customer signup error:", error);

      setSignupError(
        "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVendorSignup() {
    clearMessages();

    if (!vendorName.trim()) {
      setSignupError("Your name is required.");
      setVendorStep(1);
      return;
    }

    if (!vendorBusinessName.trim()) {
      setSignupError("Business name is required.");
      setVendorStep(1);
      return;
    }

    if (!vendorEmail.trim() && !vendorPhone.trim()) {
      setSignupError(
        "An email address or phone number is required."
      );
      setVendorStep(1);
      return;
    }

    if (!vendorCategory) {
      setSignupError("Please select a service category.");
      setVendorStep(1);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          fullName: vendorName.trim(),
          email: vendorEmail.trim() || undefined,
          phone: vendorPhone.trim() || undefined,
          accountType: "vendor",
          businessName: vendorBusinessName.trim(),
          primaryCategory: vendorCategory,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setSignupError(
          data.message || "Unable to create vendor account."
        );
        return;
      }

      const verificationIdentifier =
  vendorEmail.trim()
    ? vendorEmail.trim().toLowerCase()
    : vendorPhone.trim();

await beginVerification(
  verificationIdentifier
);

    } catch (error) {
      console.error("Vendor signup error:", error);

      setSignupError(
        "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-73px)] bg-[#faf9fc]">
      <div className="mx-auto max-w-5xl px-6 py-14">

        {/* PAGE TITLE */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#4f2a91]">
            Join Flamingo
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-950">
            Create your account
          </h1>

          <p className="mt-3 text-gray-500">
            Choose how you want to use Flamingo.
          </p>
        </div>

        {/* ACCOUNT TYPE TOGGLE */}
        <div className="mx-auto mt-8 flex max-w-lg rounded-2xl border border-gray-200 bg-white p-1.5 shadow-sm">

          <button
            type="button"
            onClick={() => {
              setAccountType("customer");
              setVendorStep(1);
              clearMessages();
            }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition duration-300 ${
              accountType === "customer"
                ? "bg-[#4f2a91] text-white shadow-sm"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <UserRound size={18} />
            I am a Customer
          </button>

          <button
            type="button"
            onClick={() => {
              setAccountType("vendor");
              setVendorStep(1);
              clearMessages();
            }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition duration-300 ${
              accountType === "vendor"
                ? "bg-[#4f2a91] text-white shadow-sm"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <Store size={18} />
            I am a Vendor
          </button>

        </div>

        {/* CUSTOMER */}
        {accountType === "customer" && (
          <section className="mx-auto mt-8 max-w-lg rounded-3xl border border-gray-100 bg-white p-8 shadow-xl shadow-purple-900/5">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-[#4f2a91]">
              <UserRound size={23} />
            </div>

            <h2 className="mt-5 text-2xl font-bold text-gray-900">
              Customer account
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Create your account and continue planning your event.
            </p>

            <form
              onSubmit={handleCustomerSignup}
              className="mt-7 space-y-5"
            >

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Full name
                </label>

                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(event) =>
                    setCustomerName(event.target.value)
                  }
                  placeholder="Your full name"
                  className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#4f2a91] focus:ring-4 focus:ring-purple-100"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Email or phone number
                </label>

                <input
                  type="text"
                  required
                  value={customerContact}
                  onChange={(event) =>
                    setCustomerContact(event.target.value)
                  }
                  placeholder="you@example.com or +234..."
                  className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#4f2a91] focus:ring-4 focus:ring-purple-100"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#4f2a91] px-5 py-3.5 font-medium text-white transition hover:bg-[#3e2174] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting
                  ? "Creating account..."
                  : "Continue to verification"}

                {!isSubmitting && (
                  <ArrowRight size={18} />
                )}
              </button>

            </form>

            {signupError && (
              <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">
                {signupError}
              </div>
            )}

            {signupMessage && (
              <div className="mt-5 rounded-xl bg-green-50 p-4 text-sm text-green-700">
                {signupMessage}
              </div>
            )}

            <div className="mt-6 rounded-xl bg-green-50 p-4">
              <div className="flex gap-3">
                <ShieldCheck
                  size={20}
                  className="mt-0.5 shrink-0 text-green-600"
                />

                <p className="text-sm leading-6 text-gray-600">
                  OTP verification will be connected in the next stage.
                </p>
              </div>
            </div>

          </section>
        )}

        {/* VENDOR */}
        {accountType === "vendor" && (
          <section className="mx-auto mt-8 max-w-2xl">

            {/* PROGRESS */}
            <div className="mb-7 grid grid-cols-3 gap-2">

              <StepIndicator
                number={1}
                label="Business"
                active={vendorStep >= 1}
              />

              <StepIndicator
                number={2}
                label="Verification"
                active={vendorStep >= 2}
              />

              <StepIndicator
                number={3}
                label="Payout"
                active={vendorStep >= 3}
              />

            </div>

            <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-xl shadow-purple-900/5">

              {/* VENDOR STEP 1 */}
              {vendorStep === 1 && (
                <>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-[#4f2a91]">
                    <Building2 size={23} />
                  </div>

                  <h2 className="mt-5 text-2xl font-bold text-gray-900">
                    Tell us about your business
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    Enter your business and contact information.
                  </p>

                  <div className="mt-7 grid gap-5 md:grid-cols-2">

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Your name
                      </label>

                      <input
                        type="text"
                        value={vendorName}
                        onChange={(event) =>
                          setVendorName(event.target.value)
                        }
                        placeholder="Full name"
                        className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#4f2a91] focus:ring-4 focus:ring-purple-100"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Business name
                      </label>

                      <input
                        type="text"
                        value={vendorBusinessName}
                        onChange={(event) =>
                          setVendorBusinessName(
                            event.target.value
                          )
                        }
                        placeholder="Business name"
                        className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#4f2a91] focus:ring-4 focus:ring-purple-100"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Email
                      </label>

                      <input
                        type="email"
                        value={vendorEmail}
                        onChange={(event) =>
                          setVendorEmail(event.target.value)
                        }
                        placeholder="business@example.com"
                        className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#4f2a91] focus:ring-4 focus:ring-purple-100"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Phone number
                      </label>

                      <input
                        type="tel"
                        value={vendorPhone}
                        onChange={(event) =>
                          setVendorPhone(event.target.value)
                        }
                        placeholder="+234..."
                        className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#4f2a91] focus:ring-4 focus:ring-purple-100"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-700">
                        Primary service category
                      </label>

                      <select
                        value={vendorCategory}
                        onChange={(event) =>
                          setVendorCategory(
                            event.target.value
                          )
                        }
                        className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[#4f2a91]"
                      >
                        <option value="">
                          Select a category
                        </option>
                        <option value="Venues">
                          Venues
                        </option>
                        <option value="Rentals">
                          Rentals
                        </option>
                        <option value="Catering">
                          Catering
                        </option>
                        <option value="Sound & DJ">
                          Sound & DJ
                        </option>
                        <option value="Decor">
                          Decor
                        </option>
                        <option value="Talent">
                          Talent
                        </option>
                        <option value="Photography">
                          Photography
                        </option>
                      </select>
                    </div>

                  </div>

                  {signupError && (
                    <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">
                      {signupError}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      clearMessages();

                      if (!vendorName.trim()) {
                        setSignupError(
                          "Your name is required."
                        );
                        return;
                      }

                      if (!vendorBusinessName.trim()) {
                        setSignupError(
                          "Business name is required."
                        );
                        return;
                      }

                      if (
                        !vendorEmail.trim() &&
                        !vendorPhone.trim()
                      ) {
                        setSignupError(
                          "Enter an email or phone number."
                        );
                        return;
                      }

                      if (!vendorCategory) {
                        setSignupError(
                          "Select a service category."
                        );
                        return;
                      }

                      setVendorStep(2);
                    }}
                    className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#4f2a91] px-5 py-3.5 font-medium text-white transition hover:bg-[#3e2174]"
                  >
                    Continue
                    <ArrowRight size={18} />
                  </button>
                </>
              )}

              {/* VENDOR STEP 2 */}
              {vendorStep === 2 && (
                <>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-600">
                    <ShieldCheck size={23} />
                  </div>

                  <h2 className="mt-5 text-2xl font-bold text-gray-900">
                    Identity verification
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    Vendor identity and statutory verification will be
                    performed through our KYC provider.
                  </p>

                  <div className="mt-7 rounded-2xl border border-gray-100 bg-gray-50 p-6">

                    <p className="font-semibold text-gray-900">
                      KYC integration coming next
                    </p>

                    <p className="mt-2 text-sm leading-6 text-gray-500">
                      NIN/BVN verification will be connected to a
                      secure verification service. We are not storing
                      those details directly at this stage.
                    </p>

                  </div>

                  <div className="mt-7 flex gap-3">

                    <button
                      type="button"
                      onClick={() => {
                        clearMessages();
                        setVendorStep(1);
                      }}
                      className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 py-3.5 font-medium text-gray-600 transition hover:bg-gray-50"
                    >
                      <ChevronLeft size={18} />
                      Back
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        clearMessages();
                        setVendorStep(3);
                      }}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#4f2a91] px-5 py-3.5 font-medium text-white transition hover:bg-[#3e2174]"
                    >
                      Continue
                      <ArrowRight size={18} />
                    </button>

                  </div>
                </>
              )}

              {/* VENDOR STEP 3 */}
              {vendorStep === 3 && (
                <>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-[#4f2a91]">
                    <Landmark size={23} />
                  </div>

                  <h2 className="mt-5 text-2xl font-bold text-gray-900">
                    Payout setup
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    Bank-account verification and payouts will be
                    connected when the payment system is integrated.
                  </p>

                  <div className="mt-7 rounded-2xl bg-green-50 p-5">
                    <div className="flex gap-3">

                      <Check
                        size={21}
                        className="mt-0.5 shrink-0 text-green-600"
                      />

                      <div>
                        <p className="font-semibold text-gray-900">
                          Ready to create the vendor account
                        </p>

                        <p className="mt-1 text-sm leading-6 text-gray-600">
                          Your account will remain pending until
                          verification and payout setup are completed.
                        </p>
                      </div>

                    </div>
                  </div>

                  {signupError && (
                    <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">
                      {signupError}
                    </div>
                  )}

                  {signupMessage && (
                    <div className="mt-5 rounded-xl bg-green-50 p-4 text-sm text-green-700">
                      {signupMessage}
                    </div>
                  )}

                  <div className="mt-7 flex gap-3">

                    <button
                      type="button"
                      onClick={() => {
                        clearMessages();
                        setVendorStep(2);
                      }}
                      disabled={isSubmitting}
                      className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 py-3.5 font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                    >
                      <ChevronLeft size={18} />
                      Back
                    </button>

                    <button
                      type="button"
                      onClick={handleVendorSignup}
                      disabled={isSubmitting}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3.5 font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSubmitting
                        ? "Creating account..."
                        : "Submit application"}
                    </button>

                  </div>
                </>
              )}

            </div>

          </section>
        )}

        <p className="mt-8 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link
           href="/auth/login"
            className="font-semibold text-[#4f2a91]"
          >
            Sign in
          </Link>
        </p>

      </div>
    </main>
  );
}

function StepIndicator({
  number,
  label,
  active,
}: {
  number: number;
  label: string;
  active: boolean;
}) {
  return (
    <div
      className={`rounded-xl border px-4 py-3 transition ${
        active
          ? "border-purple-200 bg-purple-50"
          : "border-gray-100 bg-white"
      }`}
    >
      <div className="flex items-center gap-2">

        <div
          className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
            active
              ? "bg-[#4f2a91] text-white"
              : "bg-gray-100 text-gray-400"
          }`}
        >
          {number}
        </div>

        <span
          className={`text-sm font-medium ${
            active
              ? "text-[#4f2a91]"
              : "text-gray-400"
          }`}
        >
          {label}
        </span>

      </div>
    </div>
  );
}