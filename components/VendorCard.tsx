import Image from "next/image";
import Link from "next/link";

type VendorCardProps = {
  businessName: string;
  slug: string;
  category: string;
  city: string;
  rating: number;
  customerCount: number;
  verified: boolean;
  imageUrl: string;
};

export default function VendorCard({
  businessName,
  slug,
  category,
  city,
  rating,
  customerCount,
  verified,
  imageUrl,
}: VendorCardProps) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-900/5">

      {/* VENDOR IMAGE */}
      <div className="relative h-52 overflow-hidden">
        <Image
          src={imageUrl}
          alt={businessName}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

        {verified && (
          <span className="absolute right-4 top-4 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 shadow-sm">
            ✓ Verified
          </span>
        )}
      </div>

      {/* DETAILS */}
      <div className="p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#4f2a91]">
          {category}
        </p>

        <h3 className="mt-2 text-lg font-semibold text-gray-900">
          {businessName}
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          {city}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-green-600">
              ★ {rating}
            </span>

            <span className="text-sm text-gray-400">
              ({customerCount} customers)
            </span>
          </div>

          <Link
          href={`/customer/vendors/${slug}`}
            className="text-sm font-semibold text-[#4f2a91] transition hover:text-[#3e2174]"
          >
            View vendor →
          </Link>
        </div>
      </div>

    </article>
  );
}