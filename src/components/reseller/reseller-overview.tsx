/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AtlasCard } from "@/components/atlas/card";
import { AtlasSkeleton } from "@/components/atlas/skeleton";
import { AtlasBadge } from "@/components/atlas/badge";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { useResellerOverview } from "@/lib/reseller/hooks/use-reseller-overview";
import { useStorefront } from "@/contexts/storefront-context";
import { StorefrontPurchaseFlow } from "@/components/reseller/storefront/storefront-purchase-flow";
import { formatCurrency } from "@/lib/shared/format";
import { formatRelative } from "@/lib/shared/format";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_VARIANTS,
  ORDER_AUDIENCE_LABELS,
  ORDER_AUDIENCE_VARIANTS,
  serviceLabel,
} from "@/lib/admin/orders/orders-labels";

const quickSellActions = [
  { label: "Airtime", serviceId: "airtime", description: "Top up any network", icon: "phone" as AtlasIconName, bgClass: "bg-orange-100" },
  { label: "Data", serviceId: "data", description: "Sell data bundles", icon: "globe" as AtlasIconName, bgClass: "bg-green-100" },
  { label: "Electricity", serviceId: "electricity", description: "Pay power bills", icon: "zap" as AtlasIconName, bgClass: "bg-yellow-100" },
  { label: "Cable TV", serviceId: "cabletv", description: "TV subscriptions", icon: "tv" as AtlasIconName, bgClass: "bg-purple-100" },
  { label: "Internet", serviceId: "internet", description: "Internet bundles", icon: "wifi" as AtlasIconName, bgClass: "bg-blue-100" },
  { label: "Exam Pins", serviceId: "exampins", description: "Results checker", icon: "book" as AtlasIconName, bgClass: "bg-indigo-100" },
  { label: "Bills", serviceId: "billpayments", description: "Pay utility bills", icon: "receipt" as AtlasIconName, bgClass: "bg-sky-100" },
  { label: "Gift Cards", serviceId: "giftcards", description: "Digital gift cards", icon: "gift" as AtlasIconName, bgClass: "bg-pink-100" },
];

const resellerTools = [
  { label: "Price Management", description: "Set your selling prices", icon: "settings" as AtlasIconName, href: "/reseller/services" },
  { label: "Transaction Reports", description: "Track your performance", icon: "bar-chart" as AtlasIconName, href: "/reseller/analytics" },
  { label: "Orders", description: "See every order", icon: "receipt" as AtlasIconName, href: "/reseller/orders" },
  { label: "Wallet", description: "Fund and withdraw", icon: "wallet" as AtlasIconName, href: "/reseller/wallet" },
];

function ResellerOverviewSkeleton() {
  return (
    <div className="space-y-6">
      <AtlasSkeleton className="h-36 w-full" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <AtlasSkeleton key={index} className="h-32 w-full" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 space-y-6">
          <AtlasSkeleton className="h-[300px] w-full" />
          <AtlasSkeleton className="h-[250px] w-full" />
        </div>
        <div className="space-y-6">
          <AtlasSkeleton className="h-64 w-full" />
          <AtlasSkeleton className="h-64 w-full" />
        </div>
      </div>
    </div>
  );
}

