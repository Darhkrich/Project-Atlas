/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect, useMemo } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CustomerSummaryCards } from "@/components/admin/customers/customer-summary-cards";
import { CustomerListItem } from "@/components/admin/customers/customer-list-item";
import { CustomerDetailDrawer } from "@/components/admin/customers/customer-detail-drawer";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { ExportMenu } from "@/components/admin/ui/export-menu";
import { SavedViews, type SavedView } from "@/components/admin/ui/saved-views";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { mockCustomers } from "@/lib/admin/mock/customers";
import { Customer } from "@/lib/admin/types/customer";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [bulkAction, setBulkAction] = useState<"suspend" | "export" | "send_notification" | null>(null);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);

  // Load mock data
  useEffect(() => {
    setTimeout(() => {
      setCustomers(mockCustomers);
      setLoading(false);
    }, 500);
  }, []);

  // Load saved views from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("atlas-customer-views");
      if (stored) setSavedViews(JSON.parse(stored));
    } catch {}
  }, []);

  // Persist saved views
  useEffect(() => {
    localStorage.setItem("atlas-customer-views", JSON.stringify(savedViews));
  }, [savedViews]);

  const filteredCustomers = customers.filter((c) => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) &&
        !c.email.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter && c.status !== statusFilter) return false;
    if (tagFilter && !c.tags.includes(tagFilter)) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredCustomers.length / pageSize);
  const startIndex = (page - 1) * pageSize;
  const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + pageSize);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    customers.forEach((c) => c.tags.forEach((tag) => tags.add(tag)));
    return Array.from(tags);
  }, [customers]);

  const summaryData = {
    totalCustomers: customers.length,
    activeCustomers: customers.filter((c) => c.status === "active").length,
    newThisMonth: 12,
    totalSpent: customers.reduce((sum, c) => sum + c.totalSpent, 0),
    avgOrderValue: customers.reduce((sum, c) => sum + c.totalSpent, 0) / Math.max(customers.reduce((sum, c) => sum + c.totalOrders, 0), 1),
  };

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    console.log(`Exporting customers as ${format}`);
  };

  const handleSaveView = (name: string) => {
    const filters = { search, statusFilter, tagFilter };
    setSavedViews((prev) => [...prev, { name, filters }]);
  };

  const handleLoadView = (view: SavedView) => {
    setSearch(view.filters.search || "");
    setStatusFilter(view.filters.statusFilter || "");
    setTagFilter(view.filters.tagFilter || "");
  };

  const handleDeleteView = (name: string) => {
    setSavedViews((prev) => prev.filter((v) => v.name !== name));
  };

  const handleBulkAction = () => {
    console.log(`${bulkAction} for customers:`, selectedIds);
    setShowBulkConfirm(false);
    setBulkAction(null);
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(paginatedCustomers.map((c) => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Customers"
        description="Customer 360 Hub for managing Atlas Digital Services users."
        actions={
          <>
            <ExportMenu onExport={handleExport} />
            <Button variant="outline" size="sm" disabled={selectedIds.length === 0}>
              Bulk Actions
            </Button>
          </>
        }
      />

      <CustomerSummaryCards data={summaryData} />

      <SavedViews views={savedViews} onLoad={handleLoadView} onDelete={handleDeleteView} onSave={handleSaveView} />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search customers..."
          className="max-w-xs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
        <select
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
        >
          <option value="">All Tags</option>
          {allTags.map((tag) => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-neutral-500">Rows per page:</span>
          <select
            className="h-8 rounded-md border border-neutral-300 px-2 text-xs dark:border-neutral-700 dark:bg-neutral-800"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Bulk selection bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-2 rounded-md bg-neutral-50 p-2 dark:bg-neutral-900">
          <span className="text-sm">{selectedIds.length} selected</span>
          <Button variant="outline" size="sm" onClick={() => { setBulkAction("suspend"); setShowBulkConfirm(true); }}>Suspend</Button>
          <Button variant="outline" size="sm" onClick={() => { setBulkAction("send_notification"); setShowBulkConfirm(true); }}>Notify</Button>
          <Button variant="outline" size="sm" onClick={() => { setBulkAction("export"); setShowBulkConfirm(true); }}>Export Selected</Button>
        </div>
      )}

      {/* Customer List */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {paginatedCustomers.map((customer) => (
              <div key={customer.id} className="relative">
                <input
                  type="checkbox"
                  className="absolute top-3 left-3 z-10 h-4 w-4"
                  checked={selectedIds.includes(customer.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedIds((prev) => [...prev, customer.id]);
                    } else {
                      setSelectedIds((prev) => prev.filter((id) => id !== customer.id));
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
                <CustomerListItem
                  customer={customer}
                  isSelected={selectedIds.includes(customer.id)}
                  onClick={(customer) => setSelectedCustomer(customer)}
                />
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-neutral-500">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                Next
              </Button>
            </div>
          </div>
        </>
      )}

      <CustomerDetailDrawer customer={selectedCustomer} onClose={() => setSelectedCustomer(null)} />

      {/* Bulk action confirmation */}
      <ConfirmDialog
        open={showBulkConfirm}
        title={`Confirm ${bulkAction ? bulkAction.replace('_', ' ') : ''}`}
        description={`Are you sure you want to ${bulkAction ? bulkAction.replace('_', ' ') : ''} ${selectedIds.length} customers?`}
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