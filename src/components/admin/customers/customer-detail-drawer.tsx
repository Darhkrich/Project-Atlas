"use client";

import { useState } from "react";
import { Customer } from "@/lib/admin/types/customer";
import { formatCurrency } from "@/lib/admin/formatters";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { AtlasIcon } from "@/components/atlas/icons";

interface CustomerDetailDrawerProps {
  customer: Customer | null;
  onClose: () => void;
  onAdjustWallet?: (id: string, amount: number, reason: string) => void;
  onAddTag?: (id: string, tag: string) => void;
  onSuspend?: (id: string) => void;
  onSendNotification?: (id: string, channel: string, message: string) => void;
}

type Tab = "overview" | "financial" | "activity" | "preferences" | "usage";

const tabs: { key: Tab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "financial", label: "Financial" },
  { key: "activity", label: "Activity" },
  { key: "preferences", label: "Preferences" },
  { key: "usage", label: "Usage" },
];

export function CustomerDetailDrawer({
  customer,
  onClose,
  onAdjustWallet,
  onAddTag,
  onSuspend,
  onSendNotification,
}: CustomerDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [showSensitive, setShowSensitive] = useState(false);
  const [showRevealConfirm, setShowRevealConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"suspend" | "disable" | "reset_password" | null>(null);

  const [showAdjustWallet, setShowAdjustWallet] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState(0);
  const [adjustReason, setAdjustReason] = useState("");

  const [newTag, setNewTag] = useState("");

  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [notifyChannel, setNotifyChannel] = useState<"email" | "sms" | "push">("email");
  const [notifyMessage, setNotifyMessage] = useState("");

  if (!customer) return null;

  const riskVariant =
    customer.riskLevel === "high"
      ? "danger"
      : customer.riskLevel === "medium"
      ? "warning"
      : "success";

  const handleAdjustWallet = () => {
    if (onAdjustWallet) onAdjustWallet(customer.id, adjustAmount, adjustReason);
    setShowAdjustWallet(false);
    setAdjustAmount(0);
    setAdjustReason("");
  };

  const handleAddTag = () => {
    if (newTag.trim() && onAddTag) onAddTag(customer.id, newTag.trim());
    setNewTag("");
  };

  const handleSendNotification = () => {
    if (onSendNotification) onSendNotification(customer.id, notifyChannel, notifyMessage);
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
              {customer.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
            </div>
            <div>
              <p className="text-sm font-semibold">{customer.name}</p>
              <p className="text-xs text-neutral-500">{customer.id}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>

        {/* Status bar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <Badge variant={customer.status === "active" ? "success" : customer.status === "suspended" ? "danger" : "neutral"}>
            {customer.status}
          </Badge>
          <Badge variant={riskVariant}>Risk: {customer.riskLevel}</Badge>
          <Badge variant="info">Source: {customer.source}</Badge>
          {customer.storefrontId && (
            <Badge variant="neutral">
              {customer.storefrontType} · {customer.storefrontId}
            </Badge>
          )}
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
              {/* Contact info - masked */}
              <div className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-900">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-neutral-500">
                    Contact Information
                  </p>
                  {!showSensitive && (
                    <button
                      onClick={() => setShowRevealConfirm(true)}
                      className="text-xs font-medium text-brand-600 hover:underline"
                    >
                      Reveal
                    </button>
                  )}
                </div>
                <div className="mt-2 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Email</span>
                    <span className="font-mono text-xs">
                      {showSensitive ? customer.email : "•••••••@•••••"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Phone</span>
                    <span className="font-mono text-xs">
                      {showSensitive ? customer.phone : "••• ••• ••••"}
                    </span>
                  </div>
                </div>
                {showSensitive && (
                  <p className="mt-2 text-xs text-warning-600">
                    Sensitive data is now visible. This action is logged.
                  </p>
                )}
              </div>

              {/* Referral */}
              <div className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-900">
                <p className="text-xs font-medium text-neutral-500">Referral</p>
                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Code</span>
                    <span className="font-mono text-xs">
                      {customer.referralCode || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Referred by</span>
                    <span>{customer.referredBy || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Referrals</span>
                    <span>{customer.referralsCount}</span>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-900">
                <p className="text-xs font-medium text-neutral-500">Tags</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {customer.tags.length === 0 && (
                    <span className="text-xs text-neutral-400">No tags</span>
                  )}
                  {customer.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded bg-neutral-200 px-2 py-0.5 text-xs dark:bg-neutral-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-2 flex gap-2">
                  <Input
                    placeholder="Add tag..."
                    className="h-8 text-xs"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                  />
                  <Button variant="outline" size="sm" onClick={handleAddTag}>
                    Add
                  </Button>
                </div>
              </div>

              {/* Support tickets */}
              <div className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-900">
                <p className="text-xs font-medium text-neutral-500">
                  Support Tickets
                </p>
                {customer.supportTickets.length === 0 ? (
                  <p className="mt-2 text-xs text-neutral-400">No tickets</p>
                ) : (
                  <ul className="mt-2 space-y-1">
                    {customer.supportTickets.map((ticket) => (
                      <li
                        key={ticket.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="truncate">{ticket.subject}</span>
                        <Badge
                          variant={
                            ticket.status === "resolved"
                              ? "success"
                              : ticket.status === "pending"
                              ? "warning"
                              : "info"
                          }
                        >
                          {ticket.status}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Reports */}
              {customer.reports && customer.reports.length > 0 && (
                <div className="rounded-lg border border-danger-200 bg-danger-50 p-3 dark:border-danger-800 dark:bg-danger-900/20">
                  <p className="text-xs font-medium text-danger-700 dark:text-danger-300">
                    Reports
                  </p>
                  <ul className="mt-2 space-y-2">
                    {customer.reports.map((report) => (
                      <li key={report.id} className="text-xs">
                        <div className="flex justify-between">
                          <span className="font-medium">
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
                          >
                            {report.status}
                          </Badge>
                        </div>
                        <p className="text-danger-700 dark:text-danger-300">
                          {report.reason}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === "financial" && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-md bg-neutral-50 p-3 dark:bg-neutral-900">
                  <p className="text-xs text-neutral-500">Wallet</p>
                  <p className="mt-1 text-lg font-bold">
                    {formatCurrency(customer.walletBalance)}
                  </p>
                </div>
                <div className="rounded-md bg-neutral-50 p-3 dark:bg-neutral-900">
                  <p className="text-xs text-neutral-500">Points</p>
                  <p className="mt-1 text-lg font-bold">
                    {customer.atlasPointsBalance}
                  </p>
                </div>
                <div className="rounded-md bg-neutral-50 p-3 dark:bg-neutral-900">
                  <p className="text-xs text-neutral-500">Total Spent</p>
                  <p className="mt-1 text-lg font-bold">
                    {formatCurrency(customer.totalSpent)}
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdjustWallet(true)}
              >
                Adjust Wallet
              </Button>

              <div>
                <p className="text-xs font-medium text-neutral-500">
                  Atlas Points History
                </p>
                {customer.atlasPointsHistory.length === 0 ? (
                  <p className="mt-2 text-xs text-neutral-400">
                    No points activity
                  </p>
                ) : (
                  <ul className="mt-2 space-y-2">
                    {customer.atlasPointsHistory.map((pt) => (
                      <li
                        key={pt.id}
                        className="flex items-center justify-between text-xs"
                      >
                        <span>{pt.description}</span>
                        <span
                          className={
                            pt.type === "earned"
                              ? "text-success-600"
                              : "text-danger-600"
                          }
                        >
                          {pt.type === "earned" ? "+" : "−"}
                          {pt.amount}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {customer.savedPaymentMethods.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-neutral-500">
                    Saved Payment Methods
                  </p>
                  <ul className="mt-2 space-y-1">
                    {customer.savedPaymentMethods.map((pm) => (
                      <li
                        key={pm.id}
                        className="flex items-center gap-2 text-xs"
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
                </div>
              )}
            </div>
          )}

          {activeTab === "activity" && (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-neutral-500">
                  Activity Log
                </p>
                {customer.activityLog.length === 0 ? (
                  <p className="mt-2 text-xs text-neutral-400">
                    No activity recorded
                  </p>
                ) : (
                  <ul className="mt-2 space-y-2">
                    {customer.activityLog.map((act) => (
                      <li
                        key={act.id}
                        className="rounded-md bg-neutral-50 p-2 text-xs dark:bg-neutral-900"
                      >
                        <p className="font-medium">{act.action}</p>
                        <p className="text-neutral-500">
                          {new Date(act.timestamp).toLocaleString()}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <p className="text-xs font-medium text-neutral-500">
                  Security Events
                </p>
                {customer.securityEvents.length === 0 ? (
                  <p className="mt-2 text-xs text-neutral-400">
                    No security events
                  </p>
                ) : (
                  <ul className="mt-2 space-y-2">
                    {customer.securityEvents.map((sec) => (
                      <li
                        key={sec.id}
                        className="rounded-md bg-neutral-50 p-2 text-xs dark:bg-neutral-900"
                      >
                        <p className="font-medium">{sec.event}</p>
                        <p className="text-neutral-500">
                          {sec.ip && `${sec.ip} · `}
                          {new Date(sec.timestamp).toLocaleString()}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {activeTab === "preferences" && (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-neutral-500">Devices</p>
                {customer.devices.length === 0 ? (
                  <p className="mt-2 text-xs text-neutral-400">
                    No devices recorded
                  </p>
                ) : (
                  <ul className="mt-2 space-y-2">
                    {customer.devices.map((device) => (
                      <li
                        key={device.id}
                        className="flex items-center justify-between rounded-md bg-neutral-50 p-2 text-xs dark:bg-neutral-900"
                      >
                        <span>{device.deviceName}</span>
                        <span className="text-neutral-500">
                          {device.isCurrent
                            ? "Current"
                            : new Date(device.lastActive).toLocaleDateString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <p className="text-xs font-medium text-neutral-500">
                  Notification Preferences
                </p>
                {customer.notificationPreferences.length === 0 ? (
                  <p className="mt-2 text-xs text-neutral-400">
                    No preferences set
                  </p>
                ) : (
                  <ul className="mt-2 space-y-1">
                    {customer.notificationPreferences.map((pref) => (
                      <li
                        key={pref.channel}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="capitalize">{pref.channel}</span>
                        <Badge variant={pref.enabled ? "success" : "neutral"}>
                          {pref.enabled ? "On" : "Off"}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {activeTab === "usage" && (
            <div>
              <p className="text-xs font-medium text-neutral-500">
                Data & Airtime Usage
              </p>
              {customer.dataUsage.length === 0 ? (
                <p className="mt-2 text-xs text-neutral-400">
                  No usage recorded
                </p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {customer.dataUsage.map((usage) => (
                    <li
                      key={usage.month}
                      className="flex items-center justify-between rounded-md bg-neutral-50 p-2 text-xs dark:bg-neutral-900"
                    >
                      <span className="font-medium">{usage.month}</span>
                      <span className="text-neutral-500">
                        Data: {usage.dataUsedGB}GB · Airtime:{" "}
                        {formatCurrency(usage.airtimeUsedGHS)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirmAction("reset_password")}
          >
            Reset Password
          </Button>
          {customer.status === "active" ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setConfirmAction("suspend")}
            >
              Suspend
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={onClose}>
              Reactivate
            </Button>
          )}
          <Button variant="ghost" size="sm" className="ml-auto" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      {/* Reveal confirmation */}
      <ConfirmDialog
        open={showRevealConfirm}
        title="Reveal Sensitive Data"
        description="This action will expose customer contact details and will be logged in the audit trail. Continue?"
        confirmLabel="Reveal"
        danger
        onConfirm={() => {
          setShowSensitive(true);
          setShowRevealConfirm(false);
        }}
        onCancel={() => setShowRevealConfirm(false)}
      />

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

      {/* Notification modal */}
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
          confirmAction === "suspend"
            ? "Suspend Customer"
            : "Reset Password"
        }`}
        description={
          confirmAction === "suspend"
            ? `Are you sure you want to suspend ${customer.name}? This restricts their account access.`
            : `Send a password reset link to ${customer.name}?`
        }
        confirmLabel={confirmAction === "suspend" ? "Suspend" : "Send"}
        danger={confirmAction === "suspend"}
        onConfirm={() => {
          if (confirmAction === "suspend" && onSuspend) onSuspend(customer.id);
          setConfirmAction(null);
          onClose();
        }}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}