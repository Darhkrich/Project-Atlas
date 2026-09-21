/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AtlasCard } from "@/components/atlas/card";
import { Button } from "@/components/atlas/button";
import { AtlasBadge } from "@/components/atlas/badge";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { AtlasModalShell } from "@/components/atlas/modal-shell";
import { useCurrentReseller } from "@/lib/reseller/hooks/use-current-reseller";
import { useResellerOrders } from "@/lib/domains/orders/use-reseller-orders";
import type { ResellerOrderRow } from "@/lib/domains/orders/use-reseller-orders";
import { useNow } from "@/lib/shared/hooks/use-now";
import { formatCurrency, formatRelative, formatAbsolute } from "@/lib/shared/format";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_VARIANTS,
  ORDER_AUDIENCE_LABELS,
  ORDER_AUDIENCE_VARIANTS,
  serviceLabel,
  networkLabel,
  providerLabel,
} from "@/lib/admin/orders/orders-labels";
import type { OrderStatus } from "@/lib/admin/types/orders";

type OrderFilter = {
  id: "all" | OrderStatus;
  label: string;
};

const filters: OrderFilter[] = [
  { id: "all", label: "All Orders" },
  { id: "successful", label: "Successful" },
  { id: "processing", label: "Processing" },
  { id: "failed", label: "Failed" },
  { id: "cancelled", label: "Cancelled" },
];

function serviceIcon(serviceId: string): AtlasIconName {
  if (serviceId.includes("data")) return "globe";
  if (serviceId.includes("airtime")) return "phone";
  if (serviceId.includes("ecg")) return "zap";
  if (serviceId.includes("dstv") || serviceId.includes("gotv")) return "tv";
  return "grid";
}

function serviceIconBackground(serviceId: string): string {
  if (serviceId.includes("data")) return "bg-green-100 dark:bg-green-900/30";
  if (serviceId.includes("airtime")) return "bg-orange-100 dark:bg-orange-900/30";
  if (serviceId.includes("ecg")) return "bg-yellow-100 dark:bg-yellow-900/30";
  if (serviceId.includes("dstv") || serviceId.includes("gotv"))
    return "bg-blue-100 dark:bg-blue-900/30";
  return "bg-neutral-100 dark:bg-neutral-800";
}

