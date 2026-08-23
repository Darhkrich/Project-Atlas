/* eslint-disable react/no-unescaped-entities */
"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import {
  mockMerchantOrderDetail,
  fallbackOrderDetail,
} from "@/lib/mock-merchant-order-detail";

export default function MerchantOrderDetailPage() {
  const params = useParams();
  const orderId = params.orderId as string;

  const order = mockMerchantOrderDetail[orderId] || fallbackOrderDetail;

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
          <AtlasIcon name="alert" className="h-8 w-8 text-neutral-500" />
        </div>
        <h1 className="mt-4 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          Order not found
        </h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          The order you're looking for doesn't exist.
        </p>
        <Link
          href="/merchant/orders"
          className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/merchant/orders"
            className="inline-flex items-center gap-1 text-sm font-medium text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
          >
            <AtlasIcon name="arrow-left" className="h-4 w-4" />
            Back to Orders
          </Link>
          <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
            Order {order.orderNumber}
          </h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            {order.date}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800">
            <AtlasIcon name="file-text" className="h-5 w-5" />
            Print Invoice
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-colors">
            <AtlasIcon name="check" className="h-5 w-5" />
            Mark as Shipped
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order items */}
          <div className="rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <div className="border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Items ({order.items.length})
              </h2>
            </div>
            <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-2xl dark:bg-neutral-800">
                    {item.image}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {item.name}
                    </p>
                    <p className="text-xs text-neutral-500">SKU: {item.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {item.totalPrice}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {item.quantity} × {item.unitPrice}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order timeline */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Order Timeline
            </h2>
            <div className="mt-4 space-y-6">
              {order.timeline.map((event, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full border-2",
                        event.status === "completed"
                          ? "bg-success-100 border-success-500 text-success-600 dark:bg-success-900/30 dark:border-success-500 dark:text-success-200"
                          : event.status === "current"
                          ? "bg-brand-100 border-brand-500 text-brand-600 dark:bg-brand-900/30 dark:border-brand-500 dark:text-brand-200"
                          : "bg-neutral-100 border-neutral-300 text-neutral-400 dark:bg-neutral-800 dark:border-neutral-700"
                      )}
                    >
                      {event.status === "completed" ? (
                        <AtlasIcon name="check" className="h-4 w-4" />
                      ) : event.status === "current" ? (
                        <AtlasIcon name="clock" className="h-4 w-4" />
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-current" />
                      )}
                    </div>
                    {index < order.timeline.length - 1 && (
                      <div
                        className={cn(
                          "w-px flex-1",
                          event.status === "completed"
                            ? "bg-success-500"
                            : "bg-neutral-300 dark:bg-neutral-700"
                        )}
                      />
                    )}
                  </div>
                  <div className="pb-2">
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {event.title}
                    </p>
                    <p className="text-xs text-neutral-500">{event.description}</p>
                    <p className="text-xs text-neutral-400 mt-1">{event.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Customer info */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Customer
            </h2>
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3">
                <AtlasIcon name="user" className="h-5 w-5 text-neutral-400" />
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {order.customer.name}
                  </p>
                  <p className="text-xs text-neutral-500">{order.customer.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <AtlasIcon name="phone" className="h-5 w-5 text-neutral-400" />
                <p className="text-sm text-neutral-600 dark:text-neutral-300">
                  {order.customer.phone}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <AtlasIcon name="home" className="h-5 w-5 text-neutral-400 mt-0.5" />
                <p className="text-sm text-neutral-600 dark:text-neutral-300">
                  {order.customer.address}
                  <br />
                  {order.customer.city}, {order.customer.country}
                </p>
              </div>
            </div>
          </div>

          {/* Payment summary */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Payment Summary
            </h2>
            <dl className="mt-4 space-y-2">
              <div className="flex justify-between">
                <dt className="text-sm text-neutral-500">Subtotal</dt>
                <dd className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {order.subtotal}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-neutral-500">Shipping</dt>
                <dd className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {order.shipping}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-neutral-500">Discount</dt>
                <dd className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {order.discount}
                </dd>
              </div>
              <div className="border-t border-neutral-200 pt-2 mt-2 flex justify-between dark:border-neutral-800">
                <dt className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  Total
                </dt>
                <dd className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  {order.total}
                </dd>
              </div>
            </dl>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-neutral-500">Payment Method</span>
              <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {order.paymentMethod}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm text-neutral-500">Payment Status</span>
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1",
                  order.paymentStatus === "Paid"
                    ? "bg-success-50 text-success-700 ring-success-200 dark:bg-success-900/30 dark:text-success-200 dark:ring-success-800"
                    : order.paymentStatus === "Pending"
                    ? "bg-warning-50 text-warning-700 ring-warning-200 dark:bg-warning-900/30 dark:text-warning-200 dark:ring-warning-800"
                    : "bg-danger-50 text-danger-700 ring-danger-200 dark:bg-danger-900/30 dark:text-danger-200 dark:ring-danger-800"
                )}
              >
                {order.paymentStatus}
              </span>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Notes
              </h2>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                {order.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}