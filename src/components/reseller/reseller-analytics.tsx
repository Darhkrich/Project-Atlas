"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AtlasCard } from "@/components/atlas/card";
import { AtlasBadge } from "@/components/atlas/badge";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { useCurrentReseller } from "@/lib/reseller/hooks/use-current-reseller";
import { useResellerOrders } from "@/lib/domains/orders/use-reseller-orders";
import { useCurrentResellerWallet } from "@/lib/reseller/hooks/use-current-reseller-wallet";
import { useNow } from "@/lib/shared/hooks/use-now";
import { formatCurrency } from "@/lib/shared/format";
import { serviceLabel } from "@/lib/admin/orders/orders-labels";

type Period = "7d" | "30d" | "90d";

const PERIOD_DAYS: Record<Period, number> = { "7d": 7, "30d": 30, "90d": 90 };

function formatPercentage(value: number): string {
  return (value >= 0 ? "+" : "") + value.toFixed(1) + "%";
}

function deltaPercent(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / previous) * 100;
}

export function ResellerAnalytics() {
  const reseller = useCurrentReseller();
  const orders = useResellerOrders(reseller?.id ?? "");
  const walletState = useCurrentResellerWallet();
  const nowMs = useNow();
  const [period, setPeriod] = useState<Period>("30d");

  const days = PERIOD_DAYS[period];

  const analytics = useMemo(() => {
    if (nowMs === null) {
      return {
        totalSales: 0,
        totalOrders: 0,
        totalCommission: 0,
        averageOrderValue: 0,
        salesChange: 0,
        ordersChange: 0,
        commissionChange: 0,
        averageOrderChange: 0,
        topServices: [] as { serviceId: string; label: string; count: number; revenue: number; percentage: number }[],
        buckets: [] as { label: string; sales: number }[],
      };
    }

    const nowStart = nowMs - days * 86_400_000;
    const prevStart = nowMs - 2 * days * 86_400_000;

    let curSales = 0;
    let curOrders = 0;
    let curCommission = 0;
    let prevSales = 0;
    let prevOrders = 0;
    let prevCommission = 0;

    for (const o of orders) {
      const t = new Date(o.createdAt).getTime();
      if (Number.isNaN(t)) continue;
      if (t >= nowStart) {
        curOrders += 1;
        if (o.status === "successful") curSales += o.amount;
      } else if (t >= prevStart && t < nowStart) {
        prevOrders += 1;
        if (o.status === "successful") prevSales += o.amount;
      }
    }

    for (const row of walletState.ledgerRows) {
      if (row.kind !== "commission") continue;
      const t = new Date(row.createdAt).getTime();
      if (Number.isNaN(t)) continue;
      if (t >= nowStart) curCommission += row.amount;
      else if (t >= prevStart && t < nowStart) prevCommission += row.amount;
    }

    const curAov = curOrders > 0 ? curSales / curOrders : 0;
    const prevAov = prevOrders > 0 ? prevSales / prevOrders : 0;

    const serviceMap = new Map<string, { count: number; revenue: number }>();
    for (const o of orders) {
      if (new Date(o.createdAt).getTime() < nowStart) continue;
      const entry = serviceMap.get(o.serviceId) ?? { count: 0, revenue: 0 };
      entry.count += 1;
      if (o.status === "successful") entry.revenue += o.amount;
      serviceMap.set(o.serviceId, entry);
    }
    const total = curOrders;
    const topServices = Array.from(serviceMap.entries())
      .map(([serviceId, data]) => ({
        serviceId,
        label: serviceLabel(serviceId),
        count: data.count,
        revenue: data.revenue,
        percentage: total > 0 ? Math.round((data.count / total) * 100) : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const bucketCount = period === "7d" ? 7 : period === "30d" ? 10 : 12;
    const bucketMs = (days * 86_400_000) / bucketCount;
    const buckets: { label: string; sales: number }[] = [];
    for (let i = 0; i < bucketCount; i++) {
      const start = nowStart + i * bucketMs;
      const d = new Date(start);
      buckets.push({
        label: period === "7d"
          ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getUTCDay()]
          : String(d.getUTCDate()) + "/" + String(d.getUTCMonth() + 1),
        sales: 0,
      });
    }
    for (const o of orders) {
      const t = new Date(o.createdAt).getTime();
      if (Number.isNaN(t) || t < nowStart) continue;
      if (o.status !== "successful") continue;
      const idx = Math.min(bucketCount - 1, Math.floor((t - nowStart) / bucketMs));
      buckets[idx].sales += o.amount;
    }

    return {
      totalSales: curSales,
      totalOrders: curOrders,
      totalCommission: curCommission,
      averageOrderValue: curAov,
      salesChange: deltaPercent(curSales, prevSales),
      ordersChange: deltaPercent(curOrders, prevOrders),
      commissionChange: deltaPercent(curCommission, prevCommission),
      averageOrderChange: deltaPercent(curAov, prevAov),
      topServices,
      buckets,
    };
  }, [orders, walletState.ledgerRows, nowMs, days, period]);

  const maxBucket = Math.max(...analytics.buckets.map((b) => b.sales), 1);

  return (
    <div className="space-y-6">
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
          className="inline-flex w-fit items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-800 shadow-sm transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200"
        >
          <AtlasIcon name="receipt" className="h-4 w-4" aria-hidden="true" />
          View Orders
        </Link>
      </div>

      <div
        role="group"
        aria-label="Analytics period"
        className="flex w-fit divide-x divide-neutral-200 overflow-hidden rounded-lg border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800"
      >
        {(["7d", "30d", "90d"] as Period[]).map((id) => {
          const active = period === id;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={active}
              onClick={() => setPeriod(id)}
              className={
                "px-4 py-2.5 text-sm font-semibold transition-colors " +
                (active
                  ? "bg-brand-800 text-white"
                  : "text-neutral-600 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-900")
              }
            >
              {id === "7d" ? "7 Days" : id === "30d" ? "30 Days" : "90 Days"}
            </button>
          );
        })}
      </div>

      <div
        role="region"
        aria-label="Analytics summary"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <KpiCard label="Total Sales" value={formatCurrency(analytics.totalSales)} change={analytics.salesChange} icon="trending-up" cls="bg-brand-50 text-brand-800 dark:bg-brand-900/30 dark:text-brand-300" />
        <KpiCard label="Total Orders" value={analytics.totalOrders.toLocaleString()} change={analytics.ordersChange} icon="receipt" cls="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" />
        <KpiCard label="Commission Earned" value={formatCurrency(analytics.totalCommission)} change={analytics.commissionChange} icon="wallet" cls="bg-success-50 text-success-700 dark:bg-success-900/30 dark:text-success-300" />
        <KpiCard label="Average Order" value={formatCurrency(analytics.averageOrderValue)} change={analytics.averageOrderChange} icon="cart" cls="bg-accent-500/10 text-accent-700 dark:text-accent-300" />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <AtlasCard className="xl:col-span-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-neutral-950 dark:text-white">
                Sales Performance
              </h2>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                Revenue per bucket across the selected period
              </p>
            </div>
            <AtlasBadge variant={analytics.salesChange >= 0 ? "success" : "danger"}>
              {formatPercentage(analytics.salesChange)}
            </AtlasBadge>
          </div>
          <div className="mt-6">
            <div className="flex h-64 items-end gap-2 sm:gap-4">
              {analytics.buckets.map((bucket, index) => {
                const height = Math.max((bucket.sales / maxBucket) * 100, 4);
                return (
                  <div key={index} className="group flex h-full flex-1 flex-col justify-end">
                    <div className="relative flex flex-1 items-end">
                      <div
                        className="w-full rounded-t-lg bg-brand-100 transition-all duration-300 group-hover:bg-brand-200 dark:bg-brand-900/40 dark:group-hover:bg-brand-900/60"
                        style={{ height: height + "%" }}
                        title={formatCurrency(bucket.sales)}
                      />
                    </div>
                    <div className="mt-3 text-center text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                      {bucket.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </AtlasCard>

        <AtlasCard>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-neutral-950 dark:text-white">
                Top Services
              </h2>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                Based on orders in this period
              </p>
            </div>
            <AtlasIcon name="bar-chart" className="h-5 w-5 text-neutral-400" aria-hidden="true" />
          </div>
          <div className="mt-5 space-y-4">
            {analytics.topServices.length === 0 ? (
              <p className="text-sm text-neutral-500">No orders in this period.</p>
            ) : (
              analytics.topServices.map((service, index) => (
                <div key={service.serviceId} className="flex items-center gap-3">
                  <span className="w-4 text-xs font-semibold text-neutral-400">{index + 1}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        {service.label}
                      </p>
                      <p className="shrink-0 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        {formatCurrency(service.revenue)}
                      </p>
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-3">
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {service.count} {service.count === 1 ? "order" : "orders"}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {service.percentage}%
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </AtlasCard>
      </div>

      <AtlasCard>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-neutral-950 dark:text-white">
              Recent Orders
            </h2>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              Latest orders in this period
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
            <div key={order.id} className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium">{serviceLabel(order.serviceId)}</span>
              <span className="truncate text-neutral-500">{order.customerName}</span>
              <span className="font-semibold">{formatCurrency(order.amount)}</span>
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

function KpiCard({
  label,
  value,
  change,
  icon,
  cls,
}: {
  label: string;
  value: string;
  change: number;
  icon: AtlasIconName;
  cls: string;
}) {
  const up = change >= 0;
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
              name={up ? "trending-up" : "arrow-right"}
              className={
                "h-3.5 w-3.5 " +
                (up
                  ? "text-success-600 dark:text-success-400"
                  : "text-danger-600 dark:text-danger-400")
              }
              aria-hidden="true"
            />
            <span
              className={
                up
                  ? "text-success-600 dark:text-success-400"
                  : "text-danger-600 dark:text-danger-400"
              }
            >
              {formatPercentage(change)}
            </span>
            <span className="text-neutral-400">vs previous period</span>
          </div>
        </div>
        <div className={"flex h-11 w-11 shrink-0 items-center justify-center rounded-xl " + cls}>
          <AtlasIcon name={icon} className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
    </AtlasCard>
  );
}