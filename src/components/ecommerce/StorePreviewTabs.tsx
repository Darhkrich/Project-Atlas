"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const storeThemes = [
  {
    id: "fashion",
    label: "Fashion",
    name: "Fashion Boutique",
    description: "A clean, image-focused storefront for clothing and accessories.",
    headerBg: "bg-neutral-100",
    primary: "bg-neutral-900",
  },
  {
    id: "electronics",
    label: "Electronics",
    name: "Electronics Store",
    description: "A bold, product-forward layout for gadgets and tech.",
    headerBg: "bg-blue-50",
    primary: "bg-blue-600",
  },
  {
    id: "groceries",
    label: "Groceries",
    name: "Grocery Market",
    description: "A fresh, colorful design for everyday essentials.",
    headerBg: "bg-green-50",
    primary: "bg-green-600",
  },
];

export function StorePreviewTabs() {
  const [activeTab, setActiveTab] = useState(storeThemes[0].id);
  const active = storeThemes.find((t) => t.id === activeTab)!;

  return (
    <div>
      {/* Tabs */}
      <div className="mb-8 flex flex-wrap justify-center gap-2">
        {storeThemes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => setActiveTab(theme.id)}
            className={cn(
              "rounded-full px-5 py-2 text-sm font-medium transition-colors",
              activeTab === theme.id
                ? "bg-brand-800 text-white"
                : "border border-neutral-300 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
            )}
          >
            {theme.label}
          </button>
        ))}
      </div>

      {/* Preview */}
      <div className="mx-auto max-w-4xl overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <div className={cn("p-4", active.headerBg)}>
          <div className="text-sm font-semibold text-neutral-900">
            {active.name}
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            {active.description}
          </p>
        </div>
        <div className="grid gap-4 p-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="h-32 rounded-lg bg-neutral-100 dark:bg-neutral-800" />
              <div className="h-32 rounded-lg bg-neutral-100 dark:bg-neutral-800" />
              <div className="h-32 rounded-lg bg-neutral-100 dark:bg-neutral-800" />
              <div className="h-32 rounded-lg bg-neutral-100 dark:bg-neutral-800" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="rounded-lg bg-white p-3 shadow-sm dark:bg-neutral-900">
              <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Featured Product
              </div>
              <div className="mt-2 h-24 rounded bg-neutral-100 dark:bg-neutral-800" />
              <div className="mt-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                $49.99
              </div>
              <button className="mt-2 w-full rounded-md bg-brand-800 px-3 py-2 text-xs font-medium text-white">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}