/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AtlasCard } from "@/components/atlas/card";
import { Button } from "@/components/atlas/button";
import { AtlasSkeleton } from "@/components/atlas/skeleton";
import { AtlasErrorState } from "@/components/atlas/error-state";
import { AtlasEmptyState } from "@/components/atlas/empty-state";
import { AtlasBadge } from "@/components/atlas/badge";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import {
  mockResellerOrders,
  type ResellerOrder,
} from "@/lib/mock-data";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type OrderFilter = {
  id: "all" | "successful" | "pending" | "failed";
  label: string;
  status?: ResellerOrder["status"];
};

type ServiceFilter = {
  id: string;
  label: string;
};

type OrderStat = {
  label: string;
  value: number;
  icon: AtlasIconName;
  iconClassName: string;
};

type ResellerOrdersListProps = {
  initialOrders?: ResellerOrder[];
};

/* -------------------------------------------------------------------------- */
/* Configuration                                                              */
/* -------------------------------------------------------------------------- */

const filters: OrderFilter[] = [
  {
    id: "all",
    label: "All Orders",
  },
  {
    id: "successful",
    label: "Successful",
    status: "Successful",
  },
  {
    id: "pending",
    label: "Pending",
    status: "Pending",
  },
  {
    id: "failed",
    label: "Failed",
    status: "Failed",
  },
];

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function getServiceIcon(service: string): AtlasIconName {
  const normalized = service.toLowerCase();

  if (normalized.includes("data")) {
    return "globe";
  }

  if (normalized.includes("airtime")) {
    return "phone";
  }

  if (
    normalized.includes("ecg") ||
    normalized.includes("electricity")
  ) {
    return "zap";
  }

  if (
    normalized.includes("dstv") ||
    normalized.includes("gotv") ||
    normalized.includes("tv")
  ) {
    return "tv";
  }

  return "grid";
}

function getServiceIconBackground(service: string): string {
  const normalized = service.toLowerCase();

  if (normalized.includes("data")) {
    return "bg-green-100 dark:bg-green-900/30";
  }

  if (normalized.includes("airtime")) {
    return "bg-orange-100 dark:bg-orange-900/30";
  }

  if (
    normalized.includes("ecg") ||
    normalized.includes("electricity")
  ) {
    return "bg-yellow-100 dark:bg-yellow-900/30";
  }

  if (
    normalized.includes("dstv") ||
    normalized.includes("gotv") ||
    normalized.includes("tv")
  ) {
    return "bg-blue-100 dark:bg-blue-900/30";
  }

  return "bg-neutral-100 dark:bg-neutral-800";
}

function getServiceCategory(service: string): string {
  const normalized = service.toLowerCase();

  if (normalized.includes("data")) return "Data";
  if (normalized.includes("airtime")) return "Airtime";
  if (
    normalized.includes("ecg") ||
    normalized.includes("electricity")
  ) {
    return "Electricity";
  }
  if (
    normalized.includes("dstv") ||
    normalized.includes("gotv") ||
    normalized.includes("tv")
  ) {
    return "Cable TV";
  }
  return "Other";
}

function normalizeSearchValue(value: string) {
  return value.trim().toLowerCase();
}

function getFilterLabel(activeFilter: string) {
  return (
    filters.find((filter) => filter.id === activeFilter)?.label ??
    "All Orders"
  );
}

/* -------------------------------------------------------------------------- */
/* Loading State                                                              */
/* -------------------------------------------------------------------------- */

function ResellerOrdersSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <AtlasSkeleton className="h-7 w-48" />
        <AtlasSkeleton className="h-4 w-80" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <AtlasSkeleton key={index} className="h-28 w-full" />
        ))}
      </div>

      <AtlasSkeleton className="h-16 w-full" />

      <AtlasCard padding="none">
        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-4 px-5 py-5 sm:px-6"
            >
              <AtlasSkeleton className="h-11 w-11 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1 space-y-2">
                <AtlasSkeleton className="h-4 w-40" />
                <AtlasSkeleton className="h-3 w-56" />
              </div>
              <AtlasSkeleton className="hidden h-8 w-20 sm:block" />
              <div className="space-y-2">
                <AtlasSkeleton className="h-4 w-20" />
                <AtlasSkeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      </AtlasCard>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Order Statistics                                                           */
/* -------------------------------------------------------------------------- */

