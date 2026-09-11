"use client";

import { useState } from "react";
import { Input } from "@/components/admin/ui/input";
import { Button } from "@/components/admin/ui/button";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";

interface ResellerFiltersProps {
  onFilterChange: (filters: {
    search: string;
    status: string;
    verification: string;
    tier: string;
    dateJoinedFrom: string;
    dateJoinedTo: string;
  }) => void;
  availableTiers: string[];
}

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
  { value: "pending", label: "Pending" },
  { value: "rejected", label: "Rejected" },
];

const verificationOptions = [
  { value: "", label: "All Verification" },
  { value: "verified", label: "Verified" },
  { value: "pending", label: "Pending" },
  { value: "rejected", label: "Rejected" },
  { value: "not_submitted", label: "Not Submitted" },
];

export function ResellerFilters({
  onFilterChange,
  availableTiers,
}: ResellerFiltersProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [verification, setVerification] = useState("");
  const [tier, setTier] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const applyChange = (
    overrides: Partial<{
      search: string;
      status: string;
      verification: string;
      tier: string;
      dateJoinedFrom: string;
      dateJoinedTo: string;
    }>
  ) => {
    onFilterChange({
      search: overrides.search ?? search,
      status: overrides.status ?? status,
      verification: overrides.verification ?? verification,
      tier: overrides.tier ?? tier,
      dateJoinedFrom: overrides.dateJoinedFrom ?? dateFrom,
      dateJoinedTo: overrides.dateJoinedTo ?? dateTo,
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
    verification && {
      label: `Verification: ${
        verificationOptions.find((v) => v.value === verification)?.label
      }`,
      clear: () => {
        setVerification("");
        applyChange({ verification: "" });
      },
    },
    tier && {
      label: `Tier: ${tier}`,
      clear: () => {
        setTier("");
        applyChange({ tier: "" });
      },
    },
    dateFrom && {
      label: `From: ${dateFrom}`,
      clear: () => {
        setDateFrom("");
        applyChange({ dateJoinedFrom: "" });
      },
    },
    dateTo && {
      label: `To: ${dateTo}`,
      clear: () => {
        setDateTo("");
        applyChange({ dateJoinedTo: "" });
      },
    },
  ].filter(Boolean) as { label: string; clear: () => void }[];

  const handleReset = () => {
    setSearch("");
    setStatus("");
    setVerification("");
    setTier("");
    setDateFrom("");
    setDateTo("");
    onFilterChange({
      search: "",
      status: "",
      verification: "",
      tier: "",
      dateJoinedFrom: "",
      dateJoinedTo: "",
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
            placeholder="Search resellers..."
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
          value={verification}
          onChange={(e) => {
            setVerification(e.target.value);
            applyChange({ verification: e.target.value });
          }}
        >
          {verificationOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          value={tier}
          onChange={(e) => {
            setTier(e.target.value);
            applyChange({ tier: e.target.value });
          }}
        >
          <option value="">All Tiers</option>
          {availableTiers.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <label className="text-xs text-neutral-500">From</label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              applyChange({ dateJoinedFrom: e.target.value });
            }}
            className="h-10 w-36"
          />
          <label className="text-xs text-neutral-500">To</label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value);
              applyChange({ dateJoinedTo: e.target.value });
            }}
            className="h-10 w-36"
          />
        </div>

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