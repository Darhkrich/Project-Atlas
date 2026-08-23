/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AtlasLogo } from "@/components/atlas/atlas-logo";
import { cn } from "@/lib/utils";
import { AtlasIcon } from "@/components/atlas/icons";
import { useTheme } from "@/components/atlas/theme-provider";
import { useAuth } from "@/components/auth/AuthProvider";

interface CustomerHeaderProps {
  mobileNavOpen: boolean;
  onMenuToggle: () => void;
  unreadCount?: number;
}

export function CustomerHeader({
  mobileNavOpen,
  onMenuToggle,
  unreadCount = 0,
}: CustomerHeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex h-full items-center gap-3 px-4 sm:px-6 lg:px-8">
        {/* Mobile navigation trigger */}
        <button
          type="button"
          onClick={onMenuToggle}
          className="inline-flex items-center justify-center rounded-md p-2 text-neutral-600 transition-colors hover:text-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-neutral-400 dark:hover:text-neutral-100 lg:hidden"
          aria-expanded={mobileNavOpen}
          aria-controls="customer-mobile-navigation"
          aria-label={mobileNavOpen ? "Close navigation" : "Open navigation"}
        >
          {mobileNavOpen ? (
            <AtlasIcon name="x-circle" className="h-5 w-5" />
          ) : (
            <AtlasIcon name="menu" className="h-5 w-5" />
          )}
        </button>

        <AtlasLogo />

        {/* Desktop Search */}
        <div className="mx-4 hidden flex-1 md:block">
          <div className="relative max-w-md">
            <AtlasIcon
              name="search"
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
            />
            <input
              type="search"
              placeholder="Search services, transactions..."
              className="w-full rounded-full border border-neutral-200 bg-neutral-50 py-2 pl-10 pr-4 text-sm text-neutral-900 placeholder-neutral-500 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder-neutral-400"
            />
          </div>
        </div>

        {/* Right side controls */}
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex items-center justify-center rounded-md p-2 text-neutral-600 transition-colors hover:text-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-neutral-400 dark:hover:text-neutral-100"
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <AtlasIcon name="moon" className="h-5 w-5" />
            ) : (
              <AtlasIcon name="sun" className="h-5 w-5" />
            )}
          </button>

          {/* Notifications */}
          <button
            type="button"
            className="relative inline-flex items-center justify-center rounded-md p-2 text-neutral-600 transition-colors hover:text-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-neutral-400 dark:hover:text-neutral-100"
            aria-label="Notifications"
          >
            <AtlasIcon name="bell" className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-danger-600 px-1 text-xs font-medium text-white dark:bg-danger-500">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Account / Profile Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-md p-1.5 text-neutral-700 transition-colors hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-neutral-200 dark:hover:bg-neutral-800"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label="Account menu"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700 dark:bg-brand-900 dark:text-brand-300">
                E
              </span>
              <span className="hidden text-sm font-medium sm:block">Emmanuel</span>
              <AtlasIcon
                name="arrow-right"
                className="hidden h-4 w-4 rotate-90 text-neutral-500 dark:text-neutral-400 sm:block"
              />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-12 z-50 w-48 rounded-lg border border-neutral-200 bg-white p-2 shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                  <AtlasIcon name="x-circle" className="h-4 w-4" />
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}