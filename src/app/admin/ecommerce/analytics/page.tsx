"use client";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from "recharts";
import { formatCurrency } from "@/lib/admin/formatters";

const salesSummary = [
  { month: "Jan", sales: 22000 },
  { month: "Feb", sales: 28000 },
  { month: "Mar", sales: 31000 },
  { month: "Apr", sales: 29000 },
  { month: "May", sales: 35000 },
  { month: "Jun", sales: 38000 },
  { month: "Jul", sales: 40000 },
  { month: "Aug", sales: 42000 },
];

const merchantPerformance = [
  { name: "TechHub Store", revenue: 45000, orders: 350 },
  { name: "FashionPlus", revenue: 38000, orders: 280 },
  { name: "HomeEssentials", revenue: 32000, orders: 220 },
  { name: "GadgetWorld", revenue: 28000, orders: 190 },
  { name: "BeautyCorner", revenue: 22000, orders: 150 },
];

const planRevenue = [
  { name: "Starter", value: 4000 },
  { name: "Growth", value: 6000 },
  { name: "Pro", value: 8000 },
  { name: "Premium", value: 12000 },
];

const COLORS = ["#166e59", "#3b82f6", "#f59e0b", "#8b5cf6"];

export default function EcommerceAnalyticsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="E-commerce Analytics"
        description="Sales, revenue, and merchant performance reports."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Sales Summary */}
        <Card>
          <CardHeader><CardTitle>Sales Summary</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesSummary}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-neutral-200 dark:text-neutral-700" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Line type="monotone" dataKey="sales" stroke="#166e59" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Merchant Performance */}
        <Card>
          <CardHeader><CardTitle>Merchant Performance</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={merchantPerformance} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-neutral-200 dark:text-neutral-700" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={100} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="revenue" fill="#166e59" radius={[0,4,4,0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Plan Revenue */}
        <Card>
          <CardHeader><CardTitle>Plan Revenue</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={planRevenue} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2}>
                  {planRevenue.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Products Placeholder */}
        <Card>
          <CardHeader><CardTitle>Top Products (Mock)</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex justify-between"><span>Wireless Earbuds</span><span>120 sold</span></li>
              <li className="flex justify-between"><span>Smart Watch</span><span>95 sold</span></li>
              <li className="flex justify-between"><span>Bluetooth Speaker</span><span>80 sold</span></li>
              <li className="flex justify-between"><span>Laptop Stand</span><span>60 sold</span></li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}