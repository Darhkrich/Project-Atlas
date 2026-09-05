/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AtlasCard } from "@/components/atlas/card";
import { AtlasSkeleton } from "@/components/atlas/skeleton";
import { AtlasErrorState } from "@/components/atlas/error-state";
import { AtlasBadge } from "@/components/atlas/badge";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { useResellerData } from "@/contexts/reseller-data-context";
import { useStorefront } from "@/contexts/storefront-context";
import { StorefrontPurchaseFlow } from "@/components/reseller/storefront/storefront-purchase-flow";

/* -------------------------------------------------------------------------- */
/* Static Local Data (For the Mockup's specific layout)                       */
/* -------------------------------------------------------------------------- */

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
  { label: "Price Management", description: "Set your selling prices", icon: "settings" as AtlasIconName },
  { label: "Bulk Transactions", description: "Process multiple orders", icon: "layers" as AtlasIconName },
  { label: "Transaction Reports", description: "Track your performance", icon: "chart-bar" as AtlasIconName },
  { label: "API Access", description: "Integrate with your systems", icon: "code" as AtlasIconName },
];

const topServices = [
  { label: "Data", percentage: 42, icon: "globe" as AtlasIconName, color: "bg-green-500" },
  { label: "Airtime", percentage: 28, icon: "phone" as AtlasIconName, color: "bg-orange-500" },
  { label: "Electricity", percentage: 14, icon: "zap" as AtlasIconName, color: "bg-yellow-500" },
  { label: "Cable TV", percentage: 10, icon: "tv" as AtlasIconName, color: "bg-purple-500" },
  { label: "Others", percentage: 6, icon: "more-horizontal" as AtlasIconName, color: "bg-neutral-500" },
];

/* -------------------------------------------------------------------------- */
/* Loading & Error State                                                      */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/* Main Component                                                             */
/* -------------------------------------------------------------------------- */

