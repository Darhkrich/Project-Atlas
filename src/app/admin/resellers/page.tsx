/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useMemo, SetStateAction } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ResellerSummaryCards } from "@/components/admin/resellers/reseller-summary-cards";
import { ResellerFilters } from "@/components/admin/resellers/reseller-filters";
import { ResellerDetailDrawer } from "@/components/admin/resellers/reseller-detail-drawer";
import { AdminDataTable, type Column } from "@/components/admin/ui/admin-data-table";
import { Button } from "@/components/admin/ui/button";
import { Badge } from "@/components/admin/ui/badge";
import { ExportMenu } from "@/components/admin/ui/export-menu";
import { SavedViews, type SavedView } from "@/components/admin/ui/saved-views";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { AtlasIcon } from "@/components/atlas/icons";
import { mockResellers } from "@/lib/admin/mock/resellers";
import { mockResellerTiers } from "@/lib/admin/mock/commissions";
import { formatCurrency } from "@/lib/admin/formatters";
import {
  Reseller,
  RESELLER_STATUS_LABELS,
  VERIFICATION_STATUS_LABELS,
} from "@/lib/admin/types/reseller";
import { cn } from "@/lib/utils";

const statusVariantMap: Record<string, "success" | "warning" | "danger" | "info" | "neutral"> = {
  active: "success",
  suspended: "danger",
  pending: "warning",
  rejected: "neutral",
};

const verificationVariantMap: Record<string, "success" | "warning" | "danger" | "info" | "neutral"> = {
  verified: "success",
  pending: "warning",
  rejected: "danger",
  not_submitted: "neutral",
};

