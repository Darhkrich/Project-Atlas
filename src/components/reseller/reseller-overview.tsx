/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AtlasCard } from "@/components/atlas/card";
import { AtlasSkeleton } from "@/components/atlas/skeleton";
import { AtlasErrorState } from "@/components/atlas/error-state";
import { AtlasBadge } from "@/components/atlas/badge";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { useReseller } from "@/contexts/ResellerContext";
import type { ResellerOrder } from "@/lib/mock-data";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type QuickAction = {
  label: string;
  description: string;
  href: string;
  icon: AtlasIconName;
  bgClass: string;
};

type KpiConfig = {
  label: string;
  value: string;
  icon: AtlasIconName;
  bgClass: string;
  change?: string;
};

/* -------------------------------------------------------------------------- */
/* Configuration                                                              */
/* -------------------------------------------------------------------------- */

const quickActions: QuickAction[] = [
  {
    label: "Fund Wallet",
    description: "Add money to your reseller wallet",
    href: "/reseller/wallet",
    icon: "plus",
    bgClass: "bg-brand-100 dark:bg-brand-900/30",
  },
  {
    label: "Manage Store",
    description: "Customize your storefront",
    href: "/reseller/storefront",
    icon: "store",
    bgClass: "bg-accent-500/15",
  },
  {
    label: "View Orders",
    description: "Review customer transactions",
    href: "/reseller/orders",
    icon: "receipt",
    bgClass: "bg-yellow-100 dark:bg-yellow-900/30",
  },
  {
    label: "Add Services",
    description: "Enable more services to sell",
    href: "/reseller/services",
    icon: "grid",
    bgClass: "bg-blue-100 dark:bg-blue-900/30",
  },
];

