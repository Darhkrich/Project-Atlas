"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { AdminDataTable, type Column } from "@/components/admin/ui/admin-data-table";
import { mockPlatformMargins } from "@/lib/admin/mock/commissions";
import { PlatformMargin } from "@/lib/admin/types/commission";
import { formatCurrency } from "@/lib/admin/formatters";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const trendData = [
  { date: "Mon", margin: 500 },
  { date: "Tue", margin: 650 },
  { date: "Wed", margin: 580 },
  { date: "Thu", margin: 700 },
  { date: "Fri", margin: 800 },
  { date: "Sat", margin: 620 },
  { date: "Sun", margin: 750 },
];

const columns: Column<PlatformMargin>[] = [
  { key: "id", header: "Margin ID", cell: (m) => <span className="font-mono text-xs">{m.id}</span> },
  { key: "orderId", header: "Order ID", cell: (m) => m.orderId },
  { key: "service", header: "Service", cell: (m) => m.service },
  { key: "providerCost", header: "Provider Cost", cell: (m) => formatCurrency(m.providerCost) },
  { key: "atlasPrice", header: "Atlas Price", cell: (m) => formatCurrency(m.atlasPrice) },
  { key: "margin", header: "Margin", cell: (m) => <span className="font-semibold">{formatCurrency(m.margin)}</span> },
  { key: "marginPercent", header: "Margin %", cell: (m) => `${m.marginPercentage}%` },
  { key: "date", header: "Date", cell: (m) => new Date(m.date).toLocaleDateString() },
];

export function PlatformMarginView() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Margin Trend (7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="marginGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#166e59" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#166e59" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-neutral-200 dark:text-neutral-700" />
              <XAxis dataKey="date" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Area type="monotone" dataKey="margin" stroke="#166e59" fill="url(#marginGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <AdminDataTable
        columns={columns}
        data={mockPlatformMargins}
        isLoading={false}
        rowKey={(m) => m.id}
        pageSize={10}
        currentPage={1}
        onPageChange={() => {}}
        emptyMessage="No margins found."
      />
    </div>
  );
}