"use client";

import { Input } from "@/components/admin/ui/input";
import { Button } from "@/components/admin/ui/button";
import {
  DATE_PRESET_LABELS,
  type DatePreset,
  type LedgerSortKey,
} from "@/lib/admin/ecommerce/payments/payments-constants";
import type { MerchantMoneyEvent } from "@/lib/admin/types/merchant-money";

export interface PaymentsFilterValues {
  tab: "ledger" | "withdrawals";
  q: string;
  flow: "" | MerchantMoneyEvent["kind"];
  status: string;
  preset: DatePreset;
  sort: LedgerSortKey;
  page: string;
  pageSize: string;
}

interface Props {
  value: PaymentsFilterValues;
  hasActive: boolean;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  onChange: (patch: Partial<PaymentsFilterValues>) => void;
  onClear: () => void;
}

export function PaymentsFilters({
  value,
  hasActive,
  searchInputRef,
  onChange,
  onClear,
}: Props) {
  const isWithdrawals = value.tab === "withdrawals";

  return (
    <div
      role="region"
      aria-label="Payment filters"
      className="flex flex-wrap items-end gap-2"
    >
      <div className="min-w-56 flex-1">
        <label
          htmlFor="payments-search"
          className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400"
        >
          Search
        </label>
        <Input
          id="payments-search"
          ref={searchInputRef}
          aria-label="Search payments"
          placeholder="Merchant, event ID, reference"
          value={value.q}
          onChange={(e) => onChange({ q: e.target.value, page: "1" })}
        />
      </div>

      {!isWithdrawals && (
        <div>
          <label
            htmlFor="payments-flow"
            className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400"
          >
            Flow
          </label>
          <select
            id="payments-flow"
            aria-label="Filter by flow"
            value={value.flow}
            onChange={(e) =>
              onChange({
                flow: e.target.value as PaymentsFilterValues["flow"],
                page: "1",
              })
            }
            className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          >
            <option value="">All flows</option>
            <option value="plan_charge">Plan billing</option>
            <option value="checkout">Storefront sale</option>
            <option value="withdrawal">Withdrawal</option>
            <option value="refund">Refund</option>
          </select>
        </div>
      )}

      <div>
        <label
          htmlFor="payments-preset"
          className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400"
        >
          Period
        </label>
        <select
          id="payments-preset"
          aria-label="Filter by period"
          value={value.preset}
          onChange={(e) =>
            onChange({ preset: e.target.value as DatePreset, page: "1" })
          }
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
        >
          {(Object.keys(DATE_PRESET_LABELS) as DatePreset[]).map((k) => (
            <option key={k} value={k}>
              {DATE_PRESET_LABELS[k]}
            </option>
          ))}
        </select>
      </div>

      {!isWithdrawals && (
        <div>
          <label
            htmlFor="payments-sort"
            className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400"
          >
            Sort
          </label>
          <select
            id="payments-sort"
            aria-label="Sort ledger"
            value={value.sort}
            onChange={(e) =>
              onChange({ sort: e.target.value as LedgerSortKey, page: "1" })
            }
            className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="largest">Largest amount</option>
          </select>
        </div>
      )}

      {hasActive && (
        <Button variant="ghost" size="sm" onClick={onClear}>
          Clear filters
        </Button>
      )}
    </div>
  );
}