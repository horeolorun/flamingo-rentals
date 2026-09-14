export default function SearchBar() {
  return (
    <div className="mx-auto mt-8 max-w-3xl">
      <div className="flex items-center rounded-2xl border border-gray-200 bg-white p-2 shadow-lg shadow-purple-900/5 transition duration-300 focus-within:border-[#4f2a91] focus-within:shadow-xl">

        <div className="pl-4 text-gray-400">
          🔍
        </div>

        <input
          type="text"
          placeholder="Search venues, catering, sound, décor..."
          className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm outline-none md:text-base"
        />

        <button className="rounded-xl bg-[#4f2a91] px-5 py-3 text-sm font-medium text-white transition duration-300 hover:bg-[#3e2174]">
          Search
        </button>

      </div>
    </div>
  );
}