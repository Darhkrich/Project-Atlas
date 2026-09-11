/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import {
  Merchant,
  MERCHANT_STATUS_LABELS,
  SUBSCRIPTION_STATUS_LABELS,
  VERIFICATION_STATUS_LABELS,
  STORE_STATUS_LABELS,
  SUBSCRIPTION_PLANS,
} from "@/lib/admin/types/merchant";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { formatCurrency } from "@/lib/admin/formatters";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { AtlasIcon } from "@/components/atlas/icons";
import { StorefrontUsersList } from "@/components/admin/shared/storefront-users-list";

interface MerchantDetailDrawerProps {
  merchant: Merchant | null;
  onClose: () => void;
  onChangePlan?: (id: string, planId: Merchant["subscription"]["planId"]) => void;
  onToggleStatus?: (id: string) => void;
  onToggleStore?: (id: string) => void;
  onSendNotification?: (id: string, channel: string, message: string) => void;
}

type Tab =
  | "overview"
  | "wallet"
  | "subscription"
  | "store"
  | "users"
  | "activity";

const tabs: { key: Tab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "wallet", label: "Wallet" },
  { key: "subscription", label: "Subscription" },
  { key: "store", label: "Store Config" },
  { key: "users", label: "Users" },
  { key: "activity", label: "Activity" },
];

