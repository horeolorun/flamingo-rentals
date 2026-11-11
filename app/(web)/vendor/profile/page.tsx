
"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import { vendorSegments } from "@/app/data/vendorSegments";
import { nigerianStates } from "@/app/data/nigerianStates";

type VendorProfileData = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  role: "VENDOR";
  business: {
    id: string;
    businessName: string | null;
    segments: string[];
    country: string;
    state: string | null;
    city: string | null;
    averageRating: number;
    reviewCount: number;
    kycStatus: string;
    payoutStatus: string;
  };
};

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function statusClass(status: string) {
  if (status === "VERIFIED") {
    return "bg-green-50 text-green-700";
  }

  if (status === "PENDING") {
    return "bg-yellow-50 text-yellow-700";
  }

  if (status === "REJECTED") {
    return "bg-red-50 text-red-700";
  }

  return "bg-gray-100 text-gray-600";
}

const inputClass =
  "mt-2 w-full rounded-xl border border-[#F0E3E9] bg-white px-4 py-3 text-[#29232A] outline-none transition placeholder:text-gray-400 focus:border-[#B60152] focus:ring-4 focus:ring-[#B60152]/5";

export default function VendorProfilePage() {
  const router = useRouter();

  const [profile, setProfile] =
    useState<VendorProfileData | null>(null);

  const [businessName, setBusinessName] = useState("");
  const [selectedSegments, setSelectedSegments] =
    useState<string[]>([]);
  const [state, setState] = useState("");
  const [city, setCity] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /*
    LOAD PROFILE
  */
  useEffect(() => {
    async function loadProfile() {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(
          "/api/vendor/profile",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (response.status === 401) {
          router.replace("/auth/login");
          return;
        }

        if (response.status === 403) {
          router.replace("/#explore");
          return;
        }

        if (!response.ok) {
          setError(
            data.message ||
              "Could not load your business profile."
          );
          return;
        }

        setProfile(data.data);

        setBusinessName(
          data.data.business.businessName ?? ""
        );

        setSelectedSegments(
          data.data.business.segments ?? []
        );

        setState(data.data.business.state ?? "");
        setCity(data.data.business.city ?? "");
      } catch (error) {
        console.error("Vendor profile load error:", error);

        setError(
          "Could not load your business profile."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  /*
    SELECT / UNSELECT BUSINESS SERVICE
  */
  function toggleSegment(segment: string) {
    setSuccess("");
    setError("");

    setSelectedSegments((current) => {
      if (current.includes(segment)) {
        return current.filter((item) => item !== segment);
      }

      return [...current, segment];
    });
  }

  /*
    SAVE PROFILE
  */
  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!businessName.trim()) {
      setError("Business name is required.");
      return;
    }

    if (selectedSegments.length === 0) {
      setError("Please select at least one service.");
      return;
    }

    if (!state) {
      setError("Please select your state.");
      return;
    }

    if (!city.trim()) {
      setError("Please enter your city.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(
        "/api/vendor/profile",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            businessName: businessName.trim(),
            segments: selectedSegments,
            state,
            city: city.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Could not save your business profile."
        );
        return;
      }

      setSuccess(
        "Your business profile has been updated successfully."
      );

      /*
        Update visible profile information immediately.
      */
      setProfile((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          business: {
            ...current.business,
            businessName: data.data.businessName,
            segments: data.data.segments,
            country: data.data.country,
            state: data.data.state,
            city: data.data.city,
          },
        };
      });
    } catch (error) {
      console.error("Vendor profile save error:", error);

      setError(
        "Could not save your business profile."
      );
    } finally {
      setIsSaving(false);
    }
  }

  /*
    LOADING
  */
  if (isLoading) {
    return (
      <main className="min-h-[calc(100vh-76px)] bg-[#FFF9FB] px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="h-5 w-24 animate-pulse rounded bg-[#FCEBF2]" />

          <div className="mt-4 h-12 w-72 animate-pulse rounded-xl bg-[#FCEBF2]" />

          <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
            <div className="h-[600px] animate-pulse rounded-3xl bg-white" />
            <div className="h-[400px] animate-pulse rounded-3xl bg-white" />
          </div>
        </div>
      </main>
    );
  }

  /*
    PROFILE FAILED
  */
  if (!profile) {
    return (
      <main className="min-h-[calc(100vh-76px)] bg-[#FFF9FB] px-6 py-16">
        <div className="mx-auto max-w-4xl rounded-3xl border border-red-100 bg-red-50 p-8">
          <h1 className="text-xl font-bold text-red-800">
            Business profile unavailable
          </h1>

          <p className="mt-2 text-red-700">
            {error ||
              "We could not load your vendor profile."}
          </p>
        </div>
      </main>
    );
  }

  const hasReviews = profile.business.reviewCount > 0;

  return (
    <main className="min-h-[calc(100vh-76px)] bg-[#FFF9FB] px-6 py-14">
      <div className="mx-auto max-w-6xl">

        {/* PAGE HEADER */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#B60152]">
            Vendor
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#29232A]">
            Business Profile
          </h1>

          <p className="mt-3 max-w-2xl leading-7 text-[#737373]">
            Manage the business information customers will use to discover
            your services on Flamingo.
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">

          {/* EDITABLE BUSINESS DETAILS */}
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-[#F0E3E9] bg-white p-7 shadow-sm md:p-9"
          >
            <div>
              <h2 className="text-2xl font-bold text-[#29232A]">
                Business information
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#737373]">
                Keep these details accurate so customers can find your
                business using Flamingo's marketplace filters.
              </p>
            </div>

            {/* BUSINESS NAME */}
            <div className="mt-8">
              <label
                htmlFor="businessName"
                className="block text-sm font-semibold text-[#29232A]"
              >
                Business name
              </label>

              <input
                id="businessName"
                type="text"
                value={businessName}
                onChange={(event) =>
                  setBusinessName(event.target.value)
                }
                placeholder="e.g. Royal Events"
                maxLength={120}
                className={inputClass}
              />
            </div>

            {/* SERVICES */}
            <div className="mt-8">
              <div>
                <p className="text-sm font-semibold text-[#29232A]">
                  Services
                </p>

                <p className="mt-1 text-sm leading-6 text-[#737373]">
                  Select every type of service your business provides.
                  You can choose more than one.
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                {vendorSegments.map((segment) => {
                  const selected =
                    selectedSegments.includes(segment);

                  return (
                    <button
                      key={segment}
                      type="button"
                      onClick={() => toggleSegment(segment)}
                      className={`rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
                        selected
                          ? "border-[#B60152] bg-[#B60152] text-white shadow-sm"
                          : "border-[#F0E3E9] bg-white text-[#737373] hover:border-[#B60152]/40 hover:bg-[#FFF6F9] hover:text-[#B60152]"
                      }`}
                    >
                      {selected ? "✓ " : ""}
                      {segment}
                    </button>
                  );
                })}
              </div>

              <p className="mt-3 text-xs text-[#737373]">
                {selectedSegments.length} selected
              </p>
            </div>

            {/* LOCATION */}
            <div className="mt-10 border-t border-[#F0E3E9] pt-8">
              <h3 className="text-lg font-bold text-[#29232A]">
                Business location
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#737373]">
                Customers will be able to use State and City to narrow
                their vendor search.
              </p>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">

                {/* COUNTRY */}
                <div>
                  <label
                    htmlFor="country"
                    className="block text-sm font-semibold text-[#29232A]"
                  >
                    Country
                  </label>

                  <input
                    id="country"
                    type="text"
                    value="Nigeria"
                    disabled
                    className="mt-2 w-full cursor-not-allowed rounded-xl border border-[#F0E3E9] bg-gray-50 px-4 py-3 text-gray-500"
                  />
                </div>

                {/* STATE */}
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
                    onChange={(event) =>
                      setState(event.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="">Select state</option>

                    {nigerianStates.map((stateName) => (
                      <option
                        key={stateName}
                        value={stateName}
                      >
                        {stateName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* CITY */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="city"
                    className="block text-sm font-semibold text-[#29232A]"
                  >
                    City
                  </label>

                  <input
                    id="city"
                    type="text"
                    value={city}
                    onChange={(event) =>
                      setCity(event.target.value)
                    }
                    placeholder="e.g. Ikeja"
                    maxLength={80}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* MESSAGES */}
            {error && (
              <div className="mt-7 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="mt-7 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                ✓ {success}
              </div>
            )}

            {/* SAVE */}
            <div className="mt-8 flex items-center justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-xl bg-[#B60152] px-7 py-3.5 font-semibold text-white shadow-sm transition hover:bg-[#C40032] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving
                  ? "Saving..."
                  : "Save business profile"}
              </button>
            </div>
          </form>

          {/* ACCOUNT / SYSTEM INFORMATION */}
          <aside className="space-y-6">

            {/* ACCOUNT */}
            <section className="rounded-3xl border border-[#F0E3E9] bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-[#29232A]">
                Account
              </h2>

              <div className="mt-5 space-y-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#737373]">
                    Owner
                  </p>

                  <p className="mt-1 font-semibold text-[#29232A]">
                    {profile.fullName}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#737373]">
                    Email
                  </p>

                  <p className="mt-1 break-words font-semibold text-[#29232A]">
                    {profile.email || "Not provided"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#737373]">
                    Phone
                  </p>

                  <p className="mt-1 font-semibold text-[#29232A]">
                    {profile.phone || "Not provided"}
                  </p>
                </div>
              </div>
            </section>

            {/* CUSTOMER REPUTATION */}
            <section className="rounded-3xl border border-[#F0E3E9] bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-[#29232A]">
                Customer reputation
              </h2>

              {hasReviews ? (
                <div className="mt-5">
                  <p className="text-3xl font-bold text-[#29232A]">
                    <span className="text-amber-500">★</span>{" "}
                    {profile.business.averageRating.toFixed(1)}
                  </p>

                  <p className="mt-2 text-sm text-[#737373]">
                    Based on {profile.business.reviewCount}{" "}
                    {profile.business.reviewCount === 1
                      ? "review"
                      : "reviews"}
                  </p>
                </div>
              ) : (
                <div className="mt-5 rounded-2xl bg-[#FFF6F9] p-5">
                  <p className="font-semibold text-[#29232A]">
                    No reviews yet
                  </p>

                  <p className="mt-2 text-sm leading-6 text-[#737373]">
                    Your rating will appear here after Flamingo's
                    customer review system is connected.
                  </p>
                </div>
              )}

              <p className="mt-4 text-xs leading-5 text-[#737373]">
                Ratings cannot be edited by vendors.
              </p>
            </section>

            {/* VERIFICATION */}
            <section className="rounded-3xl border border-[#F0E3E9] bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-[#29232A]">
                Verification
              </h2>

              <div className="mt-5 space-y-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#737373]">
                    Identity verification
                  </p>

                  <span
                    className={`mt-2 inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${statusClass(
                      profile.business.kycStatus
                    )}`}
                  >
                    {formatStatus(profile.business.kycStatus)}
                  </span>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#737373]">
                    Payout verification
                  </p>

                  <span
                    className={`mt-2 inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${statusClass(
                      profile.business.payoutStatus
                    )}`}
                  >
                    {formatStatus(profile.business.payoutStatus)}
                  </span>
                </div>
              </div>
            </section>

            {/* CURRENT PUBLIC LOCATION */}
            <section className="rounded-3xl border border-[#F0E3E9] bg-[#FFF6F9] p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#B60152]">
                Marketplace location
              </p>

              {profile.business.city &&
              profile.business.state ? (
                <>
                  <p className="mt-3 text-lg font-bold text-[#29232A]">
                    {profile.business.city},{" "}
                    {profile.business.state}
                  </p>

                  <p className="mt-1 text-sm text-[#737373]">
                    {profile.business.country}
                  </p>
                </>
              ) : (
                <p className="mt-3 text-sm leading-6 text-[#737373]">
                  Add your State and City so customers can find your
                  business using location filters.
                </p>
              )}
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
