/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { WalletSummaryCards } from "@/components/admin/wallets/wallet-summary-cards";
import { WalletDetailDrawer } from "@/components/admin/wallets/wallet-detail-drawer";
import { WithdrawalRequestsQueue } from "@/components/admin/wallets/withdrawal-requests-queue";
import { WithdrawalRequestDetail } from "@/components/admin/wallets/withdrawal-request-detail";
import { WalletSparkline } from "@/components/admin/wallets/wallet-sparkline";
import { AdminDataTable } from "@/components/admin/ui/admin-data-table";
import { Button } from "@/components/admin/ui/button";
import { Badge } from "@/components/admin/ui/badge";
import { Input } from "@/components/admin/ui/input";
import { mockWallets, mockWithdrawalRequests } from "@/lib/admin/mock/wallets";
import { formatCurrency } from "@/lib/admin/formatters";
import {
  Wallet,
  WALLET_STATUS_LABELS,
  OWNER_TYPE_LABELS,
  WithdrawalRequest,
  AdjustmentDirection,
} from "@/lib/admin/types/wallet";

const statusVariantMap: Record<string, "success" | "danger"> = {
  active: "success",
  frozen: "danger",
};

const ownerTypeVariantMap: Record<string, "info" | "success" | "warning"> = {
  customer: "info",
  reseller: "success",
  merchant: "warning",
};

