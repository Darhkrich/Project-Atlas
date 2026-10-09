"use client";

import Link from "next/link";
import { AtlasBadge } from "@/components/atlas/badge";
import { formatCurrency, formatRelative } from "@/lib/shared/format";
import { useNow } from "@/lib/shared/hooks/use-now";
import { ROUTES } from "@/lib/reseller/overview/constants";
import {
  ORDER_AUDIENCE_LABELS,
  ORDER_AUDIENCE_VARIANTS,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_VARIANTS,
  serviceLabel,
} from "@/lib/domains/orders/reseller-order-labels";
import type { ResellerOrderRow } from "@/lib/domains/orders/reseller-order-types";

interface RecentOrdersTableProps {
  orders: ResellerOrderRow[];
}

export function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  const nowMs = useNow();
  return (
    <table className="w-full text-left text-sm">
      <caption className="sr-only">Recent reseller orders</caption>
      <thead className="bg-neutral-50 text-xs uppercase text-neutral-500 dark:bg-neutral-900/50 dark:text-neutral-400">
        <tr>
          <th scope="col" className="px-6 py-3 font-medium">Service</th>
          <th scope="col" className="px-6 py-3 font-medium">Customer</th>
          <th scope="col" className="px-6 py-3 font-medium">Audience</th>
          <th scope="col" className="px-6 py-3 font-medium">Amount</th>
          <th scope="col" className="px-6 py-3 font-medium">Status</th>
          <th scope="col" className="px-6 py-3 font-medium">Time</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
        {orders.map((order) => (
          <tr
            key={order.id}
            className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
          >
            <td className="px-6 py-4 font-medium text-neutral-900 dark:text-neutral-100">
              {serviceLabel(order.serviceId)}
            </td>
            <td className="px-6 py-4 text-neutral-600 dark:text-neutral-300">
              {order.customerName}
            </td>
            <td className="px-6 py-4">
              <AtlasBadge variant={ORDER_AUDIENCE_VARIANTS[order.audience]}>
                {ORDER_AUDIENCE_LABELS[order.audience]}
              </AtlasBadge>
            </td>
            <td className="px-6 py-4 font-medium tabular-nums text-neutral-900 dark:text-neutral-100">
              {formatCurrency(order.amount)}
            </td>
            <td className="px-6 py-4">
              <AtlasBadge variant={ORDER_STATUS_VARIANTS[order.status]}>
                {ORDER_STATUS_LABELS[order.status]}
              </AtlasBadge>
            </td>
            <td className="px-6 py-4 text-neutral-500">
              {nowMs ? formatRelative(order.createdAt, nowMs) : "\u2014"}
            </td>
          </tr>
        ))}
        {orders.length > 0 ? (
          <tr>
            <td colSpan={6} className="px-6 py-4 text-center">
              <Link
                href={ROUTES.orders}
                className="text-sm font-medium text-brand-700 hover:underline dark:text-brand-300"
              >
                View all orders
              </Link>
            </td>
          </tr>
        ) : null}
      </tbody>
    </table>
  );
}