/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AtlasIcon } from "@/components/atlas/icons";
import { getMockMerchantOrders, MerchantOrder } from "@/lib/mock-merchant-orders";
import { useStorefrontConfig } from "@/contexts/storefront-config-context";
import { useOrders } from "@/contexts/orders-context";
import { cn } from "@/lib/utils";

const statusOptions = [
  "All",
  "Paid",
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Failed",
  "Refunded",
];

function parseTotal(total: string | number): number {
  if (typeof total === "number") return total;
  const numericString = total.replace(/[^0-9.]/g, "");
  return parseFloat(numericString) || 0;
}

export default function MerchantOrdersPage() {
  const { storefrontConfig } = useStorefrontConfig();
  const { orders: realOrders, updateOrderPaymentStatus } = useOrders();
  const storeSlug = storefrontConfig.slug;

  const mockOrders = useMemo(() => getMockMerchantOrders(storeSlug), [storeSlug]);

  const allOrders = useMemo(() => {
    const convertedRealOrders: MerchantOrder[] = realOrders
      .filter((order) => order.storeSlug === storeSlug)
      .map((order) => ({
        id: order.id,
        storeSlug: order.storeSlug,
        orderNumber: order.orderNumber,
        customerName: order.customerEmail,
        customerEmail: order.customerEmail,
        date: order.date,
        total: `GH₵ ${order.total.toFixed(2)}`,
        items: order.items.reduce((sum, item) => sum + item.quantity, 0),
        status: order.status as MerchantOrder["status"],
        paymentMethod: order.paymentMethod || "Mobile Money",
        paymentStatus: order.paymentStatus || "Paid",
        itemsDetail: order.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.image,
        })),
        updatedAt: order.updatedAt,
      }));

    const combined = [...convertedRealOrders, ...mockOrders];
    return combined.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  }, [realOrders, mockOrders, storeSlug]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [refundTarget, setRefundTarget] = useState<MerchantOrder | null>(null);
  const [refundReason, setRefundReason] = useState("");
  const [refundSubmitted, setRefundSubmitted] = useState(false);

  // New Orders: status "New"
  const newOrders = useMemo(() => {
    return allOrders.filter((order) => {
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
      return order.status === "New" && matchesSearch;
    });
  }, [allOrders, searchTerm]);

  // Updated Orders: status != "New"
  const updatedOrders = useMemo(() => {
    return allOrders.filter((order) => {
      if (order.status === "New") return false;
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "All" || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [allOrders, searchTerm, statusFilter]);

  const openRefundModal = (order: MerchantOrder) => {
    setRefundTarget(order);
    setRefundReason("");
    setRefundSubmitted(false);
  };

  const handleRefundConfirm = () => {
    if (!refundTarget) return;
    setRefundSubmitted(true);
    setTimeout(() => setRefundTarget(null), 1500);
  };

  const handleMarkAsPaid = (orderId: string) => {
    const realOrder = realOrders.find((o) => o.id === orderId);
    if (realOrder) {
      updateOrderPaymentStatus(orderId, "Paid");
    }
  };

  const totalOrders = allOrders.length;
  const newOrdersCount = newOrders.length;
  const revenue = allOrders.reduce((sum, order) => sum + parseTotal(order.total), 0);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
            Orders
          </h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Track and manage customer orders.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800">
          <AtlasIcon name="download" className="h-5 w-5" />
          Export Orders
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-xs text-neutral-500">Total Orders</p>
          <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-neutral-100">{totalOrders}</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-xs text-neutral-500">New Orders</p>
          <p className="mt-1 text-2xl font-bold text-warning-600">{newOrdersCount}</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-xs text-neutral-500">Total Revenue</p>
          <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-neutral-100">GH₵ {revenue.toFixed(2)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search orders..."
            className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 pl-10 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder-neutral-500"
          />
          <AtlasIcon name="search" className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
        >
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status === "All" ? "All Statuses" : status}
            </option>
          ))}
        </select>
      </div>

      {/* Two equal cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* New Orders Card */}
        <div className="rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <div className="border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">New Orders</h2>
            <p className="text-xs text-neutral-500">Recently received, awaiting action</p>
          </div>
          {/* Scrollable container with hidden scrollbar */}
          <div className="divide-y divide-neutral-200 dark:divide-neutral-800 max-h-[500px] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {newOrders.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-neutral-500">No new orders.</p>
            ) : (
              newOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <Link href={`/merchant/orders/${order.id}`} className="text-sm font-medium text-brand-600 hover:text-brand-700">
                      {order.orderNumber}
                    </Link>
                    <p className="text-xs text-neutral-500">{order.customerEmail} · {order.date}</p>
                  </div>
                  <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{order.total}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Updated Orders Card */}
        <div className="rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <div className="border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Updated Orders</h2>
            <p className="text-xs text-neutral-500">Orders with changed status</p>
          </div>
          {/* Scrollable container with hidden scrollbar */}
          <div className="divide-y divide-neutral-200 dark:divide-neutral-800 max-h-[500px] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {updatedOrders.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-neutral-500">No updated orders.</p>
            ) : (
              updatedOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <Link href={`/merchant/orders/${order.id}`} className="text-sm font-medium text-brand-600 hover:text-brand-700">
                      {order.orderNumber}
                    </Link>
                    <p className="text-xs text-neutral-500">{order.customerEmail} · {order.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{order.total}</span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Refund Modal */}
      {refundTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setRefundTarget(null)} />
          <div className="relative z-10 w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-6 shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
            {refundSubmitted ? (
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success-100 text-success-600">
                  <AtlasIcon name="check" className="h-6 w-6" />
                </div>
                <p className="mt-4 font-semibold text-neutral-900 dark:text-neutral-100">Refund initiated</p>
                <p className="text-sm text-neutral-500">The order has been marked as refunded.</p>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Refund Order</h3>
                <p className="mt-1 text-sm text-neutral-500">
                  You are about to refund {refundTarget.orderNumber} ({refundTarget.total}).
                </p>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  rows={3}
                  placeholder="Reason for refund (optional)"
                  className="mt-4 w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm text-neutral-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                />
                <div className="mt-4 flex justify-end gap-3">
                  <button onClick={() => setRefundTarget(null)} className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800">Cancel</button>
                  <button onClick={handleRefundConfirm} className="rounded-lg bg-danger-600 px-4 py-2 text-sm font-semibold text-white hover:bg-danger-700">Confirm Refund</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  const statusClasses: Record<string, string> = {
    New: "bg-warning-50 text-warning-700 ring-warning-200 dark:bg-warning-900/30 dark:text-warning-200 dark:ring-warning-800",
    Paid: "bg-success-50 text-success-700 ring-success-200 dark:bg-success-900/30 dark:text-success-200 dark:ring-success-800",
    Pending: "bg-warning-50 text-warning-700 ring-warning-200 dark:bg-warning-900/30 dark:text-warning-200 dark:ring-warning-800",
    Processing: "bg-info-50 text-info-700 ring-info-200 dark:bg-info-900/30 dark:text-info-200 dark:ring-info-800",
    Shipped: "bg-info-50 text-info-700 ring-info-200 dark:bg-info-900/30 dark:text-info-200 dark:ring-info-800",
    Delivered: "bg-brand-50 text-brand-700 ring-brand-200 dark:bg-brand-900/30 dark:text-brand-200 dark:ring-brand-800",
    Failed: "bg-danger-50 text-danger-700 ring-danger-200 dark:bg-danger-900/30 dark:text-danger-200 dark:ring-danger-800",
    Refunded: "bg-neutral-100 text-neutral-600 ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:ring-neutral-700",
  };

  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1", statusClasses[status] || statusClasses.Paid)}>
      {status}
    </span>
  );
}