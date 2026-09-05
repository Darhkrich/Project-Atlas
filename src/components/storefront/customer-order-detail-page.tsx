"use client";

import Link from "next/link";
import { useCustomerAuth } from "@/contexts/customer-auth-context";
import { useOrders } from "@/contexts/orders-context";
import type { MerchantStorefrontConfig } from "@/types/merchant-storefront";

interface CustomerOrderDetailPageProps {
  store: MerchantStorefrontConfig;
  orderId: string;
}

export function CustomerOrderDetailPage({
  store,
  orderId,
}: CustomerOrderDetailPageProps) {
  const { customer, isAuthenticated } = useCustomerAuth();
  const { getOrderById } = useOrders();

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-neutral-950">Account Access</h1>
        <p className="mt-2 text-neutral-600">Please sign in to view your orders.</p>
        <Link
          href={`/ecommerce-stores/${store.slug}/account/login`}
          className="mt-6 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white"
          style={{ backgroundColor: store.primaryColor }}
        >
          Sign In
        </Link>
      </div>
    );
  }

  const order = getOrderById(orderId);

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-neutral-950">Order not found</h1>
        <p className="mt-2 text-neutral-600">This order does not exist or has been removed.</p>
        <Link
          href={`/ecommerce-stores/${store.slug}/account/orders`}
          className="mt-6 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white"
          style={{ backgroundColor: store.primaryColor }}
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href={`/ecommerce-stores/${store.slug}/account/orders`}
        className="text-sm font-medium text-neutral-500 hover:text-neutral-900"
      >
        ← Back to Orders
      </Link>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-950">Order {order.orderNumber}</h1>
          <p className="text-sm text-neutral-500">{order.date}</p>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ring-1 ${
            order.status === "Delivered"
              ? "bg-success-50 text-success-700 ring-success-200"
              : order.status === "Processing"
              ? "bg-warning-50 text-warning-700 ring-warning-200"
              : order.status === "Shipped"
              ? "bg-info-50 text-info-700 ring-info-200"
              : "bg-neutral-100 text-neutral-600 ring-neutral-200"
          }`}
        >
          {order.status}
        </span>
      </div>

      <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-neutral-950">Items</h2>
        <div className="mt-4 space-y-4">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span className="text-neutral-600">
                {item.quantity} × {item.name}
              </span>
              <span className="font-medium text-neutral-950">
                GH₵ {(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-6 border-t border-neutral-200 pt-4">
          <div className="flex justify-between text-base">
            <span className="font-semibold text-neutral-950">Total</span>
            <span className="font-bold text-neutral-950">GH₵ {order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-neutral-950">Order Information</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 text-sm">
          <div>
            <span className="text-neutral-500">Customer:</span> {order.customerEmail}
          </div>
          <div>
            <span className="text-neutral-500">Store:</span> {order.storeSlug}
          </div>
        </div>
      </div>
    </div>
  );
}