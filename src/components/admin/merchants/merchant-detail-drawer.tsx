/* eslint-disable @typescript-eslint/no-unused-vars */
// components/admin/merchants/merchant-detail-drawer.tsx
"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import {
  Merchant,
  SubscriptionPlan,
  MERCHANT_STATUS_LABELS,
  SUBSCRIPTION_STATUS_LABELS,
  STORE_STATUS_LABELS,
  VERIFICATION_STATUS_LABELS,
  getMerchantMrr,
} from "@/lib/admin/types/merchant";
import { subscriptionPlans } from "@/config/subscription-plans";
import { mockStorefronts } from "@/lib/admin/mock/storefronts";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { StatusDot } from "@/components/admin/ui/status-dot";
import {
  formatCurrency,
  formatDateTime,
  getInitials,
} from "@/lib/admin/formatters";
import { cn } from "@/lib/utils";
import { AtlasIcon } from "@/components/atlas/icons";
import { useFocusTrap } from "@/lib/admin/hooks/use-focus-trap";
import { useNow } from "@/lib/admin/hooks/use-now";
import { formatAbsolute, formatRelative } from "@/lib/admin/support/format";
import { StorefrontUsersList } from "@/components/admin/shared/storefront-users-list";
import { Can, PERMISSIONS } from "@/lib/admin/rbac";
import { routes } from "@/lib/admin/routes";
import {
  MERCHANT_STATUS_VARIANT,
  STORE_STATUS_VARIANT,
  SUBSCRIPTION_STATUS_VARIANT,
  VERIFICATION_VARIANT,
} from "@/lib/admin/merchants/constants";
import {
  daysUntilRenewalAt,
  formatRenewalLabel,
  renewalTone,
  storeUrlFor,
  templateLabel,
} from "@/lib/admin/merchants/helpers";
import {
  MerchantContractMrrModal,
  MerchantNotifyModal,
  MerchantPlanChangeModal,
  MerchantResetSecurityModal,
  MerchantStoreToggleModal,
  MerchantSuspendModal,
  MerchantVerifyModal,
} from "./merchant-action-modals";

type Tab = "overview" | "subscription" | "store" | "users" | "activity";

const TABS: { key: Tab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "subscription", label: "Subscription" },
  { key: "store", label: "Store" },
  { key: "users", label: "Users" },
  { key: "activity", label: "Activity" },
];

type NotifyChannel = "email" | "sms" | "push";

interface MerchantDetailDrawerProps {
  merchant: Merchant | null;
  onClose: () => void;
  onChangePlan: (id: string, planId: SubscriptionPlan) => void;
  onSuspend: (id: string, reason: string) => void;
  onReactivate: (id: string) => void;
  onToggleStore: (id: string) => void;
  onUpdateContractMrr: (id: string, value: number, reason: string) => void;
  onApproveVerification: (id: string) => void;
  onRejectVerification: (id: string, reason: string) => void;
  onSendNotification: (
    id: string,
    channel: NotifyChannel,
    message: string
  ) => void;
  onResetSecurity: (id: string) => void;
}

