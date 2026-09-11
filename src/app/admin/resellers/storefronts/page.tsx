/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ResellerStorefrontSummaryCards } from "@/components/admin/resellers/reseller-storefront-summary-cards";
import { ResellerStorefrontTable } from "@/components/admin/resellers/reseller-storefront-table";
import { ResellerStorefrontDetailDrawer } from "@/components/admin/resellers/reseller-storefront-detail-drawer";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { ExportMenu } from "@/components/admin/ui/export-menu";
import { SavedViews, type SavedView } from "@/components/admin/ui/saved-views";
import { mockResellerStorefronts } from "@/lib/admin/mock/reseller-storefronts";
import { ResellerStorefront } from "@/lib/admin/types/reseller-storefront";

export default function ResellerStorefrontsPage() {
  const [storefronts, setStorefronts] = useState<ResellerStorefront[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedStorefront, setSelectedStorefront] = useState<ResellerStorefront | null>(null);
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);

  useEffect(() => {
    setTimeout(() => {
      setStorefronts(mockResellerStorefronts);
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("atlas-reseller-storefront-views");
      if (stored) setSavedViews(JSON.parse(stored));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("atlas-reseller-storefront-views", JSON.stringify(savedViews));
  }, [savedViews]);

  const filteredStorefronts = storefronts.filter(sf => {
    if (search && !sf.storeName.toLowerCase().includes(search.toLowerCase()) &&
        !sf.slug.toLowerCase().includes(search.toLowerCase()) &&
        !sf.resellerName.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter && sf.status !== statusFilter) return false;
    return true;
  });

  const handleToggleStatus = (id: string) => {
    setStorefronts(prev => prev.map(sf => {
      if (sf.id !== id) return sf;
      const newStatus = sf.status === "live" ? "disabled" : sf.status === "disabled" ? "live" : "live";
      return { ...sf, status: newStatus };
    }));
    // Also update selected if open
    setSelectedStorefront(prev => {
      if (prev && prev.id === id) {
        const newStatus = prev.status === "live" ? "disabled" : prev.status === "disabled" ? "live" : "live";
        return { ...prev, status: newStatus };
      }
      return prev;
    });
  };

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    console.log(`Exporting storefronts as ${format}`);
  };

  const handleSaveView = (name: string) => {
    const filters = { search, statusFilter };
    setSavedViews(prev => [...prev, { name, filters }]);
  };

  const handleLoadView = (view: SavedView) => {
    setSearch(view.filters.search || "");
    setStatusFilter(view.filters.statusFilter || "");
  };

  const handleDeleteView = (name: string) => {
    setSavedViews(prev => prev.filter(v => v.name !== name));
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Reseller Storefronts"
        description="Manage all reseller storefronts and their status."
        actions={<ExportMenu onExport={handleExport} />}
      />

      <ResellerStorefrontSummaryCards />

      <SavedViews views={savedViews} onLoad={handleLoadView} onDelete={handleDeleteView} onSave={handleSaveView} />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search storefronts..."
          className="max-w-xs"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="live">Live</option>
          <option value="disabled">Disabled</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
          ))}
        </div>
      ) : (
        <ResellerStorefrontTable
          storefronts={filteredStorefronts}
          onView={setSelectedStorefront}
          onToggleStatus={handleToggleStatus}
        />
      )}

      <ResellerStorefrontDetailDrawer
        storefront={selectedStorefront}
        onClose={() => setSelectedStorefront(null)}
        onToggleStatus={handleToggleStatus}
      />
    </div>
  );
}