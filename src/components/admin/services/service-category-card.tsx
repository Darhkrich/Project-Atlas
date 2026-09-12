// components/admin/services/service-category-card.tsx
"use client";

import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { StatusDot } from "@/components/admin/ui/status-dot";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import type { ServiceCategory } from "@/lib/services-page-data";
import {
  FILTER_GROUP_LABEL,
  SECTION_LABEL,
  STATUS_LABEL,
  STATUS_VARIANT,
} from "@/lib/admin/services/constants";
import {
  networkCount,
  planCountFor,
  sectionsFor,
  serviceStatus,
} from "@/lib/admin/services/helpers";
import { resolveServiceIcon } from "@/lib/admin/services/icon-catalog";

interface ServiceCategoryCardProps {
  category: ServiceCategory;
  isSelected: boolean;
  isFocused: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onToggleSelect: (id: string) => void;
  onOpen: (id: string) => void;
  onFocus: (id: string) => void;
  onToggleAvailable: (id: string) => void;
  onDuplicate: (category: ServiceCategory) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
}

export function ServiceCategoryCard({
  category,
  isSelected,
  isFocused,
  canMoveUp,
  canMoveDown,
  onToggleSelect,
  onOpen,
  onFocus,
  onToggleAvailable,
  onDuplicate,
  onMoveUp,
  onMoveDown,
}: ServiceCategoryCardProps) {
  const checkboxId = `service-select-${category.id}`;
  const status = serviceStatus(category);
  const icon = resolveServiceIcon(category.icon);
  const plans = planCountFor(category);
  const networks = networkCount(category);
  const sections = sectionsFor(category);

  return (
    <div
      data-service-id={category.id}
      onMouseEnter={() => onFocus(category.id)}
      className={cn(
        "relative flex flex-col rounded-xl border bg-white transition-all dark:bg-neutral-900",
        "border-neutral-200 hover:-translate-y-0.5 hover:shadow-md dark:border-neutral-700",
        isSelected &&
          "border-brand-500 ring-2 ring-brand-500 dark:bg-brand-900/20",
        isFocused && !isSelected && "ring-1 ring-brand-300 dark:ring-brand-800"
      )}
    >
      <label
        htmlFor={checkboxId}
        className="absolute left-3 top-3 z-10 flex h-4 w-4 cursor-pointer items-center justify-center"
        aria-label={`Select ${category.name}`}
      >
        <input
          id={checkboxId}
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(category.id)}
          className="h-4 w-4"
        />
      </label>

      <button
        type="button"
        onClick={() => onOpen(category.id)}
        className="w-full rounded-t-xl p-4 pl-10 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
            <AtlasIcon name={icon} className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  {category.name}
                </h3>
                <p className="mt-0.5 line-clamp-1 text-xs text-neutral-500 dark:text-neutral-400">
                  {category.description}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <StatusDot
                  tone={
                    status === "available"
                      ? "success"
                      : status === "coming_soon"
                      ? "warning"
                      : "neutral"
                  }
                  size="sm"
                />
                <Badge variant={STATUS_VARIANT[status]} size="sm">
                  {STATUS_LABEL[status]}
                </Badge>
              </div>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <Badge variant="neutral" size="sm">
                {FILTER_GROUP_LABEL[category.filterGroup]}
              </Badge>
              {sections.map((section) => (
                <Badge key={section} variant="brand" size="sm">
                  {SECTION_LABEL[section]}
                </Badge>
              ))}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-neutral-500 dark:text-neutral-400">
                  Plans
                </p>
                <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {plans > 0 ? plans : "—"}
                </p>
              </div>
              <div>
                <p className="text-neutral-500 dark:text-neutral-400">
                  Networks
                </p>
                <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {networks > 0 ? networks : "—"}
                </p>
              </div>
            </div>

            {category.comingSoon && category.comingSoonReason && (
              <p className="mt-2 text-xs text-warning-700 dark:text-warning-300">
                {category.comingSoonReason}
              </p>
            )}
          </div>
        </div>
      </button>

      <div className="flex flex-wrap items-center gap-2 border-t border-neutral-100 px-4 py-2 dark:border-neutral-800">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToggleAvailable(category.id)}
        >
          {status === "available" ? "Disable" : "Enable"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDuplicate(category)}
        >
          Duplicate
        </Button>

        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            disabled={!canMoveUp}
            onClick={() => onMoveUp(category.id)}
            aria-label={`Move ${category.name} up`}
          >
            ↑
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={!canMoveDown}
            onClick={() => onMoveDown(category.id)}
            aria-label={`Move ${category.name} down`}
          >
            ↓
          </Button>
        </div>
      </div>
    </div>
  );
}