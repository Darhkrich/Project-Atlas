"use client";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from "recharts";
import { formatCurrency } from "@/lib/admin/formatters";

const revenueByReseller = [
  { name: "Kwame Store", revenue: 45000 },
  { name: "Adjoa Ventures", revenue: 38000 },
  { name: "Yaw Enterprises", revenue: 32000 },
  { name: "Efua Trading", revenue: 28000 },
  { name: "Kojo & Sons", revenue: 20000 },
];

const commissionTrend = [
  { month: "Jan", commissions: 1200 },
  { month: "Feb", commissions: 1800 },
  { month: "Mar", commissions: 2200 },
  { month: "Apr", commissions: 2100 },
  { month: "May", commissions: 2600 },
  { month: "Jun", commissions: 3000 },
];

const serviceDistribution = [
  { name: "Data", value: 45 },
  { name: "Airtime", value: 30 },
  { name: "Bills", value: 15 },
  { name: "TV", value: 7 },
  { name: "Results", value: 3 },
];

const COLORS = ["#166e59", "#3b82f6", "#f59e0b", "#22c55e", "#8b5cf6"];

export default function ResellerAnalyticsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Reseller Analytics"
        description="Performance and revenue insights across the reseller channel."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue by Reseller */}
        <Card>
          <CardHeader><CardTitle>Revenue by Reseller</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueByReseller} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-neutral-200 dark:text-neutral-700" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={100} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="revenue" fill="#166e59" radius={[0,4,4,0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Commission Trend */}
        <Card>
          <CardHeader><CardTitle>Commission Trend</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={commissionTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-neutral-200 dark:text-neutral-700" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Line type="monotone" dataKey="commissions" stroke="#166e59" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Service Distribution */}
        <Card>
          <CardHeader><CardTitle>Service Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={serviceDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2}>
                  {serviceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Resellers Table */}
        <Card>
          <CardHeader><CardTitle>Top Resellers</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-neutral-500">
                  <th className="py-1">Reseller</th>
                  <th>Revenue</th>
                  <th>Commissions</th>
                </tr>
              </thead>
              <tbody>
                {revenueByReseller.map(r => (
                  <tr key={r.name} className="border-t border-neutral-100">
                    <td className="py-2">{r.name}</td>
                    <td>{formatCurrency(r.revenue)}</td>
                    <td className="text-success-600">{formatCurrency(r.revenue * 0.05)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}