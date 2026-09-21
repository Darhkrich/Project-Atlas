"use client";

import { useEffect, useId, useState } from "react";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { AtlasIcon } from "@/components/atlas/icons";
import { useDebouncedValue } from "@/lib/admin/hooks/use-debounced-value";
import type {
  TreasuryApprovalStatus,
  TreasuryDirection,
  TreasuryEventFilters,
  TreasuryEventKind,
  TreasuryReconciliationStatus,
} from "@/lib/admin/types/treasury";
import {
  TREASURY_KIND_LABELS,
  TREASURY_DIRECTION_LABELS,
  TREASURY_APPROVAL_LABELS,
  TREASURY_RECONCILIATION_LABELS,
} from "@/lib/admin/treasury/treasury-labels";
import {
  TREASURY_KIND_ORDER,
  TREASURY_DIRECTION_ORDER,
  TREASURY_APPROVAL_ORDER,
  TREASURY_RECONCILIATION_ORDER,
} from "@/lib/admin/treasury/treasury-constants";

interface TreasuryFiltersProps {
  filters: TreasuryEventFilters;
  onChange: (next: TreasuryEventFilters) => void;
  onReset: () => void;
}

export function TreasuryFilters({
  filters,
  onChange,
  onReset,
}: TreasuryFiltersProps) {
  const searchId = useId();
  const directionId = useId();
  const kindId = useId();
  const approvalId = useId();
  const reconciliationId = useId();
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

  const update = <K extends keyof TreasuryEventFilters>(
    key: K,
    value: TreasuryEventFilters[K]
  ) => {
    onChange({ ...filters, [key]: value });
  };

  const clearChip = (key: keyof TreasuryEventFilters) => {
    if (key === "search") setSearchInput("");
    const next = { ...filters };
    delete next[key];
    onChange(next);
  };

  const activeChips: { key: keyof TreasuryEventFilters; label: string }[] = [];
  if (filters.search) {
    activeChips.push({ key: "search", label: "Search: " + filters.search });
  }
  if (filters.direction) {
    activeChips.push({
      key: "direction",
      label: "Direction: " + TREASURY_DIRECTION_LABELS[filters.direction],
    });
  }
  if (filters.kind) {
    activeChips.push({
      key: "kind",
      label: "Kind: " + TREASURY_KIND_LABELS[filters.kind],
    });
  }
  if (filters.approvalStatus) {
    activeChips.push({
      key: "approvalStatus",
      label: "Approval: " + TREASURY_APPROVAL_LABELS[filters.approvalStatus],
    });
  }
  if (filters.reconciliationStatus) {
    activeChips.push({
      key: "reconciliationStatus",
      label:
        "Reconciliation: " +
        TREASURY_RECONCILIATION_LABELS[filters.reconciliationStatus],
    });
  }
  if (filters.dateFrom) {
    activeChips.push({ key: "dateFrom", label: "From: " + filters.dateFrom });
  }
  if (filters.dateTo) {
    activeChips.push({ key: "dateTo", label: "To: " + filters.dateTo });
  }

  return (
    <div role="group" aria-label="Treasury filters" className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="relative min-w-[240px] flex-1">
          <label htmlFor={searchId} className="sr-only">
            Search treasury events
          </label>
          <AtlasIcon
            name="search"
            aria-hidden="true"
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
          />
          <Input
            id={searchId}
            placeholder="Search by reference, counterparty, or description"
            className="pl-9"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor={directionId}
            className="text-[11px] font-medium uppercase tracking-wide text-neutral-500"
          >
            Direction
          </label>
          <select
            id={directionId}
            aria-label="Filter by direction"
            className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
            value={filters.direction ?? ""}
            onChange={(e) =>
              update(
                "direction",
                (e.target.value || undefined) as TreasuryDirection | undefined
              )
            }
          >
            <option value="">All</option>
            {TREASURY_DIRECTION_ORDER.map((d) => (
              <option key={d} value={d}>
                {TREASURY_DIRECTION_LABELS[d]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor={kindId}
            className="text-[11px] font-medium uppercase tracking-wide text-neutral-500"
          >
            Kind
          </label>
          <select
            id={kindId}
            aria-label="Filter by event kind"
            className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
            value={filters.kind ?? ""}
            onChange={(e) =>
              update(
                "kind",
                (e.target.value || undefined) as TreasuryEventKind | undefined
              )
            }
          >
            <option value="">All</option>
            {TREASURY_KIND_ORDER.map((k) => (
              <option key={k} value={k}>
                {TREASURY_KIND_LABELS[k]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor={approvalId}
            className="text-[11px] font-medium uppercase tracking-wide text-neutral-500"
          >
            Approval
          </label>
          <select
            id={approvalId}
            aria-label="Filter by approval status"
            className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
            value={filters.approvalStatus ?? ""}
            onChange={(e) =>
              update(
                "approvalStatus",
                (e.target.value || undefined) as
                  | TreasuryApprovalStatus
                  | undefined
              )
            }
          >
            <option value="">All</option>
            {TREASURY_APPROVAL_ORDER.map((s) => (
              <option key={s} value={s}>
                {TREASURY_APPROVAL_LABELS[s]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor={reconciliationId}
            className="text-[11px] font-medium uppercase tracking-wide text-neutral-500"
          >
            Reconciliation
          </label>
          <select
            id={reconciliationId}
            aria-label="Filter by reconciliation status"
            className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
            value={filters.reconciliationStatus ?? ""}
            onChange={(e) =>
              update(
                "reconciliationStatus",
                (e.target.value || undefined) as
                  | TreasuryReconciliationStatus
                  | undefined
              )
            }
          >
            <option value="">All</option>
            {TREASURY_RECONCILIATION_ORDER.map((s) => (
              <option key={s} value={s}>
                {TREASURY_RECONCILIATION_LABELS[s]}
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