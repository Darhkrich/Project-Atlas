/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/atlas/theme-provider";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", href: "/", exact: true },
  { label: "Services", href: "/services", exact: false },
  { label: "For Resellers", href: "/resellers", exact: false },
  { label: "E-Commerce", href: "/ecommerce", exact: false },
  { label: "Dashboard", href: "/dashboard", exact: false },
  { label: "Resources", href: "/resources", exact: false },
  { label: "Company", href: "/company", exact: false },
];

export function AtlasNavbar() {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200/80 bg-[#FCFCFB]/90 backdrop-blur-sm dark:border-neutral-800/80 dark:bg-neutral-950/80">
      <div className="mx-auto flex h-[84px] max-w-[1180px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2" aria-label="Atlas home">
          <svg className="h-7 w-7 text-[#003D2E] dark:text-brand-300" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 3L21 20H3L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            <path d="M8 16H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="text-lg font-semibold tracking-widest text-[#003D2E] dark:text-brand-300">ATLAS</span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-6 lg:flex" aria-label="Main navigation">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors",
                  isActive
                    ? "text-[#003D2E] underline underline-offset-4 decoration-2 dark:text-brand-300"
                    : "text-neutral-700 hover:text-[#003D2E] dark:text-neutral-300 dark:hover:text-brand-300"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {/* Theme toggle pill */}
          <button
            onClick={toggleTheme}
            className="inline-flex h-7 w-12 items-center rounded-full border border-neutral-300 bg-white px-1 transition-colors focus:outline-none focus:ring-2 focus:ring-[#003D2E] dark:border-neutral-700 dark:bg-neutral-900"
            aria-label="Toggle theme"
          >
            <span
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded-full bg-neutral-200 transition-transform dark:bg-neutral-700",
                theme === "light" ? "translate-x-0" : "translate-x-5"
              )}
            >
              {theme === "light" ? (
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </span>
          </button>

          {/* Auth buttons */}
          <Link
            href="/login"
            className="hidden items-center justify-center rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800 sm:inline-flex"
          >
            Log in
          </Link>
          <Link
            href="/sign-up"
            className="hidden items-center justify-center rounded-lg bg-[#003D2E] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#004B3B] dark:bg-brand-800 dark:hover:bg-brand-700 sm:inline-flex"
          >
            Sign up
          </Link>

          {/* Mobile menu toggle */}
          <button
            className="inline-flex items-center justify-center rounded-md p-2 text-neutral-700 hover:bg-neutral-100 hover:text-[#003D2E] dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-brand-300 lg:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "fixed inset-x-0 top-[84px] z-30 overflow-hidden border-b border-neutral-200 bg-[#FCFCFB] transition-all duration-300 ease-in-out dark:border-neutral-800 dark:bg-neutral-950 lg:hidden",
          mobileOpen ? "max-h-[calc(100vh-84px)] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <nav className="flex flex-col space-y-1 px-4 py-4" aria-label="Mobile main navigation">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-3 py-3 text-base font-medium transition-colors",
                  isActive
                    ? "bg-[#EAF3EF] text-[#003D2E] dark:bg-brand-900/40 dark:text-brand-300"
                    : "text-neutral-700 hover:bg-neutral-100 hover:text-[#003D2E] dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-brand-300"
                )}
              >
                {item.label}
              </Link>
            );
          })}

          <div className="mt-4 flex flex-col gap-3 border-t border-neutral-200 pt-4 dark:border-neutral-800">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm font-medium text-neutral-800 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
            >
              Log in
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center rounded-lg bg-[#003D2E] px-4 py-3 text-sm font-medium text-white dark:bg-brand-800"
            >
              Sign up
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}