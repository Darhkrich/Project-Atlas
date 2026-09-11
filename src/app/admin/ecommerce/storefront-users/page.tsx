/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CustomerListItem } from "@/components/admin/customers/customer-list-item";
import { CustomerDetailDrawer } from "@/components/admin/customers/customer-detail-drawer";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { ExportMenu } from "@/components/admin/ui/export-menu";
import { SavedViews, type SavedView } from "@/components/admin/ui/saved-views";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { mockCustomers } from "@/lib/admin/mock/customers";
import { Customer } from "@/lib/admin/types/customer";

export default function MerchantStorefrontUsersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [storefrontFilter, setStorefrontFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [bulkAction, setBulkAction] = useState<"suspend" | "export" | null>(null);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      const storefrontUsers = mockCustomers.filter(c => c.storefrontType === "merchant");
      setCustomers(storefrontUsers);
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("atlas-merchant-storefront-users-views");
      if (stored) setSavedViews(JSON.parse(stored));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("atlas-merchant-storefront-users-views", JSON.stringify(savedViews));
  }, [savedViews]);

  const merchantStorefronts = Array.from(new Set(customers.map(c => c.storefrontId as string)));

  const filtered = customers.filter(c => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.email.toLowerCase().includes(search.toLowerCase())) return false;
    if (storefrontFilter && c.storefrontId !== storefrontFilter) return false;
    return true;
  });

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    console.log(`Exporting storefront users as ${format}`);
  };

  const handleSaveView = (name: string) => {
    const filters = { search, storefrontFilter };
    setSavedViews(prev => [...prev, { name, filters }]);
  };

  const handleLoadView = (view: SavedView) => {
    setSearch(view.filters.search || "");
    setStorefrontFilter(view.filters.storefrontFilter || "");
  };

  const handleDeleteView = (name: string) => {
    setSavedViews(prev => prev.filter(v => v.name !== name));
  };

  const handleBulkAction = () => {
    console.log(`${bulkAction} for users:`, selectedIds);
    setShowBulkConfirm(false);
    setBulkAction(null);
  };

  const toggleSelected = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Merchant Storefront Users"
        description="All customer accounts belonging to merchant storefronts."
        actions={
          <>
            <ExportMenu onExport={handleExport} />
            <Button variant="outline" size="sm" disabled={selectedIds.length === 0}>
              Bulk Actions
            </Button>
          </>
        }
      />

      <SavedViews views={savedViews} onLoad={handleLoadView} onDelete={handleDeleteView} onSave={handleSaveView} />

      <div className="flex flex-wrap gap-2">
        <Input placeholder="Search storefront users..." className="max-w-xs" value={search} onChange={e => setSearch(e.target.value)} />
        <select
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          value={storefrontFilter}
          onChange={e => setStorefrontFilter(e.target.value)}
        >
          <option value="">All Merchant Storefronts</option>
          {merchantStorefronts.map(id => (
            <option key={id} value={id}>{id}</option>
          ))}
        </select>
      </div>

      {selectedIds.length > 0 && (
        <div className="flex items-center gap-2 rounded-md bg-neutral-50 p-2 dark:bg-neutral-900">
          <span className="text-sm">{selectedIds.length} selected</span>
          <Button variant="outline" size="sm" onClick={() => { setBulkAction("suspend"); setShowBulkConfirm(true); }}>Suspend</Button>
          <Button variant="outline" size="sm" onClick={() => { setBulkAction("export"); setShowBulkConfirm(true); }}>Export Selected</Button>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(customer => (
            <div key={customer.id} className="relative">
              <input
                type="checkbox"
                className="absolute top-3 left-3 z-10 h-4 w-4"
                checked={selectedIds.includes(customer.id)}
                onChange={() => toggleSelected(customer.id)}
                onClick={e => e.stopPropagation()}
              />
              <CustomerListItem
                customer={customer}
                isSelected={selectedIds.includes(customer.id)}
                onClick={setSelectedCustomer}
              />
            </div>
          ))}
        </div>
      )}

      <CustomerDetailDrawer customer={selectedCustomer} onClose={() => setSelectedCustomer(null)} />

      <ConfirmDialog
        open={showBulkConfirm}
        title={`Confirm ${bulkAction ?? ''}`}
        description={`Are you sure you want to ${bulkAction ?? ''} ${selectedIds.length} users?`}
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