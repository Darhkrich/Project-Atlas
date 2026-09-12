// components/admin/merchant-storefront-users/merchant-storefront-user-detail-drawer.tsx
"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import type { StorefrontUser } from "@/lib/admin/types/storefront-user";
import type { UnifiedStorefront } from "@/lib/admin/types/storefront";
import type { StorefrontUserOrder } from "@/lib/admin/types/storefront-user-order";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { StatusDot } from "@/components/admin/ui/status-dot";
import { Input } from "@/components/admin/ui/input";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { cn } from "@/lib/utils";
import { useFocusTrap } from "@/lib/admin/hooks/use-focus-trap";
import { useNow } from "@/lib/admin/hooks/use-now";
import { formatAbsolute, formatRelative } from "@/lib/admin/support/format";
import {
  formatCurrency,
  formatDate,
  getInitials,
} from "@/lib/admin/formatters";
import { Can, PERMISSIONS } from "@/lib/admin/rbac";
import { routes } from "@/lib/admin/routes";
import {
  ORDER_STATUS_LABEL,
  ORDER_STATUS_VARIANT,
  RISK_VARIANT,
  SEGMENT_LABEL,
  SEGMENT_VARIANT,
  STATUS_VARIANT,
  STOREFRONT_STATUS_LABEL,
  STOREFRONT_STATUS_VARIANT,
} from "@/lib/admin/storefront-users/constants";
import {
  StorefrontUserAddTagModal,
  StorefrontUserCouponModal,
  StorefrontUserNotifyModal,
  StorefrontUserSegmentModal,
  StorefrontUserSuspendModal,
} from "@/components/admin/storefront-users/storefront-user-action-modals";
import type { StorefrontUserSegment } from "@/lib/admin/types/storefront-user";

type Tab = "overview" | "orders" | "financial" | "activity" | "preferences";

const TABS: { key: Tab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "orders", label: "Orders" },
  { key: "financial", label: "Financial" },
  { key: "activity", label: "Activity" },
  { key: "preferences", label: "Preferences" },
];

interface MerchantStorefrontUserDetailDrawerProps {
  user: StorefrontUser | null;
  storefront?: UnifiedStorefront;
  orders: StorefrontUserOrder[];
  onClose: () => void;
  onAddTag: (id: string, tag: string) => void;
  onRemoveTag: (id: string, tag: string) => void;
  onAddToSegment: (id: string, segment: StorefrontUserSegment, note: string) => void;
  onSuspend: (id: string, reason: string) => void;
  onReactivate: (id: string) => void;
  onSendNotification: (
    id: string,
    channel: "email" | "sms" | "push",
    message: string
  ) => void;
  onSendCoupon: (
    id: string,
    code: string,
    amount: number,
    reason: string
  ) => void;
  onRevealPII: (id: string) => void;
  onResetPassword: (id: string) => void;
}

export function MerchantStorefrontUserDetailDrawer({
  user,
  storefront,
  orders,
  onClose,
  ...rest
}: MerchantStorefrontUserDetailDrawerProps) {
  const isOpen = user !== null;
  const trapRef = useFocusTrap<HTMLDivElement>(isOpen, onClose);
  const titleId = useId();

  if (!user) return null;

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
      <MerchantStorefrontUserDetailBody
        key={user.id}
        user={user}
        storefront={storefront}
        orders={orders}
        titleId={titleId}
        onClose={onClose}
        {...rest}
      />
    </div>
  );
}

interface BodyProps
  extends Omit<
    MerchantStorefrontUserDetailDrawerProps,
    "user" | "storefront" | "orders"
  > {
  user: StorefrontUser;
  storefront?: UnifiedStorefront;
  orders: StorefrontUserOrder[];
  titleId: string;
}

