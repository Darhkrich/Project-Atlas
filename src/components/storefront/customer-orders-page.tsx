"use client";

import Link from "next/link";
import { useCustomerAuth } from "@/contexts/customer-auth-context";
import { useOrders } from "@/contexts/orders-context";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_SHORT_LABELS,
} from "@/lib/merchant/orders/labels";
import type { CustomerOrderStatus } from "@/lib/merchant/orders/types";
import type { MerchantStorefrontConfig } from "@/types/merchant-storefront";

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

export function CustomerOrdersPage({
  store,
}: {
  store: MerchantStorefrontConfig;
}) {
  const { customer, isAuthenticated } = useCustomerAuth();
  const { getOrdersForCustomer } = useOrders();

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-neutral-950">Account Access</h1>
        <p className="mt-2 text-neutral-600">
          Please sign in to view your orders.
        </p>
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

  const orders = getOrdersForCustomer(customer?.email ?? "", store.slug);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-neutral-950">My Orders</h1>
      <p className="mt-2 text-sm text-neutral-600">
        View and track your order history.
      </p>

      {orders.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-neutral-200 bg-white p-10 text-center">
          <p className="text-neutral-500">You have no orders yet.</p>
          <Link
            href={`/ecommerce-stores/${store.slug}/products`}
            className="mt-4 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white"
            style={{ backgroundColor: store.primaryColor }}
          >
            Shop Now
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-neutral-200 bg-white p-6"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <Link
                    href={`/ecommerce-stores/${store.slug}/account/orders/${order.id}`}
                    className="text-sm font-semibold text-neutral-950 hover:text-brand-600"
                  >
                    Order {order.orderNumber}
                  </Link>
                  <p className="text-xs text-neutral-500">{order.date}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className="text-base font-bold"
                    style={{ color: store.primaryColor }}
                  >
                    {"GH\u20B5 "}
                    {order.total.toFixed(2)}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ${statusBadgeClass(
                      order.status
                    )}`}
                  >
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-600 ring-1 ring-neutral-200">
                    {PAYMENT_STATUS_SHORT_LABELS[order.paymentStatus]}
                  </span>
                </div>
              </div>

              {order.items.length > 0 && (
                <div className="mt-4 border-t border-neutral-200 pt-4">
                  <ul className="space-y-2">
                    {order.items.map((item, idx) => (
                      <li key={idx} className="flex justify-between text-sm">
                        <span className="text-neutral-600">
                          {item.quantity} {"\u00D7"} {item.name}
                        </span>
                        <span className="font-medium text-neutral-950">
                          {"GH\u20B5 "}
                          {(item.price * item.quantity).toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}