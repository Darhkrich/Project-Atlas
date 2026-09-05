"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AtlasCard } from "@/components/atlas/card";
import { AtlasSkeleton } from "@/components/atlas/skeleton";
import { AtlasErrorState } from "@/components/atlas/error-state";
import { AtlasBadge } from "@/components/atlas/badge";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { useResellerData } from "@/contexts/reseller-data-context";

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
  const { orders } = useResellerData();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("30d");

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const analytics = useMemo<AnalyticsData>(() => {
    // Calculate totals from live orders
    const totalOrders = orders.length;
    const totalSales = orders.reduce((sum, order) => {
      const amount = parseFloat(order.amount.replace(/[^0-9.]/g, ""));
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    const totalCommission = totalSales * 0.10; // assuming 10% commission
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Top services aggregation
    const serviceMap = new Map<string, { orders: number; sales: number }>();
    orders.forEach((order) => {
      const existing = serviceMap.get(order.service) || { orders: 0, sales: 0 };
      existing.orders += 1;
      existing.sales += parseFloat(order.amount.replace(/[^0-9.]/g, "")) || 0;
      serviceMap.set(order.service, existing);
    });

    const topServices = Array.from(serviceMap.entries())
      .map(([name, data]) => ({
        name,
        orders: data.orders,
        sales: data.sales,
        commission: data.sales * 0.10,
        icon: "phone" as AtlasIconName,
        iconBg: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
      }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);

    // If no orders, use placeholder top services
    if (topServices.length === 0) {
      topServices.push(
        { name: "No orders yet", orders: 0, sales: 0, commission: 0, icon: "receipt", iconBg: "bg-neutral-100" },
      );
    }

    // For chart, we can create a simple distribution (last 7 days/weeks)
    // Since we don't have real dates, we'll use a placeholder series based on total orders
    const salesSeries = [0, 0, 0, 0, 0, 0, totalSales];
    const orderSeries = [0, 0, 0, 0, 0, 0, totalOrders];

    const recentDays = [
      { label: "Today", sales: totalSales, orders: totalOrders },
    ];

    return {
      totalSales,
      totalOrders,
      totalCommission,
      averageOrderValue,
      salesChange: 0,
      ordersChange: 0,
      commissionChange: 0,
      averageOrderChange: 0,
      salesSeries,
      orderSeries,
      topServices,
      recentDays,
    };
  }, [orders]);

  if (loading) {
    return <ResellerAnalyticsSkeleton />;
  }

  const maxSales = Math.max(...analytics.salesSeries, 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-brand-700 dark:text-brand-300">
            Business Analytics
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-950 dark:text-white sm:text-3xl">
            Analytics
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
            Understand your sales, customer orders and commission performance.
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

      {/* Period Selector (non-functional for now, but UI kept) */}
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

      {/* KPI Snapshot */}
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

      {/* Sales Chart + Top Services */}
      <div className="grid gap-6 xl:grid-cols-3">
        <AtlasCard className="xl:col-span-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-neutral-950 dark:text-white">
                Sales Performance
              </h2>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                Revenue generated from orders
              </p>
            </div>
            <AtlasBadge variant="success">
              {formatPercentage(analytics.salesChange)}
            </AtlasBadge>
          </div>

          <div className="mt-6">
            <div className="flex h-64 items-end gap-2 sm:gap-4">
              {analytics.salesSeries.map((value, index) => {
                const height = Math.max((value / maxSales) * 100, 5);
                return (
                  <div key={index} className="group flex h-full flex-1 flex-col justify-end">
                    <div className="relative flex flex-1 items-end">
                      <div
                        className="w-full rounded-t-lg bg-brand-100 transition-all duration-300 group-hover:bg-brand-200 dark:bg-brand-900/40 dark:group-hover:bg-brand-900/60"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                    <div className="mt-3 text-center text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                      {index === analytics.salesSeries.length - 1 ? "Now" : `-${index}`}
                    </div>
                  </div>
                );
              })}
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
                Based on your orders
              </p>
            </div>
            <AtlasIcon name="bar-chart" className="h-5 w-5 text-neutral-400" />
          </div>

          <div className="mt-5 space-y-4">
            {analytics.topServices.map((service, index) => (
              <div key={service.name} className="flex items-center gap-3">
                <span className="w-4 text-xs font-semibold text-neutral-400">{index + 1}</span>
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${service.iconBg}`}>
                  <AtlasIcon name={service.icon} className="h-5 w-5" />
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
        </AtlasCard>
      </div>

      {/* Order Activity */}
      <AtlasCard>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-neutral-950 dark:text-white">
              Order Activity
            </h2>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              Recent customer orders
            </p>
          </div>
          <Link
            href="/reseller/orders"
            className="text-sm font-semibold text-brand-800 hover:underline dark:text-brand-300"
          >
            View all orders
          </Link>
        </div>

        <div className="mt-4 space-y-3">
          {orders.slice(0, 5).map((order) => (
            <div key={order.id} className="flex items-center justify-between text-sm">
              <span className="font-medium">{order.service}</span>
              <span className="text-neutral-500">{order.customer}</span>
              <span className="font-semibold">{order.amount}</span>
            </div>
          ))}
          {orders.length === 0 && (
            <p className="text-sm text-neutral-500">No orders yet.</p>
          )}
        </div>
      </AtlasCard>
    </div>
  );
}