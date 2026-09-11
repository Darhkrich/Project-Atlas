/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useMemo } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CustomerSummaryCards } from "@/components/admin/customers/customer-summary-cards";
import { CustomerFilters } from "@/components/admin/customers/customer-filters";
import { CustomerListItem } from "@/components/admin/customers/customer-list-item";
import { CustomerDetailDrawer } from "@/components/admin/customers/customer-detail-drawer";
import { Button } from "@/components/admin/ui/button";
import { ExportMenu } from "@/components/admin/ui/export-menu";
import { SavedViews, type SavedView } from "@/components/admin/ui/saved-views";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { mockCustomers } from "@/lib/admin/mock/customers";
import { Customer } from "@/lib/admin/types/customer";

const PAGE_SIZE = 12;

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [bulkAction, setBulkAction] = useState<"suspend" | "export" | null>(null);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);

  const [filters, setFilters] = useState<{
    search: string;
    status: string;
    tag: string;
    source: string;
    risk: string;
  }>({
    search: "",
    status: "",
    tag: "",
    source: "",
    risk: "",
  });

  useEffect(() => {
    setTimeout(() => {
      // Only direct customers (no storefront)
      setCustomers(mockCustomers.filter((c) => !c.storefrontId));
      setLoading(false);
    }, 500);
  }, []);

  // Load/save saved views
  useEffect(() => {
    try {
      const stored = localStorage.getItem("atlas-customer-views");
      if (stored) setSavedViews(JSON.parse(stored));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("atlas-customer-views", JSON.stringify(savedViews));
  }, [savedViews]);

  // Filters
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (
        filters.search &&
        !c.name.toLowerCase().includes(filters.search.toLowerCase()) &&
        !c.email.toLowerCase().includes(filters.search.toLowerCase())
      )
        return false;
      if (filters.status && c.status !== filters.status) return false;
      if (filters.tag && !c.tags.includes(filters.tag)) return false;
      if (filters.source && c.source !== filters.source) return false;
      if (filters.risk && c.riskLevel !== filters.risk) return false;
      return true;
    });
  }, [customers, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / PAGE_SIZE);
  const paginated = filteredCustomers.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  // All tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    customers.forEach((c) => c.tags.forEach((t) => tags.add(t)));
    return Array.from(tags).sort();
  }, [customers]);

  // Summary data
  const summaryData = {
    totalCustomers: customers.length,
    activeCustomers: customers.filter((c) => c.status === "active").length,
    newThisMonth: 12,
    suspendedCustomers: customers.filter((c) => c.status === "suspended").length,
    totalSpent: customers.reduce((sum, c) => sum + c.totalSpent, 0),
    avgOrderValue:
      customers.reduce((sum, c) => sum + c.totalSpent, 0) /
      Math.max(
        customers.reduce((sum, c) => sum + c.totalOrders, 0),
        1
      ),
  };

  // Handlers
  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const filterByStatus = (status: string) => {
    setFilters((prev) => ({ ...prev, status }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters({ search: "", status: "", tag: "", source: "", risk: "" });
    setPage(1);
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleAdjustWallet = (
    id: string,
    amount: number,
    reason: string
  ) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, walletBalance: c.walletBalance + amount } : c
      )
    );
    if (selectedCustomer && selectedCustomer.id === id) {
      setSelectedCustomer((prev) =>
        prev ? { ...prev, walletBalance: prev.walletBalance + amount } : prev
      );
    }
    console.log(`Adjusted wallet for ${id}: ${amount} (${reason})`);
  };

  const handleAddTag = (id: string, tag: string) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, tags: [...c.tags, tag] } : c))
    );
    if (selectedCustomer && selectedCustomer.id === id) {
      setSelectedCustomer((prev) =>
        prev ? { ...prev, tags: [...prev.tags, tag] } : prev
      );
    }
  };

  const handleSuspend = (id: string) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: "suspended" as const } : c
      )
    );
    setSelectedCustomer(null);
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
      setCustomers((prev) =>
        prev.map((c) =>
          selectedIds.includes(c.id)
            ? { ...c, status: "suspended" as const }
            : c
        )
      );
    } else if (bulkAction === "export") {
      console.log(`Export selected customers:`, selectedIds);
    }
    setSelectedIds([]);
    setShowBulkConfirm(false);
    setBulkAction(null);
  };

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    console.log(`Export customers as ${format}`);
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

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Customers"
        description="Atlas Digital Services direct customers."
        actions={<ExportMenu onExport={handleExport} />}
      />

      <CustomerSummaryCards
        data={summaryData}
        onFilterAll={() => filterByStatus("")}
        onFilterActive={() => filterByStatus("active")}
        onFilterSuspended={() => filterByStatus("suspended")}
      />

      <SavedViews
        views={savedViews}
        onLoad={handleLoadView}
        onDelete={handleDeleteView}
        onSave={handleSaveView}
      />

      <CustomerFilters allTags={allTags} onFilterChange={handleFilterChange} />

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
              Suspend
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
            {filteredCustomers.length} customers
            {Object.values(filters).some((v) => v) ? " (filtered)" : ""}
          </span>
        )}
      </div>

      {/* Customer List */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"
            />
          ))}
        </div>
      ) : paginated.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-300 p-8 text-center dark:border-neutral-700">
          <p className="text-sm text-neutral-500">
            No customers match your filters.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={resetFilters}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {paginated.map((customer) => (
              <div key={customer.id} className="relative">
                <input
                  type="checkbox"
                  className="absolute left-3 top-3 z-10 h-4 w-4"
                  checked={selectedIds.includes(customer.id)}
                  onChange={() => handleToggleSelect(customer.id)}
                  onClick={(e) => e.stopPropagation()}
                />
                <CustomerListItem
                  customer={customer}
                  isSelected={selectedIds.includes(customer.id)}
                  onClick={setSelectedCustomer}
                />
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-500">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <CustomerDetailDrawer
        customer={selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        onAdjustWallet={handleAdjustWallet}
        onAddTag={handleAddTag}
        onSuspend={handleSuspend}
        onSendNotification={handleSendNotification}
      />

      <ConfirmDialog
        open={showBulkConfirm}
        title={`Confirm ${bulkAction ?? ""}`}
        description={`Are you sure you want to ${bulkAction} ${selectedIds.length} customers?`}
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