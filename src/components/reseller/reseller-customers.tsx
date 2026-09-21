/* eslint-disable react-hooks/purity */
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AtlasCard } from "@/components/atlas/card";
import { Button } from "@/components/atlas/button";
import { AtlasEmptyState } from "@/components/atlas/empty-state";
import { AtlasBadge } from "@/components/atlas/badge";
import { AtlasIcon } from "@/components/atlas/icons";
import { AtlasModalShell } from "@/components/atlas/modal-shell";
import { useCurrentReseller } from "@/lib/reseller/hooks/use-current-reseller";
import { useResellerOrders } from "@/lib/domains/orders/use-reseller-orders";
import { useResellerCustomers } from "@/lib/domains/storefront/use-reseller-customers";
import type { ResellerCustomerRow } from "@/lib/domains/storefront/use-reseller-customers";
import { deriveCustomerStatus } from "@/lib/reseller/customers/customer-status";
import { useNow } from "@/lib/shared/hooks/use-now";
import { formatCurrency, formatRelative, formatAbsolute, getInitials } from "@/lib/shared/format";

function getInitialsColor(index: number) {
  const colors = [
    "bg-brand-100 text-brand-800 dark:bg-brand-900/40 dark:text-brand-300",
    "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
    "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
  ];
  return colors[index % colors.length];
}

