import Link from "next/link";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import {
  merchantOverview,
  recentMerchantOrders,
  lowStockProducts,
} from "@/lib/mock-merchant";

export default function MerchantDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
            Good morning, {merchantOverview.merchantName}
          </h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Here&apos;s what&apos;s happening with {merchantOverview.storeName} today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success-50 px-3 py-1 text-xs font-medium text-success-700 dark:bg-success-900/30 dark:text-success-200">
            <span className="h-1.5 w-1.5 rounded-full bg-success-500"></span>
            Store is {merchantOverview.storeStatus}
          </span>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {merchantOverview.metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-500">{metric.label}</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                <AtlasIcon name={metric.icon} className="h-5 w-5 text-neutral-500" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {metric.value}
            </p>
            {metric.change && (
              <div className="mt-1 flex items-center gap-1">
                <span
                  className={cn(
                    "text-xs font-medium",
                    metric.trend === "up" ? "text-success-600" : "text-neutral-500"
                  )}
                >
                  {metric.change}
                </span>
                {metric.trend === "up" && (
                  <AtlasIcon name="arrow-up" className="h-3 w-3 text-success-600" />
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          Quick Actions
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {merchantOverview.quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="group flex flex-col items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 p-4 transition hover:border-brand-300 hover:bg-brand-50 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-brand-500 dark:hover:bg-brand-900/30"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-neutral-700 group-hover:bg-brand-100 dark:group-hover:bg-brand-900/40">
                <AtlasIcon
                  name={action.icon}
                  className="h-5 w-5 text-neutral-600 group-hover:text-brand-600 dark:text-neutral-300 dark:group-hover:text-brand-200"
                />
              </div>
              <span className="mt-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 group-hover:text-brand-700 dark:group-hover:text-brand-200">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent orders and low stock */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent orders */}
        <div className="lg:col-span-2 rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Recent Orders
            </h2>
            <Link
              href="/merchant/orders"
              className="text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              View All
            </Link>
          </div>
          <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {recentMerchantOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between px-5 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                    <AtlasIcon name="package" className="h-5 w-5 text-neutral-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {order.product}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {order.customer} · {order.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {order.amount}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                      order.statusVariant === "success"
                        ? "bg-success-50 text-success-700 dark:bg-success-900/30 dark:text-success-200"
                        : order.statusVariant === "warning"
                        ? "bg-warning-50 text-warning-700 dark:bg-warning-900/30 dark:text-warning-200"
                        : "bg-danger-50 text-danger-700 dark:bg-danger-900/30 dark:text-danger-200"
                    )}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low stock */}
        <div className="rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <div className="border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Low Stock
            </h2>
          </div>
          <div className="space-y-4 p-5">
            {lowStockProducts.map((product) => (
              <div key={product.id} className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                  <AtlasIcon name="alert" className="h-5 w-5 text-warning-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {product.name}
                  </p>
                  <p className="text-xs text-neutral-500">{product.stock} left</p>
                </div>
                <Link
                  href={`/merchant/products/${product.id}`}
                  className="text-sm font-medium text-brand-600 hover:text-brand-700"
                >
                  Restock
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}