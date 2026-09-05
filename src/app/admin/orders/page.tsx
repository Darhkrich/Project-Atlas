/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { OrdersWorkspaceNav, type OrdersView } from "@/components/admin/orders/orders-workspace-nav";
import { OrderKanbanBoard } from "@/components/admin/orders/orders-kanban-board";
import { OrderAnalytics } from "@/components/admin/orders/order-analytics";
import { OrderDetailDrawer } from "@/components/admin/orders/order-detail-drawer";
import { AdminDataTable } from "@/components/admin/ui/admin-data-table";
import { OrderFilters } from "@/components/admin/orders/orders-filters";
import { Button } from "@/components/admin/ui/button";
import { Badge } from "@/components/admin/ui/badge";
import { mockOrders } from "@/lib/admin/mock/orders";
import { formatCurrency } from "@/lib/admin/formatters";
import { Order } from "@/lib/admin/types/orders";

const statusVariantMap: Record<string, "success" | "warning" | "danger" | "info" | "neutral"> = {
  successful: "success",
  failed: "danger",
  cancelled: "neutral",
  refunded: "neutral",
};

const allColumns = [
  { key: "id", header: "Order ID", cell: (order: Order) => <span className="font-medium">{order.id}</span> },
  { key: "source", header: "Source", cell: (order: Order) => (
    <Badge variant={order.source === "reseller" ? "brand" : "info"}>
      {order.source === "reseller" ? "Reseller" : "Direct"}
    </Badge>
  ) },
  { key: "customer", header: "Customer", cell: (order: Order) => order.customer.name },
  { key: "service", header: "Service", cell: (order: Order) => order.service },
  { key: "network", header: "Network", cell: (order: Order) => order.network ?? "—" },
  { key: "amount", header: "Amount", cell: (order: Order) => formatCurrency(order.amount) },
  { key: "commission", header: "Commission", cell: (order: Order) => formatCurrency(order.commission) },
  { key: "payment", header: "Payment", cell: (order: Order) => order.paymentMethod },
  { key: "status", header: "Status", cell: (order: Order) => (
    <Badge variant={statusVariantMap[order.status]}>{order.status}</Badge>
  ) },
  { key: "created", header: "Created", cell: (order: Order) => new Date(order.createdAt).toLocaleDateString() },
  { key: "actions", header: "", cell: (order: Order) => (
    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}>View</Button>
  ) },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeView, setActiveView] = useState<OrdersView>("live");
  const [filters, setFilters] = useState<any>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(allColumns.map((col) => col.key));
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30);

  useEffect(() => {
    setTimeout(() => {
      setOrders(mockOrders);
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      setLoading(true);
      setTimeout(() => {
        setOrders(mockOrders);
        setLoading(false);
      }, 500);
    }, refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const liveOrders = orders.filter((o) => o.status === "pending" || o.status === "processing");
  const pendingOrders = orders.filter((o) => o.status === "pending");
  const processingOrders = orders.filter((o) => o.status === "processing");
  const todayFailedOrders = orders.filter((o) => {
    const today = new Date();
    const orderDate = new Date(o.createdAt);
    return (
      o.status === "failed" &&
      orderDate.getDate() === today.getDate() &&
      orderDate.getMonth() === today.getMonth() &&
      orderDate.getFullYear() === today.getFullYear()
    );
  });

  const historyOrders = orders.filter((o) =>
    ["successful", "failed", "cancelled", "refunded"].includes(o.status)
  );

  const filteredHistory = historyOrders.filter((order) => {
    if (filters.search && !order.id.toLowerCase().includes(filters.search.toLowerCase()) &&
        !order.customer.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.status && order.status !== filters.status) return false;
    if (filters.service && order.service !== filters.service) return false;
    if (filters.source && order.source !== filters.source) return false;
    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom);
      if (new Date(order.createdAt) < from) return false;
    }
    if (filters.dateTo) {
      const to = new Date(filters.dateTo);
      to.setHours(23, 59, 59, 999);
      if (new Date(order.createdAt) > to) return false;
    }
    return true;
  });

  const columns = allColumns.filter((col) => visibleColumns.includes(col.key));

  const exportOrders = (format: string) => {
    console.log(`Exporting ${format}`);
    setExportMenuOpen(false);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Orders"
        description="Operational workspace for order management."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => setAutoRefresh(!autoRefresh)}>
              Auto Refresh {autoRefresh ? "On" : "Off"}
            </Button>
            {autoRefresh && (
              <select
                className="h-8 rounded-md border border-neutral-300 px-2 text-xs"
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
              >
                <option value={30}>30s</option>
                <option value={60}>1m</option>
                <option value={300}>5m</option>
              </select>
            )}
          </>
        }
      />

      <div className="flex flex-col gap-6 lg:flex-row">
        <OrdersWorkspaceNav activeView={activeView} onChange={setActiveView} />

        <div className="flex-1 min-w-0">
          {activeView === "live" && (
            <OrderKanbanBoard
              pendingOrders={pendingOrders}
              processingOrders={processingOrders}
              failedOrders={todayFailedOrders}
              onOrderClick={setSelectedOrder}
            />
          )}

          {activeView === "history" && (
            <>
              <OrderFilters onApplyFilters={setFilters} onReset={() => setFilters({})} />

              {/* Toolbar */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-500">Rows per page:</span>
                  <select
                    className="h-8 rounded-md border border-neutral-300 bg-white px-2 text-xs dark:border-neutral-700 dark:bg-neutral-800"
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-500">Columns:</span>
                  {allColumns.filter(col => col.key !== "actions").map(col => (
                    <label key={col.key} className="flex items-center gap-1 text-xs">
                      <input
                        type="checkbox"
                        checked={visibleColumns.includes(col.key)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setVisibleColumns(prev => [...prev, col.key]);
                          } else {
                            setVisibleColumns(prev => prev.filter(k => k !== col.key));
                          }
                        }}
                        className="h-3 w-3"
                      />
                      {col.header}
                    </label>
                  ))}
                </div>

                <div className="relative">
                  <Button variant="outline" size="sm" onClick={() => setExportMenuOpen(!exportMenuOpen)}>
                    Export
                  </Button>
                  {exportMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md border border-neutral-200 bg-white shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
                      <ul className="py-1">
                        <li>
                          <button
                            className="block w-full px-4 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
                            onClick={() => exportOrders("csv")}
                          >
                            CSV
                          </button>
                        </li>
                        <li>
                          <button
                            className="block w-full px-4 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
                            onClick={() => exportOrders("excel")}
                          >
                            Excel
                          </button>
                        </li>
                        <li>
                          <button
                            className="block w-full px-4 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
                            onClick={() => exportOrders("pdf")}
                          >
                            PDF
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <AdminDataTable
                  columns={columns}
                  data={filteredHistory}
                  isLoading={loading}
                  rowKey={(order) => order.id}
                  onRowClick={(order) => setSelectedOrder(order)}
                  pageSize={pageSize}
                  currentPage={page}
                  onPageChange={setPage}
                  emptyMessage="No orders found."
                />
              </div>
            </>
          )}

          {activeView === "analytics" && <OrderAnalytics />}
        </div>
      </div>

      <OrderDetailDrawer order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  );
}


