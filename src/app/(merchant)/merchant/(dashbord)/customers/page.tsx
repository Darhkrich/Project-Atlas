/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AtlasIcon } from "@/components/atlas/icons";
import {
  getMockMerchantCustomers,
} from "@/lib/mock-merchant-customers";
import { getMockMerchantOrders } from "@/lib/mock-merchant-orders";
import { useStorefrontConfig } from "@/contexts/storefront-config-context";
import { useStoreCustomers } from "@/contexts/store-customers-context";
import { useOrders } from "@/contexts/orders-context";
import { cn } from "@/lib/utils";

const statusOptions = ["All", "Active", "Inactive"];

// Helper to extract numeric value from total (string or number)
function parseTotal(total: string | number): number {
  if (typeof total === "number") return total;
  const numericString = total.replace(/[^0-9.]/g, "");
  return parseFloat(numericString) || 0;
}

export default function MerchantCustomersPage() {
  const { storefrontConfig } = useStorefrontConfig();
  const { getCustomersForStore } = useStoreCustomers();
  const { orders: realOrders } = useOrders();
  const storeSlug = storefrontConfig.slug;

  // Base customers: real registered + mock, deduped by email
  const baseCustomers = useMemo(() => {
    const map = new Map<string, any>();

    // Add real customers
    getCustomersForStore(storeSlug).forEach((c) => {
      map.set(c.email, {
        id: c.id,
        storeSlug: c.storeSlug,
        name: c.name,
        email: c.email,
        phone: c.phone,
        status: c.status,
      });
    });

    // Add mock customers
    getMockMerchantCustomers(storeSlug).forEach((c) => {
      if (!map.has(c.email)) {
        map.set(c.email, {
          id: c.id,
          storeSlug: c.storeSlug,
          name: c.name,
          email: c.email,
          phone: c.phone,
          status: c.status,
        });
      }
    });

    // Add order-derived customers for any emails not already present
    realOrders
      .filter((order) => order.storeSlug === storeSlug)
      .forEach((order) => {
        if (!map.has(order.customerEmail)) {
          map.set(order.customerEmail, {
            id: `order-${order.customerEmail}`,
            storeSlug: storeSlug,
            name: order.customerEmail.split("@")[0] || "Customer",
            email: order.customerEmail,
            phone: "N/A",
            status: "Active",
          });
        }
      });

    return Array.from(map.values());
  }, [getCustomersForStore, storeSlug, realOrders]);

  // Combine real and mock orders for current store
  const allOrders = useMemo(() => {
    const mockOrders = getMockMerchantOrders(storeSlug);
    return [...realOrders, ...mockOrders];
  }, [realOrders, storeSlug]);

  // Compute enriched customers with orders count and total spent
  const enrichedCustomers = useMemo(() => {
    return baseCustomers.map((customer) => {
      const customerOrders = allOrders.filter(
        (order) => order.storeSlug === storeSlug && order.customerEmail === customer.email
      );

      const totalOrders = customerOrders.length;
      const totalSpent = customerOrders.reduce(
        (sum, order) => sum + parseTotal(order.total),
        0
      );
      const lastActivity = customerOrders.length
        ? customerOrders.reduce((latest, order) =>
            new Date(order.date) > new Date(latest.date) ? order : latest
          ).date
        : customer.status === "Active"
        ? "—"
        : "No activity";

      return {
        ...customer,
        totalOrders,
        totalSpent: `GH₵ ${totalSpent.toFixed(2)}`,
        lastActivity,
      };
    });
  }, [baseCustomers, allOrders, storeSlug]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [reportTarget, setReportTarget] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const filteredCustomers = useMemo(() => {
    return enrichedCustomers.filter((customer) => {
      const matchesSearch =
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "All" || customer.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [enrichedCustomers, searchTerm, statusFilter]);

  const openReportModal = (customerId: string) => {
    setReportTarget(customerId);
    setReportReason("");
    setReportSubmitted(false);
  };

  const submitReport = () => {
    console.log(`Reported customer ${reportTarget} for: ${reportReason}`);
    setReportSubmitted(true);
    setTimeout(() => setReportTarget(null), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
            Customers
          </h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Manage and view your store&apos;s customers.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800">
          <AtlasIcon name="download" className="h-5 w-5" />
          Export Customers
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search customers..."
            className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 pl-10 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder-neutral-500"
          />
          <AtlasIcon
            name="search"
            className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400"
          />
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
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">Customer</th>
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">Phone</th>
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">Orders</th>
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">Total Spent</th>
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">Last Activity</th>
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">Status</th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-neutral-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-sm text-neutral-500">
                  No customers found.
                </td>
              </tr>
            ) : (
              filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-950/50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700 dark:bg-brand-900/30 dark:text-brand-200">
                        {customer.name.split(" ").map((n: any[]) => n[0]).slice(0, 2).join("").toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{customer.name}</p>
                        <p className="text-xs text-neutral-500">{customer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-neutral-500">{customer.phone}</td>
                  <td className="px-5 py-4 text-sm text-neutral-700 dark:text-neutral-300">{customer.totalOrders}</td>
                  <td className="px-5 py-4 text-sm font-medium text-neutral-900 dark:text-neutral-100">{customer.totalSpent}</td>
                  <td className="px-5 py-4 text-sm text-neutral-500">{customer.lastActivity}</td>
                  <td className="px-5 py-4">
                    <span className={cn(
                      "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1",
                      customer.status === "Active"
                        ? "bg-success-50 text-success-700 ring-success-200 dark:bg-success-900/30 dark:text-success-200 dark:ring-success-800"
                        : "bg-neutral-100 text-neutral-600 ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:ring-neutral-700"
                    )}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/merchant/customers/${customer.id}`} className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800" title="View customer">
                        <AtlasIcon name="eye" className="h-4 w-4" />
                      </Link>
                      <a href={`mailto:${customer.email}`} className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800" title="Email customer">
                        <AtlasIcon name="send" className="h-4 w-4" />
                      </a>
                      <a href={`tel:${customer.phone}`} className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800" title="Call customer">
                        <AtlasIcon name="phone" className="h-4 w-4" />
                      </a>
                      <button onClick={() => openReportModal(customer.id)} className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800" title="Report customer">
                        <AtlasIcon name="alert" className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="space-y-3 lg:hidden">
        {filteredCustomers.length === 0 ? (
          <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900">
            No customers found.
          </div>
        ) : (
          filteredCustomers.map((customer) => (
            <div key={customer.id} className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700 dark:bg-brand-900/30 dark:text-brand-200">
                    {customer.name.split(" ").map((n: any[]) => n[0]).slice(0, 2).join("").toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{customer.name}</p>
                    <p className="text-xs text-neutral-500">{customer.email}</p>
                  </div>
                </div>
                <span className={cn(
                  "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1",
                  customer.status === "Active"
                    ? "bg-success-50 text-success-700 ring-success-200 dark:bg-success-900/30 dark:text-success-200 dark:ring-success-800"
                    : "bg-neutral-100 text-neutral-600 ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:ring-neutral-700"
                )}>
                  {customer.status}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{customer.totalSpent}</p>
                  <p className="text-xs text-neutral-500">{customer.totalOrders} orders</p>
                </div>
                <p className="text-xs text-neutral-500">{customer.lastActivity}</p>
              </div>
              <div className="mt-3 flex gap-2 border-t border-neutral-200 pt-3 dark:border-neutral-800">
                <Link href={`/merchant/customers/${customer.id}`} className="flex-1 rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800 text-center">View</Link>
                <a href={`mailto:${customer.email}`} className="flex-1 rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800 text-center">Email</a>
                <a href={`tel:${customer.phone}`} className="flex-1 rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800 text-center">Call</a>
                <button onClick={() => openReportModal(customer.id)} className="flex-1 rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800">Report</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Report Customer Modal */}
      {reportTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setReportTarget(null)} />
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
                <p className="mt-1 text-sm text-neutral-500">Please provide a reason for reporting this customer.</p>
                <textarea
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  rows={4}
                  placeholder="Reason..."
                  className="mt-4 w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm text-neutral-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                />
                <div className="mt-4 flex justify-end gap-3">
                  <button onClick={() => setReportTarget(null)} className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800">Cancel</button>
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