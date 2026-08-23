/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const storeThemes = [
  {
    id: "fashion",
    label: "Fashion",
    name: "Fashion Boutique",
    description:
      "A clean, image-focused storefront for clothing and accessories.",
    image: "/Ladies-wear-store.png",
  },
  {
    id: "electronics",
    label: "Electronics",
    name: "Electronics Store",
    description:
      "A bold, product-forward layout for gadgets and tech.",
    image: "/images/ecommerce/store-electronics.jpg",
  },
  {
    id: "groceries",
    label: "Groceries",
    name: "Grocery Market",
    description:
      "A fresh, colorful design for everyday essentials.",
    image: "/mtn4.jpg",
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
        <div className="p-4">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                {active.name}
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {active.description}
              </p>
            </div>
            <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-800 dark:bg-brand-900 dark:text-brand-300">
              Live Preview
            </span>
          </div>
        </div>
        <div className="border-t border-neutral-200 dark:border-neutral-800">
          <img
            src={active.image}
            alt={`${active.name} preview`}
            className="h-64 w-full object-cover md:h-96"
          />
        </div>
      </div>
    </div>
  );
}