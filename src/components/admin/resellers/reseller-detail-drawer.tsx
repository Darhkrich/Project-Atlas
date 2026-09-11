/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import {
  Reseller,
  RESELLER_STATUS_LABELS,
  VERIFICATION_STATUS_LABELS,
} from "@/lib/admin/types/reseller";
import { mockResellerTiers } from "@/lib/admin/mock/commissions";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { formatCurrency } from "@/lib/admin/formatters";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { AtlasIcon } from "@/components/atlas/icons";
import { StorefrontUsersList } from "@/components/admin/shared/storefront-users-list";
import { VerificationDocumentsModal } from "@/components/admin/shared/verification-documents-modal";

interface ResellerDetailDrawerProps {
  reseller: Reseller | null;
  onClose: () => void;
  onAdjustWallet?: (id: string, amount: number, reason: string) => void;
  onAssignTier?: (id: string, tierId: string) => void;
  onToggleStatus?: (id: string) => void;
  onApproveVerification?: (id: string) => void;
  onRejectVerification?: (id: string) => void;
  onToggleStorefront?: (id: string) => void;
  onSendNotification?: (id: string, channel: string, message: string) => void;
}

type Tab =
  | "overview"
  | "wallet"
  | "commissions"
  | "tier"
  | "storefront"
  | "users"
  | "activity";

const tabs: { key: Tab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "wallet", label: "Wallet" },
  { key: "commissions", label: "Commissions" },
  { key: "tier", label: "Tier" },
  { key: "storefront", label: "Storefront" },
  { key: "users", label: "Users" },
  { key: "activity", label: "Activity" },
];

