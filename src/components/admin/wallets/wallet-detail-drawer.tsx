/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import {
  Wallet,
  WALLET_STATUS_LABELS,
  OWNER_TYPE_LABELS,
  AdjustmentDirection,
} from "@/lib/admin/types/wallet";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { formatCurrency } from "@/lib/admin/formatters";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { AtlasIcon } from "@/components/atlas/icons";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface WalletDetailDrawerProps {
  wallet: Wallet | null;
  onClose: () => void;
  onAdjust?: (walletId: string, direction: AdjustmentDirection, amount: number, reason: string) => void;
  onToggleStatus?: (walletId: string) => void;
}

type Tab = "overview" | "transactions" | "adjustments" | "limits" | "risk";

const tabs: { key: Tab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "transactions", label: "Transactions" },
  { key: "adjustments", label: "Adjustments" },
  { key: "limits", label: "Limits & Methods" },
  { key: "risk", label: "Risk & Reconciliation" },
];

export function WalletDetailDrawer({
  wallet,
  onClose,
  onAdjust,
  onToggleStatus,
}: WalletDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [confirmAction, setConfirmAction] = useState<"freeze" | "unfreeze" | null>(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustDirection, setAdjustDirection] = useState<AdjustmentDirection>("credit");
  const [adjustAmount, setAdjustAmount] = useState(0);
  const [adjustReason, setAdjustReason] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  if (!wallet) return null;

  const statusVariant = wallet.status === "active" ? "success" : "danger";
  const riskVariant =
    wallet.riskLevel === "high" ? "danger" : wallet.riskLevel === "medium" ? "warning" : "success";

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 1500);
  };

  const handleAdjust = () => {
    if (onAdjust) onAdjust(wallet.id, adjustDirection, adjustAmount, adjustReason);
    setShowAdjustModal(false);
    setAdjustAmount(0);
    setAdjustReason("");
  };

  const handleToggleStatus = () => {
    if (onToggleStatus) onToggleStatus(wallet.id);
    setConfirmAction(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute right-0 top-0 flex h-full w-full max-w-lg flex-col bg-white shadow-xl dark:bg-neutral-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
              <AtlasIcon name="wallet" className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold">{wallet.ownerName}</p>
              <p className="font-mono text-xs text-neutral-500">{wallet.id}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>

        {/* Status bar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <Badge variant={statusVariant}>{WALLET_STATUS_LABELS[wallet.status]}</Badge>
          <Badge variant="info">{OWNER_TYPE_LABELS[wallet.ownerType]}</Badge>
          <Badge variant={riskVariant}>Risk: {wallet.riskLevel}</Badge>
          <Badge
            variant={
              wallet.reconciliationStatus === "matched"
                ? "success"
                : wallet.reconciliationStatus === "pending"
                ? "warning"
                : "danger"
            }
          >
            {wallet.reconciliationStatus}
          </Badge>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-200 dark:border-neutral-800 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex-1 whitespace-nowrap px-3 py-2 text-xs font-medium",
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
              {/* Balance summary */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-neutral-500">Available Balance</p>
                  <p className="text-lg font-bold">{formatCurrency(wallet.balance)}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Pending Balance</p>
                  <p className="text-lg font-bold text-warning-600">
                    {formatCurrency(wallet.pendingBalance)}
                  </p>
                </div>
              </div>

              {/* Trend */}
              <div>
                <p className="text-xs font-medium text-neutral-500 mb-2">Balance Trend</p>
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={wallet.trend}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="currentColor"
                      className="text-neutral-200 dark:text-neutral-700"
                    />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={10} />
                    <YAxis tickLine={false} axisLine={false} fontSize={10} />
                    <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                    <Line
                      type="monotone"
                      dataKey="balance"
                      stroke="#166e59"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Meta */}
              <div className="space-y-2 rounded-lg bg-neutral-50 p-3 dark:bg-neutral-900">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Last transaction</span>
                  <span className="font-medium">
                    {wallet.lastTransactionAt
                      ? new Date(wallet.lastTransactionAt).toLocaleString()
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Last reconciliation</span>
                  <span className="font-medium">
                    {wallet.lastReconciliationAt
                      ? new Date(wallet.lastReconciliationAt).toLocaleString()
                      : "Never"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Wallet ID</span>
                  <button
                    className="flex items-center gap-1 text-brand-600 hover:underline"
                    onClick={() => handleCopy(wallet.id)}
                  >
                    {wallet.id}
                    <AtlasIcon name="link" className="h-3 w-3" />
                  </button>
                </div>
                {copied === wallet.id && (
                  <p className="text-xs text-success-600">Copied!</p>
                )}
              </div>
            </div>
          )}

          {activeTab === "transactions" && (
            <div>
              {wallet.transactions.length === 0 ? (
                <p className="text-sm text-neutral-400">No transactions.</p>
              ) : (
                <ul className="space-y-2">
                  {wallet.transactions.map((txn) => (
                    <li
                      key={txn.id}
                      className="flex items-center justify-between rounded-md bg-neutral-50 p-2 text-sm dark:bg-neutral-900"
                    >
                      <div>
                        <p className="font-medium capitalize">{txn.type}</p>
                        {txn.description && (
                          <p className="text-xs text-neutral-500">{txn.description}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p
                          className={cn(
                            "font-semibold",
                            txn.amount >= 0 ? "text-success-600" : "text-danger-600"
                          )}
                        >
                          {formatCurrency(txn.amount)}
                        </p>
                        <p className="text-xs text-neutral-500">
                          Bal: {formatCurrency(txn.balanceAfter)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {activeTab === "adjustments" && (
            <div>
              {wallet.adjustments.length === 0 ? (
                <p className="text-sm text-neutral-400">No adjustments.</p>
              ) : (
                <ul className="space-y-2">
                  {wallet.adjustments.map((adj) => (
                    <li
                      key={adj.id}
                      className="rounded-md bg-neutral-50 p-3 text-sm text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
                    >
                      <div className="flex justify-between">
                        <span className="font-medium">{adj.admin}</span>
                        <span
                          className={cn(
                            "font-semibold",
                            adj.direction === "credit"
                              ? "text-success-600"
                              : "text-danger-600"
                          )}
                        >
                          {adj.direction === "credit" ? "+" : "−"}
                          {formatCurrency(adj.amount)}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500">{adj.reason}</p>
                      <p className="text-xs text-neutral-400">
                        {formatCurrency(adj.previousBalance)} → {formatCurrency(adj.newBalance)} ·{" "}
                        {new Date(adj.timestamp).toLocaleString()}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {activeTab === "limits" && (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-neutral-500 mb-2">Wallet Limits</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-neutral-500">Daily Deposit</p>
                    <p className="font-semibold">
                      {formatCurrency(wallet.limits.dailyDeposit)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Monthly Deposit</p>
                    <p className="font-semibold">
                      {formatCurrency(wallet.limits.monthlyDeposit)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Daily Withdrawal</p>
                    <p className="font-semibold">
                      {formatCurrency(wallet.limits.dailyWithdrawal)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Monthly Withdrawal</p>
                    <p className="font-semibold">
                      {formatCurrency(wallet.limits.monthlyWithdrawal)}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-neutral-500 mb-2">
                  Linked Payment Methods
                </p>
                {wallet.linkedPaymentMethods.length === 0 ? (
                  <p className="text-sm text-neutral-400">No linked methods.</p>
                ) : (
                  <ul className="space-y-2">
                    {wallet.linkedPaymentMethods.map((method) => (
                      <li
                        key={method.id}
                        className="flex items-center gap-2 rounded-md bg-neutral-50 p-2 text-sm dark:bg-neutral-900"
                      >
                        <AtlasIcon
                          name={
                            method.type === "momo"
                              ? "mobile"
                              : method.type === "card"
                              ? "card"
                              : "bank"
                          }
                          className="h-4 w-4 text-neutral-500"
                        />
                        {method.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {wallet.autoTopUpRules.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-neutral-500 mb-2">
                    Auto Top-up Rules
                  </p>
                  <ul className="space-y-1">
                    {wallet.autoTopUpRules.map((rule) => (
                      <li key={rule.id} className="text-sm">
                        Threshold: {formatCurrency(rule.threshold)} · Amount:{" "}
                        {formatCurrency(rule.amount)} · on{" "}
                        <span
                          className={
                            rule.enabled ? "text-success-600" : "text-neutral-500"
                          }
                        >
                          {rule.enabled ? "Enabled" : "Disabled"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === "risk" && (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-neutral-500 mb-2">Risk Score Trend</p>
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={wallet.riskTrend}>
                    <XAxis dataKey="date" hide />
                    <YAxis domain={[0, 100]} hide />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
                <p className="mt-1 text-xs text-neutral-500">
                  Current: {wallet.riskScore}/100 · {wallet.riskLevel}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-neutral-500 mb-2">
                  Reconciliation Status
                </p>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      wallet.reconciliationStatus === "matched"
                        ? "success"
                        : wallet.reconciliationStatus === "pending"
                        ? "warning"
                        : "danger"
                    }
                  >
                    {wallet.reconciliationStatus}
                  </Badge>
                  {wallet.lastReconciliationAt && (
                    <span className="text-xs text-neutral-500">
                      Last run: {new Date(wallet.lastReconciliationAt).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              {wallet.statusChangeHistory.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-neutral-500 mb-2">
                    Status Change History
                  </p>
                  <ul className="space-y-2">
                    {wallet.statusChangeHistory.map((change) => (
                      <li
                        key={change.id}
                        className="rounded-md bg-neutral-50 p-2 text-xs dark:bg-neutral-900"
                      >
                        <p className="font-medium">
                          {change.fromStatus} → {change.toStatus}
                        </p>
                        <p className="text-neutral-500">
                          {change.admin} · {new Date(change.timestamp).toLocaleString()}
                        </p>
                        {change.reason && (
                          <p className="text-neutral-500">Reason: {change.reason}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="border-t border-neutral-200 p-4 dark:border-neutral-800">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowAdjustModal(true)}>
              Adjust Wallet
            </Button>
            {wallet.status === "active" ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmAction("freeze")}
              >
                Freeze
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmAction("unfreeze")}
              >
                Unfreeze
              </Button>
            )}
            <Button variant="outline" size="sm">
              Export Statement
            </Button>
            <Button variant="ghost" size="sm" className="ml-auto" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>

      {/* Adjust Modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowAdjustModal(false)}
          />
          <div className="relative w-full max-w-sm rounded-lg bg-white p-6 shadow-xl dark:bg-neutral-900">
            <h3 className="text-lg font-semibold">Adjust Wallet</h3>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-sm">Direction</label>
                <select
                  className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                  value={adjustDirection}
                  onChange={(e) =>
                    setAdjustDirection(e.target.value as AdjustmentDirection)
                  }
                >
                  <option value="credit">Credit (Add)</option>
                  <option value="debit">Debit (Subtract)</option>
                </select>
              </div>
              <div>
                <label className="text-sm">Amount (GHS)</label>
                <Input
                  type="number"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="text-sm">Reason</label>
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
                onClick={() => setShowAdjustModal(false)}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleAdjust}>
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmAction !== null}
        title={`Confirm ${confirmAction ?? ""}`}
        description={`Are you sure you want to ${confirmAction} this wallet?`}
        confirmLabel="Confirm"
        danger={confirmAction === "freeze"}
        onConfirm={handleToggleStatus}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}