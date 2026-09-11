"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend, LineChart, Line,
  FunnelChart, Funnel, LabelList, ScatterChart, Scatter, ZAxis, XAxis as XAxis2, YAxis as YAxis2,
} from "recharts";
import {
  mockRevenueTrend,
  mockOrderVolume,
  mockUserGrowth,
  mockServiceDistribution,
  mockFunnelData,
  mockHeatmapData,
  mockCohortData,
} from "@/lib/admin/mock/analytics";
import { formatCurrency } from "@/lib/admin/formatters";

const COLORS = ["#166e59", "#3b82f6", "#f59e0b", "#8b5cf6", "#f43f5e"];

export function AnalyticsCharts({ dateRange, segment }: { dateRange: string; segment: string }) {
  // In mock, we ignore filters but can later filter data based on them
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Revenue Trend */}
      <Card>
        <CardHeader><CardTitle>Revenue Over Time</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={mockRevenueTrend}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#166e59" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#166e59" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-neutral-200 dark:text-neutral-700" />
              <XAxis dataKey="date" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Area type="monotone" dataKey="revenue" stroke="#166e59" fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Order Volume */}
      <Card>
        <CardHeader><CardTitle>Order Volume</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={mockOrderVolume}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-neutral-200 dark:text-neutral-700" />
              <XAxis dataKey="date" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="orders" fill="#166e59" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* User Growth */}
      <Card>
        <CardHeader><CardTitle>User Growth</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={mockUserGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-neutral-200 dark:text-neutral-700" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="users" stroke="#166e59" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Service Distribution */}
      <Card>
        <CardHeader><CardTitle>Service Distribution</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={mockServiceDistribution} dataKey="count" nameKey="service" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2}>
                {mockServiceDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Funnel */}
      <Card>
        <CardHeader><CardTitle>Conversion Funnel</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <FunnelChart>
              <Funnel dataKey="value" data={mockFunnelData} isAnimationActive>
                <LabelList position="right" fill="#000" stroke="none" dataKey="stage" />
              </Funnel>
              <Tooltip />
            </FunnelChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Heatmap */}
      <Card>
        <CardHeader><CardTitle>Order Heatmap (Hour vs Day)</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <XAxis2 dataKey="hour" type="category" name="Hour" />
              <YAxis2 dataKey="day" type="category" name="Day" />
              <ZAxis dataKey="value" range={[50, 400]} name="Orders" />
              <Scatter data={mockHeatmapData} fill="#166e59" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Cohort Retention */}
      <Card className="lg:col-span-2">
        <CardHeader><CardTitle>Cohort Retention</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockCohortData}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-neutral-200 dark:text-neutral-700" />
              <XAxis dataKey="cohort" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="month0" stackId="a" fill="#166e59" name="Month 0" />
              <Bar dataKey="month1" stackId="a" fill="#3b82f6" name="Month 1" />
              <Bar dataKey="month2" stackId="a" fill="#f59e0b" name="Month 2" />
              <Bar dataKey="month3" stackId="a" fill="#8b5cf6" name="Month 3" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}