"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AtlasCard } from "@/components/atlas/card";
import { AtlasSkeleton } from "@/components/atlas/skeleton";
import { AtlasErrorState } from "@/components/atlas/error-state";
import { AtlasBadge } from "@/components/atlas/badge";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type Period = "7d" | "30d" | "90d";

type AnalyticsData = {
  totalSales: number;
  totalOrders: number;
  totalCommission: number;
  averageOrderValue: number;
  salesChange: number;
  ordersChange: number;
  commissionChange: number;
  averageOrderChange: number;
  salesSeries: number[];
  orderSeries: number[];
  topServices: {
    name: string;
    orders: number;
    sales: number;
    commission: number;
    icon: AtlasIconName;
    iconBg: string;
  }[];
  recentDays: {
    label: string;
    sales: number;
    orders: number;
  }[];
};

/* -------------------------------------------------------------------------- */
/* Mock Analytics Data                                                        */
/* -------------------------------------------------------------------------- */

const analyticsByPeriod: Record<Period, AnalyticsData> = {
  "7d": {
    totalSales: 1840.5,
    totalOrders: 48,
    totalCommission: 184.05,
    averageOrderValue: 38.34,

    salesChange: 14.8,
    ordersChange: 9.2,
    commissionChange: 12.4,
    averageOrderChange: 5.1,

    salesSeries: [
      180, 220, 195, 260, 310, 285, 390,
    ],

    orderSeries: [
      6, 8, 7, 9, 6, 5, 7,
    ],

    topServices: [
      {
        name: "MTN Data",
        orders: 18,
        sales: 720,
        commission: 72,
        icon: "globe",
        iconBg: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
      },
      {
        name: "Airtime Top Up",
        orders: 12,
        sales: 430,
        commission: 43,
        icon: "phone",
        iconBg: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
      },
      {
        name: "ECG Credit",
        orders: 9,
        sales: 365,
        commission: 36.5,
        icon: "zap",
        iconBg: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
      },
      {
        name: "DSTV",
        orders: 6,
        sales: 240,
        commission: 24,
        icon: "tv",
        iconBg: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
      },
      {
        name: "Glo Data",
        orders: 3,
        sales: 85.5,
        commission: 8.55,
        icon: "globe",
        iconBg: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
      },
    ],

    recentDays: [
      { label: "Mon", sales: 180, orders: 6 },
      { label: "Tue", sales: 220, orders: 8 },
      { label: "Wed", sales: 195, orders: 7 },
      { label: "Thu", sales: 260, orders: 9 },
      { label: "Fri", sales: 310, orders: 6 },
      { label: "Sat", sales: 285, orders: 5 },
      { label: "Sun", sales: 390, orders: 7 },
    ],
  },

  "30d": {
    totalSales: 7240.75,
    totalOrders: 186,
    totalCommission: 724.08,
    averageOrderValue: 38.93,

    salesChange: 21.6,
    ordersChange: 17.3,
    commissionChange: 20.2,
    averageOrderChange: 3.7,

    salesSeries: [
      920,
      1100,
      980,
      1240,
      1080,
      1320,
      1600,
    ],

    orderSeries: [
      25,
      30,
      27,
      34,
      29,
      35,
      36,
    ],

    topServices: [
      {
        name: "MTN Data",
        orders: 72,
        sales: 2860,
        commission: 286,
        icon: "globe",
        iconBg: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
      },
      {
        name: "Airtime Top Up",
        orders: 48,
        sales: 1720,
        commission: 172,
        icon: "phone",
        iconBg: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
      },
      {
        name: "ECG Credit",
        orders: 31,
        sales: 1280,
        commission: 128,
        icon: "zap",
        iconBg: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
      },
      {
        name: "DSTV",
        orders: 23,
        sales: 920,
        commission: 92,
        icon: "tv",
        iconBg: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
      },
      {
        name: "Glo Data",
        orders: 12,
        sales: 460.75,
        commission: 46.08,
        icon: "globe",
        iconBg: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
      },
    ],

    recentDays: [
      { label: "Week 1", sales: 920, orders: 25 },
      { label: "Week 2", sales: 1100, orders: 30 },
      { label: "Week 3", sales: 980, orders: 27 },
      { label: "Week 4", sales: 1240, orders: 34 },
      { label: "Week 5", sales: 1080, orders: 29 },
      { label: "Week 6", sales: 1320, orders: 35 },
      { label: "Current", sales: 1600, orders: 36 },
    ],
  },

  "90d": {
    totalSales: 21480.25,
    totalOrders: 552,
    totalCommission: 2148.03,
    averageOrderValue: 38.91,

    salesChange: 28.4,
    ordersChange: 24.8,
    commissionChange: 27.1,
    averageOrderChange: 4.6,

    salesSeries: [
      3200,
      2800,
      3450,
      2900,
      3780,
      4250,
      5100,
    ],

    orderSeries: [
      82,
      74,
      91,
      78,
      96,
      108,
      123,
    ],

    topServices: [
      {
        name: "MTN Data",
        orders: 214,
        sales: 8240,
        commission: 824,
        icon: "globe",
        iconBg: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
      },
      {
        name: "Airtime Top Up",
        orders: 132,
        sales: 4860,
        commission: 486,
        icon: "phone",
        iconBg: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
      },
      {
        name: "ECG Credit",
        orders: 96,
        sales: 3840,
        commission: 384,
        icon: "zap",
        iconBg: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
      },
      {
        name: "DSTV",
        orders: 70,
        sales: 2860,
        commission: 286,
        icon: "tv",
        iconBg: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
      },
      {
        name: "Glo Data",
        orders: 40,
        sales: 1680.25,
        commission: 168.03,
        icon: "globe",
        iconBg: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
      },
    ],

    recentDays: [
      { label: "Apr", sales: 3200, orders: 82 },
      { label: "May", sales: 2800, orders: 74 },
      { label: "Jun", sales: 3450, orders: 91 },
      { label: "Jul", sales: 2900, orders: 78 },
      { label: "Aug", sales: 3780, orders: 96 },
      { label: "Sep", sales: 4250, orders: 108 },
      { label: "Current", sales: 5100, orders: 123 },
    ],
  },
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatCurrency(value: number) {
  return `GHS ${value.toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatPercentage(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

/* -------------------------------------------------------------------------- */
/* Loading State                                                              */
/* -------------------------------------------------------------------------- */

function ResellerAnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <AtlasSkeleton className="h-7 w-48" />
        <AtlasSkeleton className="h-4 w-80" />
      </div>

      <AtlasSkeleton className="h-12 w-full sm:w-96" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <AtlasSkeleton key={index} className="h-36 w-full" />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <AtlasSkeleton className="h-[430px] w-full" />
        </div>

        <AtlasSkeleton className="h-[430px] w-full" />
      </div>

      <AtlasSkeleton className="h-80 w-full" />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* KPI Card                                                                   */
/* -------------------------------------------------------------------------- */

function AnalyticsKpi({
  label,
  value,
  change,
  icon,
  iconClass,
}: {
  label: string;
  value: string;
  change: number;
  icon: AtlasIconName;
  iconClass: string;
}) {
  return (
    <AtlasCard className="transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
            {label}
          </p>

          <p className="mt-2 truncate text-2xl font-bold tracking-tight text-neutral-950 dark:text-white">
            {value}
          </p>

          <div className="mt-2 flex items-center gap-1.5 text-xs font-medium">
            <AtlasIcon
              name={change >= 0 ? "trending-up" : "arrow-right"}
              className={`h-3.5 w-3.5 ${
                change >= 0
                  ? "text-success-600 dark:text-success-400"
                  : "text-danger-600 dark:text-danger-400"
              }`}
            />

            <span
              className={
                change >= 0
                  ? "text-success-600 dark:text-success-400"
                  : "text-danger-600 dark:text-danger-400"
              }
            >
              {formatPercentage(change)}
            </span>

            <span className="text-neutral-400">
              vs previous period
            </span>
          </div>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          <AtlasIcon name={icon} className="h-5 w-5" />
        </div>
      </div>
    </AtlasCard>
  );
}

/* -------------------------------------------------------------------------- */
/* Main Component                                                             */
/* -------------------------------------------------------------------------- */

export function ResellerAnalytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [period, setPeriod] = useState<Period>("30d");
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadAnalytics = async () => {
      setLoading(true);
      setError(false);

      try {
        /*
         * Temporary mock loading.
         * Replace with the real analytics API when the backend endpoint
         * becomes available.
         */
        await new Promise((resolve) => setTimeout(resolve, 600));

        if (!mounted) return;

        setAnalytics(analyticsByPeriod[period]);
      } catch {
        if (!mounted) return;
        setError(true);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadAnalytics();

    return () => {
      mounted = false;
    };
  }, [period]);

  const maxSales = useMemo(() => {
    if (!analytics) return 1;

    return Math.max(...analytics.salesSeries, 1);
  }, [analytics]);

  const handleRetry = () => {
    setLoading(true);
    setError(false);

    setTimeout(() => {
      setAnalytics(analyticsByPeriod[period]);
      setLoading(false);
    }, 600);
  };

  if (loading || !analytics) {
    return <ResellerAnalyticsSkeleton />;
  }

  if (error) {
    return <AtlasErrorState onRetry={handleRetry} />;
  }

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                             */}
      {/* ------------------------------------------------------------------ */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-brand-700 dark:text-brand-300">
            Business Analytics
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-950 dark:text-white sm:text-3xl">
            Analytics
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
            Understand your sales, customer orders and commission performance
            across your Atlas storefront.
          </p>
        </div>

        <Link
          href="/reseller/orders"
          className="inline-flex w-fit items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-800 shadow-sm transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
        >
          <AtlasIcon name="receipt" className="h-4 w-4" />
          View Orders
        </Link>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Period Selector                                                     */}
      {/* ------------------------------------------------------------------ */}

      <AtlasCard padding="none" className="w-fit overflow-hidden">
        <div className="flex divide-x divide-neutral-200 dark:divide-neutral-800">
          {[
            { id: "7d" as Period, label: "7 Days" },
            { id: "30d" as Period, label: "30 Days" },
            { id: "90d" as Period, label: "90 Days" },
          ].map((item) => {
            const active = period === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setPeriod(item.id)}
                className={`px-4 py-2.5 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-brand-800 text-white"
                    : "text-neutral-600 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-900"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </AtlasCard>

      {/* ------------------------------------------------------------------ */}
      {/* KPI Snapshot                                                        */}
      {/* ------------------------------------------------------------------ */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AnalyticsKpi
          label="Total Sales"
          value={formatCurrency(analytics.totalSales)}
          change={analytics.salesChange}
          icon="trending-up"
          iconClass="bg-brand-50 text-brand-800 dark:bg-brand-900/30 dark:text-brand-300"
        />

        <AnalyticsKpi
          label="Total Orders"
          value={analytics.totalOrders.toLocaleString()}
          change={analytics.ordersChange}
          icon="receipt"
          iconClass="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
        />

        <AnalyticsKpi
          label="Commission Earned"
          value={formatCurrency(analytics.totalCommission)}
          change={analytics.commissionChange}
          icon="wallet"
          iconClass="bg-success-50 text-success-700 dark:bg-success-900/30 dark:text-success-300"
        />

        <AnalyticsKpi
          label="Average Order"
          value={formatCurrency(analytics.averageOrderValue)}
          change={analytics.averageOrderChange}
          icon="cart"
          iconClass="bg-accent-500/10 text-accent-700 dark:text-accent-300"
        />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Sales Chart + Top Services                                         */}
      {/* ------------------------------------------------------------------ */}

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Sales Performance */}
        <AtlasCard className="xl:col-span-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-neutral-950 dark:text-white">
                Sales Performance
              </h2>

              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                Revenue generated during the selected period
              </p>
            </div>

            <AtlasBadge variant="success">
              {formatPercentage(analytics.salesChange)}
            </AtlasBadge>
          </div>

          {/* Chart */}
          <div className="mt-6">
            <div className="flex h-64 items-end gap-2 sm:gap-4">
              {analytics.recentDays.map((item, index) => {
                const height = Math.max(
                  (item.sales / maxSales) * 100,
                  5
                );

                return (
                  <div
                    key={`${item.label}-${index}`}
                    className="group flex h-full flex-1 flex-col justify-end"
                  >
                    <div className="relative flex flex-1 items-end">
                      <div
                        className="w-full rounded-t-lg bg-brand-100 transition-all duration-300 group-hover:bg-brand-200 dark:bg-brand-900/40 dark:group-hover:bg-brand-900/60"
                        style={{ height: `${height}%` }}
                      >
                        <div className="invisible absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-neutral-950 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100">
                          {formatCurrency(item.sales)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 text-center text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                      {item.label}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-neutral-100 pt-4 dark:border-neutral-800">
              <div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Period Sales
                </p>

                <p className="mt-1 text-lg font-bold text-neutral-950 dark:text-white">
                  {formatCurrency(analytics.totalSales)}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Commission
                </p>

                <p className="mt-1 text-lg font-bold text-success-700 dark:text-success-400">
                  {formatCurrency(analytics.totalCommission)}
                </p>
              </div>
            </div>
          </div>
        </AtlasCard>

        {/* Top Services */}
        <AtlasCard>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-neutral-950 dark:text-white">
                Top Services
              </h2>

              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                Services generating the most sales
              </p>
            </div>

            <AtlasIcon
              name="bar-chart"
              className="h-5 w-5 text-neutral-400"
            />
          </div>

          <div className="mt-5 space-y-4">
            {analytics.topServices.map((service, index) => (
              <div key={service.name} className="flex items-center gap-3">
                <span className="w-4 text-xs font-semibold text-neutral-400">
                  {index + 1}
                </span>

                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${service.iconBg}`}
                >
                  <AtlasIcon
                    name={service.icon}
                    className="h-5 w-5"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      {service.name}
                    </p>

                    <p className="shrink-0 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      {formatCurrency(service.sales)}
                    </p>
                  </div>

                  <div className="mt-1 flex items-center justify-between gap-3">
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {service.orders} orders
                    </p>

                    <p className="text-xs font-medium text-success-600 dark:text-success-400">
                      {formatCurrency(service.commission)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/reseller/services"
            className="mt-5 flex items-center justify-center gap-2 rounded-lg border border-neutral-200 px-4 py-2.5 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-900"
          >
            Manage Services
            <AtlasIcon name="arrow-right" className="h-4 w-4" />
          </Link>
        </AtlasCard>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Order Activity                                                      */}
      {/* ------------------------------------------------------------------ */}

      <AtlasCard>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-neutral-950 dark:text-white">
              Order Activity
            </h2>

            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              Customer orders across the selected period
            </p>
          </div>

          <Link
            href="/reseller/orders"
            className="text-sm font-semibold text-brand-800 hover:underline dark:text-brand-300"
          >
            View all orders
          </Link>
        </div>

        <div className="mt-6 overflow-x-auto">
          <div className="min-w-[600px]">
            <div className="grid grid-cols-[1.4fr_1fr_1fr] border-b border-neutral-100 pb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
              <span>Period</span>
              <span>Orders</span>
              <span>Sales</span>
            </div>

            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {analytics.recentDays.map((item) => (
                <div
                  key={item.label}
                  className="grid grid-cols-[1.4fr_1fr_1fr] items-center py-3.5"
                >
                  <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {item.label}
                  </span>

                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    {item.orders}
                  </span>

                  <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    {formatCurrency(item.sales)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AtlasCard>

      {/* ------------------------------------------------------------------ */}
      {/* Insight / Guidance                                                  */}
      {/* ------------------------------------------------------------------ */}

      <AtlasCard className="overflow-hidden bg-brand-950 text-white dark:bg-brand-950">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
              <AtlasIcon
                name="trending-up"
                className="h-5 w-5 text-brand-200"
              />
            </div>

            <div>
              <h2 className="text-base font-semibold">
                Keep growing your storefront
              </h2>

              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-brand-100/80">
                Your sales are trending upward. Adding popular services and
                keeping your storefront active can help you capture more
                customer orders.
              </p>
            </div>
          </div>

          <Link
            href="/reseller/services"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-brand-950 transition-colors hover:bg-brand-50"
          >
            Add Services
            <AtlasIcon name="arrow-right" className="h-4 w-4" />
          </Link>
        </div>
      </AtlasCard>
    </div>
  );
}