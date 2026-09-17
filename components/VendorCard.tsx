import Image from "next/image";
import Link from "next/link";

type VendorCardProps = {
  businessName: string;
  slug: string;
  segments: string[];
  listingCount: number;
  verified: boolean;
  imageUrl?: string;
};

export default function VendorCard({
  businessName,
  slug,
  segments,
  listingCount,
  verified,
  imageUrl = "/home/hero-venue.jpg",
}: VendorCardProps) {
  const segmentText =
    segments.length > 0
      ? segments.slice(0, 3).join(" • ")
      : "Event services";

  return (
    <Link
      href={`/customer/vendors/${slug}`}
      className="group block overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-900/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f2a91] focus-visible:ring-offset-2"
    >
      {/* VENDOR IMAGE */}
      <div className="relative h-52 overflow-hidden">
        <Image
          src={imageUrl}
          alt={businessName}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />

        {verified && (
          <span className="absolute right-4 top-4 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 shadow-sm">
            ✓ Verified
          </span>
        )}
      </div>

      {/* DETAILS */}
      <div className="p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#4f2a91]">
          {segmentText}
        </p>

        <h3 className="mt-2 text-lg font-semibold text-gray-900">
          {businessName}
        </h3>

        <div className="mt-5 flex items-center justify-between gap-4">
          <span className="text-sm text-gray-500">
            {listingCount === 1
              ? "1 listing"
              : `${listingCount} listings`}
          </span>

          <span className="shrink-0 text-sm font-semibold text-[#4f2a91] transition group-hover:text-[#3e2174]">
            View vendor →
          </span>
        </div>
      </div>
    </Link>
  );
}