"use client";

import { useState } from "react";
import { Input } from "@/components/admin/ui/input";
import { Button } from "@/components/admin/ui/button";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";

interface StorefrontUserFiltersProps {
  storefronts: { id: string; name: string }[];
  onFilterChange: (filters: {
    search: string;
    storefrontId: string;
    status: string;
    risk: string;
  }) => void;
}

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspended" },
];

const riskOptions = [
  { value: "", label: "All Risk Levels" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export function StorefrontUserFilters({
  storefronts,
  onFilterChange,
}: StorefrontUserFiltersProps) {
  const [search, setSearch] = useState("");
  const [storefrontId, setStorefrontId] = useState("");
  const [status, setStatus] = useState("");
  const [risk, setRisk] = useState("");

  const applyChange = (
    overrides: Partial<{
      search: string;
      storefrontId: string;
      status: string;
      risk: string;
    }>
  ) => {
    onFilterChange({
      search: overrides.search ?? search,
      storefrontId: overrides.storefrontId ?? storefrontId,
      status: overrides.status ?? status,
      risk: overrides.risk ?? risk,
    });
  };

  const activeChips = [
    storefrontId && {
      label: `Storefront: ${
        storefronts.find((s) => s.id === storefrontId)?.name || storefrontId
      }`,
      clear: () => {
        setStorefrontId("");
        applyChange({ storefrontId: "" });
      },
    },
    status && {
      label: `Status: ${statusOptions.find((s) => s.value === status)?.label}`,
      clear: () => {
        setStatus("");
        applyChange({ status: "" });
      },
    },
    risk && {
      label: `Risk: ${riskOptions.find((r) => r.value === risk)?.label}`,
      clear: () => {
        setRisk("");
        applyChange({ risk: "" });
      },
    },
  ].filter(Boolean) as { label: string; clear: () => void }[];

  const handleReset = () => {
    setSearch("");
    setStorefrontId("");
    setStatus("");
    setRisk("");
    onFilterChange({
      search: "",
      storefrontId: "",
      status: "",
      risk: "",
    });
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
            placeholder="Search storefront users..."
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
          value={storefrontId}
          onChange={(e) => {
            setStorefrontId(e.target.value);
            applyChange({ storefrontId: e.target.value });
          }}
        >
          <option value="">All Storefronts</option>
          {storefronts.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
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

        <select
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          value={risk}
          onChange={(e) => {
            setRisk(e.target.value);
            applyChange({ risk: e.target.value });
          }}
        >
          {riskOptions.map((opt) => (
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
              className={cn(
                "inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
              )}
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