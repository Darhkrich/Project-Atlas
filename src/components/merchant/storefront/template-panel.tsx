/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState } from "react";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import {
  TEMPLATE_CATEGORY_LABELS,
  TEMPLATE_CATALOG,
  templatesForCategory,
  type TemplateCatalogEntry,
} from "@/lib/merchant/templates/catalog";
import type { MerchantStorefrontConfig } from "@/types/merchant-storefront";
import type { MerchantTemplateCategory } from "@/types/merchant-storefront";

interface TemplatePanelProps {
  draft: MerchantStorefrontConfig;
  setField: <K extends keyof MerchantStorefrontConfig>(
    key: K,
    value: MerchantStorefrontConfig[K]
  ) => void;
  onRequestSwitch: (
    nextTemplateId: string,
    nextCategory: MerchantTemplateCategory
  ) => void;
}

const CATEGORIES_WITH_TEMPLATES: MerchantTemplateCategory[] = [
  ...new Set(TEMPLATE_CATALOG.flatMap((t) => t.recommendedFor)),
];

function countForCategory(category: MerchantTemplateCategory): number {
  return TEMPLATE_CATALOG.filter((t) =>
    t.recommendedFor.includes(category)
  ).length;
}

function TemplateCard({
  template,
  isCurrent,
  onSelect,
}: {
  template: TemplateCatalogEntry;
  isCurrent: boolean;
  onSelect: () => void;
}) {
  const isComingSoon = template.status === "coming_soon";
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={isCurrent || isComingSoon}
      aria-disabled={isComingSoon || undefined}
      className={cn(
        "overflow-hidden rounded-xl border-2 bg-white text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:bg-neutral-900",
        isCurrent
          ? "cursor-default border-brand-600 shadow-md dark:border-brand-500"
          : isComingSoon
            ? "cursor-not-allowed border-neutral-200 opacity-70 dark:border-neutral-800"
            : "border-neutral-200 hover:border-neutral-300 hover:shadow-md dark:border-neutral-800 dark:hover:border-neutral-700"
      )}
    >
      <div className="relative">
        {template.thumbnail ? (
          <img
            src={template.thumbnail}
            alt=""
            aria-hidden="true"
            className="h-28 w-full object-cover"
          />
        ) : (
          <div
            className="h-28 w-full bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-950"
            aria-hidden="true"
          />
        )}
        {isCurrent && (
          <span className="absolute right-2 top-2 rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-semibold text-white">
            Active
          </span>
        )}
        {isComingSoon && !isCurrent && (
          <span className="absolute right-2 top-2 rounded-full bg-neutral-900/80 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
            Coming soon
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          {template.name}
        </p>
        <p className="mt-0.5 line-clamp-2 text-xs text-neutral-500 dark:text-neutral-400">
          {template.description}
        </p>
      </div>
    </button>
  );
}

export function TemplatePanel({
  draft,
  setField,
  onRequestSwitch,
}: TemplatePanelProps) {
  const [selectedCategory, setSelectedCategory] =
    useState<MerchantTemplateCategory>(draft.templateCategory);

  const current = useMemo(
    () => TEMPLATE_CATALOG.find((t) => t.id === draft.templateId),
    [draft.templateId]
  );

  const templatesInCategory = useMemo(
    () => templatesForCategory(selectedCategory),
    [selectedCategory]
  );

  const handleCategoryPick = (category: MerchantTemplateCategory) => {
    setSelectedCategory(category);
    setField("templateCategory", category);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          Template
        </h2>
        <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
          Change the layout of your storefront. Your brand, products, and
          settings carry over.
        </p>
      </div>

      <div className="flex items-start gap-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-white dark:border-neutral-800">
          {current?.thumbnail ? (
            <img
              src={current.thumbnail}
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              className="h-full w-full bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-950"
              aria-hidden="true"
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            Current template
          </p>
          <p className="mt-0.5 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            {current?.name ?? "Unknown template"}
          </p>
          {current && (
            <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
              {current.description}
            </p>
          )}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
          Category
        </p>
        <p className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
          Pick the category closest to your store. You will see templates
          built for it.
        </p>

        <ul
          role="list"
          className="mt-3 flex flex-wrap gap-1.5"
        >
          {CATEGORIES_WITH_TEMPLATES.map((category) => {
            const selected = selectedCategory === category;
            const count = countForCategory(category);
            return (
              <li key={category}>
                <button
                  type="button"
                  onClick={() => handleCategoryPick(category)}
                  aria-pressed={selected}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition",
                    selected
                      ? "border-brand-600 bg-brand-600 text-white"
                      : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-neutral-600"
                  )}
                >
                  <span>{TEMPLATE_CATEGORY_LABELS[category]}</span>
                  <span
                    className={cn(
                      "rounded-full px-1.5 text-[9px] font-semibold",
                      selected
                        ? "bg-white/25 text-white"
                        : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
                    )}
                  >
                    {count}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            {TEMPLATE_CATEGORY_LABELS[selectedCategory]} templates
          </p>
          <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
            {templatesInCategory.length} total
          </span>
        </div>

        {templatesInCategory.length === 0 ? (
          <div className="mt-3 rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-6 text-center dark:border-neutral-700 dark:bg-neutral-950">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              No templates in this category yet. More are coming.
            </p>
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {templatesInCategory.map((template) => {
              const isCurrent = draft.templateId === template.id;
              return (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isCurrent={isCurrent}
                  onSelect={() => {
                    if (isCurrent) return;
                    if (template.status !== "available") return;
                    onRequestSwitch(template.id, selectedCategory);
                  }}
                />
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-info-200 bg-info-50 p-3 dark:border-info-800/60 dark:bg-info-900/20">
        <AtlasIcon
          name="info"
          aria-hidden="true"
          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-info-600 dark:text-info-400"
        />
        <p className="text-[11px] leading-relaxed text-info-900 dark:text-info-200">
          Switching templates changes the layout but keeps every detail you
          have set. You have 30 seconds to undo after each switch.
        </p>
      </div>
    </div>
  );
}