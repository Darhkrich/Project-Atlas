"use client";

import { useMemo, useState } from "react";
import { useStorefrontConfig } from "@/contexts/storefront-config-context";
import { useStoreCustomers } from "@/contexts/store-customers-context";
import { useOrders } from "@/contexts/orders-context";
import { useStoreProducts } from "@/contexts/store-products-context";
import { useCurrentMerchant } from "@/lib/merchant/hooks/use-current-merchant";
import { useCustomerFilters } from "@/lib/merchant/customers/use-customer-filters";
import { useMerchantCustomers } from "@/lib/merchant/customers/use-merchant-customers";
import type { MerchantCustomerView } from "@/lib/merchant/customers/types";
import { CustomerSegmentStrip } from "@/components/merchant/customers/customer-segment-strip";
import { CustomerToolbar } from "@/components/merchant/customers/customer-toolbar";
import { CustomerList } from "@/components/merchant/customers/customer-list";
import { CustomerEmptyState } from "@/components/merchant/customers/customer-empty-state";
import { CustomerReportModal } from "@/components/merchant/customers/customer-report-modal";
import { AtlasIcon } from "@/components/atlas/icons";
import type { AuditActor } from "@/lib/domains/audit";

export default function MerchantCustomersPage() {
  const { storefrontConfig } = useStorefrontConfig();
  const { getCustomersForStore } = useStoreCustomers();
  const { getOrdersForStore } = useOrders();
  const { getProductsForStore } = useStoreProducts();
  const merchant = useCurrentMerchant();

  const storeSlug = storefrontConfig.slug || "my-store";

  const customers = useMemo(
    () => getCustomersForStore(storeSlug),
    [getCustomersForStore, storeSlug]
  );

  const orders = useMemo(
    () => getOrdersForStore(storeSlug),
    [getOrdersForStore, storeSlug]
  );

  const products = useMemo(
    () => getProductsForStore(storeSlug),
    [getProductsForStore, storeSlug]
  );

  const filtersApi = useCustomerFilters();
  const snapshot = useMerchantCustomers(
    storeSlug,
    customers,
    orders,
    filtersApi.filters
  );

  const actor: AuditActor = useMemo(() => {
    if (merchant) {
      return { id: merchant.id, name: merchant.name, email: merchant.email };
    }
    return {
      id: "merchant",
      name: "Merchant",
      email: "merchant@atlas.local",
    };
  }, [merchant]);

  const [reportTarget, setReportTarget] = useState<MerchantCustomerView | null>(
    null
  );
  const [flash, setFlash] = useState<string | null>(null);

  const showFlash = (message: string) => {
    setFlash(message);
    window.setTimeout(() => setFlash(null), 4000);
  };

  const showNoCustomers =
    snapshot.summary.totalCustomers === 0 && !snapshot.appliedFiltersActive;
  const showNoMatches =
    snapshot.rows.length === 0 && snapshot.appliedFiltersActive;

  const subtitle =
    snapshot.summary.totalCustomers === 0
      ? "No customers yet."
      : snapshot.summary.totalCustomers +
        (snapshot.summary.totalCustomers === 1 ? " customer" : " customers") +
        (snapshot.summary.newThisMonthCount > 0
          ? ", " +
            snapshot.summary.newThisMonthCount +
            " new this month"
          : "");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-3xl">
          Customers
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

      {snapshot.summary.totalCustomers > 0 && (
        <>
          <CustomerSegmentStrip
            summary={snapshot.summary}
            active={filtersApi.filters.segment}
            onChange={filtersApi.setSegment}
          />
          <CustomerToolbar filtersApi={filtersApi} />
        </>
      )}

      {showNoCustomers && (
        <CustomerEmptyState
          variant="no-customers"
          storeSlug={storeSlug}
          hasProducts={products.length > 0}
        />
      )}

      {showNoMatches && (
        <CustomerEmptyState
          variant="no-matches"
          storeSlug={storeSlug}
          hasProducts={products.length > 0}
          onClearFilters={filtersApi.clearFilters}
        />
      )}

      {snapshot.rows.length > 0 && (
        <CustomerList rows={snapshot.rows} onReport={setReportTarget} />
      )}

      <CustomerReportModal
        open={reportTarget !== null}
        onClose={() => setReportTarget(null)}
        storeSlug={storeSlug}
        customer={reportTarget}
        actor={actor}
        onSubmitted={() => showFlash("Report submitted to Atlas.")}
      />
    </div>
  );
}