"use client";

import Link from "next/link";
import { AtlasCard } from "@/components/atlas/card";
import { AtlasIcon } from "@/components/atlas/icons";
import { formatRelative } from "@/lib/shared/format";
import { useNow } from "@/lib/shared/hooks/use-now";
import { ROUTES } from "@/lib/reseller/overview/constants";
import { SECTION_LABELS } from "@/lib/reseller/overview/labels";
import type { StorefrontHealth } from "@/lib/reseller/overview/types";

interface StorefrontHealthStripProps {
  health: StorefrontHealth | null;
}

export function StorefrontHealthStrip({
  health,
}: StorefrontHealthStripProps) {
  const nowMs = useNow();
  if (!health) return null;

  const isLive = health.status === "live";
  const lastOrderLabel =
    health.lastOrderAt && nowMs !== null
      ? formatRelative(health.lastOrderAt, nowMs)
      : "No orders yet";

  return (
    <section aria-labelledby="storefront-health-heading">
      <h2
        id="storefront-health-heading"
        className="mb-3 text-xs font-medium uppercase tracking-wide text-neutral-500"
      >
        {SECTION_LABELS.storefront}
      </h2>
      <AtlasCard className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
            >
              <AtlasIcon name="store" className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {health.slug}
              </p>
              <p className="mt-0.5 text-xs text-neutral-500">
                {health.serviceCount === 1
                  ? "1 service enabled"
                  : String(health.serviceCount) + " services enabled"}
                {" \u00B7 "}
                {lastOrderLabel}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 " +
                (isLive
                  ? "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:ring-emerald-800"
                  : "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:ring-amber-800")
              }
            >
              <span
                aria-hidden="true"
                className={
                  "h-1.5 w-1.5 rounded-full " +
                  (isLive ? "bg-emerald-500" : "bg-amber-500")
                }
              />
              {isLive ? "Live" : "Draft"}
            </span>
            <Link
              href={ROUTES.storefront}
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              Manage
              <AtlasIcon
                name="external-link"
                className="h-3.5 w-3.5"
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>
      </AtlasCard>
    </section>
  );
}