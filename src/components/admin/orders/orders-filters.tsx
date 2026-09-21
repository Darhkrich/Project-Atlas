"use client";

import { useEffect, useId, useState } from "react";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { AtlasIcon } from "@/components/atlas/icons";
import { useDebouncedValue } from "@/lib/admin/hooks/use-debounced-value";
import type { OrderFilters as OrderFiltersShape } from "@/lib/admin/orders/orders-projection";
import {
  ORDER_SERVICE_LABELS,
  ORDER_NETWORK_LABELS,
  ORDER_STATUS_LABELS,
  ORDER_AUDIENCE_LABELS,
} from "@/lib/admin/orders/orders-labels";
import type { OrderStatus, OrderAudience } from "@/lib/admin/types/orders";

interface OrdersFiltersProps {
  filters: OrderFiltersShape;
  onChange: (next: OrderFiltersShape) => void;
  onReset: () => void;
}

const HISTORY_STATUS_OPTIONS: OrderStatus[] = [
  "successful",
  "failed",
  "cancelled",
];

const AUDIENCE_OPTIONS: OrderAudience[] = [
  "direct",
  "storefront_user",
  "reseller",
];

export function OrdersFilters({ filters, onChange, onReset }: OrdersFiltersProps) {
  const searchId = useId();
  const statusId = useId();
  const audienceId = useId();
  const serviceId = useId();
  const networkId = useId();
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

  const update = <K extends keyof OrderFiltersShape>(
    key: K,
    value: OrderFiltersShape[K]
  ) => {
    onChange({ ...filters, [key]: value });
  };

  const clearChip = (key: keyof OrderFiltersShape) => {
    if (key === "search") setSearchInput("");
    const next = { ...filters };
    delete next[key];
    onChange(next);
  };

  const activeChips: { key: keyof OrderFiltersShape; label: string }[] = [];
  if (filters.search) activeChips.push({ key: "search", label: "Search: " + filters.search });
  if (filters.status) activeChips.push({ key: "status", label: "Status: " + ORDER_STATUS_LABELS[filters.status] });
  if (filters.audience) activeChips.push({ key: "audience", label: "Audience: " + ORDER_AUDIENCE_LABELS[filters.audience] });
  if (filters.serviceId) activeChips.push({ key: "serviceId", label: "Service: " + (ORDER_SERVICE_LABELS[filters.serviceId] ?? filters.serviceId) });
  if (filters.networkId) activeChips.push({ key: "networkId", label: "Network: " + (ORDER_NETWORK_LABELS[filters.networkId] ?? filters.networkId) });
  if (filters.dateFrom) activeChips.push({ key: "dateFrom", label: "From: " + filters.dateFrom });
  if (filters.dateTo) activeChips.push({ key: "dateTo", label: "To: " + filters.dateTo });

  return (
    <div role="group" aria-label="Order filters" className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="relative min-w-[220px] flex-1">
          <label htmlFor={searchId} className="sr-only">
            Search orders
          </label>
          <AtlasIcon
            name="search"
            aria-hidden="true"
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
          />
          <Input
            id={searchId}
            placeholder="Search by ID, customer, phone, reseller"
            className="pl-9"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor={audienceId} className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">
            Audience
          </label>
          <select
            id={audienceId}
            aria-label="Filter by audience"
            className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
            value={filters.audience ?? ""}
            onChange={(e) =>
              update("audience", (e.target.value || undefined) as OrderAudience | undefined)
            }
          >
            <option value="">All</option>
            {AUDIENCE_OPTIONS.map((a) => (
              <option key={a} value={a}>
                {ORDER_AUDIENCE_LABELS[a]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor={statusId} className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">
            Status
          </label>
          <select
            id={statusId}
            aria-label="Filter by status"
            className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
            value={filters.status ?? ""}
            onChange={(e) =>
              update("status", (e.target.value || undefined) as OrderStatus | undefined)
            }
          >
            <option value="">All</option>
            {HISTORY_STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {ORDER_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor={serviceId} className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">
            Service
          </label>
          <select
            id={serviceId}
            aria-label="Filter by service"
            className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
            value={filters.serviceId ?? ""}
            onChange={(e) => update("serviceId", e.target.value || undefined)}
          >
            <option value="">All</option>
            {Object.entries(ORDER_SERVICE_LABELS).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor={networkId} className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">
            Network
          </label>
          <select
            id={networkId}
            aria-label="Filter by network"
            className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
            value={filters.networkId ?? ""}
            onChange={(e) => update("networkId", e.target.value || undefined)}
          >
            <option value="">All</option>
            {Object.entries(ORDER_NETWORK_LABELS).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor={fromId} className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">
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
          <label htmlFor={toId} className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">
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