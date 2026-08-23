/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AtlasCard } from "@/components/atlas/card";
import { Button } from "@/components/atlas/button";
import { AtlasSkeleton } from "@/components/atlas/skeleton";
import { AtlasErrorState } from "@/components/atlas/error-state";
import { AtlasEmptyState } from "@/components/atlas/empty-state";
import { AtlasBadge } from "@/components/atlas/badge";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type CustomerStatus = "Active" | "Inactive";

type ResellerCustomer = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  orders: number;
  totalSpent: string;
  lastOrder: string;
  status: CustomerStatus;
  initials: string;
};

type CustomerStats = {
  total: number;
  active: number;
  inactive: number;
  totalOrders: number;
};

/* -------------------------------------------------------------------------- */
/* Mock Data                                                                  */
/* -------------------------------------------------------------------------- */

const mockCustomers: ResellerCustomer[] = [
  {
    id: "CUS-001",
    name: "Kwame Mensah",
    phone: "024 123 4567",
    email: "kwame@example.com",
    orders: 18,
    totalSpent: "GHS 845.00",
    lastOrder: "Today, 10:42 AM",
    status: "Active",
    initials: "KM",
  },
  {
    id: "CUS-002",
    name: "Ama Owusu",
    phone: "055 234 7890",
    email: "ama@example.com",
    orders: 12,
    totalSpent: "GHS 520.00",
    lastOrder: "Yesterday, 4:18 PM",
    status: "Active",
    initials: "AO",
  },
  {
    id: "CUS-003",
    name: "Daniel Asare",
    phone: "020 456 7812",
    email: "daniel@example.com",
    orders: 9,
    totalSpent: "GHS 310.50",
    lastOrder: "Aug 6, 2026",
    status: "Active",
    initials: "DA",
  },
  {
    id: "CUS-004",
    name: "Akosua Boateng",
    phone: "054 876 1234",
    email: "akosua@example.com",
    orders: 7,
    totalSpent: "GHS 275.00",
    lastOrder: "Aug 4, 2026",
    status: "Active",
    initials: "AB",
  },
  {
    id: "CUS-005",
    name: "Michael Addo",
    phone: "027 345 6789",
    email: "michael@example.com",
    orders: 4,
    totalSpent: "GHS 125.00",
    lastOrder: "Jul 29, 2026",
    status: "Inactive",
    initials: "MA",
  },
  {
    id: "CUS-006",
    name: "Esi Asante",
    phone: "050 987 6543",
    email: "esi@example.com",
    orders: 15,
    totalSpent: "GHS 690.00",
    lastOrder: "Jul 28, 2026",
    status: "Active",
    initials: "EA",
  },
];

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/* Loading State                                                              */
/* -------------------------------------------------------------------------- */

function ResellerCustomersSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <AtlasSkeleton className="h-7 w-48" />
        <AtlasSkeleton className="h-4 w-80" />
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <AtlasSkeleton key={index} className="h-28 w-full" />
        ))}
      </div>

      {/* Toolbar */}
      <AtlasSkeleton className="h-16 w-full" />

      {/* Customer table */}
      <AtlasSkeleton className="h-[500px] w-full" />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Customer Details                                                           */
/* -------------------------------------------------------------------------- */

