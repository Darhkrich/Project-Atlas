"use client";

import Link from "next/link";
import { AtlasIcon } from "@/components/atlas/icons";
import type { AtlasIconName } from "@/components/atlas/icons";
import type { DashboardAction } from "@/lib/merchant/dashboard/types";

interface TodayStripProps {
  orderCount: number;
  salesTotal: number;
  actions: DashboardAction[];
}

type TileTone = "neutral" | "warning" | "brand";

interface Tile {
  label: string;
  value: string;
  icon: AtlasIconName;
  href: string;
  tone: TileTone;
}

function iconClass(tone: TileTone): string {
  if (tone === "warning") return "h-4 w-4 text-warning-500";
  if (tone === "brand") return "h-4 w-4 text-brand-600";
  return "h-4 w-4 text-neutral-400";
}

export function TodayStrip({
  orderCount,
  salesTotal,
  actions,
}: TodayStripProps) {
  const unfulfilled =
    actions.find((a) => a.kind === "unfulfilled_orders")?.count ?? 0;
  const lowStock = actions.find((a) => a.kind === "low_stock")?.count ?? 0;

  const tiles: Tile[] = [
    {
      label: "Orders today",
      value: String(orderCount),
      icon: "orders",
      href: "/merchant/orders",
      tone: "neutral",
    },
    {
      label: "Sales today",
      value: "GH\u20B5 " + salesTotal.toFixed(2),
      icon: "sales",
      href: "/merchant/orders",
      tone: "brand",
    },
    {
      label: "Unfulfilled",
      value: String(unfulfilled),
      icon: "package",
      href: "/merchant/orders",
      tone: unfulfilled > 0 ? "warning" : "neutral",
    },
    {
      label: "Low stock",
      value: String(lowStock),
      icon: "alert",
      href: "/merchant/products",
      tone: lowStock > 0 ? "warning" : "neutral",
    },
  ];

  return (
    <section aria-label="Today at a glance">
      <ul
        role="list"
        className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
      >
        {tiles.map((tile) => (
          <li key={tile.label}>
            <Link
              href={tile.href}
              className="flex h-full flex-col justify-between rounded-xl border border-neutral-200 bg-white p-4 transition hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  {tile.label}
                </span>
                <AtlasIcon
                  name={tile.icon}
                  className={iconClass(tile.tone)}
                  aria-hidden="true"
                />
              </div>
              <p className="mt-3 text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-2xl">
                {tile.value}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}