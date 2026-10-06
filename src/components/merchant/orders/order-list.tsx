"use client";

import type { OrderRow as OrderRowType } from "@/lib/merchant/orders/types";
import { OrderRow } from "./order-row";
import { OrderCard } from "./order-card";

interface OrderListProps {
  rows: OrderRowType[];
}

export function OrderList({ rows }: OrderListProps) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 lg:block">
        <table className="w-full text-left">
          <caption className="sr-only">Your store orders</caption>
          <thead className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950">
            <tr>
              <th
                scope="col"
                className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500"
              >
                Order
              </th>
              <th
                scope="col"
                className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500"
              >
                Customer
              </th>
              <th
                scope="col"
                className="hidden px-5 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500 sm:table-cell"
              >
                Items
              </th>
              <th
                scope="col"
                className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-neutral-500"
              >
                Total
              </th>
              <th
                scope="col"
                className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-neutral-500"
              >
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {rows.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
          </tbody>
        </table>
      </div>

      <ul role="list" className="space-y-3 lg:hidden">
        {rows.map((order) => (
          <li key={order.id}>
            <OrderCard order={order} />
          </li>
        ))}
      </ul>
    </>
  );
}