export function ResellerDetailDrawer({
  reseller,
  onClose,
  onAdjustWallet,
  onAssignTier,
  onToggleStatus,
  onApproveVerification,
  onRejectVerification,
  onToggleStorefront,
  onSendNotification,
}: ResellerDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [confirmAction, setConfirmAction] = useState<
    "suspend" | "reactivate" | "verify" | "reject_verification" | "reset_security" | null
  >(null);

  const [showAdjustWallet, setShowAdjustWallet] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState(0);
  const [adjustReason, setAdjustReason] = useState("");

  const [selectedTierId, setSelectedTierId] = useState("");

  const [showVerificationDocs, setShowVerificationDocs] = useState(false);

  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [notifyChannel, setNotifyChannel] = useState<"email" | "sms" | "push">("email");
  const [notifyMessage, setNotifyMessage] = useState("");

  if (!reseller) return null;

  const statusVariant =
    reseller.status === "active"
      ? "success"
      : reseller.status === "suspended"
      ? "danger"
      : reseller.status === "pending"
      ? "warning"
      : "neutral";

  const verificationVariant =
    reseller.verificationStatus === "verified"
      ? "success"
      : reseller.verificationStatus === "pending"
      ? "warning"
      : reseller.verificationStatus === "rejected"
      ? "danger"
      : "neutral";

  const handleAdjustWallet = () => {
    if (onAdjustWallet) onAdjustWallet(reseller.id, adjustAmount, adjustReason);
    setShowAdjustWallet(false);
    setAdjustAmount(0);
    setAdjustReason("");
  };

  const handleAssignTier = () => {
    if (onAssignTier && selectedTierId) {
      onAssignTier(reseller.id, selectedTierId);
    }
  };

  const handleSendNotification = () => {
    if (onSendNotification) {
      onSendNotification(reseller.id, notifyChannel, notifyMessage);
    }
    setShowNotifyModal(false);
    setNotifyMessage("");
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute right-0 top-0 flex h-full w-full max-w-lg flex-col bg-white shadow-xl dark:bg-neutral-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
              {reseller.businessName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold">{reseller.businessName}</p>
              <p className="text-xs text-neutral-500">
                {reseller.storeName || "No store name"}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>

        {/* Status bar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <Badge variant={statusVariant}>
            {RESELLER_STATUS_LABELS[reseller.status]}
          </Badge>
          <Badge variant={verificationVariant}>
            {VERIFICATION_STATUS_LABELS[reseller.verificationStatus]}
          </Badge>
          {reseller.tierName && (
            <Badge variant="info">{reseller.tierName} Tier</Badge>
          )}
          <Badge variant="neutral">
            {reseller.commissionRate}% commission
          </Badge>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-neutral-200 dark:border-neutral-800">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex-1 whitespace-nowrap border-b-2 px-3 py-2 text-xs font-medium",
                activeTab === tab.key
                  ? "border-brand-600 text-brand-600"
                  : "border-transparent text-neutral-500 hover:text-neutral-700"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === "overview" && (
            <div className="space-y-4">
              {/* Contact */}
              <div className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-900">
                <p className="text-xs font-medium text-neutral-500">
                  Contact Information
                </p>
                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Contact</span>
                    <span className="font-medium">{reseller.contactPerson}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Email</span>
                    <span className="text-xs">{reseller.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Phone</span>
                    <span className="text-xs">{reseller.phone}</span>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-900">
                <p className="text-xs font-medium text-neutral-500">Timeline</p>
                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Joined</span>
                    <span>
                      {new Date(reseller.joinedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Last Active</span>
                    <span>
                      {new Date(reseller.lastActive).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Verification documents */}
              {reseller.verificationStatus !== "verified" && (
                <div className="rounded-lg border border-warning-200 bg-warning-50 p-3 dark:border-warning-800 dark:bg-warning-900/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-warning-700 dark:text-warning-300">
                        Verification {VERIFICATION_STATUS_LABELS[reseller.verificationStatus]}
                      </p>
                      <p className="text-xs text-warning-600 dark:text-warning-400">
                        Review submitted documents before approving.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowVerificationDocs(true)}
                    >
                      View Documents
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "wallet" && (
            <div className="space-y-4">
              <div className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-900">
                <p className="text-xs text-neutral-500">Wallet Balance</p>
                <p className="mt-1 text-2xl font-bold">
                  {formatCurrency(reseller.walletBalance)}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => setShowAdjustWallet(true)}
                >
                  Adjust Wallet
                </Button>
              </div>

              <div>
                <p className="text-xs font-medium text-neutral-500">
                  Recent Transactions
                </p>
                {reseller.walletTransactions &&
                reseller.walletTransactions.length > 0 ? (
                  <ul className="mt-2 space-y-2">
                    {reseller.walletTransactions.map((txn) => (
                      <li
                        key={txn.id}
                        className="flex items-center justify-between rounded-md bg-neutral-50 p-2 text-sm dark:bg-neutral-900"
                      >
                        <span className="capitalize">{txn.type}</span>
                        <span
                          className={cn(
                            "font-semibold",
                            txn.amount >= 0
                              ? "text-success-600"
                              : "text-danger-600"
                          )}
                        >
                          {formatCurrency(txn.amount)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-xs text-neutral-400">
                    No wallet transactions
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === "commissions" && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-md bg-neutral-50 p-3 dark:bg-neutral-900">
                  <p className="text-xs text-neutral-500">Rate</p>
                  <p className="mt-1 text-lg font-bold">
                    {reseller.commissionRate}%
                  </p>
                </div>
                <div className="rounded-md bg-neutral-50 p-3 dark:bg-neutral-900">
                  <p className="text-xs text-neutral-500">Earned</p>
                  <p className="mt-1 text-lg font-bold">
                    {formatCurrency(reseller.commissionsEarned)}
                  </p>
                </div>
                <div className="rounded-md bg-neutral-50 p-3 dark:bg-neutral-900">
                  <p className="text-xs text-neutral-500">Pending</p>
                  <p className="mt-1 text-lg font-bold text-warning-600">
                    {formatCurrency(reseller.commissionsPending)}
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-900">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Paid</span>
                  <span className="font-semibold text-success-600">
                    {formatCurrency(reseller.commissionsPaid)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "tier" && (
            <div className="space-y-4">
              <div className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-900">
                <p className="text-xs text-neutral-500">Current Tier</p>
                <p className="mt-1 text-lg font-bold">
                  {reseller.tierName || "Not assigned"}
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-500">
                  Assign Tier
                </label>
                <select
                  className="mt-1 h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                  value={selectedTierId}
                  onChange={(e) => setSelectedTierId(e.target.value)}
                >
                  <option value="">Select Tier</option>
                  {mockResellerTiers.map((tier) => (
                    <option key={tier.id} value={tier.id}>
                      {tier.name} — Extra cut: {tier.extraCutPercent}%
                    </option>
                  ))}
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={handleAssignTier}
                  disabled={!selectedTierId}
                >
                  Assign Tier
                </Button>
              </div>

              <div className="rounded-lg bg-info-50 p-3 text-xs text-info-700 dark:bg-info-900/20 dark:text-info-300">
                Tiers determine commission rates and perks. Assigning a higher
                tier increases the base commission for data products and
                reduces the Atlas cut on extra markup.
              </div>
            </div>
          )}

          {activeTab === "storefront" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-neutral-50 p-3 dark:bg-neutral-900">
                <div>
                  <p className="text-xs text-neutral-500">Storefront Status</p>
                  <Badge
                    variant={
                      reseller.storefrontStatus === "live"
                        ? "success"
                        : "danger"
                    }
                  >
                    {reseller.storefrontStatus === "live" ? "Live" : "Disabled"}
                  </Badge>
                </div>
                {reseller.storefrontStatus === "live" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onToggleStorefront?.(reseller.id)}
                  >
                    Disable
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onToggleStorefront?.(reseller.id)}
                  >
                    Enable
                  </Button>
                )}
              </div>

              {reseller.storefrontUrl && (
                <div className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-900">
                  <p className="text-xs text-neutral-500">Storefront URL</p>
                  <a
                    href={reseller.storefrontUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-brand-600 hover:underline"
                  >
                    {reseller.storefrontUrl}
                  </a>
                </div>
              )}
            </div>
          )}

          {activeTab === "users" && (
            <div>
              <p className="text-xs font-medium text-neutral-500 mb-2">
                Customers tied to this storefront
              </p>
              <StorefrontUsersList
                storefrontId={reseller.id}
                storefrontType="reseller"
              />
            </div>
          )}

          {activeTab === "activity" && (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-neutral-500">
                  Audit Trail
                </p>
                {reseller.auditTrail && reseller.auditTrail.length > 0 ? (
                  <ul className="mt-2 space-y-2">
                    {reseller.auditTrail.map((entry) => (
                      <li
                        key={entry.id}
                        className="rounded-md bg-neutral-50 p-2 text-xs dark:bg-neutral-900"
                      >
                        <p className="font-medium">{entry.admin}</p>
                        <p>{entry.action}</p>
                        <p className="text-neutral-400">
                          {new Date(entry.timestamp).toLocaleString()}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-xs text-neutral-400">
                    No audit entries
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 border-t border-neutral-200 p-4 dark:border-neutral-800">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNotifyModal(true)}
          >
            Send Notification
          </Button>

          {reseller.status === "active" ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setConfirmAction("suspend")}
            >
              Suspend
            </Button>
          ) : reseller.status === "suspended" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmAction("reactivate")}
            >
              Reactivate
            </Button>
          ) : null}

          {reseller.verificationStatus === "pending" && (
            <>
              <Button
                size="sm"
                onClick={() => setConfirmAction("verify")}
              >
                Verify
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmAction("reject_verification")}
              >
                Reject
              </Button>
            </>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="ml-auto"
            onClick={() => setConfirmAction("reset_security")}
          >
            Reset Security
          </Button>
        </div>
      </div>

      {/* Adjust wallet modal */}
      {showAdjustWallet && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowAdjustWallet(false)}
          />
          <div className="relative w-full max-w-sm rounded-lg bg-white p-6 shadow-xl dark:bg-neutral-900">
            <h3 className="text-lg font-semibold">Adjust Wallet Balance</h3>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs text-neutral-500">Amount (GHS)</label>
                <Input
                  type="number"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="text-xs text-neutral-500">Reason</label>
                <Input
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdjustWallet(false)}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleAdjustWallet}>
                Adjust
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Notify modal */}
      {showNotifyModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowNotifyModal(false)}
          />
          <div className="relative w-full max-w-sm rounded-lg bg-white p-6 shadow-xl dark:bg-neutral-900">
            <h3 className="text-lg font-semibold">Send Notification</h3>
            <div className="mt-4 space-y-3">
              <select
                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                value={notifyChannel}
                onChange={(e) =>
                  setNotifyChannel(e.target.value as "email" | "sms" | "push")
                }
              >
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="push">Push Notification</option>
              </select>
              <textarea
                className="w-full rounded-md border border-neutral-300 p-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                rows={4}
                placeholder="Message..."
                value={notifyMessage}
                onChange={(e) => setNotifyMessage(e.target.value)}
              />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNotifyModal(false)}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleSendNotification}>
                Send
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Verification documents modal */}
      {showVerificationDocs && (
        <VerificationDocumentsModal
          entityName={reseller.businessName}
          onClose={() => setShowVerificationDocs(false)}
        />
      )}

      {/* Action confirmation */}
      <ConfirmDialog
        open={confirmAction !== null}
        title={`Confirm ${
          confirmAction
            ? confirmAction.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
            : ""
        }`}
        description={`Are you sure you want to ${
          confirmAction ? confirmAction.replace(/_/g, " ") : ""
        } ${reseller.businessName}?`}
        confirmLabel="Confirm"
        danger={
          confirmAction === "suspend" || confirmAction === "reject_verification"
        }
        onConfirm={() => {
          if (confirmAction === "suspend") onToggleStatus?.(reseller.id);
          if (confirmAction === "reactivate") onToggleStatus?.(reseller.id);
          if (confirmAction === "verify") onApproveVerification?.(reseller.id);
          if (confirmAction === "reject_verification")
            onRejectVerification?.(reseller.id);
          setConfirmAction(null);
          onClose();
        }}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}