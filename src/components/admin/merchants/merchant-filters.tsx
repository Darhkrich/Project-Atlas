/* eslint-disable @typescript-eslint/no-unused-vars */
// components/admin/merchants/merchant-filters.tsx
"use client";

import type { RefObject } from "react";
import { Input } from "@/components/admin/ui/input";
import { Button } from "@/components/admin/ui/button";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { subscriptionPlans } from "@/config/subscription-plans";
import {
  ALL_SORT_KEYS,
  MERCHANT_STATUS_LABEL,
  RENEWAL_WINDOW_OPTIONS,
  SORT_LABEL,
  STORE_STATUS_LABEL,
  SUBSCRIPTION_STATUS_LABEL,
  type RenewalWindow,
  type SortKey,
} from "@/lib/admin/merchants/constants";
import type {
  MerchantStatus,
  StoreStatus,
  SubscriptionStatus,
} from "@/lib/admin/types/merchant";

export interface MerchantFilterValues {
  q: string;
  merchantStatus: string;
  subscriptionStatus: string;
  storeStatus: string;
  plan: string;
  renewalWindow: string;
  sort: string;
  page: string;
  pageSize: string;
}

interface MerchantFiltersProps {
  value: MerchantFilterValues;
  hasActive: boolean;
  searchInputRef?: RefObject<HTMLInputElement | null>;
  onChange: (patch: Partial<MerchantFilterValues>) => void;
  onClear: () => void;
}

const MERCHANT_STATUS_OPTIONS: { value: "" | MerchantStatus; label: string }[] =
  [
    { value: "", label: "All merchant statuses" },
    { value: "active", label: MERCHANT_STATUS_LABEL.active },
    { value: "suspended", label: MERCHANT_STATUS_LABEL.suspended },
    { value: "pending", label: MERCHANT_STATUS_LABEL.pending },
  ];

const SUBSCRIPTION_OPTIONS: {
  value: "" | SubscriptionStatus;
  label: string;
}[] = [
  { value: "", label: "All subscriptions" },
  { value: "active", label: SUBSCRIPTION_STATUS_LABEL.active },
  { value: "past_due", label: SUBSCRIPTION_STATUS_LABEL.past_due },
  { value: "cancelled", label: SUBSCRIPTION_STATUS_LABEL.cancelled },
  { value: "expired", label: SUBSCRIPTION_STATUS_LABEL.expired },
];

const STORE_OPTIONS: { value: "" | StoreStatus; label: string }[] = [
  { value: "", label: "All stores" },
  { value: "live", label: STORE_STATUS_LABEL.live },
  { value: "disabled", label: STORE_STATUS_LABEL.disabled },
];

const selectClass =
  "h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100";

export function MerchantFilters({
  value,
  hasActive,
  searchInputRef,
  onChange,
  onClear,
}: MerchantFiltersProps) {
  const activeChips: { key: string; label: string; clear: () => void }[] = [];

  if (value.merchantStatus) {
    activeChips.push({
      key: "merchantStatus",
      label: `Status: ${
        MERCHANT_STATUS_LABEL[value.merchantStatus as MerchantStatus] ??
        value.merchantStatus
      }`,
      clear: () => onChange({ merchantStatus: "", page: "1" }),
    });
  }
  if (value.subscriptionStatus) {
    activeChips.push({
      key: "subscriptionStatus",
      label: `Subscription: ${
        SUBSCRIPTION_STATUS_LABEL[
          value.subscriptionStatus as SubscriptionStatus
        ] ?? value.subscriptionStatus
      }`,
      clear: () => onChange({ subscriptionStatus: "", page: "1" }),
    });
  }
  if (value.storeStatus) {
    activeChips.push({
      key: "storeStatus",
      label: `Store: ${
        STORE_STATUS_LABEL[value.storeStatus as StoreStatus] ??
        value.storeStatus
      }`,
      clear: () => onChange({ storeStatus: "", page: "1" }),
    });
  }
  if (value.plan) {
    activeChips.push({
      key: "plan",
      label: `Plan: ${
        subscriptionPlans.find((p) => p.code === value.plan)?.name ?? value.plan
      }`,
      clear: () => onChange({ plan: "", page: "1" }),
    });
  }
  if (value.renewalWindow) {
    activeChips.push({
      key: "renewalWindow",
      label: `Renewal: ${
        RENEWAL_WINDOW_OPTIONS.find((r) => r.value === value.renewalWindow)
          ?.label ?? value.renewalWindow
      }`,
      clear: () => onChange({ renewalWindow: "", page: "1" }),
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <AtlasIcon
            name="search"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
          />
          <Input
            ref={searchInputRef}
            aria-label="Search merchants"
            placeholder="Search business, contact, email, or store...  (press /)"
            className="pl-9"
            value={value.q}
            onChange={(e) => onChange({ q: e.target.value, page: "1" })}
          />
        </div>

        <select
          aria-label="Filter by merchant status"
          className={selectClass}
          value={value.merchantStatus}
          onChange={(e) =>
            onChange({ merchantStatus: e.target.value, page: "1" })
          }
        >
          {MERCHANT_STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by subscription status"
          className={selectClass}
          value={value.subscriptionStatus}
          onChange={(e) =>
            onChange({ subscriptionStatus: e.target.value, page: "1" })
          }
        >
          {SUBSCRIPTION_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by store status"
          className={selectClass}
          value={value.storeStatus}
          onChange={(e) =>
            onChange({ storeStatus: e.target.value, page: "1" })
          }
        >
          {STORE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by plan"
          className={selectClass}
          value={value.plan}
          onChange={(e) => onChange({ plan: e.target.value, page: "1" })}
        >
          <option value="">All plans</option>
          {subscriptionPlans.map((plan) => (
            <option key={plan.code} value={plan.code}>
              {plan.name}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by renewal window"
          className={selectClass}
          value={value.renewalWindow}
          onChange={(e) =>
            onChange({ renewalWindow: e.target.value, page: "1" })
          }
        >
          {RENEWAL_WINDOW_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          aria-label="Sort by"
          className={selectClass}
          value={value.sort}
          onChange={(e) => onChange({ sort: e.target.value, page: "1" })}
        >
          {ALL_SORT_KEYS.map((k) => (
            <option key={k} value={k}>
              Sort: {SORT_LABEL[k as SortKey]}
            </option>
          ))}
        </select>

        {hasActive && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            Clear filters
          </Button>
        )}
      </div>

      {activeChips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeChips.map((chip) => (
            <span
              key={chip.key}
              className={cn(
                "inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
              )}
            >
              {chip.label}
              <button
                type="button"
                aria-label={`Clear ${chip.key} filter`}
                onClick={chip.clear}
                className="ml-1 rounded-full px-1 text-brand-600 hover:text-danger-600 dark:text-brand-300 dark:hover:text-danger-400"
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