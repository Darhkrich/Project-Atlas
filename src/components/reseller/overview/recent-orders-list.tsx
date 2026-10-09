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

interface RecentOrdersListProps {
  orders: ResellerOrderRow[];
}

export function RecentOrdersList({ orders }: RecentOrdersListProps) {
  const nowMs = useNow();
  return (
    <ul role="list" className="divide-y divide-neutral-100 dark:divide-neutral-800">
      {orders.map((order) => (
        <li key={order.id}>
          <Link
            href={ROUTES.orders}
            className="block px-4 py-4 focus:outline-none focus-visible:bg-neutral-50 dark:focus-visible:bg-neutral-800/60"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  {serviceLabel(order.serviceId)}
                </p>
                <p className="mt-0.5 truncate text-xs text-neutral-500">
                  {order.customerName}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">
                  {formatCurrency(order.amount)}
                </p>
                <p className="mt-0.5 text-xs text-neutral-500">
                  {nowMs ? formatRelative(order.createdAt, nowMs) : "\u2014"}
                </p>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <AtlasBadge variant={ORDER_STATUS_VARIANTS[order.status]}>
                {ORDER_STATUS_LABELS[order.status]}
              </AtlasBadge>
              <AtlasBadge variant={ORDER_AUDIENCE_VARIANTS[order.audience]}>
                {ORDER_AUDIENCE_LABELS[order.audience]}
              </AtlasBadge>
            </div>
          </Link>
        </li>
      ))}
      {orders.length > 0 ? (
        <li className="px-4 py-4 text-center">
          <Link
            href={ROUTES.orders}
            className="text-sm font-medium text-brand-700 hover:underline dark:text-brand-300"
          >
            View all orders
          </Link>
        </li>
      ) : null}
    </ul>
  );
}