function OrderStatistics({ orders }: { orders: ResellerOrder[] }) {
  const statistics: OrderStat[] = [
    {
      label: "Total Orders",
      value: orders.length,
      icon: "receipt",
      iconClassName:
        "bg-brand-100 text-brand-800 dark:bg-brand-900/30 dark:text-brand-300",
    },
    {
      label: "Successful",
      value: orders.filter((order) => order.status === "Successful").length,
      icon: "check",
      iconClassName:
        "bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-300",
    },
    {
      label: "Pending",
      value: orders.filter((order) => order.status === "Pending").length,
      icon: "clock",
      iconClassName:
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
    },
    {
      label: "Failed",
      value: orders.filter((order) => order.status === "Failed").length,
      icon: "x-circle",
      iconClassName:
        "bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-300",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {statistics.map((stat) => (
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
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${stat.iconClassName}`}
            >
              <AtlasIcon name={stat.icon} className="h-5 w-5" />
            </div>
          </div>
        </AtlasCard>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Order Detail Dialog                                                        */
/* -------------------------------------------------------------------------- */

function OrderDetailDialog({
  order,
  onClose,
}: {
  order: ResellerOrder;
  onClose: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close order details"
        className="absolute inset-0 cursor-default bg-neutral-950/50 backdrop-blur-[2px] dark:bg-black/70"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-detail-title"
        className="relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl dark:bg-neutral-950 sm:max-w-xl sm:rounded-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Transaction
            </p>
            <h2
              id="order-detail-title"
              className="mt-1 text-lg font-semibold text-neutral-950 dark:text-white"
            >
              Order Details
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
            aria-label="Close order details"
          >
            <AtlasIcon name="x-circle" className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-5">
          {/* Service summary */}
          <div className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${getServiceIconBackground(
                order.service,
              )}`}
            >
              {order.image ? (
                <img
                  src={order.image}
                  alt=""
                  className="h-9 w-9 rounded-lg object-contain"
                />
              ) : (
                <AtlasIcon
                  name={getServiceIcon(order.service)}
                  className="h-6 w-6 text-neutral-700 dark:text-neutral-200"
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-neutral-950 dark:text-white">
                {order.service}
              </p>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                {order.orderNumber}
              </p>
            </div>
            <AtlasBadge variant={order.statusVariant}>{order.status}</AtlasBadge>
          </div>

          {/* Transaction information */}
          <div className="mt-5">
            <h3 className="text-sm font-semibold text-neutral-950 dark:text-white">
              Transaction Information
            </h3>

            <div className="mt-3 overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800">
              <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
                <OrderDetailRow label="Order Number" value={order.orderNumber} />
                <OrderDetailRow label="Customer" value={order.customer} />
                <OrderDetailRow label="Service" value={order.service} />
                <OrderDetailRow label="Amount" value={order.amount} emphasis />
                <OrderDetailRow
                  label="Commission"
                  value={order.commission}
                  emphasis
                  valueClassName="text-success-700 dark:text-success-400"
                />
                <OrderDetailRow label="Date" value={order.date} />
                <div className="flex items-center justify-between gap-4 px-4 py-3">
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">
                    Status
                  </span>
                  <AtlasBadge variant={order.statusVariant}>{order.status}</AtlasBadge>
                </div>
              </div>
            </div>
          </div>

          {/* Status guidance */}
          {order.status === "Pending" && (
            <div className="mt-5 flex gap-3 rounded-xl border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900/50 dark:bg-yellow-950/20">
              <AtlasIcon
                name="clock"
                className="mt-0.5 h-5 w-5 shrink-0 text-yellow-700 dark:text-yellow-400"
              />
              <div>
                <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-300">
                  Order is being processed
                </p>
                <p className="mt-1 text-xs leading-relaxed text-yellow-800 dark:text-yellow-400">
                  This transaction has not been completed yet. You can check the order again from your orders page once the service provider responds.
                </p>
              </div>
            </div>
          )}

          {order.status === "Failed" && (
            <div className="mt-5 flex gap-3 rounded-xl border border-danger-200 bg-danger-50 p-4 dark:border-danger-900/50 dark:bg-danger-950/20">
              <AtlasIcon
                name="x-circle"
                className="mt-0.5 h-5 w-5 shrink-0 text-danger-700 dark:text-danger-400"
              />
              <div>
                <p className="text-sm font-semibold text-danger-900 dark:text-danger-300">
                  Order was unsuccessful
                </p>
                <p className="mt-1 text-xs leading-relaxed text-danger-800 dark:text-danger-400">
                  The transaction could not be completed. If money was deducted from your wallet, check your transaction history or contact Atlas support.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
          <Button className="w-full" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Order Detail Row                                                           */
/* -------------------------------------------------------------------------- */

function OrderDetailRow({
  label,
  value,
  emphasis = false,
  valueClassName = "",
}: {
  label: string;
  value: string;
  emphasis?: boolean;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <span className="text-sm text-neutral-500 dark:text-neutral-400">
        {label}
      </span>
      <span
        className={`text-right ${
          emphasis ? "font-semibold" : "font-medium"
        } ${
          valueClassName || "text-neutral-900 dark:text-neutral-100"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Empty Search State                                                         */
/* -------------------------------------------------------------------------- */

function OrdersSearchEmptyState({
  searchQuery,
  activeFilter,
  onClear,
}: {
  searchQuery: string;
  activeFilter: string;
  onClear: () => void;
}) {
  return (
    <div className="px-6 py-14 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
        <AtlasIcon name="search" className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-neutral-950 dark:text-white">
        No matching orders
      </h3>
      <p className="mx-auto mt-1 max-w-md text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
        No orders match {searchQuery ? `“${searchQuery}”` : getFilterLabel(activeFilter)}.
        Try another search or clear your filters.
      </p>
      <Button variant="outline" className="mt-5" onClick={onClear}>
        Clear filters
      </Button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main Component                                                             */
/* -------------------------------------------------------------------------- */

export function ResellerOrdersList({ initialOrders }: ResellerOrdersListProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [orders, setOrders] = useState<ResellerOrder[]>(initialOrders ?? []);

  const [activeFilter, setActiveFilter] = useState<OrderFilter["id"]>("all");
  const [activeServiceFilter, setActiveServiceFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<ResellerOrder | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setOrders(initialOrders?.length ? initialOrders : mockResellerOrders);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [initialOrders]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const serviceFilters: ServiceFilter[] = useMemo(() => {
    const uniqueCategories = new Set(
      orders.map((order) => getServiceCategory(order.service)),
    );
    return [
      { id: "all", label: "All Services" },
      ...Array.from(uniqueCategories).map((category) => ({
        id: category,
        label: category,
      })),
    ];
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const normalizedQuery = normalizeSearchValue(searchQuery);
    const activeFilterConfig = filters.find((filter) => filter.id === activeFilter);

    return orders.filter((order) => {
      const matchesStatus =
        !activeFilterConfig?.status ||
        order.status === activeFilterConfig.status;

      const matchesService =
        activeServiceFilter === "all" ||
        getServiceCategory(order.service) === activeServiceFilter;

      if (!matchesStatus || !matchesService) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const searchableText = [
        order.service,
        order.orderNumber,
        order.customer,
        order.amount,
        order.commission,
        order.date,
        order.status,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [orders, activeFilter, activeServiceFilter, searchQuery]);

  const filterCounts = useMemo(() => {
    return {
      all: orders.length,
      successful: orders.filter((order) => order.status === "Successful").length,
      pending: orders.filter((order) => order.status === "Pending").length,
      failed: orders.filter((order) => order.status === "Failed").length,
    };
  }, [orders]);

  const clearFilters = () => {
    setActiveFilter("all");
    setActiveServiceFilter("all");
    setSearchQuery("");
  };

  if (loading) {
    return <ResellerOrdersSkeleton />;
  }

  if (error) {
    return <AtlasErrorState onRetry={loadOrders} />;
  }

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
            Track customer purchases, monitor transaction status and review the commission earned from each order.
          </p>
        </div>
        <Link
          href="/reseller/services"
          className="inline-flex w-fit items-center justify-center gap-2 rounded-lg bg-brand-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <AtlasIcon name="grid" className="h-4 w-4" />
          View Services
        </Link>
      </div>

      {/* Order Statistics */}
      <OrderStatistics orders={orders} />

      {/* Search & Filters */}
      <AtlasCard>
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div className="relative">
            <AtlasIcon
              name="search"
              className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by order number, service or customer..."
              aria-label="Search orders"
              className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-10 pr-10 text-sm text-neutral-950 outline-none transition-colors placeholder:text-neutral-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
                aria-label="Clear search"
              >
                <AtlasIcon name="x-circle" className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filter controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Status filter buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {filters.map((filter) => {
                const count = filterCounts[filter.id];
                const isActive = activeFilter === filter.id;
                return (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setActiveFilter(filter.id)}
                    aria-pressed={isActive}
                    className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                      isActive
                        ? "bg-brand-800 text-white"
                        : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                    }`}
                  >
                    <span>{filter.label}</span>
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[11px] font-bold ${
                        isActive
                          ? "bg-white/15 text-white"
                          : "bg-white text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Service filter dropdown */}
            <select
              value={activeServiceFilter}
              onChange={(e) => setActiveServiceFilter(e.target.value)}
              className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
              aria-label="Filter by service"
            >
              {serviceFilters.map((serviceFilter) => (
                <option key={serviceFilter.id} value={serviceFilter.id}>
                  {serviceFilter.label}
                </option>
              ))}
            </select>

            {(searchQuery || activeFilter !== "all" || activeServiceFilter !== "all") && (
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
            {getFilterLabel(activeFilter)}
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Showing {filteredOrders.length}{" "}
            {filteredOrders.length === 1 ? "order" : "orders"}
          </p>
        </div>
        {searchQuery && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Search results for{" "}
            <span className="font-medium text-neutral-700 dark:text-neutral-200">
              “{searchQuery}”
            </span>
          </p>
        )}
      </div>

      {/* Orders List */}
      <AtlasCard padding="none" className="overflow-hidden">
        {filteredOrders.length > 0 ? (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {filteredOrders.map((order) => (
              <button
                key={order.id}
                type="button"
                onClick={() => setSelectedOrder(order)}
                className="group flex w-full flex-col gap-4 px-5 py-4 text-left transition-colors hover:bg-neutral-50 focus-visible:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500 sm:px-6 md:flex-row md:items-center md:justify-between dark:hover:bg-neutral-900 dark:focus-visible:bg-neutral-900"
              >
                {/* Service */}
                <div className="flex min-w-0 items-center gap-3">
                  {order.image ? (
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-white p-1 dark:border-neutral-800">
                      <img
                        src={order.image}
                        alt=""
                        className="h-full w-full object-contain"
                      />
                    </div>
                  ) : (
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${getServiceIconBackground(
                        order.service,
                      )}`}
                    >
                      <AtlasIcon
                        name={getServiceIcon(order.service)}
                        className="h-5 w-5 text-neutral-700 dark:text-neutral-200"
                      />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-neutral-950 dark:text-white">
                      {order.service}
                    </p>
                    <p className="mt-1 truncate text-xs text-neutral-500 dark:text-neutral-400">
                      {order.orderNumber}
                      <span className="mx-1.5">•</span>
                      {order.customer}
                    </p>
                  </div>
                </div>

                {/* Transaction */}
                <div className="flex items-center justify-between gap-6 md:justify-end">
                  <div className="text-left md:text-right">
                    <p className="text-sm font-semibold text-neutral-950 dark:text-white">
                      {order.amount}
                    </p>
                    <p className="mt-1 text-xs text-success-600 dark:text-success-400">
                      Commission: {order.commission}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <AtlasBadge variant={order.statusVariant}>
                      {order.status}
                    </AtlasBadge>
                    <AtlasIcon
                      name="arrow-right"
                      className="hidden h-4 w-4 text-neutral-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-600 sm:block dark:text-neutral-600 dark:group-hover:text-brand-400"
                    />
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <OrdersSearchEmptyState
            searchQuery={searchQuery}
            activeFilter={activeFilter}
            onClear={clearFilters}
          />
        )}
      </AtlasCard>

      {/* Business Guidance */}
      {orders.length > 0 && (
        <AtlasCard className="border-brand-100 bg-brand-50/50 dark:border-brand-900/40 dark:bg-brand-950/20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-800 dark:bg-brand-900/40 dark:text-brand-300">
              <AtlasIcon name="receipt" className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-brand-950 dark:text-brand-100">
                Keep an eye on pending orders
              </h2>
              <p className="mt-1 max-w-3xl text-sm leading-relaxed text-brand-900/70 dark:text-brand-200/70">
                Pending transactions may take some time to complete depending on the service provider.
                Open an order to review its current status and transaction details.
              </p>
            </div>
          </div>
        </AtlasCard>
      )}

      {/* Order Details */}
      {selectedOrder && (
        <OrderDetailDialog
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}