"use client";

import { useEffect, useId, useState } from "react";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { AtlasIcon } from "@/components/atlas/icons";
import { useDebouncedValue } from "@/lib/admin/hooks/use-debounced-value";
import type {
  RefundAudience,
  RefundLedgerFilters,
  RefundReason,
  RefundStatus,
  RefundType,
} from "@/lib/admin/types/refund";
import {
  REFUND_TYPE_LABELS,
  REFUND_AUDIENCE_LABELS,
  REFUND_STATUS_LABELS,
  REFUND_REASON_LABELS,
} from "@/lib/admin/refunds/refunds-labels";
import {
  REFUND_AUDIENCES,
  REFUND_STATUS_ORDER,
  REFUND_TYPES,
  SYSTEM_REASONS,
  CUSTOMER_REASONS,
} from "@/lib/admin/refunds/refunds-constants";

interface OrderRefundsFiltersProps {
  filters: RefundLedgerFilters;
  onChange: (next: RefundLedgerFilters) => void;
  onReset: () => void;
}

export function OrderRefundsFilters({
  filters,
  onChange,
  onReset,
}: OrderRefundsFiltersProps) {
  const searchId = useId();
  const typeId = useId();
  const audienceId = useId();
  const statusId = useId();
  const reasonId = useId();
  const fromId = useId();
  const toId = useId();

  const [searchInput, setSearchInput] = useState(filters.search ?? "");
  const debouncedSearch = useDebouncedValue(searchInput, 300);

  useEffect(() => {
    const current = filters.search ?? "";
    if (debouncedSearch !== current) {
      onChange({ ...filters, search: debouncedSearch || undefined });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const update = <K extends keyof RefundLedgerFilters>(
    key: K,
    value: RefundLedgerFilters[K]
  ) => {
    onChange({ ...filters, [key]: value });
  };

  const clearChip = (key: keyof RefundLedgerFilters) => {
    if (key === "search") setSearchInput("");
    const next = { ...filters };
    delete next[key];
    onChange(next);
  };

  const allReasons: RefundReason[] = [...SYSTEM_REASONS, ...CUSTOMER_REASONS];

  const activeChips: { key: keyof RefundLedgerFilters; label: string }[] = [];
  if (filters.search) {
    activeChips.push({ key: "search", label: "Search: " + filters.search });
  }
  if (filters.type) {
    activeChips.push({
      key: "type",
      label: "Type: " + REFUND_TYPE_LABELS[filters.type],
    });
  }
  if (filters.audience) {
    activeChips.push({
      key: "audience",
      label: "Audience: " + REFUND_AUDIENCE_LABELS[filters.audience],
    });
  }
  if (filters.status) {
    activeChips.push({
      key: "status",
      label: "Status: " + REFUND_STATUS_LABELS[filters.status],
    });
  }
  if (filters.reason) {
    activeChips.push({
      key: "reason",
      label: "Reason: " + REFUND_REASON_LABELS[filters.reason],
    });
  }
  if (filters.dateFrom) {
    activeChips.push({ key: "dateFrom", label: "From: " + filters.dateFrom });
  }
  if (filters.dateTo) {
    activeChips.push({ key: "dateTo", label: "To: " + filters.dateTo });
  }

  return (
    <div role="group" aria-label="Order refund filters" className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="relative min-w-[220px] flex-1">
          <label htmlFor={searchId} className="sr-only">
            Search refunds
          </label>
          <AtlasIcon
            name="search"
            aria-hidden="true"
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
          />
          <Input
            id={searchId}
            placeholder="Search by refund, order, customer, or reseller"
            className="pl-9"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor={typeId}
            className="text-[11px] font-medium uppercase tracking-wide text-neutral-500"
          >
            Type
          </label>
          <select
            id={typeId}
            aria-label="Filter by refund type"
            className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
            value={filters.type ?? ""}
            onChange={(e) =>
              update("type", (e.target.value || undefined) as RefundType | undefined)
            }
          >
            <option value="">All</option>
            {REFUND_TYPES.map((t) => (
              <option key={t} value={t}>
                {REFUND_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor={audienceId}
            className="text-[11px] font-medium uppercase tracking-wide text-neutral-500"
          >
            Audience
          </label>
          <select
            id={audienceId}
            aria-label="Filter by audience"
            className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
            value={filters.audience ?? ""}
            onChange={(e) =>
              update(
                "audience",
                (e.target.value || undefined) as RefundAudience | undefined
              )
            }
          >
            <option value="">All</option>
            {REFUND_AUDIENCES.map((a) => (
              <option key={a} value={a}>
                {REFUND_AUDIENCE_LABELS[a]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor={statusId}
            className="text-[11px] font-medium uppercase tracking-wide text-neutral-500"
          >
            Status
          </label>
          <select
            id={statusId}
            aria-label="Filter by status"
            className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
            value={filters.status ?? ""}
            onChange={(e) =>
              update(
                "status",
                (e.target.value || undefined) as RefundStatus | undefined
              )
            }
          >
            <option value="">All</option>
            {REFUND_STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {REFUND_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor={reasonId}
            className="text-[11px] font-medium uppercase tracking-wide text-neutral-500"
          >
            Reason
          </label>
          <select
            id={reasonId}
            aria-label="Filter by reason"
            className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
            value={filters.reason ?? ""}
            onChange={(e) =>
              update(
                "reason",
                (e.target.value || undefined) as RefundReason | undefined
              )
            }
          >
            <option value="">All</option>
            {allReasons.map((r) => (
              <option key={r} value={r}>
                {REFUND_REASON_LABELS[r]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor={fromId}
            className="text-[11px] font-medium uppercase tracking-wide text-neutral-500"
          >
            From
          </label>
          <Input
            id={fromId}
            type="date"
            value={filters.dateFrom ?? ""}
            onChange={(e) => update("dateFrom", e.target.value || undefined)}
            className="h-10 w-40"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor={toId}
            className="text-[11px] font-medium uppercase tracking-wide text-neutral-500"
          >
            To
          </label>
          <Input
            id={toId}
            type="date"
            value={filters.dateTo ?? ""}
            onChange={(e) => update("dateTo", e.target.value || undefined)}
            className="h-10 w-40"
          />
        </div>

        <Button variant="ghost" size="sm" onClick={onReset}>
          Reset
        </Button>
      </div>

      {activeChips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeChips.map((chip) => (
            <span
              key={chip.key}
              className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
            >
              {chip.label}
              <button
                type="button"
                aria-label={"Clear " + chip.label}
                onClick={() => clearChip(chip.key)}
                className="ml-1 rounded-full px-1 hover:text-danger-600"
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