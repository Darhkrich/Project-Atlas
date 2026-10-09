"use client";

import Link from "next/link";
import { AtlasIcon } from "@/components/atlas/icons";
import { formatRelative } from "@/lib/shared/format";
import { useNow } from "@/lib/shared/hooks/use-now";
import { ROUTES } from "@/lib/reseller/overview/constants";
import { WALLET_COPY } from "@/lib/reseller/overview/labels";
import type { StorefrontHealth } from "@/lib/reseller/overview/types";

interface TodayStorefrontCardProps {
  ordersToday: number;
  health: StorefrontHealth | null;
}

export function TodayStorefrontCard({
  ordersToday,
  health,
}: TodayStorefrontCardProps) {
  const nowMs = useNow();
  const isLive = health?.status === "live";
  const lastOrderLabel =
    health?.lastOrderAt && nowMs !== null
      ? formatRelative(health.lastOrderAt, nowMs)
      : "No orders yet";

  return (
    <section
      aria-label={WALLET_COPY.todayHeading}
      className="h-full overflow-hidden rounded-xl border border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/50 dark:bg-emerald-950/20"
    >
      <div className="grid h-full divide-y divide-emerald-100 dark:divide-emerald-900/40 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        <div className="p-4 sm:p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
            {WALLET_COPY.ordersTodayLabel}
          </p>
          <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-emerald-900 dark:text-emerald-100">
            {ordersToday}
          </p>
          <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-400">
            {ordersToday === 1
              ? WALLET_COPY.ordersPlacedOne
              : String(ordersToday) + " " + WALLET_COPY.ordersPlacedMany}
          </p>
        </div>

        <div className="flex flex-col p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
              {WALLET_COPY.storefrontHeading}
            </p>
            {health ? (
              <span
                className={
                  "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 " +
                  (isLive
                    ? "bg-white text-emerald-700 ring-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-200 dark:ring-emerald-700"
                    : "bg-white text-amber-700 ring-amber-300 dark:bg-amber-900/40 dark:text-amber-200 dark:ring-amber-700")
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
            ) : null}
          </div>

          {health ? (
            <>
              <p className="mt-2 truncate text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                {health.slug}
              </p>
              <p className="mt-0.5 text-xs text-emerald-700 dark:text-emerald-400">
                {health.serviceCount === 1
                  ? "1 service"
                  : String(health.serviceCount) + " services"}
                {" \u00B7 "}
                {lastOrderLabel}
              </p>
              <Link
                href={ROUTES.storefront}
                className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-emerald-800 hover:underline focus:outline-none focus-visible:underline dark:text-emerald-300"
              >
                {WALLET_COPY.manageAction}
                <AtlasIcon
                  name="external-link"
                  className="h-3 w-3"
                  aria-hidden="true"
                />
              </Link>
            </>
          ) : (
            <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-400">
              {WALLET_COPY.noStorefront}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}