function CustomerDetailsModal({
  customer,
  onClose,
}: {
  customer: ResellerCustomer;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-neutral-950/50 backdrop-blur-sm dark:bg-black/70"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-lg overflow-hidden rounded-t-2xl bg-white shadow-2xl dark:bg-neutral-950 sm:rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Customer
            </p>

            <h2 className="mt-1 text-lg font-semibold text-neutral-950 dark:text-white">
              Customer Details
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white"
            aria-label="Close customer details"
          >
            <AtlasIcon name="x-circle" className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-5">
          {/* Customer identity */}
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-lg font-bold text-brand-800 dark:bg-brand-900/40 dark:text-brand-300">
              {customer.initials}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-semibold text-neutral-950 dark:text-white">
                  {customer.name}
                </h3>

                <AtlasBadge
                  variant={
                    customer.status === "Active" ? "success" : "neutral"
                  }
                >
                  {customer.status}
                </AtlasBadge>
              </div>

              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                {customer.phone}
              </p>

              {customer.email && (
                <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
                  {customer.email}
                </p>
              )}
            </div>
          </div>

          {/* Customer metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-neutral-50 p-4 dark:bg-neutral-900">
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Total Orders
              </p>

              <p className="mt-1 text-xl font-bold text-neutral-950 dark:text-white">
                {customer.orders}
              </p>
            </div>

            <div className="rounded-xl bg-neutral-50 p-4 dark:bg-neutral-900">
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Total Spent
              </p>

              <p className="mt-1 text-xl font-bold text-neutral-950 dark:text-white">
                {customer.totalSpent}
              </p>
            </div>
          </div>

          {/* Activity */}
          <div className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                Last Order
              </span>

              <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {customer.lastOrder}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href={`/reseller/orders?customer=${encodeURIComponent(
                customer.name
              )}`}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand-800 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-900"
            >
              <AtlasIcon name="receipt" className="h-4 w-4" />
              View Orders
            </Link>

            <Button variant="outline" onClick={onClose} className="sm:flex-1">
              Done
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main Component                                                             */
/* -------------------------------------------------------------------------- */

export function ResellerCustomersList() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [customers, setCustomers] =
    useState<ResellerCustomer[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

  const [selectedCustomer, setSelectedCustomer] =
    useState<ResellerCustomer | null>(null);

  /* ------------------------------------------------------------------------ */
  /* Load Data                                                                */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    let mounted = true;

    const loadCustomers = async () => {
      setLoading(true);
      setError(false);

      try {
        /*
         * Temporary mock loading.
         *
         * Replace this block with the reseller customers API request
         * when the backend endpoint is available.
         */
        await new Promise((resolve) => setTimeout(resolve, 600));

        if (!mounted) return;

        setCustomers(mockCustomers);
      } catch {
        if (!mounted) return;
        setError(true);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadCustomers();

    return () => {
      mounted = false;
    };
  }, []);

  /* ------------------------------------------------------------------------ */
  /* Retry                                                                    */
  /* ------------------------------------------------------------------------ */

  const handleRetry = () => {
    setLoading(true);
    setError(false);

    setTimeout(() => {
      setCustomers(mockCustomers);
      setLoading(false);
    }, 600);
  };

  /* ------------------------------------------------------------------------ */
  /* Statistics                                                               */
  /* ------------------------------------------------------------------------ */

  const stats = useMemo<CustomerStats>(() => {
    return {
      total: customers.length,
      active: customers.filter(
        (customer) => customer.status === "Active"
      ).length,
      inactive: customers.filter(
        (customer) => customer.status === "Inactive"
      ).length,
      totalOrders: customers.reduce(
        (total, customer) => total + customer.orders,
        0
      ),
    };
  }, [customers]);

  /* ------------------------------------------------------------------------ */
  /* Filtering                                                                */
  /* ------------------------------------------------------------------------ */

  const filteredCustomers = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return customers.filter((customer) => {
      const matchesFilter =
        activeFilter === "all" ||
        customer.status.toLowerCase() === activeFilter;

      const matchesSearch =
        !normalizedSearch ||
        customer.name.toLowerCase().includes(normalizedSearch) ||
        customer.phone.toLowerCase().includes(normalizedSearch) ||
        customer.email?.toLowerCase().includes(normalizedSearch);

      return matchesFilter && matchesSearch;
    });
  }, [customers, activeFilter, searchQuery]);

  /* ------------------------------------------------------------------------ */
  /* Loading / Error                                                          */
  /* ------------------------------------------------------------------------ */

  if (loading) {
    return <ResellerCustomersSkeleton />;
  }

  if (error) {
    return <AtlasErrorState onRetry={handleRetry} />;
  }

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                             */}
      {/* ------------------------------------------------------------------ */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-brand-700 dark:text-brand-300">
            Customer Management
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-950 dark:text-white sm:text-3xl">
            Customers
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
            View your customers, track their activity and see how they
            interact with your reseller storefront.
          </p>
        </div>

        <Link
          href="/reseller/storefront"
          className="inline-flex w-fit items-center justify-center gap-2 rounded-lg bg-brand-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <AtlasIcon name="store" className="h-4 w-4" />
          View Storefront
        </Link>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Customer Snapshot                                                  */}
      {/* ------------------------------------------------------------------ */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AtlasCard>
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-800 dark:bg-brand-900/40 dark:text-brand-300">
              <AtlasIcon name="users" className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Total Customers
              </p>

              <p className="mt-1 text-xl font-bold text-neutral-950 dark:text-white">
                {stats.total}
              </p>
            </div>
          </div>
        </AtlasCard>

        <AtlasCard>
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-success-50 text-success-700 dark:bg-success-900/30 dark:text-success-300">
              <AtlasIcon name="check" className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Active Customers
              </p>

              <p className="mt-1 text-xl font-bold text-neutral-950 dark:text-white">
                {stats.active}
              </p>
            </div>
          </div>
        </AtlasCard>

        <AtlasCard>
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
              <AtlasIcon name="clock" className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Inactive Customers
              </p>

              <p className="mt-1 text-xl font-bold text-neutral-950 dark:text-white">
                {stats.inactive}
              </p>
            </div>
          </div>
        </AtlasCard>

        <AtlasCard>
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              <AtlasIcon name="receipt" className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Customer Orders
              </p>

              <p className="mt-1 text-xl font-bold text-neutral-950 dark:text-white">
                {stats.totalOrders}
              </p>
            </div>
          </div>
        </AtlasCard>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Search + Filters                                                   */}
      {/* ------------------------------------------------------------------ */}

      <AtlasCard padding="none" className="overflow-hidden">
        <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {[
              {
                id: "all",
                label: "All Customers",
              },
              {
                id: "active",
                label: "Active",
              },
              {
                id: "inactive",
                label: "Inactive",
              },
            ].map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() =>
                  setActiveFilter(
                    filter.id as "all" | "active" | "inactive"
                  )
                }
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  activeFilter === filter.id
                    ? "bg-brand-800 text-white"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:max-w-sm">
            <AtlasIcon
              name="search"
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
            />

            <input
              type="search"
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
              placeholder="Search customers..."
              className="w-full rounded-lg border border-neutral-200 bg-white py-2.5 pl-10 pr-4 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-brand-600 focus:ring-1 focus:ring-brand-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
            />
          </div>
        </div>
      </AtlasCard>

      {/* ------------------------------------------------------------------ */}
      {/* Customer List                                                       */}
      {/* ------------------------------------------------------------------ */}

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
          <>
            {/* Desktop header */}
            <div className="hidden grid-cols-[minmax(0,2fr)_1.2fr_0.8fr_1fr_1fr_auto] gap-4 border-b border-neutral-100 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500 md:grid dark:border-neutral-800 dark:text-neutral-400">
              <span>Customer</span>
              <span>Phone</span>
              <span>Orders</span>
              <span>Total Spent</span>
              <span>Last Order</span>
              <span />
            </div>

            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {filteredCustomers.map((customer, index) => (
                <div
                  key={customer.id}
                  className="group grid gap-4 px-5 py-4 transition-colors hover:bg-neutral-50 sm:px-6 md:grid-cols-[minmax(0,2fr)_1.2fr_0.8fr_1fr_1fr_auto] md:items-center dark:hover:bg-neutral-900"
                >
                  {/* Customer */}
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${getInitialsColor(
                        index
                      )}`}
                    >
                      {customer.initials}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold text-neutral-950 dark:text-white">
                          {customer.name}
                        </p>

                        <AtlasBadge
                          variant={
                            customer.status === "Active"
                              ? "success"
                              : "neutral"
                          }
                        >
                          {customer.status}
                        </AtlasBadge>
                      </div>

                      <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                        {customer.email || customer.id}
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="hidden text-sm text-neutral-600 md:block dark:text-neutral-400">
                    {customer.phone}
                  </div>

                  {/* Orders */}
                  <div>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      {customer.orders}
                    </p>

                    <p className="text-xs text-neutral-500 md:hidden dark:text-neutral-400">
                      orders
                    </p>
                  </div>

                  {/* Total */}
                  <div>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      {customer.totalSpent}
                    </p>

                    <p className="text-xs text-neutral-500 md:hidden dark:text-neutral-400">
                      total spent
                    </p>
                  </div>

                  {/* Last order */}
                  <div className="hidden text-sm text-neutral-500 md:block dark:text-neutral-400">
                    {customer.lastOrder}
                  </div>

                  {/* Action */}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setSelectedCustomer(customer)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-2 text-xs font-semibold text-neutral-700 opacity-100 transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-800 dark:border-neutral-800 dark:text-neutral-300 dark:hover:border-brand-800 dark:hover:bg-brand-950/30 dark:hover:text-brand-300"
                    >
                      View
                      <AtlasIcon
                        name="arrow-right"
                        className="h-3.5 w-3.5"
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <AtlasEmptyState
            title={
              searchQuery
                ? "No customers found"
                : "No customers yet"
            }
            description={
              searchQuery
                ? "Try a different name, phone number or email address."
                : "Customers who purchase through your storefront will appear here."
            }
            action={
              searchQuery ? (
                <Button
                  variant="outline"
                  onClick={() => setSearchQuery("")}
                >
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

      {/* ------------------------------------------------------------------ */}
      {/* Customer Insight                                                    */}
      {/* ------------------------------------------------------------------ */}

      <AtlasCard className="border-brand-100 bg-brand-50/50 dark:border-brand-900/40 dark:bg-brand-950/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-800 dark:bg-brand-900/40 dark:text-brand-300">
            <AtlasIcon name="trending-up" className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-base font-semibold text-neutral-950 dark:text-white">
              Build repeat customers
            </h2>

            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              Your customers are the foundation of your reseller business.
              Keep your storefront easy to use, offer the services customers
              actually need and make repeat purchases simple.
            </p>
          </div>
        </div>
      </AtlasCard>

      {/* ------------------------------------------------------------------ */}
      {/* Customer Details Modal                                             */}
      {/* ------------------------------------------------------------------ */}

      {selectedCustomer && (
        <CustomerDetailsModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
    </div>
  );
}