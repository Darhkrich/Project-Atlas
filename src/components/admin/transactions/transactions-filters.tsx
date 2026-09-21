"use client";

import { useEffect, useId, useState } from "react";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { AtlasIcon } from "@/components/atlas/icons";
import { useDebouncedValue } from "@/lib/admin/hooks/use-debounced-value";
import type { TransactionLedgerFilters } from "@/lib/admin/types/transaction";
import {
  TRANSACTION_KIND_LABELS,
  TRANSACTION_STATUS_LABELS,
  TRANSACTION_AUDIENCE_LABELS,
} from "@/lib/admin/transactions/transactions-labels";
import {
  TRANSACTIONS_KIND_FILTER_ORDER,
  TRANSACTIONS_STATUS_FILTER_ORDER,
} from "@/lib/admin/transactions/transactions-constants";
import type {
  TransactionAudience,
  TransactionSourceKind,
  TransactionStatus,
} from "@/lib/admin/types/transaction";

interface TransactionsFiltersProps {
  filters: TransactionLedgerFilters;
  onChange: (next: TransactionLedgerFilters) => void;
  onReset: () => void;
}

const AUDIENCE_OPTIONS: TransactionAudience[] = [
  "direct",
  "storefront_user",
  "reseller",
];

const PAYMENT_METHOD_OPTIONS = [
  { id: "wallet", label: "Wallet" },
  { id: "card", label: "Card" },
  { id: "mobile_money", label: "Mobile money" },
  { id: "bank_transfer", label: "Bank transfer" },
  { id: "atlas_points", label: "Atlas points" },
] as const;

export function TransactionsFilters({
  filters,
  onChange,
  onReset,
}: TransactionsFiltersProps) {
  const searchId = useId();
  const kindId = useId();
  const audienceId = useId();
  const statusId = useId();
  const methodId = useId();
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

  const update = <K extends keyof TransactionLedgerFilters>(
    key: K,
    value: TransactionLedgerFilters[K]
  ) => {
    onChange({ ...filters, [key]: value });
  };

  const clearChip = (key: keyof TransactionLedgerFilters) => {
    if (key === "search") setSearchInput("");
    const next = { ...filters };
    delete next[key];
    onChange(next);
  };

  const activeChips: { key: keyof TransactionLedgerFilters; label: string }[] = [];
  if (filters.search) {
    activeChips.push({ key: "search", label: "Search: " + filters.search });
  }
  if (filters.kind) {
    activeChips.push({
      key: "kind",
      label: "Kind: " + TRANSACTION_KIND_LABELS[filters.kind],
    });
  }
  if (filters.audience) {
    activeChips.push({
      key: "audience",
      label: "Audience: " + TRANSACTION_AUDIENCE_LABELS[filters.audience],
    });
  }
  if (filters.status) {
    activeChips.push({
      key: "status",
      label: "Status: " + TRANSACTION_STATUS_LABELS[filters.status],
    });
  }
  if (filters.paymentMethodId) {
    const method = PAYMENT_METHOD_OPTIONS.find(
      (m) => m.id === filters.paymentMethodId
    );
    activeChips.push({
      key: "paymentMethodId",
      label: "Method: " + (method?.label ?? filters.paymentMethodId),
    });
  }
  if (filters.dateFrom) {
    activeChips.push({ key: "dateFrom", label: "From: " + filters.dateFrom });
  }
  if (filters.dateTo) {
    activeChips.push({ key: "dateTo", label: "To: " + filters.dateTo });
  }

  return (
    <div role="group" aria-label="Transaction filters" className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="relative min-w-[240px] flex-1">
          <label htmlFor={searchId} className="sr-only">
            Search transactions
          </label>
          <AtlasIcon
            name="search"
            aria-hidden="true"
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
          />
          <Input
            id={searchId}
            placeholder="Search by ID, owner, wallet, or order"
            className="pl-9"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
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
            aria-label="Filter by transaction kind"
            className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
            value={filters.kind ?? ""}
            onChange={(e) =>
              update(
                "kind",
                (e.target.value || undefined) as TransactionSourceKind | undefined
              )
            }
          >
            <option value="">All</option>
            {TRANSACTIONS_KIND_FILTER_ORDER.map((k) => (
              <option key={k} value={k}>
                {TRANSACTION_KIND_LABELS[k]}
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
                (e.target.value || undefined) as TransactionAudience | undefined
              )
            }
          >
            <option value="">All</option>
            {AUDIENCE_OPTIONS.map((a) => (
              <option key={a} value={a}>
                {TRANSACTION_AUDIENCE_LABELS[a]}
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
                (e.target.value || undefined) as TransactionStatus | undefined
              )
            }
          >
            <option value="">All</option>
            {TRANSACTIONS_STATUS_FILTER_ORDER.map((s) => (
              <option key={s} value={s}>
                {TRANSACTION_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor={methodId}
            className="text-[11px] font-medium uppercase tracking-wide text-neutral-500"
          >
            Method
          </label>
          <select
            id={methodId}
            aria-label="Filter by payment method"
            className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
            value={filters.paymentMethodId ?? ""}
            onChange={(e) =>
              update(
                "paymentMethodId",
                (e.target.value || undefined) as
                  | TransactionLedgerFilters["paymentMethodId"]
                  | undefined
              )
            }
          >
            <option value="">All</option>
            {PAYMENT_METHOD_OPTIONS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
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