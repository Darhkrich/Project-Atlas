"use client";

import { useState } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { RevenueSummaryCards } from "@/components/admin/revenue/revenue-summary-cards";
import { RevenueTrendChart } from "@/components/admin/revenue/revenue-trend-chart";
import {
  RevenueStreamBreakdown,
  TopServicesRevenue,
  PaymentMethodRevenueChart,
  NetworkRevenueChart,
  TopPerformersTable,
} from "@/components/admin/revenue/revenue-breakdown-charts";
import {
  MRRARRCard,
  ARPUByStreamCard,
  RevenueForecastCard,
  TopCustomersCard,
  RefundImpactCard,
  RegionRevenueCard,
  SourceRevenueCard,
  WeekdayRevenueCard,
  ProfitMarginCard,
  PaymentSuccessRateCard,
  LowMarginAlertsCard,
} from "@/components/admin/revenue/revenue-extra-metrics";
import { ExportMenu } from "@/components/admin/ui/export-menu";

type Range = "today" | "7d" | "30d" | "90d" | "12m";

export default function RevenuePage() {
  const [range, setRange] = useState<Range>("30d");

  // Mock KPIs with comparison percentages
  const summaryData = {
    totalRevenue: 1250450,
    todayRevenue: 45230,
    monthRevenue: 185000,
    yearRevenue: 1250450,
    avgDailyRevenue: 41681,
    comparison: {
      totalRevenue: 8.5,
      todayRevenue: 12.1,
      monthRevenue: 3.2,
      yearRevenue: 15.7,
      avgDailyRevenue: -1.4,
    },
  };

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    console.log(`Export revenue as ${format} for range ${range}`);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Revenue"
        description="Executive revenue command center across all Atlas streams."
        actions={<ExportMenu onExport={handleExport} />}
      />

      <RevenueSummaryCards
        data={summaryData}
        range={range}
        onRangeChange={setRange}
      />

      <RevenueTrendChart />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <RevenueStreamBreakdown />
        <TopServicesRevenue />
        <PaymentMethodRevenueChart />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <NetworkRevenueChart />
        <TopPerformersTable />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <MRRARRCard />
        <ARPUByStreamCard />
      </div>

      <RevenueForecastCard />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <TopCustomersCard />
        <RefundImpactCard />
        <RegionRevenueCard />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SourceRevenueCard />
        <WeekdayRevenueCard />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ProfitMarginCard />
        <PaymentSuccessRateCard />
      </div>

      <LowMarginAlertsCard />
    </div>
  );
}