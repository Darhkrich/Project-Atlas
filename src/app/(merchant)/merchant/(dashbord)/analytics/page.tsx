/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useMemo } from "react";
import { AtlasIcon } from "@/components/atlas/icons";
import { useStorefrontConfig } from "@/contexts/storefront-config-context";
import { useOrders } from "@/contexts/orders-context";
import { useStoreCustomers } from "@/contexts/store-customers-context";
import { getMockMerchantOrders } from "@/lib/mock-merchant-orders";
import { cn } from "@/lib/utils";

function parseTotal(total: string | number): number {
  if (typeof total === "number") return total;
  const numericString = total.replace(/[^0-9.]/g, "");
  return parseFloat(numericString) || 0;
}

export default function MerchantAnalyticsPage() {
  const { storefrontConfig } = useStorefrontConfig();
  const { orders: realOrders } = useOrders();
  const { getCustomersForStore } = useStoreCustomers();
  const storeSlug = storefrontConfig.slug;

  const allOrders = useMemo(() => {
    const mock = getMockMerchantOrders(storeSlug);
    return [...realOrders, ...mock];
  }, [realOrders, storeSlug]);

  // KPI calculations
  const totalRevenue = allOrders.reduce((sum, order) => sum + parseTotal(order.total), 0);
  const totalOrders = allOrders.length;
  const successfulOrders = allOrders.filter((o) => o.status === "Delivered" || o.status === "Paid").length;
  const failedOrders = allOrders.filter((o) => o.status === "Failed").length;
  const totalCustomers = getCustomersForStore(storeSlug).length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Order status distribution
  const statusCounts = new Map<string, number>();
  allOrders.forEach((order) => {
    const status = order.status || "Unknown";
    statusCounts.set(status, (statusCounts.get(status) || 0) + 1);
  });

  const maxStatusCount = Math.max(...Array.from(statusCounts.values()), 1);

  // Popular products with revenue estimation (assume average price from orders)
  const productMap = new Map<string, { sales: number; revenue: number }>();
  allOrders.forEach((order) => {
    if (!Array.isArray(order.items)) return;
    order.items.forEach((item: any) => {
      const current = productMap.get(item.name) || { sales: 0, revenue: 0 };
      current.sales += item.quantity;
      current.revenue += item.quantity * item.price;
      productMap.set(item.name, current);
    });
  });

  const topProducts = Array.from(productMap.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Monthly sales trend (mock based on orders count)
  const monthlyTrend = [
    { month: "Jan", sales: totalRevenue * 0.6 },
    { month: "Feb", sales: totalRevenue * 0.75 },
    { month: "Mar", sales: totalRevenue * 0.9 },
    { month: "Apr", sales: totalRevenue * 1.1 },
    { month: "May", sales: totalRevenue * 1.0 },
    { month: "Jun", sales: totalRevenue * 1.2 },
  ];
  const maxTrendSales = Math.max(...monthlyTrend.map((m) => m.sales), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
          Analytics
        </h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          Monitor your store performance and make data-driven decisions.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <KpiCard label="Total Revenue" value={`GH₵ ${totalRevenue.toFixed(2)}`} icon="wallet" trend="+12.5%" />
        <KpiCard label="Total Orders" value={totalOrders} icon="orders" trend="+8.2%" />
        <KpiCard label="Avg Order Value" value={`GH₵ ${averageOrderValue.toFixed(2)}`} icon="trending-up" />
        <KpiCard label="Customers" value={totalCustomers} icon="users" trend="+5.4%" />
      </div>

      {/* Charts grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sales Trend */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 sm:p-6 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="text-sm font-semibold text-neutral-950 dark:text-white">Sales Trend</h2>
          <p className="text-xs text-neutral-500">Last 6 months</p>
          <div className="mt-4 flex h-40 items-end justify-between gap-2">
            {monthlyTrend.map((item) => (
              <div key={item.month} className="flex flex-1 flex-col items-center gap-2">
                <div className="relative flex h-32 w-full max-w-[40px] items-end justify-center">
                  <div
                    className="w-full rounded-t-md bg-brand-500"
                    style={{ height: `${(item.sales / maxTrendSales) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-neutral-500">{item.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 sm:p-6 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="text-sm font-semibold text-neutral-950 dark:text-white">Order Status</h2>
          <div className="mt-4 space-y-3">
            {Array.from(statusCounts.entries()).map(([status, count]) => (
              <div key={status}>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">{status}</span>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">{count}</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <div
                    className="h-full rounded-full bg-brand-500"
                    style={{ width: `${(count / maxStatusCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Products */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 sm:p-6 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="text-sm font-semibold text-neutral-950 dark:text-white">Top Products</h2>
          <div className="mt-4 space-y-4">
            {topProducts.length === 0 ? (
              <p className="text-sm text-neutral-500">No product sales yet.</p>
            ) : (
              topProducts.map((product) => (
                <div key={product.name} className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">{product.name}</p>
                    <p className="text-xs text-neutral-500">{product.sales} units sold</p>
                  </div>
                  <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    GH₵ {product.revenue.toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Performance Summary */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 sm:p-6 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="text-sm font-semibold text-neutral-950 dark:text-white">Performance</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-600">Total Orders</span>
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">{totalOrders}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Successful Orders</span>
              <span className="font-semibold text-success-600">{successfulOrders}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Failed Orders</span>
              <span className="font-semibold text-danger-600">{failedOrders}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Total Customers</span>
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">{totalCustomers}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  icon,
  trend,
}: {
  label: string;
  value: string | number;
  icon: any;
  trend?: string;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs sm:text-sm font-medium text-neutral-500 truncate">{label}</span>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-200">
          <AtlasIcon name={icon} className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-2 text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 truncate">{value}</p>
      {trend && (
        <p className="mt-1 text-xs font-medium text-success-600">{trend}</p>
      )}
    </div>
  );
}