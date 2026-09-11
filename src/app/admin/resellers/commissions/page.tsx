/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { ExportMenu } from "@/components/admin/ui/export-menu";
import { SavedViews, type SavedView } from "@/components/admin/ui/saved-views";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { mockResellerCommissionWallets } from "@/lib/admin/mock/reseller-commission-wallets";
import { ResellerCommissionWallet } from "@/lib/admin/types/reseller-commission-wallet";
import { formatCurrency } from "@/lib/admin/formatters";

function formatTimestamp(iso: string) {
  const d = new Date(iso);
  return `${d.getUTCDate()}/${d.getUTCMonth() + 1}/${d.getUTCFullYear()} ${d.getUTCHours()}:${d.getUTCMinutes()}`;
}

export default function ResellerCommissionWalletsPage() {
  const [wallets, setWallets] = useState<ResellerCommissionWallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [withdrawalStatusFilter, setWithdrawalStatusFilter] = useState("");
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [confirmAction, setConfirmAction] = useState<{ type: "approve" | "reject"; walletId: string; requestId: string; amount: number } | null>(null);

  useEffect(() => {
    setTimeout(() => {
      setWallets(mockResellerCommissionWallets);
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("atlas-reseller-commission-wallet-views");
      if (stored) setSavedViews(JSON.parse(stored));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("atlas-reseller-commission-wallet-views", JSON.stringify(savedViews));
  }, [savedViews]);

  const filtered = wallets.filter(w => {
    if (search && !w.resellerName.toLowerCase().includes(search.toLowerCase())) return false;
    if (withdrawalStatusFilter) {
      const hasMatching = w.withdrawalRequests.some(r => r.status === withdrawalStatusFilter) ||
        w.withdrawalHistory.some(r => r.status === withdrawalStatusFilter);
      if (!hasMatching) return false;
    }
    return true;
  });

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    console.log(`Export commission wallets as ${format}`);
  };

  const handleSaveView = (name: string) => {
    setSavedViews(prev => [...prev, { name, filters: { search, withdrawalStatusFilter } }]);
  };

  const handleLoadView = (view: SavedView) => {
    setSearch(view.filters.search || "");
    setWithdrawalStatusFilter(view.filters.withdrawalStatusFilter || "");
  };

  const handleDeleteView = (name: string) => {
    setSavedViews(prev => prev.filter(v => v.name !== name));
  };

  const handleWithdrawalAction = (walletId: string, requestId: string, action: "approve" | "reject") => {
    setWallets(prev => prev.map(w => {
      if (w.id !== walletId) return w;
      const request = w.withdrawalRequests.find(r => r.id === requestId);
      if (!request) return w;
      const newHistoryEntry = {
        id: request.id,
        amount: request.amount,
        method: request.method,
        requestedAt: request.requestedAt,
        status: action === "approve" ? "completed" as const : "failed" as const,
      };
      return {
        ...w,
        withdrawalRequests: w.withdrawalRequests.filter(r => r.id !== requestId),
        withdrawalHistory: [...w.withdrawalHistory, newHistoryEntry],
      };
    }));
    setConfirmAction(null);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Reseller Commission Wallets"
        description="Track automatic commission credits and withdrawal requests (auto-approved under GH₵5,000)."
        actions={<ExportMenu onExport={handleExport} />}
      />

      <SavedViews views={savedViews} onLoad={handleLoadView} onDelete={handleDeleteView} onSave={handleSaveView} />

      <div className="flex flex-wrap gap-2">
        <Input placeholder="Search resellers..." className="max-w-xs" value={search} onChange={e => setSearch(e.target.value)} />
        <select
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm"
          value={withdrawalStatusFilter}
          onChange={e => setWithdrawalStatusFilter(e.target.value)}
        >
          <option value="">All Withdrawals</option>
          <option value="pending">Pending Approval</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {filtered.map(wallet => (
            <Card key={wallet.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{wallet.resellerName}</CardTitle>
                <Badge variant="info">{wallet.resellerId}</Badge>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><p className="text-xs text-neutral-500">Balance</p><p className="font-semibold">{formatCurrency(wallet.balance)}</p></div>
                  <div><p className="text-xs text-neutral-500">Pending</p><p className="font-semibold text-warning-600">{formatCurrency(wallet.pendingBalance)}</p></div>
                  <div><p className="text-xs text-neutral-500">Total Earned</p><p className="font-semibold">{formatCurrency(wallet.totalEarned)}</p></div>
                  <div><p className="text-xs text-neutral-500">Total Withdrawn</p><p className="font-semibold">{formatCurrency(wallet.totalWithdrawn)}</p></div>
                </div>

                {/* Pending Approval (large amounts) */}
                {wallet.withdrawalRequests.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-medium text-neutral-500">Pending Approval (≥ GH₵5,000)</p>
                    {wallet.withdrawalRequests.map(req => (
                      <div key={req.id} className="flex items-center justify-between rounded-md bg-warning-50 p-2 text-sm dark:bg-warning-900/20">
                        <span>{formatCurrency(req.amount)} · {req.method}</span>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" onClick={() => setConfirmAction({ type: "approve", walletId: wallet.id, requestId: req.id, amount: req.amount })}>Approve</Button>
                          <Button size="sm" variant="ghost" className="text-danger-600" onClick={() => setConfirmAction({ type: "reject", walletId: wallet.id, requestId: req.id, amount: req.amount })}>Reject</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Withdrawal History */}
                {wallet.withdrawalHistory.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-medium text-neutral-500">Withdrawal History</p>
                    {wallet.withdrawalHistory.map(wh => (
                      <div key={wh.id} className="flex items-center justify-between rounded-md bg-neutral-50 p-2 text-sm dark:bg-neutral-900">
                        <span>{formatCurrency(wh.amount)} · {wh.method}</span>
                        <Badge variant={wh.status === "completed" ? "success" : "danger"}>{wh.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}

                {/* Recent Credits */}
                <div className="mt-3">
                  <p className="text-xs font-medium text-neutral-500">Recent Automatic Credits</p>
                  {wallet.recentCredits.length === 0 ? (
                    <p className="text-sm text-neutral-400">No recent credits</p>
                  ) : (
                    <ul className="mt-1 space-y-1">
                      {wallet.recentCredits.map(credit => (
                        <li key={credit.id} className="text-xs text-neutral-600 dark:text-neutral-400">
                          {credit.service} · {formatCurrency(credit.amount)} · {formatTimestamp(credit.createdAt)}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Confirmation */}
      <ConfirmDialog
        open={confirmAction !== null}
        title={`Confirm ${confirmAction?.type === "approve" ? "Approve" : "Reject"} Withdrawal`}
        description={`Are you sure you want to ${confirmAction?.type} ${formatCurrency(confirmAction?.amount || 0)} withdrawal?`}
        confirmLabel="Confirm"
        danger={confirmAction?.type === "reject"}
        onConfirm={() => {
          if (confirmAction) handleWithdrawalAction(confirmAction.walletId, confirmAction.requestId, confirmAction.type);
        }}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}