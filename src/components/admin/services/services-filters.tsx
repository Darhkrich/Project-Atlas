"use client";

import { useState } from "react";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";

interface ServicesFiltersProps {
  onFilterChange: (filters: {
    search: string;
    filterGroup: string;
    status: string;
  }) => void;
}

const filterGroups = [
  { value: "", label: "All Filter Groups" },
  { value: "all", label: "All" },
  { value: "airtime", label: "Airtime" },
  { value: "data", label: "Data" },
  { value: "tv", label: "TV" },
  { value: "bills", label: "Bills" },
  { value: "more", label: "More" },
];

const statuses = [
  { value: "", label: "All Statuses" },
  { value: "available", label: "Available" },
  { value: "coming_soon", label: "Coming Soon" },
  { value: "inactive", label: "Inactive" },
];

export function ServicesFilters({ onFilterChange }: ServicesFiltersProps) {
  const [search, setSearch] = useState("");
  const [filterGroup, setFilterGroup] = useState("");
  const [status, setStatus] = useState("");

  const applyChange = (overrides: Partial<{ search: string; filterGroup: string; status: string }>) => {
    onFilterChange({
      search: overrides.search ?? search,
      filterGroup: overrides.filterGroup ?? filterGroup,
      status: overrides.status ?? status,
    });
  };

  const activeChips = [
    filterGroup && {
      label: `Group: ${filterGroups.find((g) => g.value === filterGroup)?.label}`,
      clear: () => {
        setFilterGroup("");
        applyChange({ filterGroup: "" });
      },
    },
    status && {
      label: `Status: ${statuses.find((s) => s.value === status)?.label}`,
      clear: () => {
        setStatus("");
        applyChange({ status: "" });
      },
    },
  ].filter(Boolean) as { label: string; clear: () => void }[];

  const handleReset = () => {
    setSearch("");
    setFilterGroup("");
    setStatus("");
    onFilterChange({ search: "", filterGroup: "", status: "" });
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
            placeholder="Search services..."
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
          value={filterGroup}
          onChange={(e) => {
            setFilterGroup(e.target.value);
            applyChange({ filterGroup: e.target.value });
          }}
        >
          {filterGroups.map((g) => (
            <option key={g.value} value={g.value}>
              {g.label}
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
          {statuses.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
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