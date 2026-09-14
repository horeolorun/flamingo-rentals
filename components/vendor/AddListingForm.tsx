"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AddListingForm() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priceNaira, setPriceNaira] = useState("");
  const [pricingUnit, setPricingUnit] = useState("");

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    const price = Number(priceNaira);

    if (!title.trim()) {
      setError("Please enter a listing name.");
      return;
    }

    if (!category) {
      setError("Please select a category.");
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      setError("Please enter a valid price.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/vendor/listings", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category,
          priceKobo: Math.round(price * 100),
          pricingUnit: pricingUnit.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Could not create listing."
        );

        return;
      }

      router.push("/vendor/listings");
      router.refresh();
    } catch (error) {
      console.error("Create listing error:", error);

      setError(
        "Something went wrong while creating the listing."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="title"
          className="block text-sm font-semibold text-gray-700"
        >
          Listing name
        </label>

        <input
          id="title"
          type="text"
          value={title}
          onChange={(event) =>
            setTitle(event.target.value)
          }
          placeholder="e.g. Chiavari Chair"
          className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none transition focus:border-[#4f2a91]"
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-semibold text-gray-700"
        >
          Description
        </label>

        <textarea
          id="description"
          value={description}
          onChange={(event) =>
            setDescription(event.target.value)
          }
          placeholder="Describe what you are offering..."
          rows={5}
          className="mt-2 w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none transition focus:border-[#4f2a91]"
        />
      </div>

      <div>
        <label
          htmlFor="category"
          className="block text-sm font-semibold text-gray-700"
        >
          Category
        </label>

        <select
          id="category"
          value={category}
          onChange={(event) =>
            setCategory(event.target.value)
          }
          className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-[#4f2a91]"
        >
          <option value="">
            Select a category
          </option>

          <option value="Rentals">
            Rentals
          </option>

          <option value="Catering">
            Catering
          </option>

          <option value="Decor">
            Decor
          </option>

          <option value="Sound">
            Sound & DJ
          </option>

          <option value="Photography">
            Photography
          </option>

          <option value="Venues">
            Venues
          </option>

          <option value="Other">
            Other
          </option>
        </select>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label
            htmlFor="price"
            className="block text-sm font-semibold text-gray-700"
          >
            Price (₦)
          </label>

          <input
            id="price"
            type="number"
            min="0"
            step="0.01"
            value={priceNaira}
            onChange={(event) =>
              setPriceNaira(event.target.value)
            }
            placeholder="2500"
            className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none transition focus:border-[#4f2a91]"
          />
        </div>

        <div>
          <label
            htmlFor="pricingUnit"
            className="block text-sm font-semibold text-gray-700"
          >
            Pricing unit
          </label>

          <input
            id="pricingUnit"
            type="text"
            value={pricingUnit}
            onChange={(event) =>
              setPricingUnit(event.target.value)
            }
            placeholder="e.g. per chair"
            className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none transition focus:border-[#4f2a91]"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-4 border-t border-gray-100 pt-6">
        <button
          type="button"
          onClick={() =>
            router.push("/vendor/listings")
          }
          className="rounded-xl border border-gray-200 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-[#4f2a91] px-6 py-3 font-semibold text-white transition hover:bg-[#3e2174] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting
            ? "Saving..."
            : "Save as Draft"}
        </button>
      </div>
    </form>
  );
}