export default function WalletsPage() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [ownerTypeFilter, setOwnerTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);

  const allColumns = [
    {
      key: "owner",
      header: "Owner",
      cell: (w: Wallet) => (
        <div>
          <p className="font-medium">{w.ownerName}</p>
          <Badge variant={ownerTypeVariantMap[w.ownerType]}>
            {OWNER_TYPE_LABELS[w.ownerType]}
          </Badge>
        </div>
      ),
    },
    {
      key: "walletId",
      header: "Wallet ID",
      cell: (w: Wallet) => <span className="font-mono text-xs">{w.id}</span>,
    },
    {
      key: "balance",
      header: "Available",
      cell: (w: Wallet) => (
        <span className="font-semibold">{formatCurrency(w.balance)}</span>
      ),
    },
    {
      key: "pending",
      header: "Pending",
      cell: (w: Wallet) => (
        <span className="text-warning-600">{formatCurrency(w.pendingBalance)}</span>
      ),
    },
    {
      key: "trend",
      header: "Trend",
      cell: (w: Wallet) => <WalletSparkline data={w.trend} />,
    },
    {
      key: "risk",
      header: "Risk",
      cell: (w: Wallet) => (
        <Badge
          variant={
            w.riskLevel === "high"
              ? "danger"
              : w.riskLevel === "medium"
              ? "warning"
              : "success"
          }
        >
          {w.riskLevel}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (w: Wallet) => (
        <Badge variant={statusVariantMap[w.status]}>{WALLET_STATUS_LABELS[w.status]}</Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      cell: (w: Wallet) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedWallet(w);
          }}
        >
          View
        </Button>
      ),
    },
  ];

  useEffect(() => {
    setVisibleColumns(allColumns.map((c) => c.key));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setWallets(mockWallets);
      setWithdrawalRequests(mockWithdrawalRequests);
      setLoading(false);
    }, 500);
  }, []);

  const filteredWallets = wallets.filter((w) => {
    if (
      search &&
      !w.ownerName.toLowerCase().includes(search.toLowerCase()) &&
      !w.id.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    if (ownerTypeFilter && w.ownerType !== ownerTypeFilter) return false;
    if (statusFilter && w.status !== statusFilter) return false;
    return true;
  });

  const columns = allColumns.filter((c) => visibleColumns.includes(c.key));

  const summaryData = {
    totalBalance: wallets.reduce((sum, w) => sum + w.balance, 0),
    customerBalance: wallets
      .filter((w) => w.ownerType === "customer")
      .reduce((sum, w) => sum + w.balance, 0),
    resellerBalance: wallets
      .filter((w) => w.ownerType === "reseller")
      .reduce((sum, w) => sum + w.balance, 0),
    merchantBalance: wallets
      .filter((w) => w.ownerType === "merchant")
      .reduce((sum, w) => sum + w.balance, 0),
    pendingWithdrawals: withdrawalRequests
      .filter((r) => r.status === "pending")
      .reduce((sum, r) => sum + r.amount, 0),
  };

  const handleAdjust = (
    walletId: string,
    direction: AdjustmentDirection,
    amount: number,
    reason: string
  ) => {
    setWallets((prev) =>
      prev.map((w) => {
        if (w.id !== walletId) return w;
        const previous = w.balance;
        const newBalance =
          direction === "credit" ? w.balance + amount : w.balance - amount;
        const newAdj = {
          id: `ADJ-${Date.now()}`,
          admin: "current_admin@atlas.com",
          timestamp: new Date().toISOString(),
          direction,
          amount,
          reason,
          previousBalance: previous,
          newBalance,
        };
        return {
          ...w,
          balance: newBalance,
          adjustments: [newAdj, ...w.adjustments],
        };
      })
    );
    setSelectedWallet(null);
  };

  const handleToggleStatus = (walletId: string) => {
    setWallets((prev) =>
      prev.map((w) =>
        w.id === walletId
          ? { ...w, status: w.status === "active" ? "frozen" : "active" }
          : w
      )
    );
  };

  const handleApproveWithdrawal = (id: string) => {
    setWithdrawalRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "approved" } : r))
    );
  };

  const handleRejectWithdrawal = (id: string) => {
    setWithdrawalRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "rejected" } : r))
    );
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Wallets"
        description="Manage platform wallets, balances, withdrawals, and adjustments."
      />

      <WalletSummaryCards data={summaryData} />

      <WithdrawalRequestsQueue
        requests={withdrawalRequests}
        onApprove={handleApproveWithdrawal}
        onReject={handleRejectWithdrawal}
        onViewDetail={setSelectedRequest}
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="Search wallets..."
          className="max-w-xs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          value={ownerTypeFilter}
          onChange={(e) => setOwnerTypeFilter(e.target.value)}
        >
          <option value="">All Owner Types</option>
          <option value="customer">Customer</option>
          <option value="reseller">Reseller</option>
          <option value="merchant">Merchant</option>
        </select>
        <select
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="frozen">Frozen</option>
        </select>
      </div>

      {/* Column visibility & page size */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs">Rows per page:</span>
          <select
            className="h-8 rounded-md border border-neutral-300 px-2 text-xs"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs">Columns:</span>
          {allColumns
            .filter((c) => c.key !== "actions")
            .map((col) => (
              <label key={col.key} className="flex items-center gap-1 text-xs">
                <input
                  type="checkbox"
                  checked={visibleColumns.includes(col.key)}
                  onChange={(e) => {
                    if (e.target.checked) setVisibleColumns((prev) => [...prev, col.key]);
                    else setVisibleColumns((prev) => prev.filter((k) => k !== col.key));
                  }}
                  className="h-3 w-3"
                />
                {col.header}
              </label>
            ))}
        </div>
      </div>

      <AdminDataTable
        columns={columns}
        data={filteredWallets}
        isLoading={loading}
        rowKey={(w) => w.id}
        onRowClick={(w) => setSelectedWallet(w)}
        pageSize={pageSize}
        currentPage={page}
        onPageChange={setPage}
        emptyMessage="No wallets found."
      />

      <WalletDetailDrawer
        wallet={selectedWallet}
        onClose={() => setSelectedWallet(null)}
        onAdjust={handleAdjust}
        onToggleStatus={handleToggleStatus}
      />

      <WithdrawalRequestDetail
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
        onApprove={handleApproveWithdrawal}
        onReject={handleRejectWithdrawal}
      />
    </div>
  );
}