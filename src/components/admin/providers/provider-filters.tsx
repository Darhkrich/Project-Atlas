"use client";

import { useState } from "react";
import { Input } from "@/components/admin/ui/input";
import { AtlasIcon } from "@/components/atlas/icons";
import { Button } from "@/components/admin/ui/button";
import { cn } from "@/lib/utils";

interface ProviderFiltersProps {
  onFilterChange: (filters: {
    search: string;
    status: string;
    service: string;
    type: string;
  }) => void;
}

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "degraded", label: "Degraded" },
  { value: "offline", label: "Offline" },
  { value: "disabled", label: "Disabled" },
  { value: "maintenance", label: "Maintenance" },
];

const serviceOptions = [
  { value: "", label: "All Services" },
  { value: "airtime", label: "Airtime" },
  { value: "data", label: "Data" },
  { value: "bills", label: "Bills" },
  { value: "tv", label: "TV" },
  { value: "results", label: "Results" },
  { value: "mobile_money", label: "Mobile Money" },
  { value: "card_payment", label: "Card Payment" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "ussd", label: "USSD" },
];

const typeOptions = [
  { value: "", label: "All Types" },
  { value: "api", label: "API" },
  { value: "aggregator", label: "Aggregator" },
  { value: "direct", label: "Direct" },
  { value: "payment", label: "Payment" },
  { value: "manual", label: "Manual" },
];

export function ProviderFilters({ onFilterChange }: ProviderFiltersProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [service, setService] = useState("");
  const [type, setType] = useState("");

  const applyChange = (
    overrides: Partial<{
      search: string;
      status: string;
      service: string;
      type: string;
    }>
  ) => {
    onFilterChange({
      search: overrides.search ?? search,
      status: overrides.status ?? status,
      service: overrides.service ?? service,
      type: overrides.type ?? type,
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
    service && {
      label: `Service: ${serviceOptions.find((s) => s.value === service)?.label}`,
      clear: () => {
        setService("");
        applyChange({ service: "" });
      },
    },
    type && {
      label: `Type: ${typeOptions.find((s) => s.value === type)?.label}`,
      clear: () => {
        setType("");
        applyChange({ type: "" });
      },
    },
  ].filter(Boolean) as { label: string; clear: () => void }[];

  const handleReset = () => {
    setSearch("");
    setStatus("");
    setService("");
    setType("");
    onFilterChange({ search: "", status: "", service: "", type: "" });
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
            placeholder="Search providers..."
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
          value={service}
          onChange={(e) => {
            setService(e.target.value);
            applyChange({ service: e.target.value });
          }}
        >
          {serviceOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

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
                className={cn("ml-1 hover:text-danger-600")}
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