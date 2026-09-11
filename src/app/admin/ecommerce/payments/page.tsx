/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { EcommercePaymentsTable } from "@/components/admin/ecommerce/ecommerce-payments-table";
import { PaymentSummaryCards } from "@/components/admin/payments/payment-summary-cards";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { ExportMenu } from "@/components/admin/ui/export-menu";
import { SavedViews, type SavedView } from "@/components/admin/ui/saved-views";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { mockEcommercePayments } from "@/lib/admin/mock/ecommerce-payments";
import { EcommercePayment } from "@/lib/admin/types/ecommerce-payment";
import { formatCurrency } from "@/lib/admin/formatters";

export default function EcommercePaymentsPage() {
  const [payments, setPayments] = useState<EcommercePayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<EcommercePayment | null>(null);
  const [refundConfirm, setRefundConfirm] = useState<EcommercePayment | null>(null);
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);

  useEffect(() => {
    setTimeout(() => {
      setPayments(mockEcommercePayments);
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("atlas-ecommerce-payment-views");
      if (stored) setSavedViews(JSON.parse(stored));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("atlas-ecommerce-payment-views", JSON.stringify(savedViews));
  }, [savedViews]);

  const filtered = payments.filter(p => {
    if (search && !p.merchantName.toLowerCase().includes(search.toLowerCase()) &&
        !p.id.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter && p.status !== statusFilter) return false;
    return true;
  });

  const summaryData = {
    totalVolume: payments.reduce((sum, p) => sum + p.amount, 0),
    successfulAmount: payments.filter(p => p.status === "successful").reduce((sum, p) => sum + p.amount, 0),
    pendingAmount: payments.filter(p => p.status === "pending").reduce((sum, p) => sum + p.amount, 0),
    failedAmount: payments.filter(p => p.status === "failed").reduce((sum, p) => sum + p.amount, 0),
    refundedAmount: payments.filter(p => p.status === "refunded").reduce((sum, p) => sum + p.amount, 0),
  };

  const handleRefund = (id: string) => {
    setPayments(prev => prev.map(p => p.id === id ? { ...p, status: "refunded" } : p));
    setRefundConfirm(null);
  };

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    console.log(`Export ecommerce payments as ${format}`);
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
        title="E-commerce Payments"
        description="All payment transactions across merchant stores."
        actions={<ExportMenu onExport={handleExport} />}
      />

      <PaymentSummaryCards data={summaryData} />

      <SavedViews views={savedViews} onLoad={handleLoadView} onDelete={handleDeleteView} onSave={handleSaveView} />

      <div className="flex flex-wrap gap-2">
        <Input placeholder="Search payments..." className="max-w-xs" value={search} onChange={e => setSearch(e.target.value)} />
        <select
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="successful">Successful</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
          ))}
        </div>
      ) : (
        <EcommercePaymentsTable
          payments={filtered}
          onView={setSelectedPayment}
          onRefund={setRefundConfirm}
        />
      )}

      {/* Payment Detail Drawer (simplified) */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedPayment(null)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl dark:bg-neutral-900">
            <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
              <h2 className="text-lg font-semibold">Payment {selectedPayment.id}</h2>
              <Button variant="ghost" size="sm" onClick={() => setSelectedPayment(null)}>Close</Button>
            </div>
            <div className="p-4 space-y-4">
              <div><p className="text-sm text-neutral-500">Merchant</p><p className="font-medium">{selectedPayment.merchantName}</p></div>
              <div><p className="text-sm text-neutral-500">Order</p><p className="font-medium">{selectedPayment.orderId}</p></div>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-sm text-neutral-500">Amount</p><p className="font-semibold">{formatCurrency(selectedPayment.amount)}</p></div>
                <div><p className="text-sm text-neutral-500">Fee</p><p>{formatCurrency(selectedPayment.fee)}</p></div>
                <div><p className="text-sm text-neutral-500">Net</p><p>{formatCurrency(selectedPayment.netAmount)}</p></div>
                <div><p className="text-sm text-neutral-500">Method</p><p className="capitalize">{selectedPayment.method}</p></div>
              </div>
              <div><p className="text-sm text-neutral-500">Transaction Ref</p><p className="font-mono text-xs">{selectedPayment.transactionRef}</p></div>
            </div>
          </div>
        </div>
      )}

      {/* Refund Confirmation */}
      <ConfirmDialog
        open={refundConfirm !== null}
        title="Confirm Refund"
        description={`Refund ${refundConfirm ? formatCurrency(refundConfirm.amount) : ""} for this payment?`}
        confirmLabel="Refund"
        danger
        onConfirm={() => {
          if (refundConfirm) handleRefund(refundConfirm.id);
        }}
        onCancel={() => setRefundConfirm(null)}
      />
    </div>
  );
}