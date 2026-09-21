"use client";

import { Input } from "@/components/admin/ui/input";
import { Button } from "@/components/admin/ui/button";
import type { PaymentsFilters as PaymentFilterShape } from "@/lib/admin/payments/payments-constants";
import {
  PAYMENTS_SORT_LABELS,
  type PaymentsSortKey,
} from "@/lib/admin/payments/payments-constants";
import {
  PAYMENT_METHOD_LABEL,
  PAYMENT_SOURCE_LABEL,
  PAYMENT_STATUS_LABEL,
} from "@/lib/admin/payments/payments-labels";

interface Props {
  value: PaymentFilterShape;
  hasActive: boolean;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  onChange: (patch: Partial<PaymentFilterShape>) => void;
  onClear: () => void;
}

export function PaymentsFilters({
  value,
  hasActive,
  searchInputRef,
  onChange,
  onClear,
}: Props) {
  return (
    <div
      role="region"
      aria-label="Payment filters"
      className="flex flex-wrap items-end gap-2"
    >
      <div className="min-w-56 flex-1">
        <label
          htmlFor="payments-ledger-search"
          className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400"
        >
          Search
        </label>
        <Input
          id="payments-ledger-search"
          ref={searchInputRef}
          aria-label="Search payments"
          placeholder="Payment ID, reference, user"
          value={value.q}
          onChange={(e) => onChange({ q: e.target.value, page: "1" })}
        />
      </div>

      <div>
        <label
          htmlFor="payments-ledger-source"
          className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400"
        >
          Source
        </label>
        <select
          id="payments-ledger-source"
          aria-label="Filter by source"
          value={value.source}
          onChange={(e) =>
            onChange({
              source: e.target.value as PaymentFilterShape["source"],
              page: "1",
            })
          }
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
        >
          <option value="">All sources</option>
          <option value="direct">{PAYMENT_SOURCE_LABEL.direct}</option>
          <option value="reseller">{PAYMENT_SOURCE_LABEL.reseller}</option>
          <option value="ecommerce">{PAYMENT_SOURCE_LABEL.ecommerce}</option>
          <option value="admin">{PAYMENT_SOURCE_LABEL.admin}</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="payments-ledger-method"
          className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400"
        >
          Method
        </label>
        <select
          id="payments-ledger-method"
          aria-label="Filter by method"
          value={value.method}
          onChange={(e) =>
            onChange({
              method: e.target.value as PaymentFilterShape["method"],
              page: "1",
            })
          }
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
        >
          <option value="">All methods</option>
          <option value="wallet">{PAYMENT_METHOD_LABEL.wallet}</option>
          <option value="momo">{PAYMENT_METHOD_LABEL.momo}</option>
          <option value="card">{PAYMENT_METHOD_LABEL.card}</option>
          <option value="bank">{PAYMENT_METHOD_LABEL.bank}</option>
          <option value="ussd">{PAYMENT_METHOD_LABEL.ussd}</option>
          <option value="atlas_points">
            {PAYMENT_METHOD_LABEL.atlas_points}
          </option>
        </select>
      </div>

      <div>
        <label
          htmlFor="payments-ledger-status"
          className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400"
        >
          Status
        </label>
        <select
          id="payments-ledger-status"
          aria-label="Filter by status"
          value={value.status}
          onChange={(e) =>
            onChange({
              status: e.target.value as PaymentFilterShape["status"],
              page: "1",
            })
          }
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
        >
          <option value="">All statuses</option>
          <option value="pending">{PAYMENT_STATUS_LABEL.pending}</option>
          <option value="processing">
            {PAYMENT_STATUS_LABEL.processing}
          </option>
          <option value="successful">
            {PAYMENT_STATUS_LABEL.successful}
          </option>
          <option value="failed">{PAYMENT_STATUS_LABEL.failed}</option>
          <option value="refunded">{PAYMENT_STATUS_LABEL.refunded}</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="payments-ledger-sort"
          className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400"
        >
          Sort
        </label>
        <select
          id="payments-ledger-sort"
          aria-label="Sort payments"
          value={value.sort}
          onChange={(e) =>
            onChange({ sort: e.target.value as PaymentsSortKey, page: "1" })
          }
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
        >
          {(Object.keys(PAYMENTS_SORT_LABELS) as PaymentsSortKey[]).map((k) => (
            <option key={k} value={k}>
              {PAYMENTS_SORT_LABELS[k]}
            </option>
          ))}
        </select>
      </div>

      {hasActive && (
        <Button variant="ghost" size="sm" onClick={onClear}>
          Clear filters
        </Button>
      )}
    </div>
  );
}