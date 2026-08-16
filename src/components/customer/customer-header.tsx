"use client";

import { AtlasLogo } from "@/components/atlas/atlas-logo";
import { cn } from "@/lib/utils";

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
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        {/* Atlas identity */}
        <AtlasLogo />

        {/* Application context */}
        <div className="hidden items-center gap-2 sm:flex">
          <span className="h-4 w-px bg-neutral-300 dark:bg-neutral-700" aria-hidden="true" />
          <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
            Customer Platform
          </span>
        </div>

        {/* Right side controls */}
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          {/* Notifications */}
          <button
            type="button"
            className="relative inline-flex items-center justify-center rounded-md p-2 text-neutral-600 transition-colors hover:text-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-neutral-400 dark:hover:text-neutral-100"
            aria-label="Notifications"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            {unreadCount > 0 && (
              <span
                className="absolute right-1 top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-danger-600 px-1 text-xs font-medium text-white dark:bg-danger-500"
                aria-label={`${unreadCount} unread notifications`}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Account / Profile */}
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md p-1.5 text-neutral-700 transition-colors hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-neutral-200 dark:hover:bg-neutral-800"
            aria-label="Account"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700 dark:bg-brand-900 dark:text-brand-300">
              A
            </span>
            <svg
              className="hidden h-4 w-4 text-neutral-500 dark:text-neutral-400 sm:block"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}