import { vendors } from "./data/vendor";

import SearchBar from "../components/SearchBar";
import CategoryCard from "../components/CategoryCard";
import VendorCard from "../components/VendorCard";

export default function Home() {

  const categories = [
    "Venues",
    "Sound",
    "Catering",
    "Decor",
    "Talent",
    "Photography",
  ];

  return (
    <main className="min-h-screen bg-[#faf9fc]">

      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* HEADER */}
      

        {/* SEARCH */}
        <SearchBar />

        {/* ORGANIZE YOUR EVENT */}
        <section className="mt-10">

          <div className="flex items-center justify-between">

            <h2 className="text-2xl font-semibold text-gray-900">
              Organize Your Event
            </h2>

            <button className="font-medium text-[#4f2a91]">
              See all
            </button>

          </div>

          <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">

            {categories.map((category) => (
              <CategoryCard
                key={category}
                name={category}
              />
            ))}

          </div>

        </section>

        {/* POPULAR VENDORS */}
        <section className="mt-12">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                Popular in Lagos
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {vendors.length} vendors available
              </p>
            </div>

            <button className="font-medium text-[#4f2a91]">
              See all
            </button>

          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

           {vendors.map((vendor) => (
  <VendorCard
    key={vendor.id}
    businessName={vendor.businessName}
    slug={vendor.slug}
    category={vendor.category}
    city={vendor.city}
    rating={vendor.rating}
    customerCount={vendor.customerCount}
    verified={vendor.verified}
    imageUrl={vendor.imageUrl}
  />
))}

          </div>

        </section>

      </div>

    </main>
  );
}