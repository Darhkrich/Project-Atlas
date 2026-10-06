"use client";

import Link from "next/link";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import type {
  CustomerOrderPaymentStatus,
  CustomerOrderStatus,
} from "@/lib/merchant/orders/types";
import { OrderStatusBadge } from "./order-status-badge";
import { OrderPaymentBadge } from "./order-payment-badge";

interface OrderDetailHeaderProps {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  date: string;
  status: CustomerOrderStatus;
  paymentStatus: CustomerOrderPaymentStatus;
  onShip: () => void;
  onCancel: () => void;
  onRefund: () => void;
  onMarkPaid: () => void;
  canShip: boolean;
  canCancel: boolean;
  canRefund: boolean;
  canMarkPaid: boolean;
}

export function OrderDetailHeader({
  orderNumber,
  customerName,
  customerEmail,
  date,
  status,
  paymentStatus,
  onShip,
  onCancel,
  onRefund,
  onMarkPaid,
  canShip,
  canCancel,
  canRefund,
  canMarkPaid,
}: OrderDetailHeaderProps) {
  return (
    <div className="space-y-4">
      <Link
        href="/merchant/orders"
        className="inline-flex items-center gap-1 text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
      >
        <AtlasIcon name="arrow-left" className="h-4 w-4" aria-hidden="true" />
        Back to orders
      </Link>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-3xl">
              {orderNumber}
            </h1>
            <OrderStatusBadge status={status} />
            <OrderPaymentBadge paymentStatus={paymentStatus} />
          </div>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            {customerName}
            {" \u00B7 "}
            {customerEmail}
            {" \u00B7 "}
            {date}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onShip}
            disabled={!canShip}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition",
              canShip
                ? "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
                : "cursor-not-allowed border-neutral-200 bg-neutral-50 text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-500"
            )}
            aria-label="Mark order as shipped"
          >
            <AtlasIcon name="package" className="h-4 w-4" aria-hidden="true" />
            Ship
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={!canCancel}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition",
              canCancel
                ? "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
                : "cursor-not-allowed border-neutral-200 bg-neutral-50 text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-500"
            )}
            aria-label="Cancel order"
          >
            <AtlasIcon
              name="x-circle"
              className="h-4 w-4"
              aria-hidden="true"
            />
            Cancel
          </button>
          {canMarkPaid && (
            <button
              type="button"
              onClick={onMarkPaid}
              className="inline-flex items-center gap-2 rounded-lg border border-success-300 bg-success-50 px-3 py-2 text-sm font-semibold text-success-800 hover:bg-success-100 dark:border-success-800 dark:bg-success-900/30 dark:text-success-200 dark:hover:bg-success-900/40"
              aria-label="Mark payment as received"
            >
              <AtlasIcon
                name="check-circle"
                className="h-4 w-4"
                aria-hidden="true"
              />
              Mark as paid
            </button>
          )}
          <button
            type="button"
            onClick={onRefund}
            disabled={!canRefund}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition",
              canRefund
                ? "bg-brand-600 text-white hover:bg-brand-700"
                : "cursor-not-allowed bg-neutral-200 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-500"
            )}
            aria-label="Refund order"
          >
            <AtlasIcon name="wallet" className="h-4 w-4" aria-hidden="true" />
            Refund
          </button>
        </div>
      </div>
    </div>
  );
}