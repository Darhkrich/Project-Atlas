"use client";

import { useState } from "react";
import { Input } from "@/components/admin/ui/input";
import { Button } from "@/components/admin/ui/button";
import { AtlasIcon } from "@/components/atlas/icons";

interface StorefrontFiltersProps {
  onFilterChange: (filters: {
    search: string;
    type: string;
    status: string;
  }) => void;
}

const typeOptions = [
  { value: "", label: "All Types" },
  { value: "reseller", label: "Reseller" },
  { value: "merchant", label: "Merchant" },
];

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "live", label: "Live" },
  { value: "pending", label: "Pending" },
  { value: "disabled", label: "Disabled" },
];

export function StorefrontFilters({ onFilterChange }: StorefrontFiltersProps) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");

  const applyChange = (
    overrides: Partial<{ search: string; type: string; status: string }>
  ) => {
    onFilterChange({
      search: overrides.search ?? search,
      type: overrides.type ?? type,
      status: overrides.status ?? status,
    });
  };

  const activeChips = [
    type && {
      label: `Type: ${typeOptions.find((t) => t.value === type)?.label}`,
      clear: () => {
        setType("");
        applyChange({ type: "" });
      },
    },
    status && {
      label: `Status: ${statusOptions.find((s) => s.value === status)?.label}`,
      clear: () => {
        setStatus("");
        applyChange({ status: "" });
      },
    },
  ].filter(Boolean) as { label: string; clear: () => void }[];

  const handleReset = () => {
    setSearch("");
    setType("");
    setStatus("");
    onFilterChange({ search: "", type: "", status: "" });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <AtlasIcon
            name="search"
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
          />
          <Input
            placeholder="Search storefronts or owners..."
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              applyChange({ search: e.target.value });
            }}
          />
        </div>

        <select
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            applyChange({ type: e.target.value });
          }}
        >
          {typeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            applyChange({ status: e.target.value });
          }}
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <Button variant="ghost" size="sm" onClick={handleReset}>
          Reset
        </Button>
      </div>

      {activeChips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeChips.map((chip) => (
            <span
              key={chip.label}
              className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
            >
              {chip.label}
              <button
                onClick={chip.clear}
                className="ml-1 hover:text-danger-600"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}