function MerchantStorefrontUserDetailBody({
  user,
  storefront,
  orders,
  titleId,
  onClose,
  onAddTag,
  onRemoveTag,
  onAddToSegment,
  onSuspend,
  onReactivate,
  onSendNotification,
  onSendCoupon,
  onRevealPII,
  onResetPassword,
}: BodyProps) {
  const now = useNow();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [showSensitive, setShowSensitive] = useState(false);
  const [showRevealConfirm, setShowRevealConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showReactivateConfirm, setShowReactivateConfirm] = useState(false);

  const [notifyOpen, setNotifyOpen] = useState(false);
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [tagOpen, setTagOpen] = useState(false);
  const [couponOpen, setCouponOpen] = useState(false);
  const [segmentOpen, setSegmentOpen] = useState(false);

  const sortedOrders = useMemo(
    () =>
      [...orders].sort(
        (a, b) =>
          new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime()
      ),
    [orders]
  );

  const aov = user.ordersCount > 0 ? user.totalSpent / user.ordersCount : 0;
  const refunds = user.totalRefunded ?? 0;

  const handleRevealConfirm = () => {
    setShowSensitive(true);
    setShowRevealConfirm(false);
    onRevealPII(user.id);
  };

  const storefrontLabel = storefront
    ? STOREFRONT_STATUS_LABEL[storefront.status]
    : null;
  const storefrontVariant = storefront
    ? STOREFRONT_STATUS_VARIANT[storefront.status]
    : "neutral";

  return (
    <div className="absolute right-0 top-0 flex h-full w-full max-w-2xl flex-col bg-white shadow-xl dark:bg-neutral-900">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
            {getInitials(user.name)}
          </div>
          <div className="min-w-0">
            <p id={titleId} className="truncate text-sm font-semibold">
              {user.name}
            </p>
            <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
              {user.id}
              {user.country ? ` · ${user.country}` : ""}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>

      {/* Status strip */}
      <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
        <div className="flex items-center gap-1.5">
          <StatusDot
            tone={
              user.status === "active"
                ? "success"
                : user.status === "suspended"
                ? "danger"
                : "neutral"
            }
            size="sm"
          />
          <Badge variant={STATUS_VARIANT[user.status]}>{user.status}</Badge>
        </div>
        {user.segment && (
          <Badge variant={SEGMENT_VARIANT[user.segment]}>
            {SEGMENT_LABEL[user.segment]}
          </Badge>
        )}
        <Badge variant={RISK_VARIANT[user.riskLevel]}>
          {user.riskLevel} risk
        </Badge>
        <Badge variant={storefrontVariant}>
          {storefront?.storeName ?? user.storeName}
          {storefrontLabel ? ` (${storefrontLabel})` : ""}
        </Badge>
      </div>

      {/* Cross-links */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 border-b border-neutral-200 px-4 py-2 text-xs dark:border-neutral-800">
        {storefront && (
          <>
            <Link
              href={`/admin/ecommerce/merchants?q=${encodeURIComponent(
                storefront.ownerName
              )}`}
              className="text-brand-700 hover:underline dark:text-brand-300"
            >
              Merchant
            </Link>
            <Link
              href={routes.merchantStorefrontDetail(storefront.id)}
              className="text-brand-700 hover:underline dark:text-brand-300"
            >
              Storefront
            </Link>
          </>
        )}
        <Link
          href={`${routes.orders}?userId=${user.id}`}
          className="text-brand-700 hover:underline dark:text-brand-300"
        >
          Orders
        </Link>
        <Link
          href={`${routes.support}?q=${encodeURIComponent(user.email)}`}
          className="text-brand-700 hover:underline dark:text-brand-300"
        >
          Support
        </Link>
        <Link
          href={`/admin/audit-logs?resourceId=${user.id}`}
          className="text-brand-700 hover:underline dark:text-brand-300"
        >
          Audit log
        </Link>
        <Link
          href={`/admin/security?q=${encodeURIComponent(user.email)}`}
          className="text-brand-700 hover:underline dark:text-brand-300"
        >
          Security
        </Link>
      </div>

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Storefront user sections"
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
              aria-controls={`msfu-panel-${tab.key}`}
              id={`msfu-tab-${tab.key}`}
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
        id={`msfu-panel-${activeTab}`}
        aria-labelledby={`msfu-tab-${activeTab}`}
        className="flex-1 overflow-y-auto p-4"
      >
        {activeTab === "overview" && (
          <div className="space-y-4">
            <section className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  Contact information
                </p>
                {!showSensitive && (
                  <Can permission={PERMISSIONS.STOREFRONT_USERS_REVEAL_PII}>
                    <button
                      type="button"
                      onClick={() => setShowRevealConfirm(true)}
                      className="text-xs font-medium text-brand-700 hover:underline dark:text-brand-300"
                    >
                      Reveal
                    </button>
                  </Can>
                )}
              </div>
              <dl className="mt-2 grid grid-cols-[5rem_1fr] gap-x-3 gap-y-1.5 text-sm">
                <dt className="text-neutral-500 dark:text-neutral-400">
                  Email
                </dt>
                <dd className="font-mono text-xs text-neutral-800 dark:text-neutral-200">
                  {showSensitive ? user.email : "•••••••@•••••"}
                </dd>
                <dt className="text-neutral-500 dark:text-neutral-400">
                  Phone
                </dt>
                <dd className="font-mono text-xs text-neutral-800 dark:text-neutral-200">
                  {showSensitive ? user.phone : "••• ••• ••••"}
                </dd>
              </dl>
              {showSensitive && (
                <p className="mt-2 text-xs text-warning-700 dark:text-warning-300">
                  Sensitive data is now visible. This reveal was recorded.
                </p>
              )}
            </section>

            {storefront && (
              <section className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
                <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  Storefront context
                </p>
                <dl className="mt-2 grid grid-cols-[6rem_1fr] gap-x-3 gap-y-1.5 text-sm">
                  <dt className="text-neutral-500 dark:text-neutral-400">
                    Storefront
                  </dt>
                  <dd className="text-neutral-900 dark:text-neutral-100">
                    {storefront.storeName}
                  </dd>
                  <dt className="text-neutral-500 dark:text-neutral-400">
                    Merchant
                  </dt>
                  <dd className="text-neutral-900 dark:text-neutral-100">
                    {storefront.ownerName}
                  </dd>
                  <dt className="text-neutral-500 dark:text-neutral-400">
                    Status
                  </dt>
                  <dd>
                    <Badge variant={storefrontVariant} size="sm">
                      {storefrontLabel}
                    </Badge>
                  </dd>
                </dl>
              </section>
            )}

            <section className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                Referral
              </p>
              <dl className="mt-2 grid grid-cols-[6rem_1fr] gap-x-3 gap-y-1.5 text-sm">
                <dt className="text-neutral-500 dark:text-neutral-400">
                  Code
                </dt>
                <dd className="font-mono text-xs text-neutral-900 dark:text-neutral-100">
                  {user.referralCode ?? "—"}
                </dd>
                <dt className="text-neutral-500 dark:text-neutral-400">
                  Referred by
                </dt>
                <dd className="text-neutral-900 dark:text-neutral-100">
                  {user.referredBy ?? "—"}
                </dd>
              </dl>
            </section>

            <section className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  Tags
                </p>
                <Can permission={PERMISSIONS.STOREFRONT_USERS_TAG}>
                  <button
                    type="button"
                    onClick={() => setTagOpen(true)}
                    className="text-xs font-medium text-brand-700 hover:underline dark:text-brand-300"
                  >
                    Add tag
                  </button>
                </Can>
              </div>
              {user.tags.length === 0 ? (
                <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                  No tags.
                </p>
              ) : (
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {user.tags.map((tag) => (
                    <li
                      key={tag}
                      className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                    >
                      {tag}
                      <Can permission={PERMISSIONS.STOREFRONT_USERS_TAG}>
                        <button
                          type="button"
                          aria-label={`Remove tag ${tag}`}
                          onClick={() => onRemoveTag(user.id, tag)}
                          className="text-neutral-500 hover:text-danger-600 dark:hover:text-danger-400"
                        >
                          x
                        </button>
                      </Can>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {user.reports.length > 0 && (
              <section className="rounded-lg border border-danger-200 bg-danger-50 p-3 dark:border-danger-800/60 dark:bg-danger-900/20">
                <p className="text-xs font-medium uppercase tracking-wide text-danger-700 dark:text-danger-300">
                  Reports from the merchant
                </p>
                <ul className="mt-2 space-y-2">
                  {user.reports.map((report) => (
                    <li key={report.id} className="text-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-medium text-danger-900 dark:text-danger-100">
                          {report.reporterName} ({report.reporterType})
                        </span>
                        <Badge
                          variant={
                            report.status === "pending"
                              ? "warning"
                              : report.status === "action_taken"
                              ? "success"
                              : "neutral"
                          }
                          size="sm"
                        >
                          {report.status}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-danger-800 dark:text-danger-200">
                        {report.reason}
                      </p>
                      {report.details && (
                        <p className="mt-0.5 text-neutral-600 dark:text-neutral-400">
                          {report.details}
                        </p>
                      )}
                      <time
                        dateTime={report.timestamp}
                        title={formatAbsolute(report.timestamp)}
                        className="mt-0.5 block text-[11px] text-danger-700 dark:text-danger-300"
                      >
                        {formatRelative(report.timestamp, now)}
                      </time>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-md bg-neutral-50 p-3 dark:bg-neutral-900">
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Orders
                </p>
                <p className="mt-1 text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  {user.ordersCount}
                </p>
              </div>
              <div className="rounded-md bg-neutral-50 p-3 dark:bg-neutral-900">
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Spent
                </p>
                <p className="mt-1 text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  {formatCurrency(user.totalSpent)}
                </p>
              </div>
              <div className="rounded-md bg-neutral-50 p-3 dark:bg-neutral-900">
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Store credit
                </p>
                <p className="mt-1 text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  {formatCurrency(user.walletBalance)}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                Orders ({sortedOrders.length})
              </p>
              <Link
                href={`${routes.orders}?userId=${user.id}`}
                className="text-xs font-medium text-brand-700 hover:underline dark:text-brand-300"
              >
                View all
              </Link>
            </div>

            {sortedOrders.length === 0 ? (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                No orders from this customer yet.
              </p>
            ) : (
              <ul className="space-y-2">
                {sortedOrders.map((order) => (
                  <li
                    key={order.id}
                    className="rounded-md border border-neutral-200 p-3 text-xs dark:border-neutral-700"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-neutral-900 dark:text-neutral-100">
                          {order.productName}
                        </p>
                        <p className="mt-0.5 text-neutral-500 dark:text-neutral-400">
                          <span className="font-mono">{order.id}</span> ·{" "}
                          <time
                            dateTime={order.placedAt}
                            title={formatAbsolute(order.placedAt)}
                          >
                            {formatRelative(order.placedAt, now)}
                          </time>
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                          {formatCurrency(order.amount)}
                        </p>
                        <Badge
                          variant={ORDER_STATUS_VARIANT[order.status]}
                          size="sm"
                        >
                          {ORDER_STATUS_LABEL[order.status]}
                        </Badge>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {activeTab === "financial" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md bg-neutral-50 p-3 dark:bg-neutral-900">
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Lifetime spend
                </p>
                <p className="mt-1 text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  {formatCurrency(user.totalSpent)}
                </p>
              </div>
              <div className="rounded-md bg-neutral-50 p-3 dark:bg-neutral-900">
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Average order value
                </p>
                <p className="mt-1 text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  {formatCurrency(aov)}
                </p>
              </div>
              <div className="rounded-md bg-neutral-50 p-3 dark:bg-neutral-900">
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Orders
                </p>
                <p className="mt-1 text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  {user.ordersCount}
                </p>
              </div>
              <div className="rounded-md bg-neutral-50 p-3 dark:bg-neutral-900">
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Refunded
                </p>
                <p className="mt-1 text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  {formatCurrency(refunds)}
                </p>
              </div>
            </div>

            <section className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                Store credit
              </p>
              <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {formatCurrency(user.walletBalance)}
              </p>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                Store credit is managed by the merchant from their storefront
                admin, not from Atlas.
              </p>
            </section>

            <section className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                Timeline
              </p>
              <dl className="mt-2 grid grid-cols-[6rem_1fr] gap-x-3 gap-y-1.5 text-sm">
                <dt className="text-neutral-500 dark:text-neutral-400">
                  Joined
                </dt>
                <dd>
                  <time
                    dateTime={user.joinedAt}
                    title={formatAbsolute(user.joinedAt)}
                    className="text-neutral-900 dark:text-neutral-100"
                  >
                    {formatRelative(user.joinedAt, now)}
                  </time>
                </dd>
                <dt className="text-neutral-500 dark:text-neutral-400">
                  Last order
                </dt>
                <dd className="text-neutral-900 dark:text-neutral-100">
                  {user.lastOrderAt ? (
                    <time
                      dateTime={user.lastOrderAt}
                      title={formatAbsolute(user.lastOrderAt)}
                    >
                      {formatRelative(user.lastOrderAt, now)}
                    </time>
                  ) : (
                    "No orders yet"
                  )}
                </dd>
              </dl>
            </section>
          </div>
        )}

        {activeTab === "activity" && (
          <div className="space-y-4">
            <section>
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                Activity and admin actions
              </p>
              {(user.activityLog.length === 0 &&
                (user.auditTrail ?? []).length === 0) ? (
                <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                  No activity recorded.
                </p>
              ) : (
                <ol className="mt-2 space-y-2">
                  {[
                    ...user.activityLog.map((a) => ({
                      kind: "activity" as const,
                      id: a.id,
                      timestamp: a.timestamp,
                      label: a.action,
                      meta: undefined as string | undefined,
                    })),
                    ...(user.auditTrail ?? []).map((a) => ({
                      kind: "audit" as const,
                      id: a.id,
                      timestamp: a.timestamp,
                      label: a.action,
                      meta: a.admin,
                    })),
                  ]
                    .sort(
                      (a, b) =>
                        new Date(b.timestamp).getTime() -
                        new Date(a.timestamp).getTime()
                    )
                    .map((entry) => (
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
            </section>

            <section>
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                Security events
              </p>
              {user.securityEvents.length === 0 ? (
                <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                  No security events.
                </p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {user.securityEvents.map((sec) => (
                    <li
                      key={sec.id}
                      className="rounded-md border border-neutral-200 p-2 text-xs dark:border-neutral-700"
                    >
                      <p className="font-medium text-neutral-900 dark:text-neutral-100">
                        {sec.event}
                      </p>
                      <p className="mt-0.5 text-neutral-500 dark:text-neutral-400">
                        {sec.ip && (
                          <span className="font-mono">{sec.ip} · </span>
                        )}
                        <time
                          dateTime={sec.timestamp}
                          title={formatAbsolute(sec.timestamp)}
                        >
                          {formatRelative(sec.timestamp, now)}
                        </time>
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}

        {activeTab === "preferences" && (
          <section>
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Notification preferences
            </p>
            {user.notificationPreferences.length === 0 ? (
              <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                No preferences set.
              </p>
            ) : (
              <ul className="mt-2 space-y-1">
                {user.notificationPreferences.map((pref) => (
                  <li
                    key={pref.channel}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="capitalize text-neutral-800 dark:text-neutral-200">
                      {pref.channel}
                    </span>
                    <Badge
                      variant={pref.enabled ? "success" : "neutral"}
                      size="sm"
                    >
                      {pref.enabled ? "On" : "Off"}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>

      {/* Footer actions */}
      <div className="flex flex-wrap items-center gap-2 border-t border-neutral-200 px-4 py-3 dark:border-neutral-800">
        <Can permission={PERMISSIONS.STOREFRONT_USERS_NOTIFY}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setNotifyOpen(true)}
          >
            Send notification
          </Button>
        </Can>

        <Can permission={PERMISSIONS.STOREFRONT_USERS_COUPON}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCouponOpen(true)}
          >
            Send coupon
          </Button>
        </Can>

        <Can permission={PERMISSIONS.STOREFRONT_USERS_SEGMENT}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSegmentOpen(true)}
          >
            Add to segment
          </Button>
        </Can>

        <Can permission={PERMISSIONS.RESET_SECURITY}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowResetConfirm(true)}
          >
            Reset password
          </Button>
        </Can>

        {user.status === "active" ? (
          <Can permission={PERMISSIONS.STOREFRONT_USERS_SUSPEND}>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setSuspendOpen(true)}
            >
              Suspend
            </Button>
          </Can>
        ) : user.status === "suspended" ? (
          <Can permission={PERMISSIONS.STOREFRONT_USERS_SUSPEND}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowReactivateConfirm(true)}
            >
              Reactivate
            </Button>
          </Can>
        ) : null}
      </div>

      {/* Modals */}
      <StorefrontUserNotifyModal
        open={notifyOpen}
        userName={user.name}
        storefrontName={storefront?.storeName ?? user.storeName}
        onClose={() => setNotifyOpen(false)}
        onConfirm={(channel, message) =>
          onSendNotification(user.id, channel, message)
        }
      />

      <StorefrontUserSuspendModal
        open={suspendOpen}
        userName={user.name}
        storefrontName={storefront?.storeName ?? user.storeName}
        onClose={() => setSuspendOpen(false)}
        onConfirm={(reason) => {
          onSuspend(user.id, reason);
          onClose();
        }}
      />

      <StorefrontUserAddTagModal
        open={tagOpen}
        userName={user.name}
        existingTags={user.tags}
        onClose={() => setTagOpen(false)}
        onConfirm={(tag) => onAddTag(user.id, tag)}
      />

      <StorefrontUserCouponModal
        open={couponOpen}
        userName={user.name}
        storefrontName={storefront?.storeName ?? user.storeName}
        onClose={() => setCouponOpen(false)}
        onConfirm={(code, amount, reason) =>
          onSendCoupon(user.id, code, amount, reason)
        }
      />

      <StorefrontUserSegmentModal
        open={segmentOpen}
        userName={user.name}
        currentSegment={user.segment}
        onClose={() => setSegmentOpen(false)}
        onConfirm={(segment, note) => onAddToSegment(user.id, segment, note)}
      />

      <ConfirmDialog
        open={showRevealConfirm}
        title="Reveal sensitive data?"
        description="Contact details will be displayed and this reveal will be recorded in the user's audit trail."
        confirmLabel="Reveal"
        danger
        onConfirm={handleRevealConfirm}
        onCancel={() => setShowRevealConfirm(false)}
      />

      <ConfirmDialog
        open={showResetConfirm}
        title={`Send password reset to ${user.name}?`}
        description="A password reset link will be emailed to this user. The link expires in one hour."
        confirmLabel="Send reset link"
        onConfirm={() => {
          onResetPassword(user.id);
          setShowResetConfirm(false);
        }}
        onCancel={() => setShowResetConfirm(false)}
      />

      <ConfirmDialog
        open={showReactivateConfirm}
        title={`Reactivate ${user.name}?`}
        description={`${user.name} will be able to place orders again on ${
          storefront?.storeName ?? user.storeName
        }. Their history is preserved.`}
        confirmLabel="Reactivate"
        onConfirm={() => {
          onReactivate(user.id);
          setShowReactivateConfirm(false);
          onClose();
        }}
        onCancel={() => setShowReactivateConfirm(false)}
      />
    </div>
  );
}