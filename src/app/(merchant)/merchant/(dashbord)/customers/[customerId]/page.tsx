"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import {
  mockMerchantCustomerDetails,
  fallbackCustomerDetail,
} from "@/lib/mock-merchant-customer-detail";

function OrderStatusBadge({ status }: { status: string }) {
  const statusClasses: Record<string, string> = {
    Paid: "bg-success-50 text-success-700 ring-success-200 dark:bg-success-900/30 dark:text-success-200 dark:ring-success-800",
    Pending: "bg-warning-50 text-warning-700 ring-warning-200 dark:bg-warning-900/30 dark:text-warning-200 dark:ring-warning-800",
    Processing: "bg-info-50 text-info-700 ring-info-200 dark:bg-info-900/30 dark:text-info-200 dark:ring-info-800",
    Delivered: "bg-brand-50 text-brand-700 ring-brand-200 dark:bg-brand-900/30 dark:text-brand-200 dark:ring-brand-800",
    Failed: "bg-danger-50 text-danger-700 ring-danger-200 dark:bg-danger-900/30 dark:text-danger-200 dark:ring-danger-800",
    Refunded: "bg-neutral-100 text-neutral-600 ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:ring-neutral-700",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1",
        statusClasses[status] || statusClasses.Paid
      )}
    >
      {status}
    </span>
  );
}

export default function MerchantCustomerDetailPage() {
  const params = useParams();
  const customerId = params.customerId as string;

  const customer = mockMerchantCustomerDetails[customerId] || fallbackCustomerDetail;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/merchant/customers"
            className="inline-flex items-center gap-1 text-sm font-medium text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
          >
            <AtlasIcon name="arrow-left" className="h-4 w-4" />
            Back to Customers
          </Link>
          <div className="mt-2 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-lg font-semibold text-brand-700 dark:bg-brand-900/30 dark:text-brand-200">
              {customer.name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
                {customer.name}
              </h1>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">{customer.email}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800">
            <AtlasIcon name="send" className="h-5 w-5" />
            Email
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-colors">
            <AtlasIcon name="phone" className="h-5 w-5" />
            Call
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-sm text-neutral-500">Total Orders</p>
          <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {customer.totalOrders}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-sm text-neutral-500">Total Spent</p>
          <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {customer.totalSpent}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-sm text-neutral-500">Last Activity</p>
          <p className="mt-1 text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {customer.lastActivity || "—"}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-sm text-neutral-500">Status</p>
          <span
            className={cn(
              "mt-1 inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1",
              customer.status === "Active"
                ? "bg-success-50 text-success-700 ring-success-200 dark:bg-success-900/30 dark:text-success-200 dark:ring-success-800"
                : "bg-neutral-100 text-neutral-600 ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:ring-neutral-700"
            )}
          >
            {customer.status}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Orders */}
          <div className="rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <div className="border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Recent Orders
              </h2>
            </div>
            <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {customer.orders.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-neutral-500">
                  No orders yet.
                </p>
              ) : (
                customer.orders.map((order) => (
                  <div
                    key={order.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-5 py-4 gap-2"
                  >
                    <div>
                      <Link
                        href={`/merchant/orders/${order.id}`}
                        className="text-sm font-medium text-brand-600 hover:text-brand-700"
                      >
                        {order.orderNumber}
                      </Link>
                      <p className="text-xs text-neutral-500">
                        {order.date} · {order.items} items
                      </p>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {order.total}
                      </span>
                      <OrderStatusBadge status={order.status} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Transaction History */}
          <div className="rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <div className="border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Transaction History
              </h2>
            </div>
            <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {customer.transactions.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-neutral-500">
                  No transactions yet.
                </p>
              ) : (
                customer.transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-5 py-4 gap-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {tx.description}
                      </p>
                      <p className="text-xs text-neutral-500">{tx.date}</p>
                    </div>
                    <span
                      className={cn(
                        "text-sm font-medium",
                        tx.type === "credit"
                          ? "text-success-600 dark:text-success-200"
                          : "text-neutral-900 dark:text-neutral-100"
                      )}
                    >
                      {tx.type === "credit" ? "+" : ""}
                      {tx.amount}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Contact info */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Contact Information
            </h2>
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3">
                <AtlasIcon name="phone" className="h-5 w-5 text-neutral-400" />
                <span className="text-sm text-neutral-600 dark:text-neutral-300">
                  {customer.phone || "—"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <AtlasIcon name="message-circle" className="h-5 w-5 text-neutral-400" />
                <span className="text-sm text-neutral-600 dark:text-neutral-300">
                  {customer.email || "—"}
                </span>
              </div>
              <div className="flex items-start gap-3">
                <AtlasIcon name="home" className="h-5 w-5 text-neutral-400 mt-0.5" />
                <span className="text-sm text-neutral-600 dark:text-neutral-300">
                  {customer.address || "—"}
                  <br />
                  {customer.city}, {customer.country}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {customer.notes && (
            <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Notes
              </h2>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                {customer.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}