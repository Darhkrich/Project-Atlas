"use client";

import Link from "next/link";
import { AtlasIcon } from "@/components/atlas/icons";
import type { DashboardStorefrontHealth } from "@/lib/merchant/dashboard/types";

interface StorefrontHealthStripProps {
  storefront: DashboardStorefrontHealth;
}

export function StorefrontHealthStrip({
  storefront,
}: StorefrontHealthStripProps) {
  return (
    <section
      aria-labelledby="dashboard-storefront"
      className="rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
    >
      <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
        <h2
          id="dashboard-storefront"
          className="text-sm font-semibold text-neutral-900 dark:text-neutral-100"
        >
          Storefront
        </h2>
        <AtlasIcon
          name="store"
          className="h-4 w-4 text-neutral-400"
          aria-hidden="true"
        />
      </div>

      <ul
        role="list"
        className="divide-y divide-neutral-200 dark:divide-neutral-800"
      >
        <li className="flex items-center justify-between gap-3 px-5 py-4">
          <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            <span
              className={
                "h-2 w-2 rounded-full " +
                (storefront.status === "live"
                  ? "bg-success-500"
                  : "bg-neutral-400")
              }
              aria-hidden="true"
            />
            Status
          </span>
          <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {storefront.status === "live" ? "Live" : "Draft"}
          </span>
        </li>

        <li className="flex items-center justify-between gap-3 px-5 py-4">
          <span className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            URL
          </span>
          <span className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {storefront.displayUrl}
          </span>
        </li>

        <li className="flex items-center justify-between gap-3 px-5 py-4">
          <span className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Template
          </span>
          <span className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {storefront.templateLabel}
          </span>
        </li>
      </ul>

      <div className="border-t border-neutral-200 px-5 py-3 dark:border-neutral-800">
        <Link
          href="/merchant/storefront"
          className="text-xs font-medium text-brand-600 hover:text-brand-700"
        >
          Edit storefront
        </Link>
      </div>
    </section>
  );
}