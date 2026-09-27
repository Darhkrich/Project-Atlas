/* eslint-disable react/no-unescaped-entities */
// components/admin/resellers/reseller-detail-drawer.tsx
"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import type { Reseller } from "@/lib/admin/types/reseller";
import { mockStorefronts } from "@/lib/admin/mock/storefronts";
import { useCommissions } from "@/lib/admin/hooks/use-commissions";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { StatusDot } from "@/components/admin/ui/status-dot";
import { cn } from "@/lib/utils";
import { useFocusTrap } from "@/lib/admin/hooks/use-focus-trap";
import { useNow } from "@/lib/admin/hooks/use-now";
import { formatAbsolute, formatRelative } from "@/lib/admin/support/format";
import {
  formatCurrency,
  formatDateTime,
  getInitials,
} from "@/lib/admin/formatters";
import { Can, PERMISSIONS } from "@/lib/admin/rbac";
import { routes } from "@/lib/admin/routes";
import { downloadCsv } from "@/lib/admin/support/csv-export";
import {
  STATUS_LABEL,
  STATUS_VARIANT,
  VERIFICATION_LABEL,
  VERIFICATION_VARIANT,
  STOREFRONT_STATUS_LABEL,
  STOREFRONT_STATUS_VARIANT,
} from "@/lib/admin/resellers/constants";
import {
  computeCommissionTotals,
  tierByName,
} from "@/lib/admin/resellers/helpers";
import { resellerCommissionsToCsv } from "@/lib/admin/resellers/csv-export";
import { StorefrontUsersList } from "@/components/admin/shared/storefront-users-list";
import {
  ResellerWalletAdjustModal,
  ResellerWalletFreezeModal,
  ResellerSuspendModal,
  ResellerNotifyModal,
  ResellerTierChangeModal,
  ResellerVerificationModal,
  ResellerResetSecurityModal,
  type VerificationDocument,
} from "./reseller-action-modals";

type Tab = "overview" | "financial" | "storefront" | "users" | "activity";

const TABS: { key: Tab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "financial", label: "Financial" },
  { key: "storefront", label: "Storefront" },
  { key: "users", label: "Users" },
  { key: "activity", label: "Activity" },
];

interface ResellerDetailDrawerProps {
  reseller: Reseller | null;
  walletBalance: number;
  walletFrozen: boolean;
  onClose: () => void;
  onAdjustWallet: (
    id: string,
    businessName: string,
    amount: number,
    reason: string
  ) => void;
  onFreezeWallet: (id: string, reason: string) => void;
  onUnfreezeWallet: (id: string) => void;
  onSuspend: (id: string, reason: string) => void;
  onReactivate: (id: string) => void;
  onApproveVerification: (id: string) => void;
  onRejectVerification: (id: string, reason: string) => void;
  onToggleStorefront: (id: string) => void;
  onAssignTier: (id: string, tierId: string) => void;
  onSendNotification: (
    id: string,
    channel: "email" | "sms" | "push",
    message: string
  ) => void;
  onResetSecurity: (id: string) => void;
}

export function ResellerDetailDrawer({
  reseller,
  ...rest
}: ResellerDetailDrawerProps) {
  const isOpen = reseller !== null;
  const trapRef = useFocusTrap<HTMLDivElement>(isOpen, rest.onClose);
  const titleId = useId();

  if (!reseller) return null;

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
        onClick={rest.onClose}
        aria-hidden="true"
      />
      <ResellerDetailBody
        key={reseller.id}
        reseller={reseller}
        titleId={titleId}
        {...rest}
      />
    </div>
  );
}

interface BodyProps
  extends Omit<ResellerDetailDrawerProps, "reseller"> {
  reseller: Reseller;
  titleId: string;
}

