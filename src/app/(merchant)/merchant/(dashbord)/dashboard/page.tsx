/* eslint-disable react-hooks/purity */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AtlasIcon } from "@/components/atlas/icons";
import { useStorefrontConfig } from "@/contexts/storefront-config-context";
import { useOrders } from "@/contexts/orders-context";
import { useStoreCustomers } from "@/contexts/store-customers-context";
import { useStoreProducts } from "@/contexts/store-products-context";
import { getMockMerchantOrders } from "@/lib/mock-merchant-orders";
import { cn } from "@/lib/utils";

function parseTotal(total: string | number): number {
  if (typeof total === "number") return total;
  const numericString = total.replace(/[^0-9.]/g, "");
  return parseFloat(numericString) || 0;
}

export default function MerchantDashboardPage() {
  const { storefrontConfig } = useStorefrontConfig();
  const { orders: realOrders } = useOrders();
  const { getCustomersForStore } = useStoreCustomers();
  const { getProductsForStore } = useStoreProducts();
  const storeSlug = storefrontConfig.slug;

  // Combine real and mock orders
  const allOrders = useMemo(() => {
    const mock = getMockMerchantOrders(storeSlug);
    return [...realOrders, ...mock];
  }, [realOrders, storeSlug]);

  const totalOrders = allOrders.length;
  const totalRevenue = allOrders.reduce((sum, order) => sum + parseTotal(order.total), 0);
  const todaySales = allOrders
    .filter((order) => order.date.toLowerCase().includes("today"))
    .reduce((sum, order) => sum + parseTotal(order.total), 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const totalCustomers = getCustomersForStore(storeSlug).length;
  const totalProducts = getProductsForStore(storeSlug).length;

  const lowStockProducts = getProductsForStore(storeSlug).filter(
    (product) => product.inStock && product.price && product.price < 70 // example threshold
  );

const recentOrders = useMemo(() => {
  return allOrders
    .slice()
    .sort((a, b) => {
      const aTime = (a as any).createdAt || (a as any).updatedAt || 0;
      const bTime = (b as any).createdAt || (b as any).updatedAt || 0;
      return bTime - aTime;
    })
    .slice(0, 5);
}, [allOrders]);
  const storeUrl = storefrontConfig.customDomain && storefrontConfig.customDomainStatus === "verified"
    ? `https://${storefrontConfig.customDomain}`
    : storefrontConfig.atlasDomain
    ? `https://${storefrontConfig.atlasDomain}`
    : storefrontConfig.subdomain
    ? `https://${storefrontConfig.subdomain}.atlas.com`
    : `https://atlas.com/ecommerce/${storefrontConfig.slug}`;

  const metrics = [
    { label: "Today's Sales", value: `GH₵ ${todaySales.toFixed(2)}`, icon: "sales", trend: "+12.5%" },
    { label: "Total Revenue", value: `GH₵ ${totalRevenue.toFixed(2)}`, icon: "wallet", trend: "+8.2%" },
    { label: "Avg Order Value", value: `GH₵ ${avgOrderValue.toFixed(2)}`, icon: "trending-up" },
    { label: "Customers", value: totalCustomers, icon: "users", trend: "+5.4%" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-gradient-to-r from-brand-50 via-white to-accent-50 p-6 dark:from-brand-900/30 dark:via-neutral-900 dark:to-accent-900/20 dark:border-neutral-800">
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
              Welcome back, {storefrontConfig.storeName}
            </h1>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              Here&apos;s what&apos;s happening with your store today.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success-50 px-3 py-1 text-xs font-medium text-success-700 ring-1 ring-success-200 dark:bg-success-900/30 dark:text-success-200 dark:ring-success-800">
              <span className="h-1.5 w-1.5 rounded-full bg-success-500"></span>
              Store is {storefrontConfig.status === "live" ? "Live" : "Draft"}
            </span>
            <Link
              href={storeUrl}
              target="_blank"
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
            >
              <AtlasIcon name="eye" className="h-4 w-4" />
              View Store
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {metrics.map((metric, index) => {
          const iconBgClasses = [
            "bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200",
            "bg-info-100 text-info-700 dark:bg-info-900/40 dark:text-info-200",
            "bg-accent-100 text-accent-700 dark:bg-accent-900/40 dark:text-accent-200",
            "bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200",
          ];
          return (
            <div key={metric.label} className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-5 transition hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs sm:text-sm font-medium text-neutral-500 truncate">{metric.label}</span>
                <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", iconBgClasses[index % iconBgClasses.length])}>
                  <AtlasIcon name={metric.icon as any} className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 truncate">{metric.value}</p>
              {metric.trend && <p className="mt-1 text-xs font-medium text-success-600">{metric.trend}</p>}
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Quick Actions</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Add Product", href: "/merchant/products/new", icon: "add" },
            { label: "View Orders", href: "/merchant/orders", icon: "orders" },
            { label: "Customize Store", href: "/merchant/storefront", icon: "store" },
            { label: "View Analytics", href: "/merchant/analytics", icon: "bar-chart" },
          ].map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="group flex flex-col items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 p-4 transition hover:border-brand-300 hover:shadow-sm dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-brand-500"
            >
              <AtlasIcon name={action.icon as any} className="h-5 w-5 text-neutral-600 group-hover:text-brand-600" />
              <span className="mt-2 text-sm font-medium text-neutral-700 group-hover:text-brand-700 dark:text-neutral-300 dark:group-hover:text-brand-200">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Orders */}
        <div className="lg:col-span-2 rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Recent Orders</h2>
            <Link href="/merchant/orders" className="text-sm font-medium text-brand-600 hover:text-brand-700">View All</Link>
          </div>
          <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {recentOrders.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-neutral-500">No orders yet.</p>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                      <AtlasIcon name="package" className="h-5 w-5 text-neutral-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{order.orderNumber}</p>
                      <p className="text-xs text-neutral-500">{order.customerEmail} · {order.date}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    GH₵ {parseTotal(order.total).toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Stock */}
        <div className="rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <div className="border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Low Stock Alerts</h2>
          </div>
          <div className="p-5 space-y-4">
            {lowStockProducts.length === 0 ? (
              <p className="text-sm text-neutral-500">No low stock items.</p>
            ) : (
              lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <AtlasIcon name="alert" className="h-4 w-4 text-warning-500 shrink-0" />
                    <span className="truncate text-sm text-neutral-700 dark:text-neutral-300">{product.name}</span>
                  </div>
                  <Link href={`/merchant/products/${product.id}`} className="text-xs font-medium text-brand-600 hover:text-brand-700 shrink-0 ml-2">
                    Restock
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}