export function MerchantDetailDrawer({
  merchant,
  onClose,
  ...rest
}: MerchantDetailDrawerProps) {
  const isOpen = merchant !== null;
  const trapRef = useFocusTrap<HTMLDivElement>(isOpen, onClose);
  const titleId = useId();

  if (!merchant) return null;

  return (
    <div
      ref={trapRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-50"
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <MerchantDetailBody
        key={merchant.id}
        merchant={merchant}
        titleId={titleId}
        onClose={onClose}
        {...rest}
      />
    </div>
  );
}

interface BodyProps
  extends Omit<MerchantDetailDrawerProps, "merchant"> {
  merchant: Merchant;
  titleId: string;
}

function MerchantDetailBody({
  merchant,
  titleId,
  onClose,
  onChangePlan,
  onSuspend,
  onReactivate,
  onToggleStore,
  onUpdateContractMrr,
  onApproveVerification,
  onRejectVerification,
  onSendNotification,
  onResetSecurity,
}: BodyProps) {
  const now = useNow();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const [suspendOpen, setSuspendOpen] = useState(false);
  const [reactivateConfirm, setReactivateConfirm] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const [contractOpen, setContractOpen] = useState(false);
  const [storeToggleMode, setStoreToggleMode] = useState<
    "enable" | "disable" | null
  >(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);

  const storefront = useMemo(
    () =>
      mockStorefronts.find(
        (s) => s.ownerId === merchant.id && s.type === "merchant"
      ),
    [merchant.id]
  );

  const plan = subscriptionPlans.find(
    (p) => p.code === merchant.subscription.planId
  );
  const planLabel = plan?.name ?? merchant.subscription.planId;
  const mrr = getMerchantMrr(merchant);
  const renewalDays = now === null ? 0 : daysUntilRenewalAt(merchant, now);
  const tone = renewalTone(renewalDays);
  const storeUrl = storeUrlFor(merchant);

  const timeline = useMemo(() => {
    const activity = merchant.activityLog.map((a) => ({
      kind: "activity" as const,
      id: a.id,
      timestamp: a.timestamp,
      label: a.action,
      meta: undefined as string | undefined,
    }));
    const audit = (merchant.auditTrail ?? []).map((a) => ({
      kind: "audit" as const,
      id: a.id,
      timestamp: a.timestamp,
      label: a.action,
      meta: a.admin,
    }));
    return [...activity, ...audit].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [merchant.activityLog, merchant.auditTrail]);

  return (
    <div className="absolute right-0 top-0 flex h-full w-full max-w-2xl flex-col bg-white shadow-xl dark:bg-neutral-900">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
            {getInitials(merchant.businessName)}
          </div>
          <div className="min-w-0">
            <p id={titleId} className="truncate text-sm font-semibold">
              {merchant.businessName}
            </p>
            <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
              {merchant.storeConfig.storeName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <a
            href={storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md px-2 py-1 text-xs font-medium text-brand-700 hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-brand-900/20"
          >
            Open store
          </a>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      {/* Status strip */}
      <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
        <div className="flex items-center gap-1.5">
          <StatusDot
            tone={
              merchant.merchantStatus === "active"
                ? "success"
                : merchant.merchantStatus === "suspended"
                ? "danger"
                : "warning"
            }
            size="sm"
          />
          <Badge variant={MERCHANT_STATUS_VARIANT[merchant.merchantStatus]}>
            {MERCHANT_STATUS_LABELS[merchant.merchantStatus]}
          </Badge>
        </div>
        <Badge variant={VERIFICATION_VARIANT[merchant.verificationStatus]}>
          {VERIFICATION_STATUS_LABELS[merchant.verificationStatus]}
        </Badge>
        <Badge
          variant={SUBSCRIPTION_STATUS_VARIANT[merchant.subscription.status]}
        >
          {SUBSCRIPTION_STATUS_LABELS[merchant.subscription.status]}
        </Badge>
        <Badge variant={STORE_STATUS_VARIANT[merchant.storeStatus]}>
          {STORE_STATUS_LABELS[merchant.storeStatus]}
        </Badge>
        <Badge variant="info">{planLabel}</Badge>
      </div>

      {/* Cross-links */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 border-b border-neutral-200 px-4 py-2 text-xs dark:border-neutral-800">
        {storefront && (
          <>
            <Link
              href={routes.merchantStorefrontDetail(storefront.id)}
              className="text-brand-700 hover:underline dark:text-brand-300"
            >
              Storefront
            </Link>
            <Link
              href={`${routes.merchantStorefrontUsers}?storefront=${storefront.id}`}
              className="text-brand-700 hover:underline dark:text-brand-300"
            >
              Storefront users
            </Link>
          </>
        )}
        <Link
          href={`${routes.orders}?merchantId=${merchant.id}`}
          className="text-brand-700 hover:underline dark:text-brand-300"
        >
          Orders
        </Link>
        <Link
          href={`/admin/audit-logs?resourceId=${merchant.id}`}
          className="text-brand-700 hover:underline dark:text-brand-300"
        >
          Audit log
        </Link>
        <Link
          href={`/admin/security?q=${encodeURIComponent(merchant.email)}`}
          className="text-brand-700 hover:underline dark:text-brand-300"
        >
          Security
        </Link>
        <Link
          href={`/admin/analytics?merchantId=${merchant.id}`}
          className="text-brand-700 hover:underline dark:text-brand-300"
        >
          Analytics
        </Link>
      </div>

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Merchant sections"
        className="flex overflow-x-auto border-b border-neutral-200 dark:border-neutral-800"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              role="tab"
              type="button"
              aria-selected={isActive}
              aria-controls={`merchant-panel-${tab.key}`}
              id={`merchant-tab-${tab.key}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "whitespace-nowrap border-b-2 px-4 py-2 text-xs font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                isActive
                  ? "border-brand-600 text-brand-700 dark:border-brand-400 dark:text-brand-300"
                  : "border-transparent text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div
        role="tabpanel"
        id={`merchant-panel-${activeTab}`}
        aria-labelledby={`merchant-tab-${activeTab}`}
        className="flex-1 overflow-y-auto p-4"
      >
        {activeTab === "overview" && (
          <div className="space-y-4">
            <section className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                Contact information
              </p>
              <dl className="mt-2 grid grid-cols-[6rem_1fr] gap-x-3 gap-y-1.5 text-sm">
                <dt className="text-neutral-500 dark:text-neutral-400">
                  Contact
                </dt>
                <dd className="text-neutral-900 dark:text-neutral-100">
                  {merchant.contactPerson}
                </dd>
                <dt className="text-neutral-500 dark:text-neutral-400">
                  Email
                </dt>
                <dd className="truncate text-neutral-900 dark:text-neutral-100">
                  {merchant.email}
                </dd>
                <dt className="text-neutral-500 dark:text-neutral-400">
                  Phone
                </dt>
                <dd className="text-neutral-900 dark:text-neutral-100">
                  {merchant.phone}
                </dd>
              </dl>
            </section>

            {merchant.verificationStatus !== "verified" &&
              merchant.verificationStatus !== "not_submitted" && (
                <section className="rounded-lg border border-warning-200 bg-warning-50 p-3 dark:border-warning-800/60 dark:bg-warning-900/20">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-medium text-warning-900 dark:text-warning-100">
                        Verification{" "}
                        {VERIFICATION_STATUS_LABELS[merchant.verificationStatus]}
                      </p>
                      <p className="mt-0.5 text-xs text-warning-800 dark:text-warning-200">
                        Review documents before approving.
                      </p>
                    </div>
                    <Can permission={PERMISSIONS.MERCHANTS_EDIT}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setVerifyOpen(true)}
                      >
                        Review verification
                      </Button>
                    </Can>
                  </div>
                </section>
              )}

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-md bg-neutral-50 p-3 dark:bg-neutral-900">
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Orders
                </p>
                <p className="mt-1 text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  {merchant.totalOrders.toLocaleString("en-GH")}
                </p>
              </div>
              <div className="rounded-md bg-neutral-50 p-3 dark:bg-neutral-900">
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Revenue
                </p>
                <p className="mt-1 text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  {formatCurrency(merchant.totalRevenue)}
                </p>
              </div>
              <div className="rounded-md bg-neutral-50 p-3 dark:bg-neutral-900">
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  MRR
                </p>
                <p className="mt-1 text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  {mrr > 0 ? formatCurrency(mrr) : "—"}
                </p>
              </div>
            </div>

            {merchant.recentOrders && merchant.recentOrders.length > 0 && (
              <section>
                <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  Recent orders
                </p>
                <ul className="mt-2 space-y-2">
                  {merchant.recentOrders.slice(0, 5).map((o) => (
                    <li
                      key={o.id}
                      className="flex items-center justify-between gap-3 rounded-md border border-neutral-200 p-2 text-xs dark:border-neutral-700"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-neutral-900 dark:text-neutral-100">
                          {o.id}
                        </p>
                        <p className="mt-0.5 text-neutral-500 dark:text-neutral-400">
                          {o.itemCount} item{o.itemCount === 1 ? "" : "s"} ·{" "}
                          <time
                            dateTime={o.date}
                            title={formatAbsolute(o.date)}
                          >
                            {formatRelative(o.date, now)}
                          </time>
                        </p>
                      </div>
                      <span className="shrink-0 font-semibold text-neutral-900 dark:text-neutral-100">
                        {formatCurrency(o.total)}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {merchant.recentPayments && merchant.recentPayments.length > 0 && (
              <section>
                <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  Recent payments
                </p>
                <ul className="mt-2 space-y-2">
                  {merchant.recentPayments.slice(0, 5).map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center justify-between gap-3 rounded-md border border-neutral-200 p-2 text-xs dark:border-neutral-700"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-neutral-900 dark:text-neutral-100">
                          {p.method}
                        </p>
                        <p className="mt-0.5 text-neutral-500 dark:text-neutral-400">
                          <time
                            dateTime={p.date}
                            title={formatAbsolute(p.date)}
                          >
                            {formatRelative(p.date, now)}
                          </time>
                        </p>
                      </div>
                      <span className="shrink-0 font-semibold text-success-700 dark:text-success-300">
                        {formatCurrency(p.amount)}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}

        {activeTab === "subscription" && (
          <div className="space-y-4">
            <section className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                Wallet balance
              </p>
              <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {formatCurrency(merchant.walletBalance ?? 0)}
              </p>
            </section>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md bg-neutral-50 p-3 dark:bg-neutral-900">
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Plan
                </p>
                <p className="mt-1 text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  {planLabel}
                </p>
              </div>
              <div className="rounded-md bg-neutral-50 p-3 dark:bg-neutral-900">
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  MRR
                </p>
                <p className="mt-1 text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  {mrr > 0 ? formatCurrency(mrr) : "Custom"}
                </p>
              </div>
            </div>

            {merchant.subscription.planId === "enterprise" && (
              <section className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                      Contract MRR
                    </p>
                    <p className="mt-1 text-lg font-bold text-neutral-900 dark:text-neutral-100">
                      {formatCurrency(merchant.contractMrr ?? 0)}
                    </p>
                  </div>
                  <Can permission={PERMISSIONS.MERCHANTS_CONTRACT_MRR}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setContractOpen(true)}
                    >
                      Update contract
                    </Button>
                  </Can>
                </div>
              </section>
            )}

            <section className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
              <dl className="grid grid-cols-[7rem_1fr] gap-x-3 gap-y-2 text-sm">
                <dt className="text-neutral-500 dark:text-neutral-400">
                  Billing cycle
                </dt>
                <dd className="capitalize text-neutral-900 dark:text-neutral-100">
                  {merchant.subscription.billingCycle}
                </dd>
                <dt className="text-neutral-500 dark:text-neutral-400">
                  Status
                </dt>
                <dd>
                  <Badge
                    variant={
                      SUBSCRIPTION_STATUS_VARIANT[merchant.subscription.status]
                    }
                    size="sm"
                  >
                    {
                      SUBSCRIPTION_STATUS_LABELS[
                        merchant.subscription.status
                      ]
                    }
                  </Badge>
                </dd>
                <dt className="text-neutral-500 dark:text-neutral-400">
                  Started
                </dt>
                <dd>
                  <time
                    dateTime={merchant.subscription.startDate}
                    title={formatAbsolute(merchant.subscription.startDate)}
                    className="text-neutral-900 dark:text-neutral-100"
                  >
                    {formatRelative(merchant.subscription.startDate, now)}
                  </time>
                </dd>
                <dt className="text-neutral-500 dark:text-neutral-400">
                  Renews
                </dt>
                <dd
                  className={cn(
                    "text-neutral-900 dark:text-neutral-100",
                    tone === "danger" && "text-danger-700 dark:text-danger-300",
                    tone === "warning" &&
                      "text-warning-700 dark:text-warning-300"
                  )}
                >
                  <time
                    dateTime={merchant.subscription.endDate}
                    title={formatAbsolute(merchant.subscription.endDate)}
                  >
                    {formatRelative(merchant.subscription.endDate, now)}
                  </time>
                  <span className="ml-1.5 text-xs">
                    ({formatRenewalLabel(renewalDays)})
                  </span>
                </dd>
              </dl>
            </section>

            <Can permission={PERMISSIONS.MERCHANTS_PLAN}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPlanOpen(true)}
              >
                Change subscription plan
              </Button>
            </Can>

            {merchant.walletTransactions &&
              merchant.walletTransactions.length > 0 && (
                <section>
                  <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                    Wallet transactions
                  </p>
                  <ul className="mt-2 space-y-2">
                    {merchant.walletTransactions.map((txn) => (
                      <li
                        key={txn.id}
                        className="flex items-center justify-between gap-3 rounded-md border border-neutral-200 p-2 text-xs dark:border-neutral-700"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-neutral-900 dark:text-neutral-100">
                            {txn.type}
                          </p>
                          <p className="mt-0.5 text-neutral-500 dark:text-neutral-400">
                            <time
                              dateTime={txn.date}
                              title={formatAbsolute(txn.date)}
                            >
                              {formatRelative(txn.date, now)}
                            </time>
                          </p>
                        </div>
                        <span
                          className={cn(
                            "shrink-0 font-semibold",
                            txn.amount >= 0
                              ? "text-success-700 dark:text-success-300"
                              : "text-danger-700 dark:text-danger-300"
                          )}
                        >
                          {formatCurrency(txn.amount)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
          </div>
        )}

        {activeTab === "store" && (
          <div className="space-y-4">
            <section className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                Store configuration
              </p>
              <dl className="mt-2 grid grid-cols-[6rem_1fr] gap-x-3 gap-y-1.5 text-sm">
                <dt className="text-neutral-500 dark:text-neutral-400">
                  Store name
                </dt>
                <dd className="text-neutral-900 dark:text-neutral-100">
                  {merchant.storeConfig.storeName}
                </dd>
                <dt className="text-neutral-500 dark:text-neutral-400">
                  Slug
                </dt>
                <dd className="font-mono text-xs text-neutral-900 dark:text-neutral-100">
                  {merchant.storeConfig.slug}
                </dd>
                <dt className="text-neutral-500 dark:text-neutral-400">
                  Template
                </dt>
                <dd className="text-neutral-900 dark:text-neutral-100">
                  {templateLabel(merchant.storeConfig.templateId)}
                </dd>
              </dl>
            </section>

            <section className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                Store URL
              </p>
              <div className="mt-1.5 flex items-center gap-2">
                <a
                  href={storeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 truncate text-sm text-brand-700 hover:underline dark:text-brand-300"
                >
                  {storeUrl}
                </a>
              </div>
              <p className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                {merchant.storeConfig.customDomain
                  ? "Custom domain configured."
                  : "Using the default Atlas subdomain."}
              </p>
            </section>

            <section className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                Branding
              </p>
              <div className="mt-2 flex gap-4 text-xs">
                <div>
                  <div
                    className="h-10 w-10 rounded border border-neutral-200 dark:border-neutral-700"
                    style={{ backgroundColor: merchant.storeConfig.primaryColor }}
                    aria-label={`Primary color ${merchant.storeConfig.primaryColor}`}
                  />
                  <p className="mt-1 text-neutral-500 dark:text-neutral-400">
                    Primary
                  </p>
                </div>
                <div>
                  <div
                    className="h-10 w-10 rounded border border-neutral-200 dark:border-neutral-700"
                    style={{ backgroundColor: merchant.storeConfig.accentColor }}
                    aria-label={`Accent color ${merchant.storeConfig.accentColor}`}
                  />
                  <p className="mt-1 text-neutral-500 dark:text-neutral-400">
                    Accent
                  </p>
                </div>
              </div>
            </section>

            {storefront && (
              <section className="grid grid-cols-3 gap-3">
                <div className="rounded-md bg-neutral-50 p-3 dark:bg-neutral-900">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Users
                  </p>
                  <p className="mt-1 text-lg font-bold text-neutral-900 dark:text-neutral-100">
                    {storefront.usersCount}
                  </p>
                </div>
                <div className="rounded-md bg-neutral-50 p-3 dark:bg-neutral-900">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Orders 30d
                  </p>
                  <p className="mt-1 text-lg font-bold text-neutral-900 dark:text-neutral-100">
                    {storefront.orders30d}
                  </p>
                </div>
                <div className="rounded-md bg-neutral-50 p-3 dark:bg-neutral-900">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Revenue 30d
                  </p>
                  <p className="mt-1 text-lg font-bold text-neutral-900 dark:text-neutral-100">
                    {formatCurrency(storefront.revenue30d)}
                  </p>
                </div>
              </section>
            )}

            <section className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  Storefront status
                </p>
                <Badge
                  variant={STORE_STATUS_VARIANT[merchant.storeStatus]}
                  size="sm"
                >
                  {STORE_STATUS_LABELS[merchant.storeStatus]}
                </Badge>
              </div>
              <Can permission={PERMISSIONS.MERCHANTS_STORE_TOGGLE}>
                {merchant.storeStatus === "live" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setStoreToggleMode("disable")}
                  >
                    Disable store
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setStoreToggleMode("enable")}
                  >
                    Enable store
                  </Button>
                )}
              </Can>
            </section>
          </div>
        )}

        {activeTab === "users" && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                Storefront customers
              </p>
              {storefront && (
                <Link
                  href={`${routes.merchantStorefrontUsers}?storefront=${storefront.id}`}
                  className="text-xs font-medium text-brand-700 hover:underline dark:text-brand-300"
                >
                  View all
                </Link>
              )}
            </div>
            {storefront ? (
              <StorefrontUsersList
                storefrontId={storefront.id}
                storefrontType="merchant"
                limit={10}
              />
            ) : (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                No storefront provisioned.
              </p>
            )}
          </div>
        )}

        {activeTab === "activity" && (
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Activity and admin actions
            </p>
            {timeline.length === 0 ? (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                No activity recorded.
              </p>
            ) : (
              <ol className="space-y-2">
                {timeline.map((entry) => (
                  <li
                    key={`${entry.kind}-${entry.id}`}
                    className="flex items-start gap-3 rounded-md border border-neutral-200 p-2 dark:border-neutral-700"
                  >
                    <StatusDot
                      tone={entry.kind === "audit" ? "info" : "neutral"}
                      size="sm"
                      className="mt-1.5"
                    />
                    <div className="min-w-0">
                      <p className="text-sm text-neutral-900 dark:text-neutral-100">
                        {entry.label}
                      </p>
                      <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                        {entry.kind === "audit" && entry.meta
                          ? `${entry.meta} · `
                          : ""}
                        <time
                          dateTime={entry.timestamp}
                          title={formatAbsolute(entry.timestamp)}
                        >
                          {formatRelative(entry.timestamp, now)}
                        </time>
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="flex flex-wrap items-center gap-2 border-t border-neutral-200 px-4 py-3 dark:border-neutral-800">
        <Can permission={PERMISSIONS.MERCHANTS_NOTIFY}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setNotifyOpen(true)}
          >
            Send notification
          </Button>
        </Can>

        {merchant.merchantStatus === "active" ? (
          <Can permission={PERMISSIONS.MERCHANTS_SUSPEND}>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setSuspendOpen(true)}
            >
              Suspend
            </Button>
          </Can>
        ) : merchant.merchantStatus === "suspended" ? (
          <Can permission={PERMISSIONS.MERCHANTS_SUSPEND}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setReactivateConfirm(true)}
            >
              Reactivate
            </Button>
          </Can>
        ) : null}

        <Can permission={PERMISSIONS.RESET_SECURITY}>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto"
            onClick={() => setResetOpen(true)}
          >
            Reset security
          </Button>
        </Can>
      </div>

      {/* Modals */}
      <MerchantSuspendModal
        open={suspendOpen}
        merchantName={merchant.businessName}
        onClose={() => setSuspendOpen(false)}
        onConfirm={(reason) => {
          onSuspend(merchant.id, reason);
          onClose();
        }}
      />

      <MerchantNotifyModal
        open={notifyOpen}
        merchantName={merchant.businessName}
        onClose={() => setNotifyOpen(false)}
        onConfirm={(channel, message) =>
          onSendNotification(merchant.id, channel, message)
        }
      />

      <MerchantPlanChangeModal
        open={planOpen}
        merchant={merchant}
        onClose={() => setPlanOpen(false)}
        onConfirm={(planCode) => onChangePlan(merchant.id, planCode)}
      />

      <MerchantContractMrrModal
        open={contractOpen}
        merchantName={merchant.businessName}
        currentMrr={merchant.contractMrr ?? 0}
        onClose={() => setContractOpen(false)}
        onConfirm={(value, reason) =>
          onUpdateContractMrr(merchant.id, value, reason)
        }
      />

      <MerchantStoreToggleModal
        open={storeToggleMode !== null}
        merchantName={merchant.businessName}
        storeName={merchant.storeConfig.storeName}
        mode={storeToggleMode}
        onClose={() => setStoreToggleMode(null)}
        onConfirm={() => onToggleStore(merchant.id)}
      />

      <MerchantResetSecurityModal
        open={resetOpen}
        merchantName={merchant.businessName}
        onClose={() => setResetOpen(false)}
        onConfirm={() => onResetSecurity(merchant.id)}
      />

      <MerchantVerifyModal
        open={verifyOpen}
        merchantName={merchant.businessName}
        onClose={() => setVerifyOpen(false)}
        onApprove={() => onApproveVerification(merchant.id)}
        onReject={(reason) => onRejectVerification(merchant.id, reason)}
      />

      {reactivateConfirm && (
        <div
          role="alertdialog"
          aria-modal="true"
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setReactivateConfirm(false)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-sm rounded-lg bg-white p-5 shadow-xl dark:bg-neutral-900">
            <h3 className="text-base font-semibold">
              Reactivate {merchant.businessName}?
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Both their account and their storefront will be brought back
              online.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setReactivateConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  onReactivate(merchant.id);
                  setReactivateConfirm(false);
                  onClose();
                }}
              >
                Reactivate
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}