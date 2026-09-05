"use client";

import { useState } from "react";
import { Customer } from "@/lib/admin/types/customer";
import { formatCurrency } from "@/lib/admin/formatters";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { Input } from "@/components/admin/ui/input";

interface CustomerDetailDrawerProps {
  customer: Customer | null;
  onClose: () => void;
}

type Tab = "overview" | "financial" | "orders" | "activity" | "preferences" | "usage";

const tabs: { key: Tab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "financial", label: "Financial" },
  { key: "orders", label: "Orders" },
  { key: "activity", label: "Activity" },
  { key: "preferences", label: "Preferences" },
  { key: "usage", label: "Usage" },
];

export function CustomerDetailDrawer({ customer, onClose }: CustomerDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [showSensitive, setShowSensitive] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"suspend" | "disable" | "enable" | "reset_password" | "impersonate" | null>(null);
  const [showAdjustWallet, setShowAdjustWallet] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState(0);
  const [adjustReason, setAdjustReason] = useState("");
  const [newTag, setNewTag] = useState("");

  if (!customer) return null;

  const handleReveal = () => {
    setShowSensitive(true);
    console.log("Sensitive data revealed for", customer.id);
    // audit log entry would go here
  };

  const handleAdjustWallet = () => {
    console.log(`Adjust wallet by ${adjustAmount} for ${customer.id}: ${adjustReason}`);
    setShowAdjustWallet(false);
    setAdjustAmount(0);
    setAdjustReason("");
  };

  const handleAddTag = () => {
    console.log(`Add tag ${newTag} to ${customer.id}`);
    setNewTag("");
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-xl dark:bg-neutral-900 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <h2 className="text-lg font-semibold">Customer Details</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </div>

        {/* Profile Summary */}
        <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-lg font-bold text-brand-600">
              {customer.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2)}
            </div>
            <div>
              <p className="font-semibold text-lg">{customer.name}</p>
              <p className="text-sm text-neutral-500">
                {showSensitive ? customer.email : "•••••••@•••••"}
                <button onClick={handleReveal} className="ml-1 text-brand-600 hover:underline text-xs">Reveal</button>
              </p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-xs text-neutral-500">Wallet</p>
              <p className="font-semibold">{formatCurrency(customer.walletBalance)}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500">Points</p>
              <p className="font-semibold">{customer.atlasPointsBalance}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500">Risk Score</p>
              <p className={cn("font-semibold", customer.riskLevel === "high" ? "text-danger-600" : customer.riskLevel === "medium" ? "text-warning-600" : "text-success-600")}>
                {customer.riskScore}/100
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-200 dark:border-neutral-800 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex-1 px-3 py-2 text-xs font-medium whitespace-nowrap",
                activeTab === tab.key
                  ? "border-b-2 border-brand-600 text-brand-600"
                  : "text-neutral-500 hover:text-neutral-700"
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
              {/* Phone Number (masked) */}
              <div>
                <p className="text-sm text-neutral-500">Phone Number</p>
                {showSensitive ? (
                  <p className="font-medium">{customer.phone}</p>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="font-medium">••••••••••</p>
                    <button onClick={handleReveal} className="text-xs text-brand-600 hover:underline">Reveal</button>
                  </div>
                )}
              </div>
              {/* Email (masked) */}
              <div>
                <p className="text-sm text-neutral-500">Email</p>
                {showSensitive ? (
                  <p className="font-medium">{customer.email}</p>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="font-medium">•••••••@•••••</p>
                    <button onClick={handleReveal} className="text-xs text-brand-600 hover:underline">Reveal</button>
                  </div>
                )}
              </div>
              {/* Status */}
              <div>
                <p className="text-sm text-neutral-500">Status</p>
                <Badge variant={customer.status === "active" ? "success" : customer.status === "suspended" ? "danger" : "neutral"}>
                  {customer.status}
                </Badge>
              </div>
              {/* Source */}
              <div>
                <p className="text-sm text-neutral-500">Source</p>
                <p className="font-medium">{customer.source}</p>
              </div>
              {/* Joined */}
              <div>
                <p className="text-sm text-neutral-500">Joined</p>
                <p className="font-medium">{new Date(customer.joinedAt).toLocaleDateString()}</p>
              </div>
              {/* Last Active */}
              <div>
                <p className="text-sm text-neutral-500">Last Active</p>
                <p className="font-medium">{new Date(customer.lastActive).toLocaleString()}</p>
              </div>
              {/* Tags */}
              <div>
                <p className="text-sm font-medium">Tags</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {customer.tags.map(tag => (
                    <span key={tag} className="rounded bg-neutral-100 px-2 py-0.5 text-xs">{tag}</span>
                  ))}
                  <div className="flex gap-1">
                    <Input
                      placeholder="Add tag"
                      className="h-7 w-32 text-xs"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                    />
                    <Button size="sm" variant="outline" onClick={handleAddTag}>+</Button>
                  </div>
                </div>
              </div>
              {/* Referral */}
              <div>
                <p className="text-sm font-medium">Referral</p>
                <p className="text-sm">Code: {customer.referralCode || "None"}</p>
                <p className="text-sm">Referred by: {customer.referredBy || "N/A"}</p>
                <p className="text-sm">Referrals: {customer.referralsCount}</p>
              </div>
              {/* Support Tickets */}
              <div>
                <p className="text-sm font-medium">Support Tickets</p>
                {customer.supportTickets.length === 0 ? (
                  <p className="text-sm text-neutral-400">None</p>
                ) : (
                  customer.supportTickets.map(ticket => (
                    <div key={ticket.id} className="mt-1 flex justify-between text-sm">
                      <span>{ticket.subject}</span>
                      <Badge variant={ticket.status === "resolved" ? "success" : ticket.status === "pending" ? "warning" : "info"}>{ticket.status}</Badge>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "financial" && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Wallet Balance</p>
                <p className="text-lg font-bold">{formatCurrency(customer.walletBalance)}</p>
                <Button variant="outline" size="sm" className="mt-1" onClick={() => setShowAdjustWallet(true)}>Adjust Wallet</Button>
              </div>
              <div>
                <p className="text-sm font-medium">Atlas Points</p>
                <p className="text-lg font-bold">{customer.atlasPointsBalance}</p>
                <div className="mt-2 space-y-1">
                  {customer.atlasPointsHistory.map(pt => (
                    <div key={pt.id} className="flex justify-between text-xs">
                      <span>{pt.description}</span>
                      <span className={pt.type === "earned" ? "text-success-600" : "text-danger-600"}>{pt.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">Recent Transactions</p>
                <p className="text-sm text-neutral-400">No transactions to display (mock).</p>
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div>
              <p className="text-sm text-neutral-500">Recent Orders</p>
              <p className="mt-2 text-sm">No recent orders to display (mock).</p>
            </div>
          )}

          {activeTab === "activity" && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Activity Log</p>
                <ul className="mt-2 space-y-2">
                  {customer.activityLog.length === 0 ? (
                    <li className="text-sm text-neutral-400">No activity recorded</li>
                  ) : (
                    customer.activityLog.map(act => (
                      <li key={act.id} className="text-sm">{act.action} · {new Date(act.timestamp).toLocaleString()}</li>
                    ))
                  )}
                </ul>
              </div>
              <div>
                <p className="text-sm font-medium">Security Events</p>
                <ul className="mt-2 space-y-2">
                  {customer.securityEvents.length === 0 ? (
                    <li className="text-sm text-neutral-400">No security events</li>
                  ) : (
                    customer.securityEvents.map(sec => (
                      <li key={sec.id} className="text-sm">{sec.event} {sec.ip && `(${sec.ip})`} · {new Date(sec.timestamp).toLocaleString()}</li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          )}

          {activeTab === "preferences" && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Devices</p>
                <ul className="mt-2 space-y-2">
                  {customer.devices.map(device => (
                    <li key={device.id} className="flex justify-between text-sm">
                      <span>{device.deviceName}</span>
                      <span className="text-neutral-500">{device.isCurrent ? "Current" : new Date(device.lastActive).toLocaleDateString()}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm font-medium">Notification Preferences</p>
                <ul className="mt-2 space-y-1">
                  {customer.notificationPreferences.map(pref => (
                    <li key={pref.channel} className="flex justify-between text-sm">
                      <span className="capitalize">{pref.channel}</span>
                      <Badge variant={pref.enabled ? "success" : "neutral"}>{pref.enabled ? "On" : "Off"}</Badge>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === "usage" && (
            <div>
              <p className="text-sm font-medium">Data & Airtime Usage</p>
              <ul className="mt-2 space-y-2">
                {customer.dataUsage.map(usage => (
                  <li key={usage.month} className="flex justify-between text-sm">
                    <span>{usage.month}</span>
                    <span>Data: {usage.dataUsedGB}GB · Airtime: {formatCurrency(usage.airtimeUsedGHS)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="border-t border-neutral-200 p-4 dark:border-neutral-800 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setConfirmAction("suspend")}>Suspend</Button>
          <Button variant="outline" size="sm" onClick={() => setConfirmAction("disable")}>Disable</Button>
          <Button variant="outline" size="sm" onClick={() => setConfirmAction("reset_password")}>Reset Password</Button>
          <Button variant="outline" size="sm" onClick={() => setConfirmAction("impersonate")}>Impersonate</Button>
        </div>
      </div>

      {/* Adjust Wallet Modal */}
      {showAdjustWallet && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAdjustWallet(false)} />
          <div className="relative w-full max-w-sm rounded-lg bg-white p-6 shadow-xl dark:bg-neutral-900">
            <h3 className="text-lg font-semibold">Adjust Wallet Balance</h3>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-sm">Amount (GHS)</label>
                <Input type="number" value={adjustAmount} onChange={(e) => setAdjustAmount(Number(e.target.value))} />
              </div>
              <div>
                <label className="text-sm">Reason</label>
                <Input value={adjustReason} onChange={(e) => setAdjustReason(e.target.value)} />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowAdjustWallet(false)}>Cancel</Button>
              <Button size="sm" onClick={handleAdjustWallet}>Adjust</Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmAction !== null}
        title={`Confirm ${confirmAction ? confirmAction.replace('_', ' ') : ''}`}
        description={`Are you sure you want to ${confirmAction ? confirmAction.replace('_', ' ') : ''} for ${customer.name}?`}
        confirmLabel="Confirm"
        danger={confirmAction === "suspend" || confirmAction === "disable"}
        onConfirm={() => {
          console.log(`${confirmAction} for ${customer.id}`);
          setConfirmAction(null);
          onClose();
        }}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}