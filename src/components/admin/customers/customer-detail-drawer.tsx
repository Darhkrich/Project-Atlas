// components/admin/customers/customer-detail-drawer.tsx
"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { Customer } from "@/lib/admin/types/customer";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { AtlasIcon } from "@/components/atlas/icons";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { cn } from "@/lib/utils";
import { useFocusTrap } from "@/lib/admin/hooks/use-focus-trap";
import { useNow } from "@/lib/admin/hooks/use-now";
import { formatAbsolute, formatRelative } from "@/lib/admin/support/format";
import {
  formatCurrency,
  formatDateTime,
  getInitials,
} from "@/lib/admin/formatters";
import { Can } from "@/lib/admin/rbac";
import { PERMISSIONS } from "@/lib/admin/rbac";
import { routes } from "@/lib/admin/routes";
import {
  RISK_VARIANT,
  STATUS_VARIANT,
} from "@/lib/admin/customers/constants";
import {
  NotifyModal,
  SuspendModal,
  WalletAdjustModal,
} from "./customer-action-modals";
import type { WalletAdjustMethod } from "@/lib/admin/customers/constants";

type Tab = "overview" | "financial" | "activity" | "preferences" | "usage";

const TABS: { key: Tab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "financial", label: "Financial" },
  { key: "activity", label: "Activity" },
  { key: "preferences", label: "Preferences" },
  { key: "usage", label: "Usage" },
];

interface CustomerDetailDrawerProps {
  customer: Customer | null;
  onClose: () => void;
  onAdjustWallet: (
    id: string,
    amount: number,
    reason: string,
    method: WalletAdjustMethod
  ) => void;
  onAddTag: (id: string, tag: string) => void;
  onRemoveTag: (id: string, tag: string) => void;
  onSuspend: (id: string, reason: string) => void;
  onReactivate: (id: string) => void;
  onSendNotification: (
    id: string,
    channel: "email" | "sms" | "push",
    message: string
  ) => void;
  onRevealPII: (id: string) => void;
  onResetPassword: (id: string) => void;
}

export function CustomerDetailDrawer({
  customer,
  onClose,
  onAdjustWallet,
  onAddTag,
  onRemoveTag,
  onSuspend,
  onReactivate,
  onSendNotification,
  onRevealPII,
  onResetPassword,
}: CustomerDetailDrawerProps) {
  const isOpen = customer !== null;
  const trapRef = useFocusTrap<HTMLDivElement>(isOpen, onClose);
  const titleId = useId();

  if (!customer) return null;

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

      <CustomerDetailBody
        key={customer.id}
        customer={customer}
        titleId={titleId}
        onClose={onClose}
        onAdjustWallet={onAdjustWallet}
        onAddTag={onAddTag}
        onRemoveTag={onRemoveTag}
        onSuspend={onSuspend}
        onReactivate={onReactivate}
        onSendNotification={onSendNotification}
        onRevealPII={onRevealPII}
        onResetPassword={onResetPassword}
      />
    </div>
  );
}

interface BodyProps {
  customer: Customer;
  titleId: string;
  onClose: () => void;
  onAdjustWallet: (
    id: string,
    amount: number,
    reason: string,
    method: WalletAdjustMethod
  ) => void;
  onAddTag: (id: string, tag: string) => void;
  onRemoveTag: (id: string, tag: string) => void;
  onSuspend: (id: string, reason: string) => void;
  onReactivate: (id: string) => void;
  onSendNotification: (
    id: string,
    channel: "email" | "sms" | "push",
    message: string
  ) => void;
  onRevealPII: (id: string) => void;
  onResetPassword: (id: string) => void;
}

