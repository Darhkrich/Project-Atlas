"use client";

import { useState } from "react";
import { Input } from "@/components/admin/ui/input";
import { Button } from "@/components/admin/ui/button";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";

interface ReportFiltersProps {
  onFilterChange: (filters: {
    search: string;
    status: string;
    reporterType: string;
  }) => void;
}

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "action_taken", label: "Action Taken" },
  { value: "dismissed", label: "Dismissed" },
];

const reporterTypeOptions = [
  { value: "", label: "All Reporters" },
  { value: "reseller", label: "Reported by Reseller" },
  { value: "merchant", label: "Reported by Merchant" },
];

export function ReportFilters({ onFilterChange }: ReportFiltersProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [reporterType, setReporterType] = useState("");

  const applyChange = (
    overrides: Partial<{
      search: string;
      status: string;
      reporterType: string;
    }>
  ) => {
    onFilterChange({
      search: overrides.search ?? search,
      status: overrides.status ?? status,
      reporterType: overrides.reporterType ?? reporterType,
    });
  };

  const activeChips = [
    status && {
      label: `Status: ${statusOptions.find((s) => s.value === status)?.label}`,
      clear: () => {
        setStatus("");
        applyChange({ status: "" });
      },
    },
    reporterType && {
      label: `Reporter: ${
        reporterTypeOptions.find((r) => r.value === reporterType)?.label
      }`,
      clear: () => {
        setReporterType("");
        applyChange({ reporterType: "" });
      },
    },
  ].filter(Boolean) as { label: string; clear: () => void }[];

  const handleReset = () => {
    setSearch("");
    setStatus("");
    setReporterType("");
    onFilterChange({ search: "", status: "", reporterType: "" });
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
            placeholder="Search by customer or reporter..."
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
          value={reporterType}
          onChange={(e) => {
            setReporterType(e.target.value);
            applyChange({ reporterType: e.target.value });
          }}
        >
          {reporterTypeOptions.map((opt) => (
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