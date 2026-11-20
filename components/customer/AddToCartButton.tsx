
"use client";

import { useState } from "react";

type AddToCartButtonProps = {
  listingId: string;
  canAddToCart: boolean;
};

export default function AddToCartButton({
  listingId,
  canAddToCart,
}: AddToCartButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleAddToCart() {
    if (isAdding || !canAddToCart) return;

    setIsAdding(true);
    setMessage("");

    try {
      const response = await fetch("/api/cart/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listingId,
          quantity: 1,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setIsSuccess(false);
        setMessage(
          result.message || "Could not add this item to your cart."
        );
        return;
      }

      setIsSuccess(true);
      setMessage("Item added to your cart.");

      window.dispatchEvent(
        new Event("flamingo:cart-updated")
      );
    } catch (error) {
      console.error("Add to cart error:", error);
      setIsSuccess(false);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={!canAddToCart || isAdding}
        className="w-full rounded-xl bg-[#B60152] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#C40032] disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#B60152]/30 focus:ring-offset-2"
      >
        {isAdding
          ? "Adding..."
          : canAddToCart
            ? "Add to booking cart"
            : "Currently unavailable"}
      </button>

      {message && (
        <p
          role="status"
          aria-live="polite"
          className={`mt-2 text-sm ${
            isSuccess ? "text-green-700" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}

      {!canAddToCart && (
        <p className="mt-2 text-xs text-gray-500">
          This listing must be active and its vendor verified before it
          can be added to the cart.
        </p>
      )}
    </div>
  );
}
