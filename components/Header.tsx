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

export default function Header() {
 

  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] =
    useState<CurrentUser | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSigningOut, setIsSigningOut] =
    useState(false);

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

  async function handleSignOut() {
    setIsSigningOut(true);

    try {
      const response =
        await fetch(
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

  function navClass(href: string) {
  const active =
    href === "/"
      ? pathname === "/"
      : pathname.startsWith(href);

  return active
    ? "text-sm font-semibold text-[#4f2a91]"
    : "text-sm font-medium text-gray-600 transition hover:text-[#4f2a91]";
}
  return (
    <header className="border-b border-gray-100 bg-white">
      <div className="mx-auto flex h-[74px] max-w-7xl items-center justify-between px-6">

        {/* LOGO */}
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight text-[#4f2a91]"
        >
          Flamingo Rentals
        </Link>

        {/* PUBLIC / CUSTOMER NAV */}
        {(!user ||
          user.role === "CUSTOMER") && (
          <nav className="hidden items-center gap-10 md:flex">
            <Link
              href="/"
              className="text-sm font-medium text-gray-600 transition hover:text-[#4f2a91]"
            >
              Explore
            </Link>

            <Link
              href="/"
              className="text-sm font-medium text-gray-600 transition hover:text-[#4f2a91]"
            >
              Vendors
            </Link>

            <Link
              href="/"
              className="text-sm font-medium text-gray-600 transition hover:text-[#4f2a91]"
            >
              How it works
            </Link>
          </nav>
        )}

        {/* VENDOR NAV */}
        {user?.role === "VENDOR" && (
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/vendor/dashboard"
              className="text-sm font-medium text-gray-600 transition hover:text-[#4f2a91]"
            >
              Dashboard
            </Link>

            <Link
              href="/vendor/listings"
              className="text-sm font-medium text-gray-600 transition hover:text-[#4f2a91]"
            >
              Listings
            </Link>

            <Link
  href="/vendor/bookings"
  className={navClass("/vendor/bookings")}
>
  Bookings
</Link>

            <Link
              href="/vendor/analytics"
              className="text-sm font-medium text-gray-600 transition hover:text-[#4f2a91]"
            >
              Analytics
            </Link>

            <Link
              href="/vendor/messages"
              className="text-sm font-medium text-gray-600 transition hover:text-[#4f2a91]"
            >
              Messages
            </Link>

            <Link
              href="/vendor/profile"
              className="text-sm font-medium text-gray-600 transition hover:text-[#4f2a91]"
            >
              Profile
            </Link>
          </nav>
        )}

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-4">

          {/* LOADING */}
          {isLoading && (
            <div className="h-10 w-32 animate-pulse rounded-xl bg-gray-100" />
          )}

          {/* LOGGED OUT */}
          {!isLoading && !user && (
            <>
              <Link
                href="/auth/login"
                className="font-medium text-[#4f2a91] transition hover:text-[#3e2174]"
              >
                Sign In
              </Link>

              <Link
                href="/auth/signup"
                className="rounded-xl bg-[#4f2a91] px-6 py-3 font-medium text-white shadow-sm transition hover:bg-[#3e2174]"
              >
                Sign Up
              </Link>
            </>
          )}

          {/* CUSTOMER */}
          {!isLoading &&
            user?.role === "CUSTOMER" && (
              <>
                <Link
                  href="/customer/account"
                  className="font-medium text-[#4f2a91] transition hover:text-[#3e2174]"
                >
                  My Account
                </Link>

                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={
                    isSigningOut
                  }
                  className="rounded-xl border border-gray-200 px-5 py-2.5 font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  {isSigningOut
                    ? "Signing out..."
                    : "Sign Out"}
                </button>
              </>
            )}

          {/* VENDOR */}
          {!isLoading &&
            user?.role === "VENDOR" && (
              <button
                type="button"
                onClick={handleSignOut}
                disabled={
                  isSigningOut
                }
                className="rounded-xl border border-gray-200 px-5 py-2.5 font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                {isSigningOut
                  ? "Signing out..."
                  : "Sign Out"}
              </button>
            )}

        </div>
      </div>
    </header>
  );
}