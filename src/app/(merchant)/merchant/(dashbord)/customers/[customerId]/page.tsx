/* eslint-disable react-hooks/preserve-manual-memoization */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/purity */
"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState, useMemo } from "react";
import { AtlasIcon } from "@/components/atlas/icons";
import {
  getMockMerchantCustomers,
} from "@/lib/mock-merchant-customers";
import { getMockMerchantOrders } from "@/lib/mock-merchant-orders";
import { getMockMerchantTransactions } from "@/lib/mock-merchant-transactions";
import { useStorefrontConfig } from "@/contexts/storefront-config-context";
import { useOrders } from "@/contexts/orders-context";
import { useStoreCustomers } from "@/contexts/store-customers-context";
import { cn } from "@/lib/utils";

function parseTotal(total: string | number): number {
  if (typeof total === "number") return total;
  const numericString = total.replace(/[^0-9.]/g, "");
  return parseFloat(numericString) || 0;
}

export default function MerchantCustomerDetailPage() {
  const params = useParams();
  const customerId = params.customerId as string;
  const { storefrontConfig } = useStorefrontConfig();
  const { orders: realOrders } = useOrders();
  const { getCustomerById: getRealCustomerById } = useStoreCustomers();
  const storeSlug = storefrontConfig.slug;

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportSubmitted, setReportSubmitted] = useState(false);

  // Find customer identity
  const realCustomer = getRealCustomerById(customerId);
  const mockCustomer = !realCustomer
    ? getMockMerchantCustomers(storeSlug).find((c) => c.id === customerId)
    : undefined;

  const customerEmail = realCustomer
    ? realCustomer.email
    : mockCustomer
    ? mockCustomer.email
    : realOrders.find((o) => o.id === customerId && o.storeSlug === storeSlug)?.customerEmail || "";

  const customerName = realCustomer
    ? realCustomer.name
    : mockCustomer
    ? mockCustomer.name
    : customerEmail.split("@")[0] || "Customer";
  const customerPhone = realCustomer
    ? realCustomer.phone
    : mockCustomer
    ? mockCustomer.phone
    : "N/A";
  const customerStatus = realCustomer
    ? realCustomer.status
    : mockCustomer
    ? mockCustomer.status
    : "Active";

  // Get orders for this customer
  const allOrders = useMemo(() => {
    if (!customerEmail) return [];
    const mockOrders = getMockMerchantOrders(storeSlug).filter(
      (o) => o.customerEmail === customerEmail
    );
    const realOrdersForCustomer = realOrders.filter(
      (o) => o.storeSlug === storeSlug && o.customerEmail === customerEmail
    );
    return [...realOrdersForCustomer, ...mockOrders];
  }, [realOrders, storeSlug, customerEmail]);

  if (!customerEmail) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h1 className="text-xl font-semibold text-neutral-900">Customer not found</h1>
        <Link href="/merchant/customers" className="mt-4 text-brand-600">
          Back to Customers
        </Link>
      </div>
    );
  }

  const totalOrders = allOrders.length;
  const totalSpent = allOrders.reduce(
    (sum, order) => sum + parseTotal(order.total),
    0
  );
  const lastActivity = allOrders.length
    ? allOrders.reduce((latest, order) =>
        new Date(order.date) > new Date(latest.date) ? order : latest
      ).date
    : "No activity";

  // Transactions
  const mockTransactions = getMockMerchantTransactions(storeSlug).filter(
    (tx) => tx.orderNumber && allOrders.some((o) => o.orderNumber === tx.orderNumber)
  );

  const realTransactions = allOrders
    .filter((order) => realOrders.some((ro) => ro.id === order.id))
    .map((order) => ({
      id: `real-tx-${order.id}`,
      description: "Order payment received",
      date: order.date,
      amount: parseTotal(order.total),
      type: "Payment" as const,
      status: "Completed" as const,
      icon: "cart" as const,
      timestamp: (order as any).createdAt || Date.now(),
    }));

  const allTransactions = [
    ...realTransactions,
    ...mockTransactions.map((tx) => ({
      ...tx,
      timestamp: Date.now() - 999999, // ensure mock below real
    })),
  ].sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0));

  const submitReport = () => {
    console.log(`Reported customer ${customerName} for: ${reportReason}`);
    setReportSubmitted(true);
    setTimeout(() => setReportModalOpen(false), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/merchant/customers"
            className="text-sm font-medium text-neutral-500 hover:text-neutral-900"
          >
            ← Back
          </Link>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-lg font-semibold text-brand-700 dark:bg-brand-900/30 dark:text-brand-200">
            {customerName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
              {customerName}
            </h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">{customerEmail}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <a
            href={`mailto:${customerEmail}`}
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            <AtlasIcon name="send" className="h-5 w-5" />
            Email
          </a>
          <a
            href={`tel:${customerPhone}`}
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            <AtlasIcon name="phone" className="h-5 w-5" />
            Call
          </a>
          <button
            onClick={() => setReportModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            <AtlasIcon name="alert" className="h-5 w-5" />
            Report
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-sm text-neutral-500">Total Orders</p>
          <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {totalOrders}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-sm text-neutral-500">Total Spent</p>
          <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            GH₵ {totalSpent.toFixed(2)}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-sm text-neutral-500">Last Activity</p>
          <p className="mt-1 text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {lastActivity}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-sm text-neutral-500">Status</p>
          <span className={cn(
            "mt-1 inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1",
            customerStatus === "Active"
              ? "bg-success-50 text-success-700 ring-success-200 dark:bg-success-900/30 dark:text-success-200 dark:ring-success-800"
              : "bg-neutral-100 text-neutral-600 ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:ring-neutral-700"
          )}>
            {customerStatus}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Orders */}
        <div className="lg:col-span-2 rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <div className="border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Orders</h2>
          </div>
          <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {allOrders.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-neutral-500">No orders yet.</p>
            ) : (
              allOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between px-5 py-4">
                  <div>
                    <Link href={`/merchant/orders/${order.id}`} className="text-sm font-medium text-brand-600 hover:text-brand-700">
                      {order.orderNumber}
                    </Link>
                    <p className="text-xs text-neutral-500">{order.date}</p>
                  </div>
                  <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    GH₵ {parseTotal(order.total).toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Transactions */}
        <div className="rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <div className="border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Transactions</h2>
          </div>
          <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {allTransactions.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-neutral-500">No transactions yet.</p>
            ) : (
              allTransactions.map((tx: any) => (
                <div key={tx.id} className="flex items-center justify-between px-5 py-4">
                  <div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{tx.description}</p>
                    <p className="text-xs text-neutral-500">{tx.date}</p>
                  </div>
                  <span className={cn("text-sm font-semibold", tx.amount > 0 ? "text-success-600" : "text-neutral-900 dark:text-neutral-100")}>
                    {tx.amount > 0 ? "+" : ""}GH₵ {Math.abs(tx.amount).toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Contact info */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Contact Information</h2>
        <div className="mt-4 space-y-2 text-sm">
          <p><span className="text-neutral-500">Phone:</span> {customerPhone}</p>
          <p><span className="text-neutral-500">Email:</span> {customerEmail}</p>
        </div>
      </div>

      {/* Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setReportModalOpen(false)} />
          <div className="relative z-10 w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-6 shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
            {reportSubmitted ? (
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success-100 text-success-600">
                  <AtlasIcon name="check" className="h-6 w-6" />
                </div>
                <p className="mt-4 font-semibold text-neutral-900 dark:text-neutral-100">Report submitted</p>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Report Customer</h3>
                <p className="mt-1 text-sm text-neutral-500">Report {customerName}</p>
                <textarea
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  rows={4}
                  placeholder="Reason..."
                  className="mt-4 w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm text-neutral-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                />
                <div className="mt-4 flex justify-end gap-3">
                  <button onClick={() => setReportModalOpen(false)} className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800">Cancel</button>
                  <button onClick={submitReport} disabled={!reportReason.trim()} className="rounded-lg bg-danger-600 px-4 py-2 text-sm font-semibold text-white hover:bg-danger-700 disabled:opacity-50">Submit Report</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}