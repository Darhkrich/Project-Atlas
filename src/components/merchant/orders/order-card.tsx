/* eslint-disable react-hooks/purity */
"use client";

import Link from "next/link";
import { AtlasIcon } from "@/components/atlas/icons";
import { useNow } from "@/lib/shared/hooks/use-now";
import { formatRelative } from "@/lib/shared/format";
import type { OrderRow as OrderRowType } from "@/lib/merchant/orders/types";
import { OrderStatusBadge } from "./order-status-badge";
import { OrderPaymentBadge } from "./order-payment-badge";

interface OrderCardProps {
  order: OrderRowType;
}

export function OrderCard({ order }: OrderCardProps) {
  const nowMs = useNow();
  const now = nowMs ?? Date.now();

  return (
    <Link
      href={"/merchant/orders/" + order.id}
      className="block rounded-xl border border-neutral-200 bg-white p-4 transition hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-brand-600">
            {order.orderNumber}
          </p>
          <p className="mt-0.5 truncate text-xs text-neutral-500 dark:text-neutral-400">
            {formatRelative(new Date(order.createdAt).toISOString(), now)}
          </p>
        </div>
        <span className="shrink-0 text-sm font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">
          {"GH\u20B5 "}
          {order.total.toFixed(2)}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-3 border-t border-neutral-100 pt-3 dark:border-neutral-800">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
          <AtlasIcon
            name="package"
            className="h-5 w-5 text-neutral-500 dark:text-neutral-400"
            aria-hidden="true"
          />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {order.customerName}
          </p>
          <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
            {order.primaryItemName}
            {" \u00B7 "}
            {order.itemCount === 1 ? "1 item" : order.itemCount + " items"}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-3 dark:border-neutral-800">
        <OrderStatusBadge status={order.status} />
        <OrderPaymentBadge paymentStatus={order.paymentStatus} />
      </div>
    </Link>
  );
}