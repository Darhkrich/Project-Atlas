/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { SubscriptionsSummaryCards } from "@/components/admin/ecommerce/subscriptions-summary-cards";
import { SubscriptionsTable } from "@/components/admin/ecommerce/subscriptions-table";
import { SubscriptionDetailDrawer } from "@/components/admin/ecommerce/subscription-detail-drawer";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { ExportMenu } from "@/components/admin/ui/export-menu";
import { SavedViews, type SavedView } from "@/components/admin/ui/saved-views";
import { mockMerchantSubscriptions, mockInvoices } from "@/lib/admin/mock/ecommerce-subscriptions";
import { MerchantSubscription } from "@/lib/admin/types/ecommerce";

export default function EcommerceSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<MerchantSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedSubscription, setSelectedSubscription] = useState<MerchantSubscription | null>(null);
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);

  useEffect(() => {
    setTimeout(() => {
      setSubscriptions(mockMerchantSubscriptions);
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("atlas-ecommerce-subscription-views");
      if (stored) setSavedViews(JSON.parse(stored));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("atlas-ecommerce-subscription-views", JSON.stringify(savedViews));
  }, [savedViews]);

  const filtered = subscriptions.filter(sub => {
    if (search && !sub.merchantName.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter && sub.status !== statusFilter) return false;
    return true;
  });

  const summaryData = {
    totalActive: subscriptions.filter(s => s.status === "active").length,
    pastDue: subscriptions.filter(s => s.status === "past_due").length,
    cancelled: subscriptions.filter(s => s.status === "cancelled").length,
    mrr: 24000,
  };

  const invoicesForSelected = selectedSubscription
    ? mockInvoices.filter(inv => inv.subscriptionId === selectedSubscription.id)
    : [];

  const handleChangePlan = (subscriptionId: string, newPlanCode: string) => {
    setSubscriptions(prev => prev.map(s => {
      if (s.id !== subscriptionId) return s;
      const planName = newPlanCode.charAt(0).toUpperCase() + newPlanCode.slice(1);
      return { ...s, planCode: newPlanCode, planName };
    }));
  };

  const handleApplyDiscount = (subscriptionId: string, discountPercent: number) => {
    console.log(`Applying ${discountPercent}% discount to subscription ${subscriptionId}`);
  };

  const handleCancelSubscription = (subscriptionId: string, reason: string) => {
    setSubscriptions(prev => prev.map(s =>
      s.id === subscriptionId ? { ...s, status: "cancelled" } : s
    ));
    console.log(`Cancelled subscription ${subscriptionId} with reason: ${reason}`);
  };

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    console.log(`Export subscriptions as ${format}`);
  };

  const handleSaveView = (name: string) => {
    setSavedViews(prev => [...prev, { name, filters: { search, statusFilter } }]);
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
        title="Subscriptions"
        description="Manage merchant subscriptions, plans, and billing."
        actions={<ExportMenu onExport={handleExport} />}
      />

      <SubscriptionsSummaryCards data={summaryData} />

      <SavedViews views={savedViews} onLoad={handleLoadView} onDelete={handleDeleteView} onSave={handleSaveView} />

      <div className="flex flex-wrap gap-2">
        <Input placeholder="Search merchants..." className="max-w-xs" value={search} onChange={e => setSearch(e.target.value)} />
        <select
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="past_due">Past Due</option>
          <option value="cancelled">Cancelled</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
          ))}
        </div>
      ) : (
        <SubscriptionsTable subscriptions={filtered} onView={setSelectedSubscription} />
      )}

      <SubscriptionDetailDrawer
        subscription={selectedSubscription}
        invoices={invoicesForSelected}
        onClose={() => setSelectedSubscription(null)}
        onChangePlan={handleChangePlan}
        onApplyDiscount={handleApplyDiscount}
        onCancelSubscription={handleCancelSubscription}
      />
    </div>
  );
}