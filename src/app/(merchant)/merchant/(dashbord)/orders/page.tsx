"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AtlasIcon } from "@/components/atlas/icons";
import { mockMerchantOrders } from "@/lib/mock-merchant-orders";
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

export default function MerchantOrdersPage() {
  const [orders] = useState(mockMerchantOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "All" || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

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
        <button className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800">
          Export Orders
        </button>
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
          <svg
            className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
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

      {/* Desktop table */}
      <div className="hidden lg:block overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <table className="w-full text-left">
          <thead className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950">
            <tr>
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Order
              </th>
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Customer
              </th>
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Date
              </th>
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Items
              </th>
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Total
              </th>
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Payment
              </th>
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Status
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-sm text-neutral-500">
                  No orders found.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-950/50">
                  <td className="px-5 py-4">
                    <Link
                      href={`/merchant/orders/${order.id}`}
                      className="text-sm font-medium text-brand-600 hover:text-brand-700"
                    >
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {order.customerName}
                    </p>
                    <p className="text-xs text-neutral-500">{order.customerEmail}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-neutral-500">{order.date}</td>
                  <td className="px-5 py-4 text-sm text-neutral-500">{order.items}</td>
                  <td className="px-5 py-4 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {order.total}
                  </td>
                  <td className="px-5 py-4 text-sm text-neutral-500">{order.paymentMethod}</td>
                  <td className="px-5 py-4">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/merchant/orders/${order.id}`}
                      className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800"
                      title="View order"
                    >
                      <AtlasIcon name="eye" className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="space-y-3 lg:hidden">
        {filteredOrders.length === 0 ? (
          <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900">
            No orders found.
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="flex items-start justify-between">
                <div>
                  <Link
                    href={`/merchant/orders/${order.id}`}
                    className="text-sm font-medium text-brand-600 hover:text-brand-700"
                  >
                    {order.orderNumber}
                  </Link>
                  <p className="text-xs text-neutral-500">{order.date}</p>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {order.customerName}
                  </p>
                  <p className="text-xs text-neutral-500">{order.customerEmail}</p>
                </div>
                <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  {order.total}
                </p>
              </div>
              <div className="mt-3 flex gap-2 border-t border-neutral-200 pt-3 dark:border-neutral-800">
                <Link
                  href={`/merchant/orders/${order.id}`}
                  className="flex-1 rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800 text-center"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  const statusClasses: Record<string, string> = {
    Paid: "bg-success-50 text-success-700 ring-success-200 dark:bg-success-900/30 dark:text-success-200 dark:ring-success-800",
    Pending: "bg-warning-50 text-warning-700 ring-warning-200 dark:bg-warning-900/30 dark:text-warning-200 dark:ring-warning-800",
    Processing: "bg-info-50 text-info-700 ring-info-200 dark:bg-info-900/30 dark:text-info-200 dark:ring-info-800",
    Shipped: "bg-info-50 text-info-700 ring-info-200 dark:bg-info-900/30 dark:text-info-200 dark:ring-info-800",
    Delivered: "bg-brand-50 text-brand-700 ring-brand-200 dark:bg-brand-900/30 dark:text-brand-200 dark:ring-brand-800",
    Failed: "bg-danger-50 text-danger-700 ring-danger-200 dark:bg-danger-900/30 dark:text-danger-200 dark:ring-danger-800",
    Refunded: "bg-neutral-100 text-neutral-600 ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:ring-neutral-700",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1",
        statusClasses[status] || statusClasses.Paid
      )}
    >
      {status}
    </span>
  );
}