function ResellerDetailBody({
  reseller,
  walletBalance,
  walletFrozen,
  titleId,
  onClose,
  onAdjustWallet,
  onFreezeWallet,
  onUnfreezeWallet,
  onSuspend,
  onReactivate,
  onApproveVerification,
  onRejectVerification,
  onToggleStorefront,
  onAssignTier,
  onSendNotification,
  onResetSecurity,
}: BodyProps) {
  const now = useNow();
  const commissionState = useCommissions();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const [walletOpen, setWalletOpen] = useState(false);
  const [freezeOpen, setFreezeOpen] = useState(false);
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [reactivateConfirm, setReactivateConfirm] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [tierOpen, setTierOpen] = useState(false);
  const [verificationOpen, setVerificationOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  const storefront = useMemo(
    () =>
      mockStorefronts.find(
        (s) => s.ownerId === reseller.id && s.type === "reseller"
      ),
    [reseller.id]
  );

  const commissions = useMemo(
    () =>
      commissionState.commissions.filter(
        (c) => c.resellerId === reseller.id
      ),
    [commissionState.commissions, reseller.id]
  );

  const totals = useMemo(
    () => computeCommissionTotals(reseller.id, commissions),
    [reseller.id, commissions]
  );

  const currentTier = tierByName(reseller.tierName);

  const verificationDocuments: VerificationDocument[] = useMemo(() => {
    if (reseller.verificationStatus === "not_submitted") return [];
    const verified = reseller.verificationStatus === "verified";
    return [
      {
        id: "doc-1",
        label: "Business Registration Certificate",
        type: "PDF",
        status: "submitted",
      },
      {
        id: "doc-2",
        label: "Government Issued ID",
        type: "JPG",
        status: "submitted",
      },
      {
        id: "doc-3",
        label: "Proof of Address",
        type: "PDF",
        status: verified ? "submitted" : "missing",
      },
    ];
  }, [reseller.verificationStatus]);

  const timeline = useMemo(() => {
    const activity = reseller.activityLog.map((a) => ({
      kind: "activity" as const,
      id: a.id,
      timestamp: a.timestamp,
      label: a.action,
      meta: undefined as string | undefined,
    }));
    const audit = (reseller.auditTrail ?? []).map((a) => ({
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
  }, [reseller.activityLog, reseller.auditTrail]);

  const handleExportCommissions = () => {
    if (commissions.length === 0) return;
    const csv = resellerCommissionsToCsv(commissions);
    downloadCsv(
      `atlas-reseller-${reseller.id}-commissions-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`,
      csv
    );
  };

  const confirmReactivate = () => {
    onReactivate(reseller.id);
    setReactivateConfirm(false);
  };

  return (
    <div className="absolute right-0 top-0 flex h-full w-full max-w-2xl flex-col bg-white shadow-xl dark:bg-neutral-900">
      <div className="flex items-start justify-between gap-3 border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
            {getInitials(reseller.businessName)}
          </div>
          <div className="min-w-0">
            <p id={titleId} className="truncate text-sm font-semibold">
              {reseller.businessName}
            </p>
            <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
              {reseller.storeName ?? reseller.contactPerson}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
        <div className="flex items-center gap-1.5">
          <StatusDot
            tone={
              reseller.status === "active"
                ? "success"
                : reseller.status === "suspended"
                ? "danger"
                : "warning"
            }
            size="sm"
          />
          <Badge variant={STATUS_VARIANT[reseller.status]}>
            {STATUS_LABEL[reseller.status]}
          </Badge>
        </div>
        <Badge variant={VERIFICATION_VARIANT[reseller.verificationStatus]}>
          {VERIFICATION_LABEL[reseller.verificationStatus]}
        </Badge>
        {reseller.tierName && (
          <Badge variant="info">{reseller.tierName} tier</Badge>
        )}
        {walletFrozen && (
          <Badge variant="warning">Wallet frozen</Badge>
        )}
      </div>

      <div className="flex flex-wrap gap-x-3 gap-y-1 border-b border-neutral-200 px-4 py-2 text-xs dark:border-neutral-800">
        {storefront && (
          <>
            <Link
              href={routes.resellerStorefrontDetail(storefront.id)}
              className="text-brand-700 hover:underline dark:text-brand-300"
            >
              Storefront
            </Link>
            <Link
              href={`${routes.resellerStorefrontUsers}?storefront=${storefront.id}`}
              className="text-brand-700 hover:underline dark:text-brand-300"
            >
              Storefront users
            </Link>
          </>
        )}
        <Link
          href={`${routes.orders}?resellerId=${reseller.id}`}
          className="text-brand-700 hover:underline dark:text-brand-300"
        >
          Orders
        </Link>
        <Link
          href={`/admin/audit-logs?resourceId=${reseller.id}`}
          className="text-brand-700 hover:underline dark:text-brand-300"
        >
          Audit log
        </Link>
        <Link
          href={`/admin/security?q=${encodeURIComponent(reseller.email)}`}
          className="text-brand-700 hover:underline dark:text-brand-300"
        >
          Security
        </Link>
        <Link
          href={`/admin/analytics?resellerId=${reseller.id}`}
          className="text-brand-700 hover:underline dark:text-brand-300"
        >
          Analytics
        </Link>
      </div>

      <div
        role="tablist"
        aria-label="Reseller sections"
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
              aria-controls={`reseller-panel-${tab.key}`}
              id={`reseller-tab-${tab.key}`}
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
        id={`reseller-panel-${activeTab}`}
        aria-labelledby={`reseller-tab-${activeTab}`}
        className="flex-1 overflow-y-auto p-4"
      >
        {activeTab === "overview" && (
          <div className="space-y-4">
            <section className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                Contact
              </p>
              <dl className="mt-2 grid grid-cols-[6rem_1fr] gap-x-3 gap-y-1.5 text-sm">
                <dt className="text-neutral-500 dark:text-neutral-400">
                  Contact
                </dt>
                <dd className="text-neutral-900 dark:text-neutral-100">
                  {reseller.contactPerson}
                </dd>
                <dt className="text-neutral-500 dark:text-neutral-400">
                  Email
                </dt>
                <dd className="truncate text-neutral-900 dark:text-neutral-100">
                  {reseller.email}
                </dd>
                <dt className="text-neutral-500 dark:text-neutral-400">
                  Phone
                </dt>
                <dd className="text-neutral-900 dark:text-neutral-100">
                  {reseller.phone}
                </dd>
              </dl>
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
                    dateTime={reseller.joinedAt}
                    title={formatAbsolute(reseller.joinedAt)}
                    className="text-neutral-900 dark:text-neutral-100"
                  >
                    {formatRelative(reseller.joinedAt, now)}
                  </time>
                </dd>
                <dt className="text-neutral-500 dark:text-neutral-400">
                  Last active
                </dt>
                <dd>
                  <time
                    dateTime={reseller.lastActive}
                    title={formatAbsolute(reseller.lastActive)}
                    className="text-neutral-900 dark:text-neutral-100"
                  >
                    {formatRelative(reseller.lastActive, now)}
                  </time>
                </dd>
                {reseller.lastVerifiedAt && (
                  <>
                    <dt className="text-neutral-500 dark:text-neutral-400">
                      Verified
                    </dt>
                    <dd>
                      <time
                        dateTime={reseller.lastVerifiedAt}
                        title={formatAbsolute(reseller.lastVerifiedAt)}
                        className="text-neutral-900 dark:text-neutral-100"
                      >
                        {formatRelative(reseller.lastVerifiedAt, now)}
                      </time>
                    </dd>
                  </>
                )}
              </dl>
            </section>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-md bg-neutral-50 p-3 dark:bg-neutral-900">
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Orders
                </p>
                <p className="mt-1 text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  {reseller.totalOrders}
                </p>
              </div>
              <div className="rounded-md bg-neutral-50 p-3 dark:bg-neutral-900">
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Revenue
                </p>
                <p className="mt-1 text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  {formatCurrency(reseller.totalRevenue)}
                </p>
              </div>
              <div className="rounded-md bg-neutral-50 p-3 dark:bg-neutral-900">
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Wallet
                </p>
                <p className="mt-1 text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  {formatCurrency(walletBalance)}
                </p>
              </div>
            </div>

            {reseller.verificationStatus !== "verified" &&
              reseller.verificationStatus !== "not_submitted" && (
                <div className="rounded-lg border border-warning-200 bg-warning-50 p-3 dark:border-warning-800/60 dark:bg-warning-900/20">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-medium text-warning-900 dark:text-warning-100">
                        Verification{" "}
                        {VERIFICATION_LABEL[reseller.verificationStatus]}
                      </p>
                      <p className="mt-0.5 text-xs text-warning-800 dark:text-warning-200">
                        Review submitted documents before approving.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setVerificationOpen(true)}
                    >
                      View documents
                    </Button>
                  </div>
                </div>
              )}
          </div>
        )}

        {activeTab === "financial" && (
          <div className="space-y-4">
            <section className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  Wallet balance
                </p>
                {walletFrozen && (
                  <Badge variant="warning" size="sm">
                    Frozen
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {formatCurrency(walletBalance)}
              </p>
              <p className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
                Derived from the reseller's wallet ledger.
              </p>
              <Can permission={PERMISSIONS.RESELLERS_WALLET}>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setWalletOpen(true)}
                  >
                    Adjust wallet
                  </Button>
                  {walletFrozen ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onUnfreezeWallet(reseller.id)}
                    >
                      Unfreeze wallet
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFreezeOpen(true)}
                    >
                      Freeze wallet
                    </Button>
                  )}
                </div>
              </Can>
            </section>

            <section>
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                Commission summary
              </p>
              <p className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
                Computed from the individual commission rows below. Rates come
                from the reseller's assigned tier.
              </p>
              <div className="mt-2 grid grid-cols-3 gap-3">
                <div className="rounded-md bg-neutral-50 p-3 dark:bg-neutral-900">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Tier
                  </p>
                  <p className="mt-1 text-lg font-bold text-neutral-900 dark:text-neutral-100">
                    {reseller.tierName ?? "—"}
                  </p>
                </div>
                <div className="rounded-md bg-neutral-50 p-3 dark:bg-neutral-900">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Earned
                  </p>
                  <p className="mt-1 text-lg font-bold text-neutral-900 dark:text-neutral-100">
                    {formatCurrency(totals.earned)}
                  </p>
                </div>
                <div className="rounded-md bg-neutral-50 p-3 dark:bg-neutral-900">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Pending
                  </p>
                  <p className="mt-1 text-lg font-bold text-warning-700 dark:text-warning-300">
                    {formatCurrency(totals.pending)}
                  </p>
                </div>
              </div>
              <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                Paid to date:{" "}
                <span className="font-medium text-success-700 dark:text-success-300">
                  {formatCurrency(totals.paid)}
                </span>
              </p>
            </section>

            <section>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  Commission rows ({commissions.length})
                </p>
                {commissions.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleExportCommissions}
                  >
                    Export CSV
                  </Button>
                )}
              </div>
              {commissions.length === 0 ? (
                <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                  No commissions recorded.
                </p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {commissions.map((c) => (
                    <li
                      key={c.id}
                      className="rounded-md border border-neutral-200 p-2 text-xs dark:border-neutral-700"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-neutral-900 dark:text-neutral-100">
                            {c.service}
                          </p>
                          <p className="mt-0.5 text-neutral-500 dark:text-neutral-400">
                            {c.orderId} · {formatDateTime(c.createdAt)}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                            {formatCurrency(c.totalCommission)}
                          </p>
                          <Badge
                            variant={
                              c.status === "paid"
                                ? "success"
                                : c.status === "pending"
                                ? "warning"
                                : c.status === "reversed"
                                ? "danger"
                                : "neutral"
                            }
                            size="sm"
                          >
                            {c.status}
                          </Badge>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}

        {activeTab === "storefront" && (
          <div className="space-y-4">
            <section className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                Current tier
              </p>
              <p className="mt-1 text-lg font-bold text-neutral-900 dark:text-neutral-100">
                {reseller.tierName ?? "Not assigned"}
              </p>
              {currentTier && (
                <div className="mt-2 space-y-1 text-xs">
                  <p className="text-neutral-500 dark:text-neutral-400">
                    Extra cut:{" "}
                    <span className="font-medium text-neutral-800 dark:text-neutral-200">
                      {currentTier.extraCutPercent}%
                    </span>
                  </p>
                  <p className="text-neutral-500 dark:text-neutral-400">
                    Min monthly sales:{" "}
                    <span className="font-medium text-neutral-800 dark:text-neutral-200">
                      {formatCurrency(currentTier.minMonthlySales)}
                    </span>
                  </p>
                  {currentTier.perks.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {currentTier.perks.map((perk) => (
                        <span
                          key={perk}
                          className="rounded bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                        >
                          {perk}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <Can permission={PERMISSIONS.RESELLERS_TIER}>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => setTierOpen(true)}
                >
                  Change tier
                </Button>
              </Can>
            </section>

            {storefront ? (
              <section className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                    Storefront
                  </p>
                  <Badge
                    variant={STOREFRONT_STATUS_VARIANT[storefront.status]}
                  >
                    {STOREFRONT_STATUS_LABEL[storefront.status]}
                  </Badge>
                </div>

                <dl className="mt-3 grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <dt className="text-neutral-500 dark:text-neutral-400">
                      Users
                    </dt>
                    <dd className="mt-0.5 font-semibold text-neutral-900 dark:text-neutral-100">
                      {storefront.usersCount.toLocaleString("en-GH")}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500 dark:text-neutral-400">
                      Orders 30d
                    </dt>
                    <dd className="mt-0.5 font-semibold text-neutral-900 dark:text-neutral-100">
                      {storefront.orders30d.toLocaleString("en-GH")}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500 dark:text-neutral-400">
                      Revenue 30d
                    </dt>
                    <dd className="mt-0.5 font-semibold text-neutral-900 dark:text-neutral-100">
                      {formatCurrency(storefront.revenue30d)}
                    </dd>
                  </div>
                </dl>

                {storefront.publicUrl && (
                  <div className="mt-3">
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Storefront URL
                    </p>
                    <a
                      href={storefront.publicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-brand-700 hover:underline dark:text-brand-300"
                    >
                      {storefront.publicUrl}
                    </a>
                  </div>
                )}

                <Can permission={PERMISSIONS.RESELLERS_STOREFRONT_TOGGLE}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => onToggleStorefront(reseller.id)}
                  >
                    {storefront.status === "live" ? "Disable" : "Enable"}
                  </Button>
                </Can>
              </section>
            ) : (
              <section className="rounded-lg border border-neutral-200 p-3 text-xs text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
                No storefront provisioned for this reseller.
              </section>
            )}

            <div className="rounded-md border border-info-200 bg-info-50 p-3 text-xs text-info-900 dark:border-info-800/60 dark:bg-info-900/20 dark:text-info-100">
              <p className="font-medium">How tiers work</p>
              <p className="mt-1">
                Tiers set the base commission rate on every service category
                and the percentage Atlas takes from any markup above the
                standard price. Higher tiers reduce the Atlas cut.
              </p>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                Storefront users
              </p>
              {storefront && (
                <Link
                  href={`${routes.resellerStorefrontUsers}?storefront=${storefront.id}`}
                  className="text-xs font-medium text-brand-700 hover:underline dark:text-brand-300"
                >
                  View all
                </Link>
              )}
            </div>
            {storefront ? (
              <StorefrontUsersList
                storefrontId={storefront.id}
                storefrontType="reseller"
                limit={10}
              />
            ) : (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                No storefront assigned.
              </p>
            )}
          </div>
        )}

        {activeTab === "activity" && (
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Timeline
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
                        {entry.kind === "audit" ? `${entry.meta} · ` : ""}
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

      <div className="flex flex-wrap items-center gap-2 border-t border-neutral-200 px-4 py-3 dark:border-neutral-800">
        <Can permission={PERMISSIONS.RESELLERS_NOTIFY}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setNotifyOpen(true)}
          >
            Send notification
          </Button>
        </Can>

        {reseller.status === "active" && (
          <Can permission={PERMISSIONS.RESELLERS_SUSPEND}>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setSuspendOpen(true)}
            >
              Suspend
            </Button>
          </Can>
        )}

        {reseller.status === "suspended" && (
          <Can permission={PERMISSIONS.RESELLERS_SUSPEND}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setReactivateConfirm(true)}
            >
              Reactivate
            </Button>
          </Can>
        )}

        {reseller.verificationStatus === "pending" && (
          <Can permission={PERMISSIONS.RESELLERS_VERIFY}>
            <Button size="sm" onClick={() => setVerificationOpen(true)}>
              Review verification
            </Button>
          </Can>
        )}

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

      <ResellerWalletAdjustModal
        open={walletOpen}
        resellerName={reseller.businessName}
        currentBalance={walletBalance}
        onClose={() => setWalletOpen(false)}
        onConfirm={(amount, reason) => {
          onAdjustWallet(reseller.id, reseller.businessName, amount, reason);
        }}
      />

      <ResellerWalletFreezeModal
        open={freezeOpen}
        resellerName={reseller.businessName}
        onClose={() => setFreezeOpen(false)}
        onConfirm={(reason) => {
          onFreezeWallet(reseller.id, reason);
          setFreezeOpen(false);
        }}
      />

      <ResellerSuspendModal
        open={suspendOpen}
        resellerName={reseller.businessName}
        storefrontUsersCount={storefront?.usersCount ?? 0}
        onClose={() => setSuspendOpen(false)}
        onConfirm={(reason) => {
          onSuspend(reseller.id, reason);
          onClose();
        }}
      />

      <ResellerNotifyModal
        open={notifyOpen}
        resellerName={reseller.businessName}
        onClose={() => setNotifyOpen(false)}
        onConfirm={(channel, message) =>
          onSendNotification(reseller.id, channel, message)
        }
      />

      <ResellerTierChangeModal
        open={tierOpen}
        resellerName={reseller.businessName}
        currentTierName={reseller.tierName}
        onClose={() => setTierOpen(false)}
        onConfirm={(tierId) => onAssignTier(reseller.id, tierId)}
      />

      <ResellerVerificationModal
        open={verificationOpen}
        resellerName={reseller.businessName}
        documents={verificationDocuments}
        onClose={() => setVerificationOpen(false)}
        onApprove={() => {
          onApproveVerification(reseller.id);
          setVerificationOpen(false);
        }}
        onReject={(reason) => {
          onRejectVerification(reseller.id, reason);
          setVerificationOpen(false);
        }}
      />

      <ResellerResetSecurityModal
        open={resetOpen}
        resellerName={reseller.businessName}
        onClose={() => setResetOpen(false)}
        onConfirm={() => onResetSecurity(reseller.id)}
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
              Reactivate {reseller.businessName}?
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Their storefront and account access will be restored. Their
              audit history is preserved.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setReactivateConfirm(false)}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={confirmReactivate}>
                Reactivate
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}