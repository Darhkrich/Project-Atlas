"use client";

import { useState } from "react";
import { Input } from "@/components/admin/ui/input";
import { Button } from "@/components/admin/ui/button";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";

interface MerchantFiltersProps {
  onFilterChange: (filters: {
    search: string;
    merchantStatus: string;
    subscriptionStatus: string;
    storeStatus: string;
    plan: string;
  }) => void;
}

const merchantStatusOptions = [
  { value: "", label: "All Merchant Statuses" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
  { value: "pending", label: "Pending" },
];

const subscriptionStatusOptions = [
  { value: "", label: "All Subscriptions" },
  { value: "active", label: "Active" },
  { value: "past_due", label: "Past Due" },
  { value: "cancelled", label: "Cancelled" },
  { value: "expired", label: "Expired" },
];

const storeStatusOptions = [
  { value: "", label: "All Stores" },
  { value: "live", label: "Live" },
  { value: "disabled", label: "Disabled" },
];

const planOptions = [
  { value: "", label: "All Plans" },
  { value: "starter", label: "Starter" },
  { value: "growth", label: "Growth" },
  { value: "pro", label: "Pro" },
  { value: "premium", label: "Premium" },
];

export function MerchantFilters({ onFilterChange }: MerchantFiltersProps) {
  const [search, setSearch] = useState("");
  const [merchantStatus, setMerchantStatus] = useState("");
  const [subscriptionStatus, setSubscriptionStatus] = useState("");
  const [storeStatus, setStoreStatus] = useState("");
  const [plan, setPlan] = useState("");

  const applyChange = (
    overrides: Partial<{
      search: string;
      merchantStatus: string;
      subscriptionStatus: string;
      storeStatus: string;
      plan: string;
    }>
  ) => {
    onFilterChange({
      search: overrides.search ?? search,
      merchantStatus: overrides.merchantStatus ?? merchantStatus,
      subscriptionStatus: overrides.subscriptionStatus ?? subscriptionStatus,
      storeStatus: overrides.storeStatus ?? storeStatus,
      plan: overrides.plan ?? plan,
    });
  };

  const activeChips = [
    merchantStatus && {
      label: `Status: ${
        merchantStatusOptions.find((s) => s.value === merchantStatus)?.label
      }`,
      clear: () => {
        setMerchantStatus("");
        applyChange({ merchantStatus: "" });
      },
    },
    subscriptionStatus && {
      label: `Subscription: ${
        subscriptionStatusOptions.find(
          (s) => s.value === subscriptionStatus
        )?.label
      }`,
      clear: () => {
        setSubscriptionStatus("");
        applyChange({ subscriptionStatus: "" });
      },
    },
    storeStatus && {
      label: `Store: ${
        storeStatusOptions.find((s) => s.value === storeStatus)?.label
      }`,
      clear: () => {
        setStoreStatus("");
        applyChange({ storeStatus: "" });
      },
    },
    plan && {
      label: `Plan: ${planOptions.find((p) => p.value === plan)?.label}`,
      clear: () => {
        setPlan("");
        applyChange({ plan: "" });
      },
    },
  ].filter(Boolean) as { label: string; clear: () => void }[];

  const handleReset = () => {
    setSearch("");
    setMerchantStatus("");
    setSubscriptionStatus("");
    setStoreStatus("");
    setPlan("");
    onFilterChange({
      search: "",
      merchantStatus: "",
      subscriptionStatus: "",
      storeStatus: "",
      plan: "",
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
            placeholder="Search merchants..."
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
          value={merchantStatus}
          onChange={(e) => {
            setMerchantStatus(e.target.value);
            applyChange({ merchantStatus: e.target.value });
          }}
        >
          {merchantStatusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          value={subscriptionStatus}
          onChange={(e) => {
            setSubscriptionStatus(e.target.value);
            applyChange({ subscriptionStatus: e.target.value });
          }}
        >
          {subscriptionStatusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          value={storeStatus}
          onChange={(e) => {
            setStoreStatus(e.target.value);
            applyChange({ storeStatus: e.target.value });
          }}
        >
          {storeStatusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          value={plan}
          onChange={(e) => {
            setPlan(e.target.value);
            applyChange({ plan: e.target.value });
          }}
        >
          {planOptions.map((opt) => (
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