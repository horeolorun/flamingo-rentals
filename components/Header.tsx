"use client";

import Link from "next/link";
import {
  usePathname,
  useRouter,
} from "next/navigation";
import {
  useEffect,
  useState,
} from "react";

type CurrentUser = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  role: "CUSTOMER" | "VENDOR";
};

type CustomerNavTarget =
  | "explore"
  | "vendors"
  | "profile"
  | "how-it-works";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] =
    useState<CurrentUser | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSigningOut, setIsSigningOut] =
    useState(false);

  const [activeSection, setActiveSection] =
    useState("");

  /*
    LOAD CURRENT USER
  */
  useEffect(() => {
    async function loadCurrentUser() {
      setIsLoading(true);

      try {
        const response = await fetch(
          "/api/auth/me",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        if (!response.ok) {
          setUser(null);
          return;
        }

        const data =
          await response.json();

        if (
          data.authenticated &&
          data.user
        ) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error(
          "Header session error:",
          error
        );

        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadCurrentUser();
  }, [pathname]);

  /*
    TRACK HOMEPAGE HASH

    Examples:
    #explore
    #how-it-works
  */
  useEffect(() => {
    function updateActiveSection() {
      setActiveSection(
        window.location.hash
      );
    }

    updateActiveSection();

    window.addEventListener(
      "hashchange",
      updateActiveSection
    );

    return () => {
      window.removeEventListener(
        "hashchange",
        updateActiveSection
      );
    };
  }, [pathname]);

  /*
    SIGN OUT
  */
  async function handleSignOut() {
    setIsSigningOut(true);

    try {
      const response = await fetch(
        "/api/auth/logout",
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        console.error(
          "Unable to sign out"
        );

        return;
      }

      setUser(null);

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error(
        "Sign out error:",
        error
      );
    } finally {
      setIsSigningOut(false);
    }
  }

  /*
    CUSTOMER + PUBLIC
    ACTIVE NAVIGATION STYLE
  */
  function customerNavClass(
    target: CustomerNavTarget
  ) {
    let active = false;

    /*
      EXPLORE

      Explore is the homepage.
      If there is no hash,
      Explore is the default.
    */
    if (
      target === "explore" &&
      pathname === "/"
    ) {
      active =
        activeSection === "" ||
        activeSection === "#explore";
    }

    /*
      VENDORS

      Vendors now has its own page.
      This also stays active while
      viewing an individual vendor.
    */
    if (
      target === "vendors"
    ) {
      active =
        pathname.startsWith(
          "/customer/vendors"
        );
    }

    /*
      CUSTOMER PROFILE
    */
    if (
      target === "profile"
    ) {
      active =
        pathname.startsWith(
          "/customer/account"
        ) ||
        pathname.startsWith(
          "/customer/settings"
        );
    }

    /*
      HOW IT WORKS

      Only shown to visitors who
      are not signed in.
    */
    if (
      target === "how-it-works" &&
      pathname === "/"
    ) {
      active =
        activeSection ===
        "#how-it-works";
    }

    return active
      ? "group flex items-center gap-2 rounded-xl bg-[#eee6f8] px-4 py-2.5 text-sm font-semibold text-[#4f2a91] shadow-sm ring-1 ring-[#4f2a91]/10 transition"
      : "group flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-white hover:text-[#4f2a91] hover:shadow-sm";
  }

  /*
    VENDOR ACTIVE
    NAVIGATION STYLE
  */
  function vendorNavClass(
    href: string
  ) {
    const active =
      pathname.startsWith(href);

    return active
      ? "rounded-xl bg-[#eee6f8] px-4 py-2.5 text-sm font-semibold text-[#4f2a91] shadow-sm ring-1 ring-[#4f2a91]/10 transition"
      : "rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-[#faf7ff] hover:text-[#4f2a91]";
  }

  /*
    CART ACTIVE STYLE
  */
  function cartClass() {
    const active =
      pathname.startsWith(
        "/customer/cart"
      );

    return active
      ? "relative flex h-11 w-11 items-center justify-center rounded-xl bg-[#eee6f8] text-[#4f2a91] shadow-sm ring-1 ring-[#4f2a91]/10 transition"
      : "relative flex h-11 w-11 items-center justify-center rounded-xl text-gray-600 transition hover:bg-[#f5f0fc] hover:text-[#4f2a91]";
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center gap-6 px-6">

        {/* LOGO */}
        <Link
          href="/"
          className="shrink-0 text-2xl font-bold tracking-tight text-[#4f2a91]"
        >
          Flamingo Rentals
        </Link>

        {/* ========================= */}
        {/* PUBLIC NAV - LOGGED OUT */}
        {/* ========================= */}
        {!isLoading &&
          !user && (
            <nav className="hidden flex-1 items-center justify-center md:flex">
              <div className="flex items-center rounded-2xl border border-purple-100 bg-[#faf7ff] p-1.5 shadow-sm">

                {/* EXPLORE */}
                <Link
                  href="/#explore"
                  className={customerNavClass(
                    "explore"
                  )}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-4 w-4 transition group-hover:scale-110"
                    aria-hidden="true"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                    />

                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m15.5 8.5-2.2 4.8-4.8 2.2 2.2-4.8 4.8-2.2Z"
                    />
                  </svg>

                  Explore
                </Link>

                {/* VENDORS */}
                <Link
                  href="/customer/vendors"
                  className={customerNavClass(
                    "vendors"
                  )}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-4 w-4 transition group-hover:scale-110"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 10h16M5 10l1-5h12l1 5M6 10v9h12v-9M9 19v-5h6v5"
                    />
                  </svg>

                  Vendors
                </Link>

                {/* HOW IT WORKS */}
                <Link
                  href="/#how-it-works"
                  className={customerNavClass(
                    "how-it-works"
                  )}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-4 w-4 transition group-hover:scale-110"
                    aria-hidden="true"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                    />

                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 11v5M12 8h.01"
                    />
                  </svg>

                  How it works
                </Link>

              </div>
            </nav>
          )}

        {/* ========================= */}
        {/* CUSTOMER NAV */}
        {/* ========================= */}
        {!isLoading &&
          user?.role ===
            "CUSTOMER" && (
            <nav className="hidden flex-1 items-center justify-center md:flex">

              <div className="flex items-center rounded-2xl border border-purple-100 bg-[#faf7ff] p-1.5 shadow-sm">

                {/* EXPLORE */}
                <Link
                  href="/#explore"
                  className={customerNavClass(
                    "explore"
                  )}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-4 w-4 transition group-hover:scale-110"
                    aria-hidden="true"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                    />

                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m15.5 8.5-2.2 4.8-4.8 2.2 2.2-4.8 4.8-2.2Z"
                    />
                  </svg>

                  Explore
                </Link>

                {/* VENDORS */}
                <Link
                  href="/customer/vendors"
                  className={customerNavClass(
                    "vendors"
                  )}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-4 w-4 transition group-hover:scale-110"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 10h16M5 10l1-5h12l1 5M6 10v9h12v-9M9 19v-5h6v5"
                    />
                  </svg>

                  Vendors
                </Link>

                {/* PROFILE */}
                <Link
                  href="/customer/account"
                  className={customerNavClass(
                    "profile"
                  )}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-4 w-4 transition group-hover:scale-110"
                    aria-hidden="true"
                  >
                    <circle
                      cx="12"
                      cy="8"
                      r="4"
                    />

                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 20c.8-4 3.2-6 7.5-6s6.7 2 7.5 6"
                    />
                  </svg>

                  Profile
                </Link>

              </div>
            </nav>
          )}

        {/* ========================= */}
        {/* VENDOR NAV */}
        {/* ========================= */}
        {!isLoading &&
          user?.role ===
            "VENDOR" && (
            <nav className="hidden flex-1 items-center justify-center gap-2 md:flex">

              <Link
                href="/vendor/dashboard"
                className={vendorNavClass(
                  "/vendor/dashboard"
                )}
              >
                Dashboard
              </Link>

              <Link
                href="/vendor/listings"
                className={vendorNavClass(
                  "/vendor/listings"
                )}
              >
                Listings
              </Link>

              <Link
                href="/vendor/bookings"
                className={vendorNavClass(
                  "/vendor/bookings"
                )}
              >
                Bookings
              </Link>

              <Link
                href="/vendor/messages"
                className={vendorNavClass(
                  "/vendor/messages"
                )}
              >
                Messages
              </Link>

            </nav>
          )}

        {/* ========================= */}
        {/* RIGHT SIDE */}
        {/* ========================= */}
        <div className="ml-auto flex shrink-0 items-center gap-3">

          {/* CUSTOMER / GUEST CART */}
          {!isLoading &&
            (!user ||
              user.role ===
                "CUSTOMER") && (
              <Link
                href="/customer/cart"
                aria-label="Booking cart"
                title="Booking cart"
                className={cartClass()}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 1.9-1.4L21 7H6"
                  />

                  <circle
                    cx="10"
                    cy="20"
                    r="1"
                  />

                  <circle
                    cx="18"
                    cy="20"
                    r="1"
                  />
                </svg>

                {/* TEMPORARY CART COUNT */}
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#4f2a91] px-1 text-[10px] font-bold text-white">
                  0
                </span>
              </Link>
            )}

          {/* LOADING */}
          {isLoading && (
            <div className="h-10 w-28 animate-pulse rounded-xl bg-gray-100" />
          )}

          {/* ========================= */}
          {/* LOGGED OUT */}
          {/* ========================= */}
          {!isLoading &&
            !user && (
              <>
                <Link
                  href="/auth/login"
                  className="hidden text-sm font-semibold text-gray-700 transition hover:text-[#4f2a91] sm:block"
                >
                  Sign in
                </Link>

                <Link
                  href="/auth/signup"
                  className="rounded-xl bg-[#4f2a91] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#3e2174]"
                >
                  Get started
                </Link>
              </>
            )}

          {/* ========================= */}
          {/* CUSTOMER */}
          {/* ========================= */}
          {!isLoading &&
            user?.role ===
              "CUSTOMER" && (
              <button
                type="button"
                onClick={
                  handleSignOut
                }
                disabled={
                  isSigningOut
                }
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:border-[#4f2a91]/20 hover:bg-[#faf7ff] hover:text-[#4f2a91] disabled:opacity-50"
              >
                {isSigningOut
                  ? "Signing out..."
                  : "Sign Out"}
              </button>
            )}

          {/* ========================= */}
          {/* VENDOR */}
          {/* ========================= */}
          {!isLoading &&
            user?.role ===
              "VENDOR" && (
              <>
                <Link
                  href="/vendor/profile"
                  className={vendorNavClass(
                    "/vendor/profile"
                  )}
                >
                  Profile
                </Link>

                <button
                  type="button"
                  onClick={
                    handleSignOut
                  }
                  disabled={
                    isSigningOut
                  }
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:border-[#4f2a91]/20 hover:bg-[#faf7ff] hover:text-[#4f2a91] disabled:opacity-50"
                >
                  {isSigningOut
                    ? "Signing out..."
                    : "Sign Out"}
                </button>
              </>
            )}
        </div>
      </div>
    </header>
  );
}