export default function ResellersPage() {
  const [resellers, setResellers] = useState<Reseller[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReseller, setSelectedReseller] = useState<Reseller | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<
    "suspend" | "verify" | "export" | null
  >(null);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);

  const [filters, setFilters] = useState<{
    search: string;
    status: string;
    verification: string;
    tier: string;
    dateJoinedFrom: string;
    dateJoinedTo: string;
  }>({
    search: "",
    status: "",
    verification: "",
    tier: "",
    dateJoinedFrom: "",
    dateJoinedTo: "",
  });

  // Columns inside component to access setSelectedReseller
  const allColumns: Column<Reseller>[] = [
    {
      key: "__select__",
      header: "Select",
      cell: (r: Reseller) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(r.id)}
          onChange={(e) => {
            if (e.target.checked) setSelectedIds((prev) => [...prev, r.id]);
            else setSelectedIds((prev) => prev.filter((id) => id !== r.id));
          }}
          className="h-4 w-4"
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
    {
      key: "businessName",
      header: "Business",
      cell: (r: Reseller) => (
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
            {r.businessName.charAt(0)}
          </span>
          <div className="min-w-0">
            <p className="font-medium">{r.businessName}</p>
            <p className="text-xs text-neutral-500">
              {r.storeName || "—"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      cell: (r: Reseller) => (
        <div className="text-xs">
          <p>{r.contactPerson}</p>
          <p className="text-neutral-500">{r.email}</p>
        </div>
      ),
    },
    {
      key: "tier",
      header: "Tier",
      cell: (r: Reseller) =>
        r.tierName ? (
          <Badge variant="info">{r.tierName}</Badge>
        ) : (
          <span className="text-xs text-neutral-400">—</span>
        ),
    },
    {
      key: "wallet",
      header: "Wallet",
      cell: (r: Reseller) => formatCurrency(r.walletBalance),
    },
    {
      key: "orders",
      header: "Orders",
      cell: (r: Reseller) => r.totalOrders,
    },
    {
      key: "revenue",
      header: "Revenue",
      cell: (r: Reseller) => formatCurrency(r.totalRevenue),
    },
    {
      key: "verification",
      header: "Verification",
      cell: (r: Reseller) => {
        const verificationKey = r.verificationStatus as keyof typeof VERIFICATION_STATUS_LABELS;

        return (
          <Badge variant={verificationVariantMap[verificationKey]}>
            {VERIFICATION_STATUS_LABELS[verificationKey]}
          </Badge>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      cell: (r: Reseller) => {
        const statusKey = r.status as keyof typeof RESELLER_STATUS_LABELS;

        return (
          <Badge variant={statusVariantMap[statusKey]}>
            {RESELLER_STATUS_LABELS[statusKey]}
          </Badge>
        );
      },
    },
    {
      key: "actions",
      header: "",
      cell: (r: Reseller) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedReseller(r);
          }}
        >
          View
        </Button>
      ),
    },
  ];

  // Init visible columns
  useEffect(() => {
    setVisibleColumns(
      allColumns.map((c) => c.key).filter((k) => k !== "__select__")
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load data
  useEffect(() => {
    setTimeout(() => {
      setResellers(mockResellers);
      setLoading(false);
    }, 500);
  }, []);

  // Load saved views
  useEffect(() => {
    try {
      const stored = localStorage.getItem("atlas-reseller-views");
      if (stored) setSavedViews(JSON.parse(stored));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("atlas-reseller-views", JSON.stringify(savedViews));
  }, [savedViews]);

  // Filters
  const filteredResellers = useMemo(() => {
    return resellers.filter((r) => {
      if (
        filters.search &&
        !r.businessName.toLowerCase().includes(filters.search.toLowerCase()) &&
        !r.email.toLowerCase().includes(filters.search.toLowerCase()) &&
        !r.contactPerson.toLowerCase().includes(filters.search.toLowerCase())
      )
        return false;
      if (filters.status && r.status !== filters.status) return false;
      if (filters.verification && r.verificationStatus !== filters.verification)
        return false;
      if (filters.tier && r.tierName !== filters.tier) return false;
      if (filters.dateJoinedFrom) {
        const from = new Date(filters.dateJoinedFrom);
        if (new Date(r.joinedAt) < from) return false;
      }
      if (filters.dateJoinedTo) {
        const to = new Date(filters.dateJoinedTo);
        to.setHours(23, 59, 59, 999);
        if (new Date(r.joinedAt) > to) return false;
      }
      return true;
    });
  }, [resellers, filters]);

  // Display columns
  const displayColumns = allColumns.filter(
    (c) => c.key === "__select__" || visibleColumns.includes(c.key)
  );

  // Summary data
  const summaryData = {
    totalResellers: resellers.length,
    activeResellers: resellers.filter((r) => r.status === "active").length,
    pendingVerification: resellers.filter(
      (r) => r.verificationStatus === "pending"
    ).length,
    suspendedResellers: resellers.filter((r) => r.status === "suspended").length,
    totalCommissions: resellers.reduce(
      (sum, r) => sum + r.commissionsEarned,
      0
    ),
    newThisMonth: 8,
  };

  // Available tiers
  const availableTiers = useMemo(() => {
    const tiers = new Set<string>();
    resellers.forEach((r) => {
      if (r.tierName) tiers.add(r.tierName);
    });
    return Array.from(tiers).sort();
  }, [resellers]);

  // Handlers
  const filterByStatus = (status: string) => {
    setFilters((prev) => ({ ...prev, status }));
    setPage(1);
  };

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    console.log(`Export resellers as ${format}`);
  };

  const handleSaveView = (name: string) => {
    setSavedViews((prev) => [...prev, { name, filters }]);
  };

  const handleLoadView = (view: SavedView) => {
    setFilters(view.filters);
  };

  const handleDeleteView = (name: string) => {
    setSavedViews((prev) => prev.filter((v) => v.name !== name));
  };

  const handleAdjustWallet = (
    id: string,
    amount: number,
    reason: string
  ) => {
    setResellers((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, walletBalance: r.walletBalance + amount } : r
      )
    );
    if (selectedReseller && selectedReseller.id === id) {
      setSelectedReseller((prev) =>
        prev ? { ...prev, walletBalance: prev.walletBalance + amount } : prev
      );
    }
    console.log(`Adjusted wallet for ${id}: ${amount} (${reason})`);
  };

  const handleAssignTier = (id: string, tierId: string) => {
    const tier = mockResellerTiers.find((t) => t.id === tierId);
    if (!tier) return;
    setResellers((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, tierId: tier.id, tierName: tier.name }
          : r
      )
    );
    if (selectedReseller && selectedReseller.id === id) {
      setSelectedReseller((prev) =>
        prev ? { ...prev, tierId: tier.id, tierName: tier.name } : prev
      );
    }
  };

  const handleToggleStatus = (id: string) => {
    setResellers((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status:
                r.status === "active"
                  ? ("suspended" as const)
                  : ("active" as const),
            }
          : r
      )
    );
  };

  const handleApproveVerification = (id: string) => {
    setResellers((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, verificationStatus: "verified" as const }
          : r
      )
    );
  };

  const handleRejectVerification = (id: string) => {
    setResellers((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, verificationStatus: "rejected" as const }
          : r
      )
    );
  };

  const handleToggleStorefront = (id: string) => {
    setResellers((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              storefrontStatus:
                r.storefrontStatus === "live"
                  ? ("disabled" as const)
                  : ("live" as const),
            }
          : r
      )
    );
  };

  const handleSendNotification = (
    id: string,
    channel: string,
    message: string
  ) => {
    console.log(`Sent ${channel} to ${id}: ${message}`);
  };

  const handleBulkAction = () => {
    if (bulkAction === "suspend") {
      setResellers((prev) =>
        prev.map((r) =>
          selectedIds.includes(r.id)
            ? { ...r, status: "suspended" as const }
            : r
        )
      );
    } else if (bulkAction === "verify") {
      setResellers((prev) =>
        prev.map((r) =>
          selectedIds.includes(r.id)
            ? { ...r, verificationStatus: "verified" as const }
            : r
        )
      );
    } else if (bulkAction === "export") {
      console.log(`Export selected resellers:`, selectedIds);
    }
    setSelectedIds([]);
    setShowBulkConfirm(false);
    setBulkAction(null);
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      status: "",
      verification: "",
      tier: "",
      dateJoinedFrom: "",
      dateJoinedTo: "",
    });
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Resellers"
        description="Manage reseller accounts, verification, wallets, and storefronts."
        actions={<ExportMenu onExport={handleExport} />}
      />

      <ResellerSummaryCards
        data={summaryData}
        onFilterAll={() => filterByStatus("")}
        onFilterActive={() => filterByStatus("active")}
        onFilterPending={() => filterByStatus("pending")}
        onFilterSuspended={() => filterByStatus("suspended")}
      />

      <SavedViews
        views={savedViews}
        onLoad={handleLoadView}
        onDelete={handleDeleteView}
        onSave={handleSaveView}
      />

      <ResellerFilters
        onFilterChange={(newFilters) => {
          setFilters(newFilters);
          setPage(1);
        }}
        availableTiers={availableTiers}
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {selectedIds.length > 0 ? (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {selectedIds.length} selected
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setBulkAction("suspend");
                setShowBulkConfirm(true);
              }}
            >
              <AtlasIcon name="x-circle" className="mr-1 h-3.5 w-3.5" />
              Suspend
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setBulkAction("verify");
                setShowBulkConfirm(true);
              }}
            >
              <AtlasIcon name="check" className="mr-1 h-3.5 w-3.5" />
              Verify
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setBulkAction("export");
                setShowBulkConfirm(true);
              }}
            >
              Export Selected
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds([])}
            >
              Clear
            </Button>
          </div>
        ) : (
          <span className="text-sm text-neutral-500">
            {filteredResellers.length} reseller
            {filteredResellers.length === 1 ? "" : "s"}
            {Object.values(filters).some((v) => v) ? " (filtered)" : ""}
          </span>
        )}

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500">Rows per page:</span>
          <select
            className="h-8 rounded-md border border-neutral-300 bg-white px-2 text-xs dark:border-neutral-700 dark:bg-neutral-800"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Column visibility */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-neutral-500">Columns:</span>
        {allColumns
          .filter((c) => c.key !== "__select__" && c.key !== "actions")
          .map((col) => (
            <label key={col.key} className="flex items-center gap-1 text-xs">
              <input
                type="checkbox"
                checked={visibleColumns.includes(col.key)}
                onChange={(e) => {
                  if (e.target.checked)
                    setVisibleColumns((prev) => [...prev, col.key]);
                  else
                    setVisibleColumns((prev) =>
                      prev.filter((k) => k !== col.key)
                    );
                }}
                className="h-3 w-3"
              />
              {col.header}
            </label>
          ))}
      </div>

      {/* Table */}
      <AdminDataTable
        columns={displayColumns}
        data={filteredResellers}
        isLoading={loading}
        rowKey={(r) => r.id}
        onRowClick={(r) => setSelectedReseller(r)}
        pageSize={pageSize}
        currentPage={page}
        onPageChange={setPage}
        emptyMessage="No resellers found."
      />

      {/* Detail drawer */}
      <ResellerDetailDrawer
        reseller={selectedReseller}
        onClose={() => setSelectedReseller(null)}
        onAdjustWallet={handleAdjustWallet}
        onAssignTier={handleAssignTier}
        onToggleStatus={handleToggleStatus}
        onApproveVerification={handleApproveVerification}
        onRejectVerification={handleRejectVerification}
        onToggleStorefront={handleToggleStorefront}
        onSendNotification={handleSendNotification}
      />

      {/* Bulk confirmation */}
      <ConfirmDialog
        open={showBulkConfirm}
        title={`Confirm ${bulkAction ?? ""}`}
        description={`Are you sure you want to ${bulkAction} ${selectedIds.length} reseller${
          selectedIds.length === 1 ? "" : "s"
        }?`}
        confirmLabel="Confirm"
        danger={bulkAction === "suspend"}
        onConfirm={handleBulkAction}
        onCancel={() => {
          setShowBulkConfirm(false);
          setBulkAction(null);
        }}
      />
    </div>
  );
}