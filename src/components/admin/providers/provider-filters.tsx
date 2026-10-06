// components/admin/providers/provider-filters.tsx
"use client";

import type { RefObject } from "react";
import { Input } from "@/components/admin/ui/input";
import { Button } from "@/components/admin/ui/button";
import { AtlasIcon } from "@/components/atlas/icons";
import type {
  ProviderType,
  ProviderStatus,
  ProviderCapability,
} from "@/lib/admin/types/provider";
import {
  ALL_PROVIDER_TYPES,
  ALL_PROVIDER_STATUSES,
  ALL_PROVIDER_CAPABILITIES,
  PROVIDER_TYPE_LABEL,
  PROVIDER_STATUS_LABEL,
  PROVIDER_CAPABILITY_LABEL,
} from "@/lib/admin/providers/constants";

export interface ProviderFilterValues {
  q: string;
  status: ProviderStatus | "";
  capability: ProviderCapability | "";
  type: ProviderType | "";
}

interface ProviderFiltersProps {
  value: ProviderFilterValues;
  onChange: (patch: Partial<ProviderFilterValues>) => void;
  onClear: () => void;
  hasActive: boolean;
  searchInputRef: RefObject<HTMLInputElement | null>;
}

export function ProviderFilters({
  value,
  onChange,
  onClear,
  hasActive,
  searchInputRef,
}: ProviderFiltersProps) {
  const chips: { label: string; clear: () => void }[] = [];

  if (value.status) {
    chips.push({
      label: `Status: ${PROVIDER_STATUS_LABEL[value.status]}`,
      clear: () => onChange({ status: "" }),
    });
  }
  if (value.capability) {
    chips.push({
      label: `Capability: ${PROVIDER_CAPABILITY_LABEL[value.capability]}`,
      clear: () => onChange({ capability: "" }),
    });
  }
  if (value.type) {
    chips.push({
      label: `Type: ${PROVIDER_TYPE_LABEL[value.type]}`,
      clear: () => onChange({ type: "" }),
    });
  }
  if (value.q.trim()) {
    chips.push({
      label: `Search: ${value.q}`,
      clear: () => onChange({ q: "" }),
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <AtlasIcon
            name="search"
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
          />
          <Input
            ref={searchInputRef}
            aria-label="Search providers"
            placeholder="Search by name or code"
            className="pl-9"
            value={value.q}
            onChange={(e) => onChange({ q: e.target.value })}
          />
        </div>

        <select
          aria-label="Filter by status"
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          value={value.status}
          onChange={(e) =>
            onChange({ status: e.target.value as ProviderStatus | "" })
          }
        >
          <option value="">All statuses</option>
          {ALL_PROVIDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {PROVIDER_STATUS_LABEL[s]}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by capability"
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          value={value.capability}
          onChange={(e) =>
            onChange({
              capability: e.target.value as ProviderCapability | "",
            })
          }
        >
          <option value="">All capabilities</option>
          {ALL_PROVIDER_CAPABILITIES.map((c) => (
            <option key={c} value={c}>
              {PROVIDER_CAPABILITY_LABEL[c]}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by provider type"
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          value={value.type}
          onChange={(e) =>
            onChange({ type: e.target.value as ProviderType | "" })
          }
        >
          <option value="">All types</option>
          {ALL_PROVIDER_TYPES.map((t) => (
            <option key={t} value={t}>
              {PROVIDER_TYPE_LABEL[t]}
            </option>
          ))}
        </select>

        {hasActive && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            Clear filters
          </Button>
        )}
      </div>

      {chips.length > 0 && (
        <div
          role="status"
          aria-live="polite"
          className="flex flex-wrap gap-2"
        >
          {chips.map((chip) => (
            <span
              key={chip.label}
              className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
            >
              {chip.label}
              <button
                type="button"
                onClick={chip.clear}
                aria-label={`Remove ${chip.label} filter`}
                className="ml-1 rounded-sm hover:text-danger-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                x
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}