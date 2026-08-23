/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useState } from "react";
import { AtlasCard } from "@/components/atlas/card";
import { AtlasSkeleton } from "@/components/atlas/skeleton";
import { AtlasErrorState } from "@/components/atlas/error-state";
import { AtlasEmptyState } from "@/components/atlas/empty-state";
import { AtlasBadge } from "@/components/atlas/badge";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { Button } from "@/components/atlas/button";
import { mockOrders, type MockOrder } from "@/lib/mock-data";

const filters: { id: string; label: string; status?: MockOrder["status"] }[] = [
  { id: "all", label: "All Orders" },
  { id: "fulfilled", label: "Fulfilled", status: "Fulfilled" },
  { id: "processing", label: "Processing", status: "Processing" },
  { id: "pending", label: "Pending", status: "Pending" },
  { id: "failed", label: "Failed", status: "Failed" },
];

export function OrdersList() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [orders, setOrders] = useState<MockOrder[]>([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<MockOrder | null>(null);

  const loadData = () => {
    setLoading(true);
    setError(false);
    setTimeout(() => {
      setOrders(mockOrders);
      setLoading(false);
    }, 800);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const filter = filters.find((f) => f.id === activeFilter);
      const statusMatch = !filter?.status || order.status === filter.status;
      const searchMatch =
        !searchQuery.trim() ||
        order.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.recipient.toLowerCase().includes(searchQuery.toLowerCase());
      return statusMatch && searchMatch;
    });
  }, [orders, activeFilter, searchQuery]);

  if (loading) {
    return (
      <div className="space-y-6">
        <AtlasSkeleton className="h-12 w-full" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <AtlasSkeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <AtlasErrorState onRetry={loadData} />;
  }

  return (
    <div className="space-y-6">
      {/* Filters & Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeFilter === filter.id
                  ? "bg-brand-800 text-white"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:max-w-xs">
          <AtlasIcon
            name="search"
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search orders..."
            className="w-full rounded-full border border-neutral-200 bg-white py-2 pl-10 pr-4 text-sm text-neutral-900 placeholder-neutral-500 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder-neutral-400"
          />
        </div>
      </div>

      {/* Orders List */}
      <AtlasCard padding="none">
        {filteredOrders.length > 0 ? (
          <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {filteredOrders.map((order) => (
              <li key={order.id}>
                <button
                  onClick={() => setSelectedOrder(order)}
                  className="flex w-full flex-col gap-3 p-4 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    {order.image ? (
                      <img
                        src={order.image}
                        alt={order.service}
                        className="h-10 w-10 rounded-lg object-contain bg-white p-0.5"
                      />
                    ) : (
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${order.iconBg}`}
                      >
                        <AtlasIcon
                          name={order.icon || "grid"}
                          className="h-5 w-5 text-neutral-700 dark:text-neutral-200"
                        />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        {order.service}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {order.orderNumber} • {order.category} • {order.plan}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        {order.total}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {order.date}
                      </p>
                    </div>
                    <AtlasBadge variant={order.statusVariant}>{order.status}</AtlasBadge>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <AtlasEmptyState
            title="No orders found"
            description="Your service orders will appear here."
          />
        )}
      </AtlasCard>

      {/* Enhanced Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
          <div
            className="absolute inset-0 bg-neutral-950/50 dark:bg-black/60"
            onClick={() => setSelectedOrder(null)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-lg rounded-t-xl bg-white shadow-xl dark:bg-neutral-900 sm:rounded-xl">
            <div className="flex items-center justify-between border-b border-neutral-200 p-4 dark:border-neutral-800">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Order Details
              </h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-md p-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                aria-label="Close"
              >
                <AtlasIcon name="x-circle" className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <div className="rounded-lg bg-neutral-50 p-4 dark:bg-neutral-800">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">Order Number</span>
                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{selectedOrder.orderNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">Service</span>
                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{selectedOrder.service}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">Category</span>
                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{selectedOrder.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">Plan/Package</span>
                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{selectedOrder.plan}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">{selectedOrder.recipientLabel}</span>
                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{selectedOrder.recipient}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">Payment Method</span>
                    <span className="flex items-center gap-1 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      <AtlasIcon name={selectedOrder.paymentIcon} className="h-4 w-4" />
                      {selectedOrder.paymentMethod}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">Transaction ID</span>
                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{selectedOrder.transactionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">Amount</span>
                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{selectedOrder.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">Fee</span>
                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{selectedOrder.fee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Total</span>
                    <span className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{selectedOrder.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">Date</span>
                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{selectedOrder.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">Status</span>
                    <AtlasBadge variant={selectedOrder.statusVariant}>{selectedOrder.status}</AtlasBadge>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="mt-4">
                <h4 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  Order Timeline
                </h4>
                <div className="space-y-3">
                  {selectedOrder.timeline.map((step, index) => (
                    <div key={step.title} className="flex items-start gap-3">
                      <div
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                          step.done
                            ? "bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-300"
                            : "bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500"
                        }`}
                      >
                        <AtlasIcon name={step.done ? "check" : "clock"} className="h-3 w-3" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          {step.title}
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          {step.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <Button className="w-full" onClick={() => setSelectedOrder(null)}>
                  Done
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}