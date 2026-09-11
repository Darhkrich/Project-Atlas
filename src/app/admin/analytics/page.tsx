"use client";

import { useState } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AnalyticsSummaryCards } from "@/components/admin/analytics/analytics-summary-cards";
import { AnalyticsCharts } from "@/components/admin/analytics/analytics-charts";
import { ExportMenu } from "@/components/admin/ui/export-menu";
import { mockAnalyticsSummary } from "@/lib/admin/mock/analytics";

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("30d");
  const [segment, setSegment] = useState("all");

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    console.log(`Export analytics as ${format} for range ${dateRange}, segment ${segment}`);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Analytics"
        description="Cross-platform performance metrics and insights."
        actions={<ExportMenu onExport={handleExport} />}
      />

      {/* Filters: Date Range & Segment */}
      <div className="flex flex-wrap items-center gap-2">
        <select
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          value={dateRange}
          onChange={e => setDateRange(e.target.value)}
        >
          <option value="today">Today</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="12m">Last 12 months</option>
          <option value="custom">Custom</option>
        </select>

        <select
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          value={segment}
          onChange={e => setSegment(e.target.value)}
        >
          <option value="all">All Users</option>
          <option value="customers">Customers</option>
          <option value="resellers">Resellers</option>
          <option value="merchants">Merchants</option>
        </select>
      </div>

      <AnalyticsSummaryCards data={mockAnalyticsSummary} />
      <AnalyticsCharts dateRange={dateRange} segment={segment} />
    </div>
  );
}