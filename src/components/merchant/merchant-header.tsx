"use client";

import { useState } from "react";
import Link from "next/link";

interface MerchantHeaderProps {
  onMenuToggle: () => void;
}

export function MerchantHeader({ onMenuToggle }: MerchantHeaderProps) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-4 sm:px-6 dark:border-neutral-800 dark:bg-neutral-900">
      {/* Left: mobile menu button and search */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 lg:hidden dark:hover:bg-neutral-800"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="hidden sm:block relative">
          <input
            type="search"
            placeholder="Search..."
            className="w-64 rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-2 pl-9 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-500"
          />
          <svg
            className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Right: notifications and profile */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative rounded-md p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute right-1 top-1 flex h-2 w-2 rounded-full bg-brand-500" />
          </button>
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl border border-neutral-200 bg-white shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
              <div className="border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
                <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  Notifications
                </p>
              </div>
              <div className="max-h-64 overflow-y-auto p-2">
                <div className="rounded-lg p-2 hover:bg-neutral-50 dark:hover:bg-neutral-800">
                  <p className="text-sm text-neutral-800 dark:text-neutral-200">
                    New order received
                  </p>
                  <p className="text-xs text-neutral-500">2 minutes ago</p>
                </div>
                <div className="rounded-lg p-2 hover:bg-neutral-50 dark:hover:bg-neutral-800">
                  <p className="text-sm text-neutral-800 dark:text-neutral-200">
                    Product stock low
                  </p>
                  <p className="text-xs text-neutral-500">1 hour ago</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 rounded-md p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
              JM
            </div>
            <span className="hidden md:block text-sm font-medium text-neutral-800 dark:text-neutral-200">
              John Mensah
            </span>
            <svg className="h-4 w-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-neutral-200 bg-white shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
              <Link
                href="/merchant/settings"
                className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800"
              >
                Settings
              </Link>
              <Link
                href="/merchant/billing"
                className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800"
              >
                Billing
              </Link>
              <button className="w-full px-4 py-2 text-left text-sm text-danger-600 hover:bg-neutral-50 dark:hover:bg-neutral-800">
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}