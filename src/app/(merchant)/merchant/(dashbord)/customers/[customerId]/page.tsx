"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AtlasIcon } from "@/components/atlas/icons";
import { useStorefrontConfig } from "@/contexts/storefront-config-context";
import { useStoreCustomers } from "@/contexts/store-customers-context";
import { useOrders } from "@/contexts/orders-context";
import { useCurrentMerchant } from "@/lib/merchant/hooks/use-current-merchant";
import { useMerchantCustomer } from "@/lib/merchant/customers/use-merchant-customer";
import { withdrawCustomerReport } from "@/lib/merchant/customers/report-mutations";
import { CUSTOMER_NOT_PROVIDED } from "@/lib/merchant/customers/labels";
import type { CustomerReport } from "@/lib/merchant/customers/types";
import { CustomerHeader } from "@/components/merchant/customers/customer-header";
import { CustomerStatsStrip } from "@/components/merchant/customers/customer-stats-strip";
import { CustomerOrdersPanel } from "@/components/merchant/customers/customer-orders-panel";
import { CustomerReportBanner } from "@/components/merchant/customers/customer-report-banner";
import { CustomerReportModal } from "@/components/merchant/customers/customer-report-modal";
import type { AuditActor } from "@/lib/domains/audit";

export default function MerchantCustomerDetailPage() {
  const params = useParams();
  const customerId = (params?.customerId as string) ?? "";

  const { storefrontConfig } = useStorefrontConfig();
  const { getCustomersForStore } = useStoreCustomers();
  const { getOrdersForStore } = useOrders();
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

  const { customer, view, activeReport } = useMerchantCustomer(
    storeSlug,
    customers,
    orders,
    customerId
  );

  const customerOrders = useMemo(() => {
    if (!view) return [];
    const email = view.email.toLowerCase();
    return orders
      .filter((o) => o.customerEmail.toLowerCase() === email)
      .slice()
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [orders, view]);

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

  const [reportOpen, setReportOpen] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  const showFlash = (message: string) => {
    setFlash(message);
    window.setTimeout(() => setFlash(null), 4000);
  };

  const handleWithdraw = (report: CustomerReport) => {
    const result = withdrawCustomerReport(
      { storeSlug, reportId: report.id },
      actor
    );
    if (!result.ok) {
      showFlash(result.error ?? "Could not withdraw the report.");
      return;
    }
    showFlash("Report withdrawn.");
  };

  if (!view || !customer) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
          <AtlasIcon
            name="users"
            className="h-5 w-5 text-neutral-500 dark:text-neutral-400"
            aria-hidden="true"
          />
        </div>
        <h1 className="mt-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Customer not found
        </h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          This customer may have been removed.
        </p>
        <Link
          href="/merchant/customers"
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Back to customers
        </Link>
      </div>
    );
  }

  const addressText = customer.address?.trim() || CUSTOMER_NOT_PROVIDED;
  const cityText = customer.city?.trim() || CUSTOMER_NOT_PROVIDED;
  const regionText = customer.region?.trim() || CUSTOMER_NOT_PROVIDED;
  const phoneText = customer.phone.trim() || CUSTOMER_NOT_PROVIDED;

  return (
    <div className="space-y-6">
      <CustomerHeader
        customer={view}
        onReport={() => setReportOpen(true)}
      />

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

      {activeReport && (
        <CustomerReportBanner
          report={activeReport}
          onWithdraw={() => handleWithdraw(activeReport)}
        />
      )}

      <CustomerStatsStrip customer={view} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <CustomerOrdersPanel orders={customerOrders} />
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Contact information
            </h2>
            <dl className="mt-3 space-y-3 text-sm">
              <div className="flex items-baseline gap-2">
                <dt className="w-20 shrink-0 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  Name
                </dt>
                <dd className="min-w-0 text-neutral-900 dark:text-neutral-100">
                  {customer.name}
                </dd>
              </div>
              <div className="flex items-baseline gap-2">
                <dt className="w-20 shrink-0 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  Email
                </dt>
                <dd className="min-w-0">
                  {customer.email ? (
                    <a
                      href={"mailto:" + customer.email}
                      className="break-all text-brand-600 hover:text-brand-700"
                    >
                      {customer.email}
                    </a>
                  ) : (
                    <span className="text-neutral-500">
                      {CUSTOMER_NOT_PROVIDED}
                    </span>
                  )}
                </dd>
              </div>
              <div className="flex items-baseline gap-2">
                <dt className="w-20 shrink-0 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  Mobile
                </dt>
                <dd className="min-w-0">
                  {customer.phone.trim() ? (
                    <a
                      href={"tel:" + customer.phone}
                      className="text-brand-600 hover:text-brand-700"
                    >
                      {customer.phone}
                    </a>
                  ) : (
                    <span className="text-neutral-500">{phoneText}</span>
                  )}
                </dd>
              </div>
              <div className="flex items-baseline gap-2">
                <dt className="w-20 shrink-0 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  Address
                </dt>
                <dd className="min-w-0 text-neutral-900 dark:text-neutral-100">
                  {addressText}
                </dd>
              </div>
              <div className="flex items-baseline gap-2">
                <dt className="w-20 shrink-0 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  City
                </dt>
                <dd className="min-w-0 text-neutral-900 dark:text-neutral-100">
                  {cityText}
                </dd>
              </div>
              <div className="flex items-baseline gap-2">
                <dt className="w-20 shrink-0 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  Region
                </dt>
                <dd className="min-w-0 text-neutral-900 dark:text-neutral-100">
                  {regionText}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <CustomerReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        storeSlug={storeSlug}
        customer={view}
        actor={actor}
        onSubmitted={() => showFlash("Report submitted to Atlas.")}
      />
    </div>
  );
}