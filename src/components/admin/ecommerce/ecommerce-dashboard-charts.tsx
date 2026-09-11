"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from "recharts";
import {
  mockEcommerceRevenueTrend,
  mockPlanDistribution,
  mockTopMerchants,
} from "@/lib/admin/mock/ecommerce-dashboard";
import { formatCurrency } from "@/lib/admin/formatters";

const COLORS = ["#166e59", "#3b82f6", "#f59e0b", "#8b5cf6"];

export function EcommerceDashboardCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Revenue Trend */}
      <Card>
        <CardHeader><CardTitle>Revenue & Orders Trend</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={mockEcommerceRevenueTrend}>
              <defs>
                <linearGradient id="ecomRevGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#166e59" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#166e59" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-neutral-200 dark:text-neutral-700" />
              <XAxis dataKey="date" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Area type="monotone" dataKey="revenue" stroke="#166e59" fill="url(#ecomRevGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Plan Distribution */}
      <Card>
        <CardHeader><CardTitle>Subscription Plan Distribution</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={mockPlanDistribution} dataKey="count" nameKey="plan" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2}>
                {mockPlanDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Merchants */}
      <Card className="lg:col-span-2">
        <CardHeader><CardTitle>Top Merchants by Sales</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={mockTopMerchants} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-neutral-200 dark:text-neutral-700" />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={100} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Bar dataKey="sales" fill="#166e59" radius={[0,4,4,0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}