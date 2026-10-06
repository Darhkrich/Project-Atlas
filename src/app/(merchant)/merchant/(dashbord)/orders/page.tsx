/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AtlasIcon } from "@/components/atlas/icons";
import { useStorefrontConfig } from "@/contexts/storefront-config-context";
import { useOrders } from "@/contexts/orders-context";
import { useStoreProducts } from "@/contexts/store-products-context";
import { useOrderFilters } from "@/lib/merchant/orders/use-order-filters";
import { useMerchantOrders } from "@/lib/merchant/orders/use-merchant-orders";
import type {
  CustomerOrderPaymentStatus,
  CustomerOrderStatus,
} from "@/lib/merchant/orders/types";
import { OrderToolbar } from "@/components/merchant/orders/order-toolbar";
import { OrderList } from "@/components/merchant/orders/order-list";
import { OrderEmptyState } from "@/components/merchant/orders/order-empty-state";

const VALID_ORDER_STATUSES: CustomerOrderStatus[] = [
  "new",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const VALID_PAYMENT_STATUSES: CustomerOrderPaymentStatus[] = [
  "pending",
  "paid",
  "refunded",
  "partially_refunded",
  "failed",
];

function parseStatusParam(raw: string | null): "All" | CustomerOrderStatus {
  if (raw === null || raw.length === 0) return "All";
  return (VALID_ORDER_STATUSES as string[]).includes(raw)
    ? (raw as CustomerOrderStatus)
    : "All";
}

function parsePaymentParam(
  raw: string | null
): "All" | CustomerOrderPaymentStatus {
  if (raw === null || raw.length === 0) return "All";
  return (VALID_PAYMENT_STATUSES as string[]).includes(raw)
    ? (raw as CustomerOrderPaymentStatus)
    : "All";
}

function flashMessageFor(code: string): string {
  if (code === "shipped") return "Order marked as shipped.";
  if (code === "cancelled") return "Order cancelled.";
  if (code === "refunded") return "Refund issued.";
  if (code === "status") return "Order status updated.";
  return "Order updated.";
}

export default function MerchantOrdersPage() {
  const { storefrontConfig } = useStorefrontConfig();
  const { getOrdersForStore } = useOrders();
  const { getProductsForStore } = useStoreProducts();
  const searchParams = useSearchParams();

  const storeSlug = storefrontConfig.slug || "my-store";

  const filtersApi = useOrderFilters({
    status: parseStatusParam(searchParams.get("status")),
    paymentStatus: parsePaymentParam(searchParams.get("payment")),
  });

  const orders = useMemo(
    () => getOrdersForStore(storeSlug),
    [getOrdersForStore, storeSlug]
  );

  const products = useMemo(
    () => getProductsForStore(storeSlug),
    [getProductsForStore, storeSlug]
  );

  const snapshot = useMerchantOrders(orders, filtersApi.filters);

  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => {
    const saved = searchParams.get("saved");
    if (!saved) return;
    setFlash(flashMessageFor(saved));
    const url = new URL(window.location.href);
    url.searchParams.delete("saved");
    window.history.replaceState({}, "", url.toString());
    const timer = window.setTimeout(() => setFlash(null), 4000);
    return () => window.clearTimeout(timer);
  }, [searchParams]);

  const showNoOrders =
    snapshot.summary.totalOrders === 0 && !snapshot.appliedFiltersActive;
  const showNoMatches =
    snapshot.rows.length === 0 && snapshot.appliedFiltersActive;

  const subtitle =
    snapshot.summary.totalOrders === 0
      ? "No orders yet."
      : snapshot.summary.totalOrders +
        (snapshot.summary.totalOrders === 1 ? " order" : " orders");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-3xl">
          Orders
        </h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          {subtitle}
        </p>
      </div>

      {flash && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-lg border border-success-200 bg-success-50 px-4 py-3 text-sm text-success-800 dark:border-success-900 dark:bg-success-900/30 dark:text-success-200"
        >
          <AtlasIcon
            name="check-circle"
            className="h-4 w-4"
            aria-hidden="true"
          />
          {flash}
        </div>
      )}

      {snapshot.summary.totalOrders > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Total
            </p>
            <p className="mt-1 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
              {snapshot.summary.totalOrders}
            </p>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              New
            </p>
            <p className="mt-1 text-2xl font-semibold text-warning-600 dark:text-warning-400">
              {snapshot.summary.newCount}
            </p>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Processing
            </p>
            <p className="mt-1 text-2xl font-semibold text-info-600 dark:text-info-400">
              {snapshot.summary.processingCount}
            </p>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Revenue
            </p>
            <p className="mt-1 truncate text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
              {"GH\u20B5 "}
              {snapshot.summary.revenueTotal.toFixed(2)}
            </p>
          </div>
        </div>
      )}

      {snapshot.summary.totalOrders > 0 && (
        <OrderToolbar filtersApi={filtersApi} />
      )}

      {showNoOrders && (
        <OrderEmptyState
          variant="no-orders"
          hasProducts={products.length > 0}
          storeSlug={storeSlug}
        />
      )}

      {showNoMatches && (
        <OrderEmptyState
          variant="no-matches"
          hasProducts={products.length > 0}
          storeSlug={storeSlug}
          onClearFilters={filtersApi.clearFilters}
        />
      )}

      {snapshot.rows.length > 0 && <OrderList rows={snapshot.rows} />}
    </div>
  );
}