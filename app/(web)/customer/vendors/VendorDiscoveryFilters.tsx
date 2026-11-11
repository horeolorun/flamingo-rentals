
"use client";

import { useEffect, useState, FormEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type VendorDiscoveryFiltersProps = {
  segments: readonly string[];
  selectedSegment: string;
  search: string;
  selectedState: string;
  selectedCity: string;
  states: string[];
  cities: string[];
};

export default function VendorDiscoveryFilters({
  segments,
  selectedSegment,
  search,
  selectedState,
  selectedCity,
  states,
  cities,
}: VendorDiscoveryFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchOpen, setSearchOpen] = useState(Boolean(search));
  const [searchValue, setSearchValue] = useState(search);
  const [showAllServices, setShowAllServices] = useState(false);

  useEffect(() => {
    setSearchValue(search);
    setSearchOpen(Boolean(search));
  }, [search]);

  function updateFilters(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateFilters({ q: searchValue.trim() || null });
  }

  function handleServiceClick(segment: string) {
    updateFilters({
      segment: selectedSegment === segment ? null : segment,
    });
  }

  function handleStateChange(value: string) {
    updateFilters({
      state: value || null,
      city: null,
    });
  }

  function handleCityChange(value: string) {
    updateFilters({ city: value || null });
  }

  const visibleSegments = showAllServices
    ? segments
    : segments.slice(0, 5);

  return (
    <section className="rounded-2xl border border-[#F0E3E9] bg-white p-3 shadow-sm sm:p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        {/* SEARCH AND SERVICE FILTERS */}
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center"
          >
            {searchOpen ? (
              <div className="flex h-10 items-center gap-2 rounded-full border border-[#EAD5DF] bg-[#FFF9FB] px-3">
                <button
                  type="button"
                  aria-label="Close search"
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchValue("");
                    updateFilters({ q: null });
                  }}
                  className="text-[#737373] transition hover:text-[#B60152]"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-4 w-4"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="m18 6-12 12M6 6l12 12" />
                  </svg>
                </button>

                <input
                  autoFocus
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder="Search vendors"
                  className="w-32 bg-transparent text-sm text-[#29232A] outline-none placeholder:text-[#A49AA0] sm:w-44"
                />

                <button
                  type="submit"
                  aria-label="Submit search"
                  className="text-[#B60152] transition hover:text-[#C40032]"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-4 w-4"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-4-4" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Open vendor search"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#F0E3E9] bg-[#FFF9FB] text-[#B60152] transition hover:border-[#B60152] hover:bg-[#FCEBF2]"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-5 w-5"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-4-4" />
                </svg>
              </button>
            )}
          </form>

          <span className="hidden h-7 w-px bg-[#F0E3E9] sm:block" />

          <div className="flex flex-wrap items-center gap-2">
            {visibleSegments.map((segment) => {
              const active = selectedSegment === segment;

              return (
                <button
                  key={segment}
                  type="button"
                  onClick={() => handleServiceClick(segment)}
                  className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
                    active
                      ? "border-[#B60152] bg-[#B60152] text-white"
                      : "border-[#F0E3E9] bg-white text-[#655B62] hover:border-[#B60152]/50 hover:bg-[#FFF6F9] hover:text-[#B60152]"
                  }`}
                >
                  {segment}
                </button>
              );
            })}

            {segments.length > 5 && (
              <button
                type="button"
                onClick={() => setShowAllServices((current) => !current)}
                className="whitespace-nowrap px-2 py-2 text-xs font-bold text-[#B60152] transition hover:text-[#C40032]"
              >
                {showAllServices ? "Show less" : "More services"}
              </button>
            )}
          </div>
        </div>

        {/* LOCATION FILTERS */}
        <div className="flex shrink-0 flex-wrap items-center gap-2 border-t border-[#F0E3E9] pt-3 lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-[#737373]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-4 w-4 text-[#B60152]"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
            Location
          </span>

          <select
            value={selectedState}
            onChange={(event) => handleStateChange(event.target.value)}
            aria-label="Filter by state"
            className="h-10 max-w-[150px] rounded-full border border-[#F0E3E9] bg-[#FFF9FB] px-3 text-xs font-semibold text-[#29232A] outline-none focus:border-[#B60152]"
          >
            <option value="">All states</option>
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>

          {selectedState && (
            <select
              value={selectedCity}
              onChange={(event) => handleCityChange(event.target.value)}
              aria-label="Filter by city"
              className="h-10 max-w-[145px] rounded-full border border-[#F0E3E9] bg-[#FFF9FB] px-3 text-xs font-semibold text-[#29232A] outline-none focus:border-[#B60152]"
            >
              <option value="">All cities</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
    </section>
  );
}
