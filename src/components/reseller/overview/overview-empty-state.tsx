"use client";

import Link from "next/link";
import { AtlasIcon } from "@/components/atlas/icons";
import { ROUTES } from "@/lib/reseller/overview/constants";
import { OVERVIEW_COPY } from "@/lib/reseller/overview/labels";

export function OverviewEmptyState() {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white px-6 py-10 text-center dark:border-neutral-800 dark:bg-neutral-900 sm:py-14">
      <span
        aria-hidden="true"
        className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300"
      >
        <AtlasIcon name="store" className="h-6 w-6" />
      </span>
      <h2 className="mt-4 text-base font-semibold text-neutral-900 dark:text-neutral-100">
        {OVERVIEW_COPY.emptyTitle}
      </h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-400">
        {OVERVIEW_COPY.emptyBody}
      </p>
      <Link
        href={ROUTES.storefront}
        className="mt-6 inline-flex items-center gap-1.5 rounded-md bg-brand-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        {OVERVIEW_COPY.emptyAction}
        <AtlasIcon
          name="arrow-right"
          className="h-3.5 w-3.5"
          aria-hidden="true"
        />
      </Link>
    </div>
  );
}