export function ResellerOverview() {
  const { orders, customers } = useResellerData();
  const { config } = useStorefront();
  const [loading, setLoading] = useState(true);
  const [quickSellService, setQuickSellService] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const kpis = useMemo(() => {
    const totalOrders = orders.length;
    const totalCustomers = customers.length;
    const totalSales = orders.reduce((sum, order) => {
      const amount = parseFloat(order.amount.replace(/[^0-9.]/g, ""));
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    const todaySales = orders
      .filter((o) => o.date === "Just now" || o.date === "Today")
      .reduce((sum, order) => {
        const amount = parseFloat(order.amount.replace(/[^0-9.]/g, ""));
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);

    return [
      { label: "Today's Sales", value: `GH₵ ${todaySales.toFixed(2)}`, change: "+12.5%", trend: "up" as const },
      { label: "Total Orders", value: totalOrders.toString(), change: "+20.3%", trend: "up" as const },
      { label: "Customers", value: totalCustomers.toString(), change: "+18.7%", trend: "up" as const },
      { label: "Wallet Balance", value: "GH₵ 850.00", change: "", trend: "up" as const },
    ];
  }, [orders, customers]);

  if (loading) return <ResellerOverviewSkeleton />;

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
                <h2 className="text-xl font-bold md:text-2xl">Welcome back, Kofi Appiah 👋</h2>
                <p className="mt-2 max-w-md text-sm text-neutral-300">
                  Manage your digital services business with Atlas. Sell, earn and grow - all in one place.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2">
                  <AtlasIcon name="zap" className="h-5 w-5 text-yellow-400" />
                  <div>
                    <p className="text-xs font-semibold">Fast Transactions</p>
                    <p className="hidden text-[10px] text-neutral-300 sm:block">Instant processing</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2">
                  <AtlasIcon name="shield" className="h-5 w-5 text-green-400" />
                  <div>
                    <p className="text-xs font-semibold">Secure Platform</p>
                    <p className="hidden text-[10px] text-neutral-300 sm:block">Bank-level security</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2">
                  <AtlasIcon name="headphones" className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-xs font-semibold">24/7 Support</p>
                    <p className="hidden text-[10px] text-neutral-300 sm:block">Always here</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-transparent to-white/5" />
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {kpis.map((kpi, idx) => (
              <AtlasCard key={idx} className="p-5">
                <div className="flex items-start justify-between">
                  <p className="text-sm text-neutral-500">{kpi.label}</p>
                  <AtlasIcon
                    name={["wallet", "trending-up", "receipt", "coins"][idx] as AtlasIconName}
                    className={`h-4 w-4 ${["text-green-600", "text-blue-600", "text-purple-600", "text-yellow-600"][idx]}`}
                  />
                </div>
                <p className="mt-2 text-2xl font-bold text-neutral-900 dark:text-white">{kpi.value}</p>
                {kpi.change ? (
                  <p className="mt-2 text-xs font-medium text-green-600">
                    <AtlasIcon name="trending-up" className="mr-1 inline h-3 w-3" />
                    {kpi.change} vs yesterday
                  </p>
                ) : (
                  <button className="mt-2 w-full rounded-lg bg-[#12251C] py-2 text-xs font-semibold text-white hover:bg-[#0d1a14]">
                    Fund Wallet +
                  </button>
                )}
              </AtlasCard>
            ))}
          </div>

          {/* Quick Sell */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Quick Sell</h2>
              <Link href="/reseller/storefront" className="text-sm font-medium text-brand-800 hover:underline">
                View Storefront →
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
                    <AtlasIcon name={action.icon} className="h-5 w-5 text-neutral-700" />
                  </div>
                  <p className="mt-3 text-sm font-semibold">{action.label}</p>
                  <p className="mt-0.5 text-xs text-neutral-500">{action.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Transactions */}
          <AtlasCard padding="none" className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4 dark:border-neutral-800">
              <h2 className="text-lg font-semibold">Recent Transactions</h2>
              <Link href="/reseller/orders" className="text-sm font-medium text-brand-800 hover:underline">View All</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[600px]">
                <thead className="bg-neutral-50 text-xs uppercase text-neutral-500 dark:bg-neutral-900/50 dark:text-neutral-400">
                  <tr>
                    <th className="px-6 py-3 font-medium">Service</th>
                    <th className="px-6 py-3 font-medium">Customer</th>
                    <th className="px-6 py-3 font-medium">Amount</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {recentOrders.length > 0 ? (
                    recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                              <AtlasIcon name={(order.icon || "phone") as AtlasIconName} className="h-4 w-4 text-neutral-600" />
                            </div>
                            <span className="font-medium">{order.service}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-neutral-600 dark:text-neutral-300">{order.customer}</td>
                        <td className="px-6 py-4 font-medium">{order.amount}</td>
                        <td className="px-6 py-4"><AtlasBadge variant={order.statusVariant}>{order.status}</AtlasBadge></td>
                        <td className="px-6 py-4 text-neutral-500">{order.date}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-neutral-500">
                        No orders yet. Orders from your storefront will appear here.
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
                <Link key={tool.label} href="#" className="group rounded-xl border border-neutral-200 bg-white p-5 transition-all hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                    <AtlasIcon name={tool.icon} className="h-5 w-5 text-neutral-700" />
                  </div>
                  <p className="mt-3 text-sm font-semibold">{tool.label}</p>
                  <p className="mt-1 text-xs text-neutral-500">{tool.description}</p>
                  <AtlasIcon name="arrow-right" className="mt-3 h-4 w-4 text-neutral-400 transition-transform group-hover:translate-x-1" />
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
              <button className="text-xs font-medium text-neutral-500 hover:text-neutral-900">This Week ▾</button>
            </div>
            <div className="mt-4 h-32 rounded-lg bg-neutral-50 p-4 dark:bg-neutral-900">
              <div className="flex h-full items-end gap-2">
                {[40, 65, 45, 90, 75, 55, 80].map((height, i) => (
                  <div key={i} className="flex-1 rounded-t bg-brand-800 dark:bg-brand-400" style={{ height: `${height}%` }} />
                ))}
              </div>
              <div className="mt-2 flex justify-between text-[10px] text-neutral-400">
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
              </div>
            </div>
            <div className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 dark:bg-green-900/30">
              GHS 1,240
            </div>
          </AtlasCard>

          {/* Top Services */}
          <AtlasCard className="p-5">
            <h2 className="mb-4 text-base font-semibold">Top Services</h2>
            <div className="space-y-4">
              {topServices.map((service) => (
                <div key={service.label}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <AtlasIcon name={service.icon} className="h-4 w-4 text-neutral-500" />
                      <span className="font-medium">{service.label}</span>
                    </div>
                    <span className="text-neutral-500">{service.percentage}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-neutral-100 dark:bg-neutral-800">
                    <div className={`h-2 rounded-full ${service.color}`} style={{ width: `${service.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </AtlasCard>

          {/* Boost Your Earnings */}
          <AtlasCard className="border-green-100 bg-green-50 p-5 dark:bg-green-950/30">
            <AtlasIcon name="rocket" className="h-8 w-8 text-green-600" />
            <h2 className="mt-3 text-base font-semibold text-green-900 dark:text-white">Boost Your Earnings</h2>
            <p className="mt-1 text-sm text-green-700 dark:text-neutral-400">Sell more with competitive reseller rates.</p>
            <button className="mt-4 w-full rounded-lg bg-white py-2 text-xs font-semibold text-green-700 shadow-sm hover:bg-green-100 dark:bg-neutral-900 dark:text-neutral-300">
              View Price List →
            </button>
          </AtlasCard>

          {/* Support */}
          <AtlasCard className="p-5">
            <h2 className="text-base font-semibold">Support</h2>
            <p className="mt-1 text-sm text-neutral-500">Need help with a transaction or your account?</p>
            <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-200 py-2 text-xs font-semibold hover:bg-neutral-50 dark:border-neutral-700">
              <AtlasIcon name="headphones" className="h-4 w-4" />
              Contact Support
            </button>
          </AtlasCard>

          {/* Account Status */}
          <AtlasCard className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Account Status</h2>
              <AtlasBadge variant="success">Active</AtlasBadge>
            </div>
            <div className="mt-4 space-y-3">
              {[
                { text: "Verified Reseller", icon: "shield" },
                { text: "Account Verified", icon: "check-circle" },
                { text: "Business Active", icon: "check-circle" },
                { text: "Wallet Enabled", icon: "wallet" },
                { text: "Full Platform Access", icon: "grid" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <AtlasIcon name={item.icon as AtlasIconName} className="h-4 w-4 text-green-600" />
                  <span className="text-sm">{item.text}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-neutral-400">Member since May 2024</p>
          </AtlasCard>
        </div>
      </div>

      {/* Quick Sell Modal with clean StorefrontPurchaseFlow */}
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