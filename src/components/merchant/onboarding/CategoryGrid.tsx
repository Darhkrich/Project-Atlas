/* eslint-disable @next/next/no-img-element */
"use client";

import type { KeyboardEvent } from "react";
import type { MerchantTemplateCategory } from "@/types/merchant-storefront";
import { ONBOARDING_CATEGORIES } from "@/lib/merchant/onboarding/categories";

interface CategoryGridProps {
  value: MerchantTemplateCategory;
  onChange: (value: MerchantTemplateCategory) => void;
}

export function CategoryGrid({ value, onChange }: CategoryGridProps) {
  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number
  ) => {
    const total = ONBOARDING_CATEGORIES.length;
    let next = -1;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      next = (index + 1) % total;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      next = (index - 1 + total) % total;
    } else if (event.key === "Home") {
      next = 0;
    } else if (event.key === "End") {
      next = total - 1;
    }
    if (next < 0) return;
    event.preventDefault();
    onChange(ONBOARDING_CATEGORIES[next].value);
    const parent = event.currentTarget.parentElement;
    const items = parent?.querySelectorAll<HTMLButtonElement>('[role="radio"]');
    items?.[next]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label="Business category"
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
    >
      {ONBOARDING_CATEGORIES.map((category, index) => {
        const selected = value === category.value;
        return (
          <button
            key={category.value}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onClick={() => onChange(category.value)}
            className={
              "group overflow-hidden rounded-xl border-2 bg-white text-left transition focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:bg-neutral-950 " +
              (selected
                ? "border-brand-600 shadow-md dark:border-brand-500"
                : "border-neutral-200 hover:border-neutral-300 hover:shadow-sm dark:border-neutral-700 dark:hover:border-neutral-600")
            }
          >
            <div className="relative h-20 w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
              <img
                src={category.image}
                alt=""
                aria-hidden="true"
                loading="lazy"
                className="h-full w-full object-cover"
              />
              {selected && (
                <span className="absolute right-1.5 top-1.5 rounded-full bg-brand-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  Selected
                </span>
              )}
            </div>
            <div className="p-2.5">
              <span
                className={
                  "block text-xs font-semibold " +
                  (selected
                    ? "text-brand-700 dark:text-brand-200"
                    : "text-neutral-900 dark:text-neutral-100")
                }
              >
                {category.label}
              </span>
              <span className="mt-0.5 hidden text-[11px] text-neutral-500 sm:block">
                {category.description}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}