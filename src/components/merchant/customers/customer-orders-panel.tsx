"use client";

import Link from "next/link";
import type { CustomerOrder } from "@/contexts/orders-context";
import { OrderStatusBadge } from "@/components/merchant/orders/order-status-badge";
import { OrderPaymentBadge } from "@/components/merchant/orders/order-payment-badge";

interface CustomerOrdersPanelProps {
  orders: CustomerOrder[];
}

export function CustomerOrdersPanel({ orders }: CustomerOrdersPanelProps) {
  return (
    <section
      aria-labelledby="customer-orders-heading"
      className="rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
    >
      <div className="border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
        <h2
          id="customer-orders-heading"
          className="text-sm font-semibold text-neutral-900 dark:text-neutral-100"
        >
          Orders
          <span className="ml-2 text-xs font-normal text-neutral-500 dark:text-neutral-400">
            {orders.length === 1 ? "1 order" : orders.length + " orders"}
          </span>
        </h2>
      </div>
      {orders.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-neutral-500">
          No orders from this customer yet.
        </p>
      ) : (
        <ul
          role="list"
          className="divide-y divide-neutral-200 dark:divide-neutral-800"
        >
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={"/merchant/orders/" + order.id}
                className="flex items-center justify-between gap-3 px-5 py-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-brand-600 hover:text-brand-700">
                    {order.orderNumber}
                  </p>
                  <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                    {order.date}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <OrderStatusBadge status={order.status} />
                  <OrderPaymentBadge paymentStatus={order.paymentStatus} size="sm" />
                  <span className="text-sm font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">
                    {"GH\u20B5 "}
                    {order.total.toFixed(2)}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}