const serviceIconBg: Record<string, string> = {
  "MTN Data 50GB": "bg-green-100 dark:bg-green-900/30",
  "Airtime Top Up": "bg-orange-100 dark:bg-orange-900/30",
  "ECG Credit": "bg-yellow-100 dark:bg-yellow-900/30",
  "DSTV Compact": "bg-blue-100 dark:bg-blue-900/30",
  "Glo Data 100GB": "bg-green-100 dark:bg-green-900/30",
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function getServiceIcon(service: string): AtlasIconName {
  const normalized = service.toLowerCase();
  if (normalized.includes("data")) return "globe";
  if (normalized.includes("airtime")) return "phone";
  if (normalized.includes("ecg") || normalized.includes("electricity")) return "zap";
  if (normalized.includes("dstv") || normalized.includes("tv")) return "tv";
  return "grid";
}

/* -------------------------------------------------------------------------- */
/* Loading State                                                              */
/* -------------------------------------------------------------------------- */

function ResellerOverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <AtlasSkeleton key={index} className="h-36 w-full" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <AtlasSkeleton className="h-[430px] w-full" />
        </div>
        <div className="space-y-6">
          <AtlasSkeleton className="h-56 w-full" />
          <AtlasSkeleton className="h-72 w-full" />
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main Component                                                             */
/* -------------------------------------------------------------------------- */

export function ResellerOverview() {
  const {
    orders,
    todaySales,
    totalOrders,
    customers,
    walletBalance,
    totalCommissions,
  } = useReseller();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const handleRetry = () => {
    setLoading(true);
    setError(false);
    setTimeout(() => setLoading(false), 600);
  };

  if (loading) {
    return <ResellerOverviewSkeleton />;
  }

  if (error) {
    return <AtlasErrorState onRetry={handleRetry} />;
  }

  const kpiConfigs: KpiConfig[] = [
    {
      label: "Today's Sales",
      value: `GHS ${todaySales.toFixed(2)}`,
      icon: "wallet",
      bgClass: "bg-brand-50 text-brand-800 dark:bg-brand-900/30 dark:text-brand-300",
      change: "+12.5%",
    },
    {
      label: "Total Orders",
      value: `${totalOrders}`,
      icon: "trending-up",
      bgClass: "bg-success-50 text-success-700 dark:bg-success-900/30 dark:text-success-300",
      change: "+20.3%",
    },
    {
      label: "Customers",
      value: `${customers}`,
      icon: "users",
      bgClass: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
      change: "+18.7%",
    },
    {
      label: "Wallet Balance",
      value: `GHS ${walletBalance.toFixed(2)}`,
      icon: "store",
      bgClass: "bg-accent-500/10 text-accent-700 dark:text-accent-300",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-brand-700 dark:text-brand-300">
            Reseller Dashboard
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-950 dark:text-white sm:text-3xl">
            Good morning, Reseller
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
            Here&apos;s an overview of your reseller business, wallet, storefront and recent activity.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/reseller/storefront"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-800 shadow-sm transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            <AtlasIcon name="store" className="h-4 w-4" />
            Manage Store
          </Link>
          <Link
            href="/reseller/wallet"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <AtlasIcon name="plus" className="h-4 w-4" />
            Fund Wallet
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiConfigs.map((kpi) => (
          <AtlasCard key={kpi.label} className="relative overflow-hidden transition-shadow hover:shadow-md">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{kpi.label}</p>
                <p className="mt-2 truncate text-2xl font-bold tracking-tight text-neutral-950 dark:text-white">
                  {kpi.value}
                </p>
                {kpi.change && (
                  <div className="mt-2 flex items-center gap-1.5 text-sm font-medium text-success-600 dark:text-success-400">
                    <AtlasIcon name="trending-up" className="h-4 w-4" />
                    <span>{kpi.change}</span>
                  </div>
                )}
              </div>
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${kpi.bgClass}`}>
                <AtlasIcon name={kpi.icon} className="h-5 w-5" />
              </div>
            </div>
          </AtlasCard>
        ))}
      </div>

      {/* Storefront Status Card */}
      <AtlasCard className="overflow-hidden border-brand-100 dark:border-brand-900/40">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-800 dark:bg-brand-900/40 dark:text-brand-300">
              <AtlasIcon name="store" className="h-6 w-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-semibold text-neutral-950 dark:text-white">Your storefront</h2>
                <AtlasBadge variant="success">Live</AtlasBadge>
              </div>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                Your reseller storefront is active and ready for customers.
              </p>
              <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-500">
                Customize your storefront, manage services and share your store link with customers.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 lg:shrink-0">
            <Link
              href="/reseller/storefront"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-800 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
            >
              Customize
            </Link>
            <Link
              href="/reseller/storefront"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-800 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-900"
            >
              View Store
              <AtlasIcon name="arrow-right" className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </AtlasCard>

      {/* Main grid */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* Recent Orders */}
        <div className="xl:col-span-2">
          <AtlasCard padding="none" className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4 sm:px-6 dark:border-neutral-800">
              <div>
                <h2 className="text-base font-semibold text-neutral-950 dark:text-white">Recent Orders</h2>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">Your latest customer transactions</p>
              </div>
              <Link
                href="/reseller/orders"
                className="text-sm font-semibold text-brand-800 hover:underline dark:text-brand-300"
              >
                View all
              </Link>
            </div>

            <div className="hidden grid-cols-[minmax(0,2fr)_1fr_1fr_1.2fr] gap-4 border-b border-neutral-100 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500 md:grid dark:border-neutral-800 dark:text-neutral-400">
              <span>Service</span>
              <span>Amount</span>
              <span>Status</span>
              <span>Date</span>
            </div>

            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {orders.length > 0 ? (
                orders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="grid gap-3 px-5 py-4 transition-colors hover:bg-neutral-50 sm:px-6 md:grid-cols-[minmax(0,2fr)_1fr_1fr_1.2fr] md:items-center dark:hover:bg-neutral-900"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      {order.image ? (
                        <img
                          src={order.image}
                          alt={order.service}
                          className="h-10 w-10 rounded-lg object-contain bg-white p-0.5"
                        />
                      ) : (
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                            serviceIconBg[order.service] || "bg-neutral-100 dark:bg-neutral-800"
                          }`}
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
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">{order.category}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{order.amount}</p>
                      <p className="mt-0.5 text-xs text-neutral-500 md:hidden dark:text-neutral-400">Amount</p>
                    </div>
                    <div>
                      <AtlasBadge variant={order.statusVariant}>{order.status}</AtlasBadge>
                    </div>
                    <span className="hidden text-sm text-neutral-500 md:block dark:text-neutral-400">{order.date}</span>
                  </div>
                ))
              ) : (
                <div className="px-6 py-12 text-center">
                  <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">No orders yet</p>
                  <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Your recent customer orders will appear here.</p>
                </div>
              )}
            </div>
          </AtlasCard>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Sales Overview */}
          <AtlasCard>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-neutral-950 dark:text-white">Sales Overview</h2>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">Track your recent sales performance</p>
              </div>
              <button
                type="button"
                className="flex shrink-0 items-center gap-1 text-xs font-medium text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
              >
                This Week
                <AtlasIcon name="arrow-right" className="h-3.5 w-3.5 rotate-90" />
              </button>
            </div>

            <div className="mt-5 rounded-xl border border-neutral-100 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-900">
              <svg
                viewBox="0 0 400 150"
                className="h-40 w-full"
                preserveAspectRatio="none"
                role="img"
                aria-label="Weekly sales trend"
              >
                <line x1="0" y1="30" x2="400" y2="30" stroke="currentColor" className="text-neutral-200 dark:text-neutral-800" strokeWidth="1" />
                <line x1="0" y1="75" x2="400" y2="75" stroke="currentColor" className="text-neutral-200 dark:text-neutral-800" strokeWidth="1" />
                <line x1="0" y1="120" x2="400" y2="120" stroke="currentColor" className="text-neutral-200 dark:text-neutral-800" strokeWidth="1" />

                <path
                  d="M0 112 C45 105 65 90 100 96 C135 102 150 70 190 76 C225 82 250 54 285 58 C320 62 350 30 400 22 L400 150 L0 150 Z"
                  fill="currentColor"
                  className="text-brand-100 dark:text-brand-900/30"
                />
                <path
                  d="M0 112 C45 105 65 90 100 96 C135 102 150 70 190 76 C225 82 250 54 285 58 C320 62 350 30 400 22"
                  fill="none"
                  stroke="currentColor"
                  className="text-brand-800 dark:text-brand-400"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <circle cx="400" cy="22" r="5" fill="currentColor" className="text-brand-800 dark:text-brand-400" />
              </svg>

              <div className="mt-2 flex justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-900">
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Total Sales</p>
                <p className="mt-1 text-base font-bold text-neutral-950 dark:text-white">GHS {todaySales.toFixed(2)}</p>
              </div>
              <div className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-900">
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Orders</p>
                <p className="mt-1 text-base font-bold text-neutral-950 dark:text-white">{orders.length}</p>
              </div>
            </div>
          </AtlasCard>

          {/* Quick Actions */}
          <AtlasCard>
            <div className="mb-4">
              <h2 className="text-base font-semibold text-neutral-950 dark:text-white">Quick Actions</h2>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">Common reseller tasks</p>
            </div>

            <div className="grid gap-2.5">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="group flex items-center gap-3 rounded-xl border border-neutral-200 p-3 transition-all hover:border-brand-200 hover:bg-brand-50/50 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-neutral-800 dark:hover:border-brand-800 dark:hover:bg-brand-950/20"
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${action.bgClass}`}>
                    <AtlasIcon name={action.icon} className="h-5 w-5 text-neutral-700 dark:text-neutral-200" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-neutral-900 group-hover:text-brand-800 dark:text-neutral-100 dark:group-hover:text-brand-300">
                      {action.label}
                    </p>
                    <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">{action.description}</p>
                  </div>
                  <AtlasIcon
                    name="arrow-right"
                    className="h-4 w-4 shrink-0 text-neutral-400 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-700 dark:text-neutral-500 dark:group-hover:text-brand-300"
                  />
                </Link>
              ))}
            </div>
          </AtlasCard>
        </div>
      </div>

      {/* Business Guidance */}
      <AtlasCard className="bg-brand-950 text-white dark:bg-brand-950">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
              <AtlasIcon name="store" className="h-5 w-5 text-brand-200" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Grow your Atlas storefront</h2>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-brand-100/80">
                Add more services, customize your storefront and share your store link with customers to increase your sales.
              </p>
            </div>
          </div>
          <Link
            href="/reseller/storefront"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-brand-950 transition-colors hover:bg-brand-50"
          >
            Manage Store
            <AtlasIcon name="arrow-right" className="h-4 w-4" />
          </Link>
        </div>
      </AtlasCard>
    </div>
  );
}