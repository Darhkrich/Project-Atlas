"use client";

import { useState, useEffect } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent } from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { ExportMenu } from "@/components/admin/ui/export-menu";
import { mockEcommerceOrders } from "@/lib/admin/mock/ecommerce-orders";
import { EcommerceOrder } from "@/lib/admin/types/ecommerce-order";
import { formatCurrency } from "@/lib/admin/formatters";

const statusVariantMap = {
  pending: "warning",
  processing: "info",
  shipped: "info",
  delivered: "success",
  cancelled: "danger",
} as const;

const paymentVariantMap = {
  paid: "success",
  pending: "warning",
  refunded: "danger",
} as const;

export default function EcommerceOrdersPage() {
  const [orders, setOrders] = useState<EcommerceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<EcommerceOrder | null>(null);

  useEffect(() => {
    setTimeout(() => {
      setOrders(mockEcommerceOrders);
      setLoading(false);
    }, 500);
  }, []);

  const filtered = orders.filter(o => {
    if (search && !o.id.toLowerCase().includes(search.toLowerCase()) &&
        !o.customerName.toLowerCase().includes(search.toLowerCase()) &&
        !o.merchantName.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter && o.status !== statusFilter) return false;
    if (paymentFilter && o.paymentStatus !== paymentFilter) return false;
    return true;
  });

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    console.log(`Export orders as ${format}`);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="E-commerce Orders"
        description="View all merchant orders. Merchants manage their own order statuses."
        actions={<ExportMenu onExport={handleExport} />}
      />

      <div className="flex flex-wrap gap-2">
        <Input placeholder="Search orders..." className="max-w-xs" value={search} onChange={e => setSearch(e.target.value)} />
        <select className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm" value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)}>
          <option value="">All Payment Statuses</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(order => (
            <Card key={order.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-mono text-xs font-semibold">{order.id}</p>
                    <p className="text-sm font-medium">{order.merchantName}</p>
                    <p className="text-xs text-neutral-500">{order.customerName}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Badge variant={statusVariantMap[order.status]}>{order.status}</Badge>
                    <Badge variant={paymentVariantMap[order.paymentStatus]}>{order.paymentStatus}</Badge>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm text-neutral-500">{order.items.length} item(s)</span>
                  <span className="font-semibold">{formatCurrency(order.totalAmount)}</span>
                </div>
                <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => setSelectedOrder(order)}>View Details</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Order Detail Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedOrder(null)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl dark:bg-neutral-900 flex flex-col">
            <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
              <h2 className="text-lg font-semibold">Order {selectedOrder.id}</h2>
              <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(null)}>Close</Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div><p className="text-sm text-neutral-500">Merchant</p><p className="font-medium">{selectedOrder.merchantName}</p></div>
              <div><p className="text-sm text-neutral-500">Customer</p><p className="font-medium">{selectedOrder.customerName}</p></div>
              <div>
                <p className="text-sm text-neutral-500">Items</p>
                <table className="mt-1 w-full text-sm">
                  <thead><tr className="text-left text-xs text-neutral-500"><th>Item</th><th>Qty</th><th>Price</th></tr></thead>
                  <tbody>
                    {selectedOrder.items.map(item => (
                      <tr key={item.id} className="border-t border-neutral-100">
                        <td className="py-1">{item.productName}</td>
                        <td>{item.quantity}</td>
                        <td>{formatCurrency(item.totalPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-between"><span>Total</span><span className="font-semibold">{formatCurrency(selectedOrder.totalAmount)}</span></div>
              <div><p className="text-sm text-neutral-500">Payment Method</p><p className="capitalize">{selectedOrder.paymentMethod}</p></div>
              <div><p className="text-sm text-neutral-500">Payment Status</p><Badge variant={paymentVariantMap[selectedOrder.paymentStatus]}>{selectedOrder.paymentStatus}</Badge></div>
              <div><p className="text-sm text-neutral-500">Order Status</p><Badge variant={statusVariantMap[selectedOrder.status]}>{selectedOrder.status}</Badge></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}