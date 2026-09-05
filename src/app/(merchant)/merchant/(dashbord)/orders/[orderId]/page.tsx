/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";
import { AtlasIcon } from "@/components/atlas/icons";
import { getMockMerchantOrders, MerchantOrder, MerchantOrderStatus } from "@/lib/mock-merchant-orders";
import { useStorefrontConfig } from "@/contexts/storefront-config-context";
import { useOrders } from "@/contexts/orders-context";
import { cn } from "@/lib/utils";

const statusTransitions: MerchantOrderStatus[] = [
  "Paid",
  "Processing",
  "Shipped",
  "Delivered",
  "Refunded",
  "Cancelled",
];

export default function MerchantOrderDetailPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const { storefrontConfig } = useStorefrontConfig();
  const { orders: realOrders, updateOrderStatus } = useOrders();
  const storeSlug = storefrontConfig.slug;

  const realOrder = realOrders.find(
    (order) => order.id === orderId && order.storeSlug === storeSlug
  );

  const mockOrder = realOrder
    ? undefined
    : getMockMerchantOrders(storeSlug).find((order) => order.id === orderId);

  const [order, setOrder] = useState<MerchantOrder | null>(
    realOrder
      ? {
          id: realOrder.id,
          storeSlug: realOrder.storeSlug,
          orderNumber: realOrder.orderNumber,
          customerName: realOrder.customerEmail.split("@")[0] || "Customer",
          customerEmail: realOrder.customerEmail,
          date: realOrder.date,
          total: `GH₵ ${realOrder.total.toFixed(2)}`,
          items: realOrder.items.reduce((sum, item) => sum + item.quantity, 0),
          status: realOrder.status as MerchantOrder["status"],
          paymentMethod: "Mobile Money",
          itemsDetail: realOrder.items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            image: item.image,
          })),
        }
      : mockOrder || null
  );

  const [newStatus, setNewStatus] = useState<MerchantOrderStatus | null>(null);
  const [statusUpdated, setStatusUpdated] = useState(false);

  // If order changes (e.g., after real order update), update local state
  useEffect(() => {
    if (realOrder) {
      setOrder((prev) =>
        prev
          ? {
              ...prev,
              status: realOrder.status as MerchantOrder["status"],
            }
          : prev
      );
    }
  }, [realOrder]);

  const handleStatusChange = (status: MerchantOrderStatus) => {
    setNewStatus(status);
  };

  const applyStatusUpdate = () => {
    if (!order || !newStatus) return;

    if (realOrder) {
      // Update real order in context
      updateOrderStatus(realOrder.id, newStatus as any);
    }

    // Update local order state (for both real and mock)
    setOrder((prev) => (prev ? { ...prev, status: newStatus } : prev));
    setStatusUpdated(true);
    setTimeout(() => setStatusUpdated(false), 2000);
    setNewStatus(null);
  };

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h1 className="text-xl font-semibold text-neutral-900">Order not found</h1>
        <Link href="/merchant/orders" className="mt-4 text-brand-600">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/merchant/orders"
            className="text-sm font-medium text-neutral-500 hover:text-neutral-900"
          >
            ← Back to Orders
          </Link>
          <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
            Order {order.orderNumber}
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">{order.date}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Status Update Panel */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          Update Order Status
        </h2>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <select
            value={newStatus || order.status}
            onChange={(e) => handleStatusChange(e.target.value as MerchantOrderStatus)}
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          >
            {statusTransitions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <button
            onClick={applyStatusUpdate}
            disabled={!newStatus || newStatus === order.status}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Update Status
          </button>
        </div>
        {statusUpdated && (
          <p className="mt-2 text-sm text-success-600">Status updated successfully.</p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <div className="border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Items ({order.items})
              </h2>
            </div>
            <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {order.itemsDetail && order.itemsDetail.length > 0 ? (
                order.itemsDetail.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 px-5 py-4">
                    {item.image ? (
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-neutral-100">
                        <AtlasIcon name="package" className="h-6 w-6 text-neutral-400" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {item.name}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {item.quantity} × GH₵ {item.price.toFixed(2)}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      GH₵ {(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="px-5 py-8 text-center text-sm text-neutral-500">
                  No item details available.
                </p>
              )}
            </div>
          </div>

          {/* Customer information */}
          <div className="rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <div className="border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Customer
              </h2>
            </div>
            <div className="p-5">
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <span className="text-neutral-500">Name:</span> {order.customerName}
                </div>
                <div>
                  <span className="text-neutral-500">Email:</span> {order.customerEmail}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary sidebar */}
        <div className="space-y-6">
          <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Order Summary
            </h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-neutral-600">Subtotal</dt>
                <dd className="font-medium text-neutral-900 dark:text-neutral-100">
                  {order.total}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-600">Shipping</dt>
                <dd className="font-medium text-neutral-900 dark:text-neutral-100">Free</dd>
              </div>
              <div className="border-t border-neutral-200 pt-2 flex justify-between text-base dark:border-neutral-800">
                <dt className="font-semibold text-neutral-900 dark:text-neutral-100">Total</dt>
                <dd className="font-bold text-neutral-900 dark:text-neutral-100">{order.total}</dd>
              </div>
            </dl>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-neutral-600">Payment Method</span>
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                {order.paymentMethod}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  const statusClasses: Record<string, string> = {
    Paid: "bg-success-50 text-success-700 ring-success-200 dark:bg-success-900/30 dark:text-success-200 dark:ring-success-800",
    Pending: "bg-warning-50 text-warning-700 ring-warning-200 dark:bg-warning-900/30 dark:text-warning-200 dark:ring-warning-800",
    Processing: "bg-info-50 text-info-700 ring-info-200 dark:bg-info-900/30 dark:text-info-200 dark:ring-info-800",
    Shipped: "bg-info-50 text-info-700 ring-info-200 dark:bg-info-900/30 dark:text-info-200 dark:ring-info-800",
    Delivered: "bg-brand-50 text-brand-700 ring-brand-200 dark:bg-brand-900/30 dark:text-brand-200 dark:ring-brand-800",
    Failed: "bg-danger-50 text-danger-700 ring-danger-200 dark:bg-danger-900/30 dark:text-danger-200 dark:ring-danger-800",
    Refunded: "bg-neutral-100 text-neutral-600 ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:ring-neutral-700",
  };

  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1", statusClasses[status] || statusClasses.Paid)}>
      {status}
    </span>
  );
}