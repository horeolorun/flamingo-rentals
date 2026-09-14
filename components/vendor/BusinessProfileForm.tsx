"use client";

import {
  FormEvent,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { vendorSegments } from "@/app/data/vendorSegments";

type BusinessProfileFormProps = {
  initialBusinessName: string;
  initialSegments: string[];
};

export default function BusinessProfileForm({
  initialBusinessName,
  initialSegments,
}: BusinessProfileFormProps) {
  const router = useRouter();

  const [
    businessName,
    setBusinessName,
  ] = useState(initialBusinessName);

  const [
    selectedSegments,
    setSelectedSegments,
  ] = useState<string[]>(
    initialSegments
  );

  const [error, setError] =
    useState("");

  const [isSaving, setIsSaving] =
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

    if (!businessName.trim()) {
      setError(
        "Please enter your business name."
      );
      return;
    }

    if (
      selectedSegments.length === 0
    ) {
      setError(
        "Please select at least one business segment."
      );
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(
        "/api/vendor/profile",
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            businessName:
              businessName.trim(),

            segments:
              selectedSegments,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Could not save business profile."
        );

        return;
      }

      router.push(
        "/vendor/onboarding"
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Business profile error:",
        error
      );

      setError(
        "Something went wrong while saving your business profile."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8"
    >
      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="businessName"
          className="block text-sm font-semibold text-gray-700"
        >
          Business name
        </label>

        <input
          id="businessName"
          type="text"
          value={businessName}
          onChange={(event) =>
            setBusinessName(
              event.target.value
            )
          }
          placeholder="e.g. Royal Events & Rentals"
          className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none transition focus:border-[#4f2a91]"
        />

        <p className="mt-2 text-sm text-gray-500">
          This is the name customers
          will see on Flamingo.
        </p>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-gray-700">
          Business segments
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Select everything your
          business currently provides.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          {vendorSegments.map(
            (segment) => {
              const selected =
                selectedSegments.includes(
                  segment
                );

              return (
                <button
                  key={segment}
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
                  {selected && "✓ "}
                  {segment}
                </button>
              );
            }
          )}
        </div>
      </div>

      <div className="flex justify-end border-t border-gray-100 pt-6">
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-xl bg-[#4f2a91] px-6 py-3 font-semibold text-white transition hover:bg-[#3e2174] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving
            ? "Saving..."
            : "Save & Continue"}
        </button>
      </div>
    </form>
  );
}