export function ResellerCustomersList() {
  const reseller = useCurrentReseller();
  const orders = useResellerOrders(reseller?.id ?? "");
  const customers = useResellerCustomers(reseller?.id ?? "", orders);
  const nowMs = useNow();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">(
    "all"
  );
  const [selectedCustomer, setSelectedCustomer] =
    useState<ResellerCustomerRow | null>(null);

  const effectiveNow = nowMs ?? Date.now();

  const enriched = useMemo(
    () =>
      customers.map((c) => ({
        ...c,
        status: deriveCustomerStatus(c.lastOrderAt, effectiveNow),
      })),
    [customers, effectiveNow]
  );

  const stats = useMemo(() => {
    return {
      total: enriched.length,
      active: enriched.filter((c) => c.status === "active").length,
      inactive: enriched.filter((c) => c.status === "inactive").length,
      totalOrders: enriched.reduce((sum, c) => sum + c.orderCount, 0),
    };
  }, [enriched]);

  const filteredCustomers = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();
    return enriched.filter((customer) => {
      const matchesFilter =
        activeFilter === "all" || customer.status === activeFilter;
      const matchesSearch =
        !normalizedSearch ||
        customer.name.toLowerCase().includes(normalizedSearch) ||
        customer.phone.toLowerCase().includes(normalizedSearch) ||
        customer.email.toLowerCase().includes(normalizedSearch);
      return matchesFilter && matchesSearch;
    });
  }, [enriched, activeFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-brand-700 dark:text-brand-300">
            Customer Management
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-950 dark:text-white sm:text-3xl">
            Customers
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
            View your customers, track their activity and see how they interact
            with your reseller storefront.
          </p>
        </div>
        <Link
          href="/reseller/storefront"
          className="inline-flex w-fit items-center justify-center gap-2 rounded-lg bg-brand-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-900"
        >
          <AtlasIcon name="store" className="h-4 w-4" aria-hidden="true" />
          View Storefront
        </Link>
      </div>

      {/* Customer Snapshot */}
      <div
        role="region"
        aria-label="Customer summary"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {[
          { label: "Total Customers", value: stats.total, icon: "users" as const, cls: "bg-brand-100 text-brand-800 dark:bg-brand-900/40 dark:text-brand-300" },
          { label: "Active Customers", value: stats.active, icon: "check" as const, cls: "bg-success-50 text-success-700 dark:bg-success-900/30 dark:text-success-300" },
          { label: "Inactive Customers", value: stats.inactive, icon: "clock" as const, cls: "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300" },
          { label: "Customer Orders", value: stats.totalOrders, icon: "receipt" as const, cls: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
        ].map((stat) => (
          <AtlasCard key={stat.label}>
            <div className="flex items-center gap-4">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${stat.cls}`}>
                <AtlasIcon name={stat.icon} className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {stat.label}
                </p>
                <p className="mt-1 text-xl font-bold text-neutral-950 dark:text-white">
                  {stat.value}
                </p>
              </div>
            </div>
          </AtlasCard>
        ))}
      </div>

      {/* Search + Filters */}
      <AtlasCard padding="none" className="overflow-hidden">
        <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div
            role="group"
            aria-label="Customer status filters"
            className="flex flex-wrap gap-2"
          >
            {[
              { id: "all", label: "All Customers" },
              { id: "active", label: "Active" },
              { id: "inactive", label: "Inactive" },
            ].map((filter) => {
              const isActive = activeFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() =>
                    setActiveFilter(filter.id as "all" | "active" | "inactive")
                  }
                  className={
                    "rounded-full px-4 py-2 text-sm font-medium transition-colors " +
                    (isActive
                      ? "bg-brand-800 text-white"
                      : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700")
                  }
                >
                  {filter.label}
                </button>
              );
            })}
          </div>

          <div className="relative w-full lg:max-w-sm">
            <AtlasIcon
              name="search"
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search customers..."
              aria-label="Search customers"
              className="w-full rounded-lg border border-neutral-200 bg-white py-2.5 pl-10 pr-4 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-brand-600 focus:ring-1 focus:ring-brand-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
            />
          </div>
        </div>
      </AtlasCard>

      {/* Customer List */}
      <AtlasCard padding="none" className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4 sm:px-6 dark:border-neutral-800">
          <div>
            <h2 className="text-base font-semibold text-neutral-950 dark:text-white">
              Your Customers
            </h2>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              {filteredCustomers.length} customer
              {filteredCustomers.length === 1 ? "" : "s"} found
            </p>
          </div>
        </div>

        {filteredCustomers.length > 0 ? (
          <ul role="list" className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {filteredCustomers.map((customer, index) => (
              <li
                key={customer.id}
                className="group grid gap-4 px-5 py-4 transition-colors hover:bg-neutral-50 sm:px-6 md:grid-cols-[minmax(0,2fr)_1.2fr_0.8fr_1fr_1fr_auto] md:items-center dark:hover:bg-neutral-900"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${getInitialsColor(index)}`}
                  >
                    {getInitials(customer.name)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-neutral-950 dark:text-white">
                        {customer.name}
                      </p>
                      <AtlasBadge
                        variant={customer.status === "active" ? "success" : "neutral"}
                      >
                        {customer.status === "active" ? "Active" : "Inactive"}
                      </AtlasBadge>
                    </div>
                    <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                      {customer.email}
                    </p>
                  </div>
                </div>

                <div className="hidden text-sm text-neutral-600 md:block dark:text-neutral-400">
                  {customer.phone}
                </div>

                <div>
                  <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    {customer.orderCount}
                  </p>
                  <p className="text-xs text-neutral-500 md:hidden dark:text-neutral-400">
                    orders
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    {formatCurrency(customer.totalSpent)}
                  </p>
                  <p className="text-xs text-neutral-500 md:hidden dark:text-neutral-400">
                    total spent
                  </p>
                </div>

                <div className="hidden text-sm text-neutral-500 md:block dark:text-neutral-400">
                  {customer.lastOrderAt && nowMs
                    ? formatRelative(customer.lastOrderAt, nowMs)
                    : "No orders"}
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedCustomer(customer)}
                    aria-label={`View ${customer.name}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-2 text-xs font-semibold text-neutral-700 transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-800 dark:border-neutral-800 dark:text-neutral-300 dark:hover:border-brand-800 dark:hover:bg-brand-950/30 dark:hover:text-brand-300"
                  >
                    View
                    <AtlasIcon name="arrow-right" className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <AtlasEmptyState
            title={searchQuery ? "No customers found" : "No customers yet"}
            description={
              searchQuery
                ? "Try a different name, phone number or email address."
                : "Customers who purchase through your storefront will appear here."
            }
            action={
              searchQuery ? (
                <Button variant="outline" onClick={() => setSearchQuery("")}>
                  Clear Search
                </Button>
              ) : (
                <Link
                  href="/reseller/storefront"
                  className="inline-flex items-center justify-center rounded-lg border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-800 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-800"
                >
                  View Storefront
                </Link>
              )
            }
          />
        )}
      </AtlasCard>

      {/* Customer Insight */}
      <AtlasCard className="border-brand-100 bg-brand-50/50 dark:border-brand-900/40 dark:bg-brand-950/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-800 dark:bg-brand-900/40 dark:text-brand-300">
            <AtlasIcon name="trending-up" className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-neutral-950 dark:text-white">
              Build repeat customers
            </h2>
            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              Your customers are the foundation of your reseller business. Keep
              your storefront easy to use, offer the services customers actually
              need and make repeat purchases simple.
            </p>
          </div>
        </div>
      </AtlasCard>

      {/* Customer Details Modal */}
      <AtlasModalShell
        open={selectedCustomer !== null}
        onClose={() => setSelectedCustomer(null)}
        title="Customer Details"
        description={selectedCustomer?.name}
        size="md"
      >
        {selectedCustomer && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-lg font-bold text-brand-800 dark:bg-brand-900/40 dark:text-brand-300">
                {getInitials(selectedCustomer.name)}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold text-neutral-950 dark:text-white">
                    {selectedCustomer.name}
                  </h3>
                  <AtlasBadge
                    variant={
                      selectedCustomer.status === "active" ? "success" : "neutral"
                    }
                  >
                    {selectedCustomer.status === "active" ? "Active" : "Inactive"}
                  </AtlasBadge>
                </div>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  {selectedCustomer.phone}
                </p>
                {selectedCustomer.email && (
                  <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
                    {selectedCustomer.email}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-neutral-50 p-4 dark:bg-neutral-900">
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Total Orders
                </p>
                <p className="mt-1 text-xl font-bold text-neutral-950 dark:text-white">
                  {selectedCustomer.orderCount}
                </p>
              </div>
              <div className="rounded-xl bg-neutral-50 p-4 dark:bg-neutral-900">
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Total Spent
                </p>
                <p className="mt-1 text-xl font-bold text-neutral-950 dark:text-white">
                  {formatCurrency(selectedCustomer.totalSpent)}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-500 dark:text-neutral-400">
                  Last Order
                </span>
                <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {selectedCustomer.lastOrderAt && nowMs
                    ? formatRelative(selectedCustomer.lastOrderAt, nowMs)
                    : "No orders yet"}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                href={"/reseller/orders?customer=" + encodeURIComponent(selectedCustomer.name)}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand-800 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-900"
              >
                <AtlasIcon name="receipt" className="h-4 w-4" aria-hidden="true" />
                View Orders
              </Link>
              <Button
                variant="outline"
                onClick={() => setSelectedCustomer(null)}
                className="sm:flex-1"
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </AtlasModalShell>
    </div>
  );
}