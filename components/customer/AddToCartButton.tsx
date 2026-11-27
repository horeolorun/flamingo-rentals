"use client";

import { useState } from "react";
import BookingDetailsModal from "./BookingDetailsModal";

type AddToCartButtonProps = {
  listingId: string;
  listingTitle?: string;
  priceKobo?: number;
  pricingUnit?: string | null;
  totalQuantity?: number;
  canAddToCart: boolean;
};

export default function AddToCartButton({
  listingId,
  listingTitle = "Selected listing",
  priceKobo = 0,
  pricingUnit = null,
  totalQuantity = 1,
  canAddToCart,
}: AddToCartButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState("");

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={() => {
          if (!canAddToCart) return;
          setMessage("");
          setIsModalOpen(true);
        }}
        disabled={!canAddToCart}
        className="w-full rounded-xl bg-[#B60152] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#C40032] disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#B60152]/30 focus:ring-offset-2"
      >
        {canAddToCart ? "Add to booking cart" : "Currently unavailable"}
      </button>

      {message && (
        <p
          role="status"
          aria-live="polite"
          className="mt-2 text-sm text-green-700"
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

      <BookingDetailsModal
        isOpen={isModalOpen}
        mode="add"
        listingId={listingId}
        listingTitle={listingTitle}
        priceKobo={priceKobo}
        pricingUnit={pricingUnit}
        totalQuantity={totalQuantity}
        onClose={() => setIsModalOpen(false)}
        onCompleted={(msg) => setMessage(msg)}
      />
    </div>
  );
}
