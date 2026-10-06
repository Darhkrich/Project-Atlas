/* eslint-disable @next/next/no-img-element */
"use client";

import type { KeyboardEvent } from "react";
import { ONBOARDING_TEMPLATES } from "@/lib/merchant/onboarding/templates";

interface TemplateGridProps {
  value: string;
  onChange: (id: string) => void;
}

export function TemplateGrid({ value, onChange }: TemplateGridProps) {
  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number
  ) => {
    const total = ONBOARDING_TEMPLATES.length;
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
    onChange(ONBOARDING_TEMPLATES[next].id);
    const parent = event.currentTarget.parentElement;
    const items = parent?.querySelectorAll<HTMLButtonElement>('[role="radio"]');
    items?.[next]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label="Storefront template"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {ONBOARDING_TEMPLATES.map((template, index) => {
        const selected = value === template.id;
        return (
          <button
            key={template.id}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onClick={() => onChange(template.id)}
            className={
              "overflow-hidden rounded-xl border-2 bg-white text-left transition focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:bg-neutral-950 " +
              (selected
                ? "border-brand-600 shadow-lg"
                : "border-neutral-200 hover:border-neutral-300 hover:shadow-md dark:border-neutral-800 dark:hover:border-neutral-700")
            }
          >
            <img
              src={template.thumbnail}
              alt=""
              aria-hidden="true"
              className="h-32 w-full object-cover"
            />
            <div className="p-4">
              <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                {template.name}
              </h3>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                {template.description}
              </p>
              <ul role="list" className="mt-3 space-y-1">
                {template.attributes.map((attr) => (
                  <li
                    key={attr}
                    className="flex items-center gap-2 text-xs text-neutral-500"
                  >
                    <span
                      aria-hidden="true"
                      className="h-1.5 w-1.5 rounded-full bg-brand-500"
                    />
                    {attr}
                  </li>
                ))}
              </ul>
            </div>
          </button>
        );
      })}
    </div>
  );
}