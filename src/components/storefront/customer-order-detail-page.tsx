"use client";

import Link from "next/link";
import { useCustomerAuth } from "@/contexts/customer-auth-context";
import { useOrders } from "@/contexts/orders-context";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
} from "@/lib/merchant/orders/labels";
import type { CustomerOrderStatus } from "@/lib/merchant/orders/types";
import type { MerchantStorefrontConfig } from "@/types/merchant-storefront";

interface CustomerOrderDetailPageProps {
  store: MerchantStorefrontConfig;
  orderId: string;
}

function statusBadgeClass(status: CustomerOrderStatus): string {
  switch (status) {
    case "delivered":
      return "bg-success-50 text-success-700 ring-success-200";
    case "processing":
      return "bg-warning-50 text-warning-700 ring-warning-200";
    case "shipped":
      return "bg-info-50 text-info-700 ring-info-200";
    case "cancelled":
      return "bg-neutral-100 text-neutral-500 ring-neutral-200";
    default:
      return "bg-neutral-100 text-neutral-600 ring-neutral-200";
  }
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

  if (!order || order.customerEmail !== customer?.email) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-neutral-950">Order not found</h1>
        <p className="mt-2 text-neutral-600">
          This order does not exist or has been removed.
        </p>
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
        {"\u2190"} Back to Orders
      </Link>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-950">
            Order {order.orderNumber}
          </h1>
          <p className="text-sm text-neutral-500">{order.date}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ${statusBadgeClass(
              order.status
            )}`}
          >
            {ORDER_STATUS_LABELS[order.status]}
          </span>
          <span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600 ring-1 ring-neutral-200">
            {PAYMENT_STATUS_LABELS[order.paymentStatus]}
          </span>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-neutral-950">Items</h2>
        {order.items.length === 0 ? (
          <p className="mt-4 text-sm text-neutral-500">
            No items on this order.
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-neutral-600">
                  {item.quantity} {"\u00D7"} {item.name}
                </span>
                <span className="font-medium text-neutral-950">
                  {"GH\u20B5 "}
                  {(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
        <div className="mt-6 border-t border-neutral-200 pt-4">
          <div className="flex justify-between text-base">
            <span className="font-semibold text-neutral-950">Total</span>
            <span className="font-bold text-neutral-950">
              {"GH\u20B5 "}
              {order.total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-neutral-950">
          Order Information
        </h2>
        <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <span className="text-neutral-500">Customer:</span>{" "}
            {order.customerEmail}
          </div>
          <div>
            <span className="text-neutral-500">Payment method:</span>{" "}
            {order.paymentMethod}
          </div>
        </div>
      </div>

      {order.shippingAddress && (
        <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-neutral-950">
            Shipping
          </h2>
          <div className="mt-4 space-y-1 text-sm text-neutral-600">
            <p className="font-medium text-neutral-950">
              {order.shippingAddress.name}
            </p>
            <p>{order.shippingAddress.address}</p>
            <p>
              {order.shippingAddress.city}
              {order.shippingAddress.region
                ? ", " + order.shippingAddress.region
                : ""}
            </p>
            <p>{order.shippingAddress.phone}</p>
          </div>
          {order.trackingNumber && (
            <div className="mt-4 border-t border-neutral-200 pt-4 text-sm">
              <p className="text-neutral-500">
                {order.carrier ? order.carrier + " \u00B7 " : ""}
                {order.trackingNumber}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}