export function ResellerOverview() {
  const {
    reseller,
    orders,
    ordersSummary,
    customers,
    wallet,
    nowMs,
    loading,
  } = useResellerOverview();
  const { config } = useStorefront();
  const [quickSellService, setQuickSellService] = useState<string | null>(null);

  const resellerStatus = (reseller as { status?: string } | null)?.status;
  const resellerJoinedAt = (reseller as { joinedAt?: string } | null)?.joinedAt;

  const walletBalance = wallet.wallet?.record.balance ?? 0;

  const topServices = useMemo(() => {
    const counts = new Map<string, { count: number; revenue: number }>();
    for (const o of orders) {
      const current = counts.get(o.serviceId) ?? { count: 0, revenue: 0 };
      current.count += 1;
      if (o.status === "successful") current.revenue += o.amount;
      counts.set(o.serviceId, current);
    }
    const total = orders.length;
    const list = Array.from(counts.entries())
      .map(([serviceId, data]) => ({
        serviceId,
        label: serviceLabel(serviceId),
        count: data.count,
        revenue: data.revenue,
        percentage: total > 0 ? Math.round((data.count / total) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    return list;
  }, [orders]);

  const performanceSeries = useMemo(() => {
    if (nowMs === null) {
      return Array.from({ length: 7 }, () => ({
        label: "",
        sales: 0,
        orders: 0,
      }));
    }
    const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const buckets = Array.from({ length: 7 }, (_, i) => {
      const dayStartMs = nowMs - (6 - i) * 86_400_000;
      const d = new Date(dayStartMs);
      return {
        start: Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
        label: dayLabels[d.getUTCDay()],
        sales: 0,
        orders: 0,
      };
    });
    const endOfToday = buckets[6].start + 86_400_000;
    for (const o of orders) {
      const t = new Date(o.createdAt).getTime();
      if (Number.isNaN(t)) continue;
      for (const bucket of buckets) {
        if (t >= bucket.start && t < bucket.start + 86_400_000) {
          bucket.orders += 1;
          if (o.status === "successful") bucket.sales += o.amount;
          break;
        }
      }
    }
    void endOfToday;
    return buckets;
  }, [orders, nowMs]);

  const maxSales = Math.max(...performanceSeries.map((b) => b.sales), 1);
  const weekTotal = performanceSeries.reduce((sum, b) => sum + b.sales, 0);

  const accountStatusChecks = useMemo(() => {
    if (!reseller) return [];
    return [
      {
        text: "Verified reseller",
        ok: reseller.verificationStatus === "verified",
      },
      {
        text: "Account active",
        ok: resellerStatus === "active",
      },
      {
        text: "Wallet enabled",
        ok: walletBalance > 0 || resellerStatus === "active",
      },
      {
        text: "Full platform access",
        ok: resellerStatus === "active",
      },
    ];
  }, [reseller, resellerStatus, walletBalance]);

  if (loading || !reseller) return <ResellerOverviewSkeleton />;

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Left Column */}
        <div className="space-y-6 xl:col-span-2">
          {/* Welcome Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-[#12251C] p-6 text-white shadow-lg">
            <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-bold md:text-2xl">
                  Welcome back, {reseller.name}
                </h2>
                <p className="mt-2 max-w-md text-sm text-neutral-300">
                  Manage your digital services business with Atlas. Sell, earn
                  and grow - all in one place.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2">
                  <AtlasIcon name="zap" className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                  <div>
                    <p className="text-xs font-semibold">Fast Transactions</p>
                    <p className="hidden text-[10px] text-neutral-300 sm:block">
                      Instant processing
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2">
                  <AtlasIcon name="shield" className="h-5 w-5 text-green-400" aria-hidden="true" />
                  <div>
                    <p className="text-xs font-semibold">Secure Platform</p>
                    <p className="hidden text-[10px] text-neutral-300 sm:block">
                      Bank-level security
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2">
                  <AtlasIcon name="headphones" className="h-5 w-5 text-blue-400" aria-hidden="true" />
                  <div>
                    <p className="text-xs font-semibold">24/7 Support</p>
                    <p className="hidden text-[10px] text-neutral-300 sm:block">
                      Always here
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-transparent to-white/5" />
          </div>

          {/* KPI Cards */}
          <div
            role="region"
            aria-label="Reseller dashboard summary"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <AtlasCard className="p-5">
              <div className="flex items-start justify-between">
                <p className="text-sm text-neutral-500">Today&apos;s Sales</p>
                <AtlasIcon name="trending-up" className="h-4 w-4 text-green-600" aria-hidden="true" />
              </div>
              <p className="mt-2 text-2xl font-bold text-neutral-900 dark:text-white">
                {formatCurrency(ordersSummary.todayRevenue)}
              </p>
              <p className="mt-2 text-xs text-neutral-500">
                {ordersSummary.todayOrders} {ordersSummary.todayOrders === 1 ? "order" : "orders"}
              </p>
            </AtlasCard>

            <AtlasCard className="p-5">
              <div className="flex items-start justify-between">
                <p className="text-sm text-neutral-500">Total Orders</p>
                <AtlasIcon name="receipt" className="h-4 w-4 text-blue-600" aria-hidden="true" />
              </div>
              <p className="mt-2 text-2xl font-bold text-neutral-900 dark:text-white">
                {ordersSummary.totalOrders}
              </p>
              <p className="mt-2 text-xs text-neutral-500">
                {ordersSummary.successfulCount} successful
              </p>
            </AtlasCard>

            <AtlasCard className="p-5">
              <div className="flex items-start justify-between">
                <p className="text-sm text-neutral-500">Customers</p>
                <AtlasIcon name="users" className="h-4 w-4 text-purple-600" aria-hidden="true" />
              </div>
              <p className="mt-2 text-2xl font-bold text-neutral-900 dark:text-white">
                {customers.length}
              </p>
              <p className="mt-2 text-xs text-neutral-500">
                On your storefront
              </p>
            </AtlasCard>

            <AtlasCard className="p-5">
              <div className="flex items-start justify-between">
                <p className="text-sm text-neutral-500">Wallet Balance</p>
                <AtlasIcon name="wallet" className="h-4 w-4 text-yellow-600" aria-hidden="true" />
              </div>
              <p className="mt-2 text-2xl font-bold text-neutral-900 dark:text-white">
                {formatCurrency(walletBalance)}
              </p>
              <Link
                href="/reseller/wallet"
                className="mt-2 block w-full rounded-lg bg-[#12251C] py-2 text-center text-xs font-semibold text-white hover:bg-[#0d1a14]"
              >
                Fund Wallet
              </Link>
            </AtlasCard>
          </div>

          {/* Quick Sell */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Quick Sell</h2>
              <Link
                href="/reseller/storefront"
                className="text-sm font-medium text-brand-800 hover:underline"
              >
                View Storefront
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {quickSellActions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => setQuickSellService(action.serviceId)}
                  className="group rounded-xl border border-neutral-200 bg-white p-4 text-left transition-all hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${action.bgClass}`}>
                    <AtlasIcon name={action.icon} className="h-5 w-5 text-neutral-700" aria-hidden="true" />
                  </div>
                  <p className="mt-3 text-sm font-semibold">{action.label}</p>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {action.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Transactions */}
          <AtlasCard padding="none" className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4 dark:border-neutral-800">
              <h2 className="text-lg font-semibold">Recent Orders</h2>
              <Link
                href="/reseller/orders"
                className="text-sm font-medium text-brand-800 hover:underline"
              >
                View All
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[600px]">
                <caption className="sr-only">Recent reseller orders</caption>
                <thead className="bg-neutral-50 text-xs uppercase text-neutral-500 dark:bg-neutral-900/50 dark:text-neutral-400">
                  <tr>
                    <th scope="col" className="px-6 py-3 font-medium">Service</th>
                    <th scope="col" className="px-6 py-3 font-medium">Customer</th>
                    <th scope="col" className="px-6 py-3 font-medium">Audience</th>
                    <th scope="col" className="px-6 py-3 font-medium">Amount</th>
                    <th scope="col" className="px-6 py-3 font-medium">Status</th>
                    <th scope="col" className="px-6 py-3 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {recentOrders.length > 0 ? (
                    recentOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
                      >
                        <td className="px-6 py-4">
                          <span className="font-medium">
                            {serviceLabel(order.serviceId)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-neutral-600 dark:text-neutral-300">
                          {order.customerName}
                        </td>
                        <td className="px-6 py-4">
                          <AtlasBadge variant={ORDER_AUDIENCE_VARIANTS[order.audience]}>
                            {ORDER_AUDIENCE_LABELS[order.audience]}
                          </AtlasBadge>
                        </td>
                        <td className="px-6 py-4 font-medium">
                          {formatCurrency(order.amount)}
                        </td>
                        <td className="px-6 py-4">
                          <AtlasBadge variant={ORDER_STATUS_VARIANTS[order.status]}>
                            {ORDER_STATUS_LABELS[order.status]}
                          </AtlasBadge>
                        </td>
                        <td className="px-6 py-4 text-neutral-500">
                          {nowMs ? formatRelative(order.createdAt, nowMs) : "—"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-8 text-center text-neutral-500"
                      >
                        No orders yet. Orders from your storefront will appear
                        here.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </AtlasCard>

          {/* Reseller Tools */}
          <div>
            <h2 className="mb-3 text-lg font-semibold">Reseller Tools</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {resellerTools.map((tool) => (
                <Link
                  key={tool.label}
                  href={tool.href}
                  className="group rounded-xl border border-neutral-200 bg-white p-5 transition-all hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                    <AtlasIcon name={tool.icon} className="h-5 w-5 text-neutral-700" aria-hidden="true" />
                  </div>
                  <p className="mt-3 text-sm font-semibold">{tool.label}</p>
                  <p className="mt-1 text-xs text-neutral-500">
                    {tool.description}
                  </p>
                  <AtlasIcon
                    name="arrow-right"
                    className="mt-3 h-4 w-4 text-neutral-400 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Business Performance */}
          <AtlasCard className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Business Performance</h2>
              <span className="text-xs font-medium text-neutral-500">
                Last 7 days
              </span>
            </div>
            <div className="mt-4 h-32 rounded-lg bg-neutral-50 p-4 dark:bg-neutral-900">
              <div className="flex h-full items-end gap-2">
                {performanceSeries.map((bucket, i) => {
                  const height = Math.max((bucket.sales / maxSales) * 100, 4);
                  return (
                    <div
                      key={i}
                      className="flex-1 rounded-t bg-brand-800 dark:bg-brand-400"
                      style={{ height: `${height}%` }}
                      title={formatCurrency(bucket.sales)}
                    />
                  );
                })}
              </div>
              <div className="mt-2 flex justify-between text-[10px] text-neutral-400">
                {performanceSeries.map((bucket, i) => (
                  <span key={i}>{bucket.label}</span>
                ))}
              </div>
            </div>
            <div className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 dark:bg-green-900/30">
              {formatCurrency(weekTotal)}
            </div>
          </AtlasCard>

          {/* Top Services */}
          <AtlasCard className="p-5">
            <h2 className="mb-4 text-base font-semibold">Top Services</h2>
            {topServices.length === 0 ? (
              <p className="text-sm text-neutral-500">
                No orders recorded yet.
              </p>
            ) : (
              <div className="space-y-4">
                {topServices.map((service) => (
                  <div key={service.serviceId}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium">{service.label}</span>
                      <span className="text-neutral-500">
                        {service.percentage}%
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-neutral-100 dark:bg-neutral-800">
                      <div
                        className="h-2 rounded-full bg-brand-600"
                        style={{ width: `${service.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AtlasCard>

          {/* Boost Your Earnings */}
          <AtlasCard className="border-green-100 bg-green-50 p-5 dark:bg-green-950/30">
            <AtlasIcon
              name="rocket"
              className="h-8 w-8 text-green-600"
              aria-hidden="true"
            />
            <h2 className="mt-3 text-base font-semibold text-green-900 dark:text-white">
              Boost Your Earnings
            </h2>
            <p className="mt-1 text-sm text-green-700 dark:text-neutral-400">
              Sell more with competitive reseller rates.
            </p>
            <Link
              href="/reseller/services"
              className="mt-4 block w-full rounded-lg bg-white py-2 text-center text-xs font-semibold text-green-700 shadow-sm hover:bg-green-100 dark:bg-neutral-900 dark:text-neutral-300"
            >
              View Services
            </Link>
          </AtlasCard>

          {/* Support */}
          <AtlasCard className="p-5">
            <h2 className="text-base font-semibold">Support</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Need help with a transaction or your account?
            </p>
            <Link
              href="/reseller/support"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-200 py-2 text-xs font-semibold hover:bg-neutral-50 dark:border-neutral-700"
            >
              <AtlasIcon name="headphones" className="h-4 w-4" aria-hidden="true" />
              Contact Support
            </Link>
          </AtlasCard>

          {/* Account Status */}
          <AtlasCard className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Account Status</h2>
              <AtlasBadge
                variant={reseller.status === "active" ? "success" : "warning"}
              >
                {reseller.status === "active"
                  ? "Active"
                  : reseller.status === "pending"
                  ? "Pending"
                  : "Suspended"}
              </AtlasBadge>
            </div>
            <div className="mt-4 space-y-3">
              {accountStatusChecks.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <AtlasIcon
                    name={item.ok ? "check" : "x"}
                    className={
                      item.ok
                        ? "h-4 w-4 text-green-600"
                        : "h-4 w-4 text-neutral-400"
                    }
                    aria-hidden="true"
                  />
                  <span className="text-sm text-neutral-600 dark:text-neutral-300">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-neutral-400">
              Member since{" "}
              {resellerJoinedAt
                ? new Date(resellerJoinedAt).toLocaleDateString("en-GH", {
                    month: "long",
                    year: "numeric",
                  })
                : "—"}
            </p>
          </AtlasCard>
        </div>
      </div>

      {quickSellService && (
        <StorefrontPurchaseFlow
          serviceId={quickSellService}
          config={config}
          resellerMode
          onClose={() => setQuickSellService(null)}
          onComplete={() => setQuickSellService(null)}
        />
      )}
    </div>
  );
}