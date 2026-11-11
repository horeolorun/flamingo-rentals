
export default function SearchBar() {
  return (
    <div className="mx-auto mt-8 max-w-3xl">
      <div className="flex items-center rounded-2xl border border-gray-200 bg-white p-2 shadow-lg shadow-primary/5 transition duration-300 focus-within:border-primary focus-within:shadow-xl focus-within:shadow-primary/10">

        <div className="pl-4 text-gray-400" aria-hidden="true">
          🔍
        </div>

        <input
          type="text"
          aria-label="Search venues and rental services"
          placeholder="Search venues, catering, sound, décor..."
          className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-ink outline-none placeholder:text-gray-400 md:text-base"
        />

        <button
          type="button"
          className="rounded-xl bg-primary px-5 py-3 text-sm font-medium text-white transition duration-300 hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          Search
        </button>

      </div>
    </div>
  );
}