export function MerchantDetailDrawer({
  merchant,
  onClose,
  onChangePlan,
  onToggleStatus,
  onToggleStore,
  onSendNotification,
}: MerchantDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [confirmAction, setConfirmAction] = useState<
    "suspend" | "reactivate" | "disable_store" | "enable_store" | "reset_security" | null
  >(null);

  const [showPlanChange, setShowPlanChange] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Merchant["subscription"]["planId"]>(
    merchant?.subscription.planId || "basic"
  );

  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [notifyChannel, setNotifyChannel] = useState<"email" | "sms" | "push">("email");
  const [notifyMessage, setNotifyMessage] = useState("");

  if (!merchant) return null;

  const statusVariant =
    merchant.merchantStatus === "active"
      ? "success"
      : merchant.merchantStatus === "suspended"
      ? "danger"
      : "warning";

  const verificationVariant =
    merchant.verificationStatus === "verified"
      ? "success"
      : merchant.verificationStatus === "pending"
      ? "warning"
      : merchant.verificationStatus === "rejected"
      ? "danger"
      : "neutral";

  const subStatusVariant =
    merchant.subscription.status === "active"
      ? "success"
      : merchant.subscription.status === "past_due"
      ? "warning"
      : merchant.subscription.status === "cancelled"
      ? "neutral"
      : "neutral";

  const storeStatusVariant = merchant.storeStatus === "live" ? "success" : "danger";

  const planLabel =
    SUBSCRIPTION_PLANS.find((p) => p.value === merchant.subscription.planId)
      ?.label || merchant.subscription.planId;

  const handleChangePlan = () => {
    if (onChangePlan) onChangePlan(merchant.id, selectedPlan);
    setShowPlanChange(false);
  };

  const handleSendNotification = () => {
    if (onSendNotification)
      onSendNotification(merchant.id, notifyChannel, notifyMessage);
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
              {merchant.businessName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold">{merchant.businessName}</p>
              <p className="text-xs text-neutral-500">
                {merchant.storeConfig.storeName}
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
            {MERCHANT_STATUS_LABELS[merchant.merchantStatus]}
          </Badge>
          <Badge variant={verificationVariant}>
            {VERIFICATION_STATUS_LABELS[merchant.verificationStatus]}
          </Badge>
          <Badge variant={subStatusVariant}>
            {SUBSCRIPTION_STATUS_LABELS[merchant.subscription.status]}
          </Badge>
          <Badge variant={storeStatusVariant}>
            {STORE_STATUS_LABELS[merchant.storeStatus]}
          </Badge>
          <Badge variant="info">{planLabel}</Badge>
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
                    <span className="font-medium">{merchant.contactPerson}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Email</span>
                    <span className="text-xs">{merchant.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Phone</span>
                    <span className="text-xs">{merchant.phone}</span>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-900">
                <p className="text-xs font-medium text-neutral-500">Timeline</p>
                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Created</span>
                    <span>
                      {new Date(merchant.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Last Active</span>
                    <span>
                      {new Date(merchant.lastActive).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-md bg-neutral-50 p-3 dark:bg-neutral-900">
                  <p className="text-xs text-neutral-500">Total Orders</p>
                  <p className="mt-1 text-lg font-bold">{merchant.totalOrders}</p>
                </div>
                <div className="rounded-md bg-neutral-50 p-3 dark:bg-neutral-900">
                  <p className="text-xs text-neutral-500">Total Revenue</p>
                  <p className="mt-1 text-lg font-bold">
                    {formatCurrency(merchant.totalRevenue)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "wallet" && (
            <div className="space-y-4">
              <div className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-900">
                <p className="text-xs text-neutral-500">Wallet Balance</p>
                <p className="mt-1 text-2xl font-bold">
                  {formatCurrency(merchant.walletBalance ?? 0)}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-neutral-500">
                  Recent Wallet Transactions
                </p>
                {merchant.walletTransactions &&
                merchant.walletTransactions.length > 0 ? (
                  <ul className="mt-2 space-y-2">
                    {merchant.walletTransactions.map((txn) => (
                      <li
                        key={txn.id}
                        className="flex items-center justify-between rounded-md bg-neutral-50 p-2 text-sm dark:bg-neutral-900"
                      >
                        <div>
                          <p className="text-sm">{txn.type}</p>
                          <p className="text-xs text-neutral-500">
                            {new Date(txn.date).toLocaleDateString()}
                          </p>
                        </div>
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

          {activeTab === "subscription" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-md bg-neutral-50 p-3 dark:bg-neutral-900">
                  <p className="text-xs text-neutral-500">Current Plan</p>
                  <p className="mt-1 text-lg font-bold">{planLabel}</p>
                </div>
                <div className="rounded-md bg-neutral-50 p-3 dark:bg-neutral-900">
                  <p className="text-xs text-neutral-500">Billing Cycle</p>
                  <p className="mt-1 text-lg font-bold capitalize">
                    {merchant.subscription.billingCycle}
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-900">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Status</span>
                    <Badge variant={subStatusVariant}>
                      {SUBSCRIPTION_STATUS_LABELS[merchant.subscription.status]}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Start Date</span>
                    <span>
                      {new Date(
                        merchant.subscription.startDate
                      ).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">End Date</span>
                    <span>
                      {new Date(
                        merchant.subscription.endDate
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedPlan(merchant.subscription.planId);
                  setShowPlanChange(true);
                }}
              >
                Change Subscription Plan
              </Button>
            </div>
          )}

          {activeTab === "store" && (
            <div className="space-y-4">
              <div className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-900">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Store Name</span>
                    <span className="font-medium">
                      {merchant.storeConfig.storeName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Slug</span>
                    <span className="font-mono text-xs">
                      {merchant.storeConfig.slug}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Subdomain</span>
                    <span className="font-mono text-xs">
                      {merchant.storeConfig.subdomain}
                    </span>
                  </div>
                  {merchant.storeConfig.customDomain && (
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Custom Domain</span>
                      <span className="font-mono text-xs">
                        {merchant.storeConfig.customDomain}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Template</span>
                    <span className="font-mono text-xs">
                      {merchant.storeConfig.templateId}
                    </span>
                  </div>
                </div>
              </div>

              {/* Colors */}
              <div className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-900">
                <p className="text-xs font-medium text-neutral-500 mb-2">
                  Branding
                </p>
                <div className="flex gap-4">
                  <div>
                    <div
                      className="h-10 w-10 rounded border dark:border-neutral-700"
                      style={{
                        backgroundColor: merchant.storeConfig.primaryColor,
                      }}
                    />
                    <p className="mt-1 text-xs">Primary</p>
                  </div>
                  <div>
                    <div
                      className="h-10 w-10 rounded border dark:border-neutral-700"
                      style={{
                        backgroundColor: merchant.storeConfig.accentColor,
                      }}
                    />
                    <p className="mt-1 text-xs">Accent</p>
                  </div>
                </div>
              </div>

              {/* Store toggle */}
              <div className="flex items-center justify-between rounded-lg bg-neutral-50 p-3 dark:bg-neutral-900">
                <div>
                  <p className="text-xs text-neutral-500">Store Status</p>
                  <Badge variant={storeStatusVariant}>
                    {STORE_STATUS_LABELS[merchant.storeStatus]}
                  </Badge>
                </div>
                {merchant.storeStatus === "live" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setConfirmAction("disable_store")}
                  >
                    Disable Store
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setConfirmAction("enable_store")}
                  >
                    Enable Store
                  </Button>
                )}
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div>
              <p className="text-xs font-medium text-neutral-500 mb-2">
                Customers tied to this storefront
              </p>
              <StorefrontUsersList
                storefrontId={merchant.id}
                storefrontType="merchant"
              />
            </div>
          )}

          {activeTab === "activity" && (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-neutral-500">
                  Audit Trail
                </p>
                {merchant.auditTrail && merchant.auditTrail.length > 0 ? (
                  <ul className="mt-2 space-y-2">
                    {merchant.auditTrail.map((entry) => (
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

          {merchant.merchantStatus === "active" ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setConfirmAction("suspend")}
            >
              Suspend
            </Button>
          ) : merchant.merchantStatus === "suspended" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmAction("reactivate")}
            >
              Reactivate
            </Button>
          ) : null}

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

      {/* Change plan modal */}
      {showPlanChange && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowPlanChange(false)}
          />
          <div className="relative w-full max-w-sm rounded-lg bg-white p-6 shadow-xl dark:bg-neutral-900">
            <h3 className="text-lg font-semibold">Change Subscription Plan</h3>
            <p className="mt-1 text-xs text-neutral-500">
              Changing the plan will affect future billing and features.
            </p>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs text-neutral-500">New Plan</label>
                <select
                  className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                  value={selectedPlan}
                  onChange={(e) =>
                    setSelectedPlan(
                      e.target.value as Merchant["subscription"]["planId"]
                    )
                  }
                >
                  {SUBSCRIPTION_PLANS.map((plan) => (
                    <option key={plan.value} value={plan.value}>
                      {plan.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPlanChange(false)}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleChangePlan}>
                Change Plan
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Send notification modal */}
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

      {/* Action confirmation */}
      <ConfirmDialog
        open={confirmAction !== null}
        title={`Confirm ${
          confirmAction
            ? confirmAction
                .replace(/_/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase())
            : ""
        }`}
        description={`Are you sure you want to ${
          confirmAction ? confirmAction.replace(/_/g, " ") : ""
        } ${merchant.businessName}?`}
        confirmLabel="Confirm"
        danger={
          confirmAction === "suspend" || confirmAction === "disable_store"
        }
        onConfirm={() => {
          if (confirmAction === "suspend") onToggleStatus?.(merchant.id);
          if (confirmAction === "reactivate") onToggleStatus?.(merchant.id);
          if (confirmAction === "disable_store") onToggleStore?.(merchant.id);
          if (confirmAction === "enable_store") onToggleStore?.(merchant.id);
          setConfirmAction(null);
          onClose();
        }}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}