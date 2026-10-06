/* eslint-disable react-hooks/purity */
"use client";

import Link from "next/link";
import { AtlasIcon } from "@/components/atlas/icons";
import { useNow } from "@/lib/shared/hooks/use-now";
import { formatRelative } from "@/lib/shared/format";
import type { OrderRow as OrderRowType } from "@/lib/merchant/orders/types";
import { OrderStatusBadge } from "./order-status-badge";
import { OrderPaymentBadge } from "./order-payment-badge";

interface OrderRowProps {
  order: OrderRowType;
}

export function OrderRow({ order }: OrderRowProps) {
  const nowMs = useNow();
  const now = nowMs ?? Date.now();

  return (
    <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
      <td className="px-5 py-4">
        <Link
          href={"/merchant/orders/" + order.id}
          className="block"
          aria-label={"Open order " + order.orderNumber}
        >
          <span className="block text-sm font-medium text-brand-600 hover:text-brand-700">
            {order.orderNumber}
          </span>
          <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
            {formatRelative(new Date(order.createdAt).toISOString(), now)}
          </span>
        </Link>
      </td>

      <td className="px-5 py-4">
        <span className="block truncate text-sm text-neutral-900 dark:text-neutral-100">
          {order.customerName}
        </span>
        <span className="block truncate text-xs text-neutral-500 dark:text-neutral-400">
          {order.customerEmail}
        </span>
      </td>

      <td className="hidden px-5 py-4 sm:table-cell">
        <span className="block truncate text-sm text-neutral-600 dark:text-neutral-400">
          {order.primaryItemName}
        </span>
        <span className="text-xs text-neutral-500 dark:text-neutral-500">
          {order.itemCount === 1
            ? "1 item"
            : order.itemCount + " items"}
        </span>
      </td>

      <td className="px-5 py-4">
        <div className="flex flex-col gap-1">
          <OrderStatusBadge status={order.status} />
          <OrderPaymentBadge paymentStatus={order.paymentStatus} size="sm" />
        </div>
      </td>

      <td className="px-5 py-4 text-right">
        <span className="text-sm font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">
          {"GH\u20B5 "}
          {order.total.toFixed(2)}
        </span>
      </td>

      <td className="px-5 py-4 text-right">
        <Link
          href={"/merchant/orders/" + order.id}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
          aria-label={"Open " + order.orderNumber}
        >
          Open
          <AtlasIcon
            name="chevron-right"
            className="h-3.5 w-3.5"
            aria-hidden="true"
          />
        </Link>
      </td>
    </tr>
  );
}