export function ResellerOrdersList() {
  const reseller = useCurrentReseller();
  const orders = useResellerOrders(reseller?.id ?? "");
  const nowMs = useNow();

  const [activeFilter, setActiveFilter] = useState<OrderFilter["id"]>("all");
  const [activeServiceFilter, setActiveServiceFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<ResellerOrderRow | null>(null);

  const serviceFilters = useMemo(() => {
    const uniqueServiceIds = new Set(orders.map((o) => o.serviceId));
    return [
      { id: "all", label: "All Services" },
      ...Array.from(uniqueServiceIds).map((serviceId) => ({
        id: serviceId,
        label: serviceLabel(serviceId),
      })),
    ];
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesStatus =
        activeFilter === "all" || order.status === activeFilter;
      const matchesService =
        activeServiceFilter === "all" || order.serviceId === activeServiceFilter;
      if (!matchesStatus || !matchesService) return false;
      if (!normalizedQuery) return true;
      const haystack = [
        order.id,
        serviceLabel(order.serviceId),
        order.customerName,
        order.customerPhone,
        ORDER_STATUS_LABELS[order.status],
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [orders, activeFilter, activeServiceFilter, searchQuery]);

  const filterCounts = useMemo(() => {
    const counts: Record<string, number> = { all: orders.length };
    for (const f of filters) {
      if (f.id === "all") continue;
      counts[f.id] = orders.filter((o) => o.status === f.id).length;
    }
    return counts;
  }, [orders]);

  const clearFilters = () => {
    setActiveFilter("all");
    setActiveServiceFilter("all");
    setSearchQuery("");
  };

  const totalOrderCount = orders.length;
  const successfulCount = orders.filter((o) => o.status === "successful").length;
  const failedCount = orders.filter((o) => o.status === "failed").length;
  const processingCount = orders.filter(
    (o) => o.status === "pending" || o.status === "processing" || o.status === "retrying"
  ).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-brand-700 dark:text-brand-300">
            Reseller Business
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-950 dark:text-white sm:text-3xl">
            Orders
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
            Track customer purchases, monitor transaction status and review the
            commission earned from each order.
          </p>
        </div>
        <Link
          href="/reseller/services"
          className="inline-flex w-fit items-center justify-center gap-2 rounded-lg bg-brand-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-900"
        >
          <AtlasIcon name="grid" className="h-4 w-4" aria-hidden="true" />
          View Services
        </Link>
      </div>

      {/* Order Statistics */}
      <div
        role="region"
        aria-label="Order summary"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {[
          { label: "Total Orders", value: totalOrderCount, icon: "receipt" as AtlasIconName, cls: "bg-brand-100 text-brand-800 dark:bg-brand-900/30 dark:text-brand-300" },
          { label: "Successful", value: successfulCount, icon: "check" as AtlasIconName, cls: "bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-300" },
          { label: "Processing", value: processingCount, icon: "clock" as AtlasIconName, cls: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300" },
          { label: "Failed", value: failedCount, icon: "x-circle" as AtlasIconName, cls: "bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-300" },
        ].map((stat) => (
          <AtlasCard key={stat.label}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  {stat.label}
                </p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-neutral-950 dark:text-white">
                  {stat.value}
                </p>
              </div>
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${stat.cls}`}>
                <AtlasIcon name={stat.icon} className="h-5 w-5" aria-hidden="true" />
              </div>
            </div>
          </AtlasCard>
        ))}
      </div>

      {/* Search & Filters */}
      <AtlasCard>
        <div className="flex flex-col gap-4">
          <div className="relative">
            <AtlasIcon
              name="search"
              className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by order ID, service, or customer..."
              aria-label="Search orders"
              className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-10 pr-10 text-sm text-neutral-950 outline-none transition-colors placeholder:text-neutral-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div
              role="group"
              aria-label="Order status filters"
              className="flex flex-wrap items-center gap-2"
            >
              {filters.map((filter) => {
                const count = filterCounts[filter.id] ?? 0;
                const isActive = activeFilter === filter.id;
                return (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setActiveFilter(filter.id)}
                    aria-pressed={isActive}
                    className={
                      "inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors " +
                      (isActive
                        ? "bg-brand-800 text-white"
                        : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700")
                    }
                  >
                    <span>{filter.label}</span>
                    <span
                      className={
                        "rounded-full px-1.5 py-0.5 text-[11px] font-bold " +
                        (isActive
                          ? "bg-white/15 text-white"
                          : "bg-white text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300")
                      }
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <select
              value={activeServiceFilter}
              onChange={(e) => setActiveServiceFilter(e.target.value)}
              className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
              aria-label="Filter by service"
            >
              {serviceFilters.map((sf) => (
                <option key={sf.id} value={sf.id}>
                  {sf.label}
                </option>
              ))}
            </select>

            {(searchQuery ||
              activeFilter !== "all" ||
              activeServiceFilter !== "all") && (
              <button
                type="button"
                onClick={clearFilters}
                className="ml-auto text-sm font-medium text-brand-800 hover:underline dark:text-brand-300"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </AtlasCard>

      {/* Results Summary */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-neutral-950 dark:text-white">
            {filters.find((f) => f.id === activeFilter)?.label ?? "All Orders"}
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Showing {filteredOrders.length}{" "}
            {filteredOrders.length === 1 ? "order" : "orders"}
          </p>
        </div>
      </div>

      {/* Orders List */}
      <AtlasCard padding="none" className="overflow-hidden">
        {filteredOrders.length > 0 ? (
          <ul role="list" className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {filteredOrders.map((order) => (
              <li key={order.id}>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(order)}
                  className="group flex w-full flex-col gap-4 px-5 py-4 text-left transition-colors hover:bg-neutral-50 focus-visible:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500 sm:px-6 md:flex-row md:items-center md:justify-between dark:hover:bg-neutral-900 dark:focus-visible:bg-neutral-900"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${serviceIconBackground(order.serviceId)}`}
                    >
                      <AtlasIcon
                        name={serviceIcon(order.serviceId)}
                        className="h-5 w-5 text-neutral-700 dark:text-neutral-200"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-neutral-950 dark:text-white">
                        {serviceLabel(order.serviceId)}
                      </p>
                      <p className="mt-1 truncate text-xs text-neutral-500 dark:text-neutral-400">
                        {order.id}
                        <span className="mx-1.5">•</span>
                        {order.customerName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-6 md:justify-end">
                    <div className="text-left md:text-right">
                      <p className="text-sm font-semibold text-neutral-950 dark:text-white">
                        {formatCurrency(order.amount)}
                      </p>
                      <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                        {nowMs
                          ? formatRelative(order.createdAt, nowMs)
                          : formatAbsolute(order.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <AtlasBadge variant={ORDER_AUDIENCE_VARIANTS[order.audience]}>
                        {ORDER_AUDIENCE_LABELS[order.audience]}
                      </AtlasBadge>
                      <AtlasBadge variant={ORDER_STATUS_VARIANTS[order.status]}>
                        {ORDER_STATUS_LABELS[order.status]}
                      </AtlasBadge>
                      <AtlasIcon
                        name="arrow-right"
                        className="hidden h-4 w-4 text-neutral-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-600 sm:block dark:text-neutral-600 dark:group-hover:text-brand-400"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-6 py-14 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
              <AtlasIcon name="receipt" className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-neutral-950 dark:text-white">
              No orders found
            </h3>
            <p className="mx-auto mt-1 max-w-md text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
              Orders from your storefront will appear here.
            </p>
            {searchQuery && (
              <Button variant="outline" className="mt-5" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </div>
        )}
      </AtlasCard>

      {/* Order Details */}
      <AtlasModalShell
        open={selectedOrder !== null}
        onClose={() => setSelectedOrder(null)}
        title="Order Details"
        description={selectedOrder?.id}
        size="md"
      >
        {selectedOrder && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${serviceIconBackground(selectedOrder.serviceId)}`}
              >
                <AtlasIcon
                  name={serviceIcon(selectedOrder.serviceId)}
                  className="h-6 w-6 text-neutral-700 dark:text-neutral-200"
                  aria-hidden="true"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-neutral-950 dark:text-white">
                  {serviceLabel(selectedOrder.serviceId)}
                </p>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  {selectedOrder.id}
                </p>
              </div>
              <AtlasBadge variant={ORDER_STATUS_VARIANTS[selectedOrder.status]}>
                {ORDER_STATUS_LABELS[selectedOrder.status]}
              </AtlasBadge>
            </div>

            <div className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800">
              <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
                <DetailRow label="Order ID" value={selectedOrder.id} />
                <DetailRow label="Customer" value={selectedOrder.customerName} />
                <DetailRow label="Phone" value={selectedOrder.customerPhone} />
                <DetailRow
                  label="Service"
                  value={serviceLabel(selectedOrder.serviceId)}
                />
                {selectedOrder.networkId && (
                  <DetailRow
                    label="Network"
                    value={networkLabel(selectedOrder.networkId)}
                  />
                )}
                <DetailRow
                  label="Provider"
                  value={providerLabel(selectedOrder.providerId)}
                />
                <DetailRow
                  label="Audience"
                  value={ORDER_AUDIENCE_LABELS[selectedOrder.audience]}
                />
                <DetailRow
                  label="Amount"
                  value={formatCurrency(selectedOrder.amount)}
                  emphasis
                />
                <DetailRow
                  label="Date"
                  value={
                    nowMs
                      ? formatRelative(selectedOrder.createdAt, nowMs)
                      : formatAbsolute(selectedOrder.createdAt)
                  }
                />
              </div>
            </div>
          </div>
        )}
      </AtlasModalShell>
    </div>
  );
}

function DetailRow({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <span className="text-sm text-neutral-500 dark:text-neutral-400">
        {label}
      </span>
      <span
        className={
          emphasis
            ? "text-right text-sm font-semibold text-neutral-900 dark:text-neutral-100"
            : "text-right text-sm font-medium text-neutral-900 dark:text-neutral-100"
        }
      >
        {value}
      </span>
    </div>
  );
}