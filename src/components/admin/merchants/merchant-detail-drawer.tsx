/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { Merchant, SUBSCRIPTION_PLANS, MERCHANT_STATUS_LABELS, SUBSCRIPTION_STATUS_LABELS, VERIFICATION_STATUS_LABELS, STORE_STATUS_LABELS } from "@/lib/admin/types/merchant";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { formatCurrency } from "@/lib/admin/formatters";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { Input } from "@/components/admin/ui/input";

interface MerchantDetailDrawerProps {
  merchant: Merchant | null;
  onClose: () => void;
}

type Tab = "overview" | "store" | "subscription" | "orders" | "payments" | "activity";

const tabs: { key: Tab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "store", label: "Store Config" },
  { key: "subscription", label: "Subscription" },
  { key: "orders", label: "Orders" },
  { key: "payments", label: "Payments" },
  { key: "activity", label: "Activity" },
];

export function MerchantDetailDrawer({ merchant, onClose }: MerchantDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [confirmAction, setConfirmAction] = useState<"suspend" | "reactivate" | "disable_store" | "enable_store" | "change_plan" | "reset_security" | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Merchant["subscription"]["planId"]>(merchant?.subscription.planId || "basic");
  const [showPlanChange, setShowPlanChange] = useState(false);

  if (!merchant) return null;

  const statusVariant = merchant.merchantStatus === "active" ? "success" : merchant.merchantStatus === "suspended" ? "danger" : "warning";
  const verificationVariant = merchant.verificationStatus === "verified" ? "success" : merchant.verificationStatus === "pending" ? "warning" : merchant.verificationStatus === "rejected" ? "danger" : "neutral";
  const subStatusVariant = merchant.subscription.status === "active" ? "success" : merchant.subscription.status === "past_due" ? "warning" : merchant.subscription.status === "cancelled" ? "neutral" : "neutral";
  const storeStatusVariant = merchant.storeStatus === "live" ? "success" : "danger";

  const handleChangePlan = () => {
    console.log(`Change plan for ${merchant.id} to ${selectedPlan}`);
    setShowPlanChange(false);
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-xl dark:bg-neutral-900 flex flex-col">
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <h2 className="text-lg font-semibold">Merchant Details</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </div>

        {/* Header */}
        <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-lg font-bold text-brand-600">
              {merchant.businessName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-lg">{merchant.businessName}</p>
              <p className="text-sm text-neutral-500">{merchant.storeConfig.storeName}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Badge variant={statusVariant}>{MERCHANT_STATUS_LABELS[merchant.merchantStatus]}</Badge>
            <Badge variant={verificationVariant}>{VERIFICATION_STATUS_LABELS[merchant.verificationStatus]}</Badge>
            <Badge variant={storeStatusVariant}>{STORE_STATUS_LABELS[merchant.storeStatus]}</Badge>
            <Badge variant={subStatusVariant}>{SUBSCRIPTION_STATUS_LABELS[merchant.subscription.status]}</Badge>
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
                <p className="font-medium">{merchant.contactPerson}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Email</p>
                <p className="font-medium">{merchant.email}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Phone</p>
                <p className="font-medium">{merchant.phone}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Created</p>
                <p className="font-medium">{new Date(merchant.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Last Active</p>
                <p className="font-medium">{new Date(merchant.lastActive).toLocaleString()}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-neutral-500">Total Orders</p>
                  <p className="font-semibold">{merchant.totalOrders}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Total Revenue</p>
                  <p className="font-semibold">{formatCurrency(merchant.totalRevenue)}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "store" && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-neutral-500">Store Name</p>
                <p className="font-medium">{merchant.storeConfig.storeName}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Slug</p>
                <p className="font-medium">{merchant.storeConfig.slug}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Subdomain</p>
                <p className="font-medium">{merchant.storeConfig.subdomain}</p>
              </div>
              {merchant.storeConfig.customDomain && (
                <div>
                  <p className="text-sm text-neutral-500">Custom Domain</p>
                  <p className="font-medium">{merchant.storeConfig.customDomain}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-neutral-500">Template</p>
                <p className="font-medium">{merchant.storeConfig.templateId}</p>
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm text-neutral-500">Primary Color</p>
                  <div className="mt-1 h-8 w-8 rounded border" style={{ backgroundColor: merchant.storeConfig.primaryColor }} />
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Accent Color</p>
                  <div className="mt-1 h-8 w-8 rounded border" style={{ backgroundColor: merchant.storeConfig.accentColor }} />
                </div>
              </div>
            </div>
          )}

          {activeTab === "subscription" && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-neutral-500">Current Plan</p>
                <p className="font-medium">{SUBSCRIPTION_PLANS.find(p => p.value === merchant.subscription.planId)?.label}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Status</p>
                <Badge variant={subStatusVariant}>{SUBSCRIPTION_STATUS_LABELS[merchant.subscription.status]}</Badge>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Billing Cycle</p>
                <p className="font-medium capitalize">{merchant.subscription.billingCycle}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Start Date</p>
                <p className="font-medium">{new Date(merchant.subscription.startDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">End Date</p>
                <p className="font-medium">{new Date(merchant.subscription.endDate).toLocaleDateString()}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowPlanChange(true)}>Change Plan</Button>
            </div>
          )}

          {activeTab === "orders" && (
            <div>
              <p className="text-sm text-neutral-500">Recent Orders</p>
              {merchant.recentOrders && merchant.recentOrders.length > 0 ? (
                <table className="mt-2 w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-neutral-500">
                      <th>Order ID</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {merchant.recentOrders.map(order => (
                      <tr key={order.id} className="border-t border-neutral-100 dark:border-neutral-800">
                        <td className="py-1">{order.id}</td>
                        <td>{order.itemCount}</td>
                        <td>{formatCurrency(order.total)}</td>
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

          {activeTab === "payments" && (
            <div>
              <p className="text-sm text-neutral-500">Recent Payments</p>
              {merchant.recentPayments && merchant.recentPayments.length > 0 ? (
                <table className="mt-2 w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-neutral-500">
                      <th>Payment ID</th>
                      <th>Amount</th>
                      <th>Method</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {merchant.recentPayments.map(payment => (
                      <tr key={payment.id} className="border-t border-neutral-100 dark:border-neutral-800">
                        <td className="py-1">{payment.id}</td>
                        <td>{formatCurrency(payment.amount)}</td>
                        <td>{payment.method}</td>
                        <td>{new Date(payment.date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-sm text-neutral-400">No recent payments</p>
              )}
            </div>
          )}

          {activeTab === "activity" && (
            <div>
              <p className="text-sm font-medium">Audit Trail</p>
              {merchant.auditTrail && merchant.auditTrail.length > 0 ? (
                <ul className="mt-2 space-y-2">
                  {merchant.auditTrail.map(entry => (
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
          {merchant.merchantStatus === "active" ? (
            <Button variant="outline" size="sm" onClick={() => setConfirmAction("suspend")}>Suspend</Button>
          ) : merchant.merchantStatus === "suspended" ? (
            <Button variant="outline" size="sm" onClick={() => setConfirmAction("reactivate")}>Reactivate</Button>
          ) : null}
          {merchant.storeStatus === "live" ? (
            <Button variant="outline" size="sm" onClick={() => setConfirmAction("disable_store")}>Disable Store</Button>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setConfirmAction("enable_store")}>Enable Store</Button>
          )}
          <Button variant="outline" size="sm" onClick={() => setShowPlanChange(true)}>Change Plan</Button>
          <Button variant="outline" size="sm" onClick={() => setConfirmAction("reset_security")}>Reset Security</Button>
        </div>
      </div>

      {/* Change Plan Modal */}
      {showPlanChange && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowPlanChange(false)} />
          <div className="relative w-full max-w-sm rounded-lg bg-white p-6 shadow-xl dark:bg-neutral-900">
            <h3 className="text-lg font-semibold">Change Subscription Plan</h3>
            <select
              className="mt-4 h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value as Merchant["subscription"]["planId"])}
            >
              {SUBSCRIPTION_PLANS.map(plan => (
                <option key={plan.value} value={plan.value}>{plan.label}</option>
              ))}
            </select>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowPlanChange(false)}>Cancel</Button>
              <Button size="sm" onClick={handleChangePlan}>Change</Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmAction !== null}
        title={`Confirm ${confirmAction ? confirmAction.replace('_', ' ') : ''}`}
        description={`Are you sure you want to ${confirmAction ? confirmAction.replace('_', ' ') : ''} ${merchant.businessName}?`}
        confirmLabel="Confirm"
        danger={confirmAction === "suspend" || confirmAction === "disable_store"}
        onConfirm={() => {
          console.log(`${confirmAction} for ${merchant.id}`);
          setConfirmAction(null);
          onClose();
        }}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}