function CustomerDetailBody({
  customer,
  titleId,
  onClose,
  onAdjustWallet,
  onAddTag,
  onRemoveTag,
  onSuspend,
  onReactivate,
  onSendNotification,
  onRevealPII,
  onResetPassword,
}: BodyProps) {
  const now = useNow();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [showSensitive, setShowSensitive] = useState(false);
  const [showRevealConfirm, setShowRevealConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [newTag, setNewTag] = useState("");

  const handleAddTag = () => {
    const trimmed = newTag.trim();
    if (!trimmed) return;
    onAddTag(customer.id, trimmed);
    setNewTag("");
  };

  const handleConfirmReveal = () => {
    setShowSensitive(true);
    setShowRevealConfirm(false);
    onRevealPII(customer.id);
  };

  return (
    <div className="absolute right-0 top-0 flex h-full w-full max-w-2xl flex-col bg-white shadow-xl dark:bg-neutral-900">
      <div className="flex items-start justify-between gap-3 border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
            {getInitials(customer.name)}
          </div>
          <div className="min-w-0">
            <p id={titleId} className="truncate text-sm font-semibold">
              {customer.name}
            </p>
            <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
              {customer.id}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
        <Badge variant={STATUS_VARIANT[customer.status]}>
          {customer.status}
        </Badge>
        <Badge variant={RISK_VARIANT[customer.riskLevel]}>
          {customer.riskLevel} risk
        </Badge>
        <Badge variant="info" size="sm">
          Source: {customer.source}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-x-3 gap-y-1 border-b border-neutral-200 px-4 py-2 text-xs dark:border-neutral-800">
        <Link
          href={`${routes.orders}?customerId=${customer.id}`}
          className="text-brand-700 hover:underline dark:text-brand-300"
        >
          Orders
        </Link>
        <Link
          href={`${routes.support}?q=${encodeURIComponent(customer.email)}`}
          className="text-brand-700 hover:underline dark:text-brand-300"
        >
          Support tickets
        </Link>
        <Link
          href={`/admin/audit-logs?resourceId=${customer.id}`}
          className="text-brand-700 hover:underline dark:text-brand-300"
        >
          Audit log
        </Link>
        <Link
          href={`/admin/security?q=${encodeURIComponent(customer.email)}`}
          className="text-brand-700 hover:underline dark:text-brand-300"
        >
          Security
        </Link>
      </div>

      <div
        role="tablist"
        aria-label="Customer sections"
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
              aria-controls={`customer-panel-${tab.key}`}
              id={`customer-tab-${tab.key}`}
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

      <div
        role="tabpanel"
        id={`customer-panel-${activeTab}`}
        aria-labelledby={`customer-tab-${activeTab}`}
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
                  <Can permission={PERMISSIONS.CUSTOMERS_REVEAL_PII}>
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
                  {showSensitive ? customer.email : "•••••••@•••••"}
                </dd>
                <dt className="text-neutral-500 dark:text-neutral-400">
                  Phone
                </dt>
                <dd className="font-mono text-xs text-neutral-800 dark:text-neutral-200">
                  {showSensitive ? customer.phone : "••• ••• ••••"}
                </dd>
              </dl>
              {showSensitive && (
                <p className="mt-2 text-xs text-warning-700 dark:text-warning-300">
                  Sensitive data is now visible. This reveal has been logged.
                </p>
              )}
            </section>

            <section className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                Referral
              </p>
              <dl className="mt-2 grid grid-cols-[5rem_1fr] gap-x-3 gap-y-1.5 text-sm">
                <dt className="text-neutral-500 dark:text-neutral-400">
                  Code
                </dt>
                <dd className="font-mono text-xs text-neutral-800 dark:text-neutral-200">
                  {customer.referralCode || "—"}
                </dd>
                <dt className="text-neutral-500 dark:text-neutral-400">
                  Referred by
                </dt>
                <dd className="text-neutral-800 dark:text-neutral-200">
                  {customer.referredBy || "—"}
                </dd>
                <dt className="text-neutral-500 dark:text-neutral-400">
                  Referrals
                </dt>
                <dd className="text-neutral-800 dark:text-neutral-200">
                  {customer.referralsCount}
                </dd>
              </dl>
            </section>

            <section className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                Tags
              </p>
              {customer.tags.length === 0 ? (
                <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                  No tags yet.
                </p>
              ) : (
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {customer.tags.map((tag) => (
                    <li
                      key={tag}
                      className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                    >
                      {tag}
                      <Can permission={PERMISSIONS.CUSTOMERS_EDIT}>
                        <button
                          type="button"
                          aria-label={`Remove tag ${tag}`}
                          onClick={() => onRemoveTag(customer.id, tag)}
                          className="text-neutral-500 hover:text-danger-600 dark:hover:text-danger-400"
                        >
                          x
                        </button>
                      </Can>
                    </li>
                  ))}
                </ul>
              )}
              <Can permission={PERMISSIONS.CUSTOMERS_EDIT}>
                <div className="mt-3 flex gap-2">
                  <Input
                    aria-label="New tag"
                    className="h-8 text-xs"
                    placeholder="Add tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddTag}
                    disabled={!newTag.trim()}
                  >
                    Add
                  </Button>
                </div>
              </Can>
            </section>

            <section className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  Support tickets
                </p>
                <Link
                  href={`${routes.support}?q=${encodeURIComponent(
                    customer.email
                  )}`}
                  className="text-xs font-medium text-brand-700 hover:underline dark:text-brand-300"
                >
                  View all
                </Link>
              </div>
              {customer.supportTickets.length === 0 ? (
                <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                  No tickets.
                </p>
              ) : (
                <ul className="mt-2 space-y-1.5">
                  {customer.supportTickets.map((ticket) => (
                    <li
                      key={ticket.id}
                      className="flex items-center justify-between gap-2 text-sm"
                    >
                      <span className="truncate text-neutral-800 dark:text-neutral-200">
                        {ticket.subject}
                      </span>
                      <Badge
                        variant={
                          ticket.status === "resolved"
                            ? "success"
                            : ticket.status === "pending"
                            ? "warning"
                            : "info"
                        }
                        size="sm"
                      >
                        {ticket.status}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {customer.reports && customer.reports.length > 0 && (
              <section className="rounded-lg border border-danger-200 bg-danger-50 p-3 dark:border-danger-800/60 dark:bg-danger-900/20">
                <p className="text-xs font-medium uppercase tracking-wide text-danger-700 dark:text-danger-300">
                  Reports
                </p>
                <ul className="mt-2 space-y-2">
                  {customer.reports.map((report) => (
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
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}

        {activeTab === "financial" && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-md bg-neutral-50 p-3 dark:bg-neutral-900">
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Wallet
                </p>
                <p className="mt-1 text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  {formatCurrency(customer.walletBalance)}
                </p>
              </div>
              <div className="rounded-md bg-neutral-50 p-3 dark:bg-neutral-900">
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Points
                </p>
                <p className="mt-1 text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  {customer.atlasPointsBalance}
                </p>
              </div>
              <div className="rounded-md bg-neutral-50 p-3 dark:bg-neutral-900">
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Total spent
                </p>
                <p className="mt-1 text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  {formatCurrency(customer.totalSpent)}
                </p>
              </div>
            </div>

            <Can permission={PERMISSIONS.CUSTOMERS_WALLET}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setWalletOpen(true)}
              >
                Adjust wallet
              </Button>
            </Can>

            {customer.last6MonthsSpend.length > 0 && (
              <section>
                <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  Spend (last 6 months)
                </p>
                <ul className="mt-2 space-y-1">
                  {customer.last6MonthsSpend.map((m) => (
                    <li
                      key={m.month}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="text-neutral-700 dark:text-neutral-300">
                        {m.month}
                      </span>
                      <span className="font-medium text-neutral-900 dark:text-neutral-100">
                        {formatCurrency(m.amount)}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section>
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                Atlas Points history
              </p>
              {customer.atlasPointsHistory.length === 0 ? (
                <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                  No points activity.
                </p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {customer.atlasPointsHistory.map((pt) => (
                    <li
                      key={pt.id}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="text-neutral-700 dark:text-neutral-300">
                        {pt.description}
                      </span>
                      <span
                        className={
                          pt.type === "earned"
                            ? "text-success-700 dark:text-success-300"
                            : "text-danger-700 dark:text-danger-300"
                        }
                      >
                        {pt.type === "earned" ? "+" : "-"}
                        {pt.amount}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {customer.savedPaymentMethods.length > 0 && (
              <section>
                <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  Saved payment methods
                </p>
                <ul className="mt-2 space-y-1">
                  {customer.savedPaymentMethods.map((pm) => (
                    <li
                      key={pm.id}
                      className="flex items-center gap-2 text-xs text-neutral-700 dark:text-neutral-300"
                    >
                      <AtlasIcon
                        name={
                          pm.type === "momo"
                            ? "mobile"
                            : pm.type === "card"
                            ? "card"
                            : pm.type === "bank"
                            ? "bank"
                            : "wallet"
                        }
                        className="h-3.5 w-3.5 text-neutral-500"
                      />
                      {pm.label}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}

        {activeTab === "activity" && (
          <div className="space-y-4">
            <section>
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                Activity log
              </p>
              {customer.activityLog.length === 0 ? (
                <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                  No activity recorded.
                </p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {customer.activityLog.map((act) => (
                    <li
                      key={act.id}
                      className="rounded-md bg-neutral-50 p-2 text-xs dark:bg-neutral-900"
                    >
                      <p className="font-medium text-neutral-900 dark:text-neutral-100">
                        {act.action}
                      </p>
                      <p className="mt-0.5 text-neutral-500 dark:text-neutral-400">
                        {formatDateTime(act.timestamp)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                Security events
              </p>
              {customer.securityEvents.length === 0 ? (
                <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                  No security events.
                </p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {customer.securityEvents.map((sec) => (
                    <li
                      key={sec.id}
                      className="rounded-md bg-neutral-50 p-2 text-xs dark:bg-neutral-900"
                    >
                      <p className="font-medium text-neutral-900 dark:text-neutral-100">
                        {sec.event}
                      </p>
                      <p className="mt-0.5 text-neutral-500 dark:text-neutral-400">
                        {sec.ip && (
                          <span className="font-mono">{sec.ip} · </span>
                        )}
                        {formatDateTime(sec.timestamp)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}

        {activeTab === "preferences" && (
          <div className="space-y-4">
            <section>
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                Devices
              </p>
              {customer.devices.length === 0 ? (
                <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                  No devices recorded.
                </p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {customer.devices.map((device) => (
                    <li
                      key={device.id}
                      className="flex items-center justify-between gap-2 rounded-md bg-neutral-50 p-2 text-xs dark:bg-neutral-900"
                    >
                      <span className="text-neutral-800 dark:text-neutral-200">
                        {device.deviceName}
                      </span>
                      <span className="text-neutral-500 dark:text-neutral-400">
                        {device.isCurrent ? (
                          <Badge variant="success" size="sm">
                            Current
                          </Badge>
                        ) : (
                          <time
                            dateTime={device.lastActive}
                            title={formatAbsolute(device.lastActive)}
                          >
                            {formatRelative(device.lastActive, now)}
                          </time>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                Notification preferences
              </p>
              {customer.notificationPreferences.length === 0 ? (
                <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                  No preferences set.
                </p>
              ) : (
                <ul className="mt-2 space-y-1">
                  {customer.notificationPreferences.map((pref) => (
                    <li
                      key={pref.channel}
                      className="flex items-center justify-between text-xs"
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
          </div>
        )}

        {activeTab === "usage" && (
          <section>
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Data and airtime usage
            </p>
            {customer.dataUsage.length === 0 ? (
              <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                No usage recorded.
              </p>
            ) : (
              <ul className="mt-2 space-y-2">
                {customer.dataUsage.map((usage) => (
                  <li
                    key={usage.month}
                    className="flex items-center justify-between gap-2 rounded-md bg-neutral-50 p-2 text-xs dark:bg-neutral-900"
                  >
                    <span className="font-medium text-neutral-800 dark:text-neutral-200">
                      {usage.month}
                    </span>
                    <span className="text-neutral-500 dark:text-neutral-400">
                      Data: {usage.dataUsedGB}GB · Airtime:{" "}
                      {formatCurrency(usage.airtimeUsedGHS)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-neutral-200 px-4 py-3 dark:border-neutral-800">
        <Can permission={PERMISSIONS.CUSTOMERS_NOTIFY}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setNotifyOpen(true)}
          >
            Send notification
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
        {customer.status === "active" ? (
          <Can permission={PERMISSIONS.CUSTOMERS_SUSPEND}>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setSuspendOpen(true)}
            >
              Suspend
            </Button>
          </Can>
        ) : (
          <Can permission={PERMISSIONS.CUSTOMERS_SUSPEND}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onReactivate(customer.id)}
            >
              Reactivate
            </Button>
          </Can>
        )}
      </div>

      <WalletAdjustModal
        open={walletOpen}
        customerName={customer.name}
        currentBalance={customer.walletBalance}
        onClose={() => setWalletOpen(false)}
        onConfirm={(amount, reason, method) =>
          onAdjustWallet(customer.id, amount, reason, method)
        }
      />

      <SuspendModal
        open={suspendOpen}
        customerName={customer.name}
        onClose={() => setSuspendOpen(false)}
        onConfirm={(reason) => {
          onSuspend(customer.id, reason);
          onClose();
        }}
      />

      <NotifyModal
        open={notifyOpen}
        customerName={customer.name}
        onClose={() => setNotifyOpen(false)}
        onConfirm={(channel, message) =>
          onSendNotification(customer.id, channel, message)
        }
      />

      <ConfirmDialog
        open={showRevealConfirm}
        title="Reveal sensitive data?"
        description="Contact details will be displayed and this reveal will be recorded on the customer's activity log."
        confirmLabel="Reveal"
        danger
        onConfirm={handleConfirmReveal}
        onCancel={() => setShowRevealConfirm(false)}
      />

      <ConfirmDialog
        open={showResetConfirm}
        title={`Send password reset to ${customer.name}?`}
        description="A reset link will be emailed to the customer. The link expires in one hour."
        confirmLabel="Send reset link"
        onConfirm={() => {
          onResetPassword(customer.id);
          setShowResetConfirm(false);
        }}
        onCancel={() => setShowResetConfirm(false)}
      />
    </div>
  );
}