"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type CatalogPricingTabKey = "pricing" | "tier_reference";

const TABS: { key: CatalogPricingTabKey; label: string }[] = [
  { key: "pricing", label: "Pricing" },
  { key: "tier_reference", label: "Tier reference" },
];

export function CatalogPricingTabs({
  active,
  onChange,
}: {
  active: CatalogPricingTabKey;
  onChange: (key: CatalogPricingTabKey) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Pricing sections"
      className="flex gap-2 overflow-x-auto border-b border-neutral-200 dark:border-neutral-800"
    >
      {TABS.map((tab) => {
        const selected = active === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            id={"tab-" + tab.key}
            aria-selected={selected}
            aria-controls={"tabpanel-" + tab.key}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.key)}
            className={cn(
              "whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium",
              selected
                ? "border-brand-600 text-brand-600"
                : "border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export function CatalogPricingTabPanel({
  tabKey,
  active,
  children,
}: {
  tabKey: CatalogPricingTabKey;
  active: CatalogPricingTabKey;
  children: ReactNode;
}) {
  if (tabKey !== active) return null;
  return (
    <div
      role="tabpanel"
      id={"tabpanel-" + tabKey}
      aria-labelledby={"tab-" + tabKey}
    >
      {children}
    </div>
  );
}