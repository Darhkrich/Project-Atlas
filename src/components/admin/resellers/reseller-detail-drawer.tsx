"use client";

import { useState } from "react";
import { Reseller, RESELLER_STATUS_LABELS, VERIFICATION_STATUS_LABELS } from "@/lib/admin/types/reseller";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { formatCurrency } from "@/lib/admin/formatters";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { Input } from "@/components/admin/ui/input";

interface ResellerDetailDrawerProps {
  reseller: Reseller | null;
  onClose: () => void;
}

type Tab = "overview" | "wallet" | "orders" | "commissions" | "storefront" | "activity";

const tabs: { key: Tab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "wallet", label: "Wallet" },
  { key: "orders", label: "Orders" },
  { key: "commissions", label: "Commissions" },
  { key: "storefront", label: "Storefront" },
  { key: "activity", label: "Activity" },
];

export function ResellerDetailDrawer({ reseller, onClose }: ResellerDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [confirmAction, setConfirmAction] = useState<"suspend" | "reactivate" | "verify" | "reject_verification" | "reset_security" | null>(null);
  const [showAdjustWallet, setShowAdjustWallet] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState(0);
  const [adjustReason, setAdjustReason] = useState("");

  if (!reseller) return null;

  const handleAdjustWallet = () => {
    console.log(`Adjust wallet by ${adjustAmount} for ${reseller.id}: ${adjustReason}`);
    setShowAdjustWallet(false);
    setAdjustAmount(0);
    setAdjustReason("");
  };

  const statusVariant = reseller.status === "active" ? "success" : reseller.status === "suspended" ? "danger" : reseller.status === "pending" ? "warning" : "neutral";
  const verificationVariant = reseller.verificationStatus === "verified" ? "success" : reseller.verificationStatus === "pending" ? "warning" : reseller.verificationStatus === "rejected" ? "danger" : "neutral";

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-xl dark:bg-neutral-900 flex flex-col">
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <h2 className="text-lg font-semibold">Reseller Details</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </div>

        {/* Header */}
        <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-lg font-bold text-brand-600">
              {reseller.businessName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-lg">{reseller.businessName}</p>
              <p className="text-sm text-neutral-500">{reseller.storeName || "No store name"}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Badge variant={statusVariant}>{RESELLER_STATUS_LABELS[reseller.status]}</Badge>
            <Badge variant={verificationVariant}>{VERIFICATION_STATUS_LABELS[reseller.verificationStatus]}</Badge>
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
              <div>
                <p className="text-sm text-neutral-500">Contact Person</p>
                <p className="font-medium">{reseller.contactPerson}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Email</p>
                <p className="font-medium">{reseller.email}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Phone</p>
                <p className="font-medium">{reseller.phone}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Joined</p>
                <p className="font-medium">{new Date(reseller.joinedAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Last Active</p>
                <p className="font-medium">{new Date(reseller.lastActive).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Commission Rate</p>
                <p className="font-medium">{reseller.commissionRate}%</p>
              </div>
            </div>
          )}

          {activeTab === "wallet" && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-neutral-500">Wallet Balance</p>
                <p className="text-lg font-bold">{formatCurrency(reseller.walletBalance)}</p>
                <Button variant="outline" size="sm" className="mt-1" onClick={() => setShowAdjustWallet(true)}>Adjust Wallet</Button>
              </div>
              <div>
                <p className="text-sm font-medium">Recent Transactions</p>
                {reseller.walletTransactions && reseller.walletTransactions.length > 0 ? (
                  <ul className="mt-2 space-y-1">
                    {reseller.walletTransactions.map(txn => (
                      <li key={txn.id} className="flex justify-between text-sm">
                        <span>{txn.type}</span>
                        <span className={txn.amount >= 0 ? "text-success-600" : "text-danger-600"}>{formatCurrency(txn.amount)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-neutral-400">No transactions</p>
                )}
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div>
              <p className="text-sm text-neutral-500">Recent Orders</p>
              {reseller.recentOrders && reseller.recentOrders.length > 0 ? (
                <table className="mt-2 w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-neutral-500">
                      <th>Order ID</th>
                      <th>Service</th>
                      <th>Amount</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reseller.recentOrders.map(order => (
                      <tr key={order.id} className="border-t border-neutral-100 dark:border-neutral-800">
                        <td className="py-1">{order.id}</td>
                        <td>{order.service}</td>
                        <td>{formatCurrency(order.amount)}</td>
                        <td>{new Date(order.date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-sm text-neutral-400">No recent orders</p>
              )}
            </div>
          )}

          {activeTab === "commissions" && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-neutral-500">Rate</p>
                <p className="font-medium">{reseller.commissionRate}%</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Earned</p>
                <p className="font-medium">{formatCurrency(reseller.commissionsEarned)}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Pending</p>
                <p className="font-medium text-warning-600">{formatCurrency(reseller.commissionsPending)}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Paid</p>
                <p className="font-medium text-success-600">{formatCurrency(reseller.commissionsPaid)}</p>
              </div>
            </div>
          )}

          {activeTab === "storefront" && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-neutral-500">Storefront Status</p>
                <Badge variant={reseller.storefrontStatus === "live" ? "success" : "danger"}>
                  {reseller.storefrontStatus === "live" ? "Live" : "Disabled"}
                </Badge>
              </div>
              {reseller.storefrontUrl && (
                <div>
                  <p className="text-sm text-neutral-500">URL</p>
                  <a href={reseller.storefrontUrl} className="text-brand-600 hover:underline" target="_blank" rel="noopener noreferrer">
                    {reseller.storefrontUrl}
                  </a>
                </div>
              )}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => console.log("Preview storefront", reseller.storefrontUrl)}>
                  Preview
                </Button>
                {reseller.storefrontStatus === "live" ? (
                  <Button variant="destructive" size="sm" onClick={() => console.log("Disable storefront")}>
                    Disable
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => console.log("Enable storefront")}>
                    Enable
                  </Button>
                )}
              </div>
            </div>
          )}

          {activeTab === "activity" && (
            <div>
              <p className="text-sm font-medium">Audit Trail</p>
              {reseller.auditTrail && reseller.auditTrail.length > 0 ? (
                <ul className="mt-2 space-y-2">
                  {reseller.auditTrail.map(entry => (
                    <li key={entry.id} className="text-sm">
                      {entry.admin} {entry.action} · {new Date(entry.timestamp).toLocaleString()}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-neutral-400">No audit entries</p>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="border-t border-neutral-200 p-4 dark:border-neutral-800 flex flex-wrap gap-2">
          {reseller.status === "active" ? (
            <Button variant="outline" size="sm" onClick={() => setConfirmAction("suspend")}>Suspend</Button>
          ) : reseller.status === "suspended" ? (
            <Button variant="outline" size="sm" onClick={() => setConfirmAction("reactivate")}>Reactivate</Button>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setConfirmAction("verify")}>Verify</Button>
          )}
          {reseller.verificationStatus === "pending" && (
            <>
              <Button variant="outline" size="sm" onClick={() => setConfirmAction("verify")}>Verify</Button>
              <Button variant="outline" size="sm" onClick={() => setConfirmAction("reject_verification")}>Reject</Button>
            </>
          )}
          <Button variant="outline" size="sm" onClick={() => setConfirmAction("reset_security")}>Reset Security</Button>
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
        description={`Are you sure you want to ${confirmAction ? confirmAction.replace('_', ' ') : ''} ${reseller.businessName}?`}
        confirmLabel="Confirm"
        danger={confirmAction === "suspend" || confirmAction === "reject_verification"}
        onConfirm={() => {
          console.log(`${confirmAction} for ${reseller.id}`);
          setConfirmAction(null);
          onClose();
        }}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}