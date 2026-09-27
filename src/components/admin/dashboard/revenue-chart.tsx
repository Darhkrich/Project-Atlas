"use client";

import { TrendPanel } from "./trend-panel";
import type { DashboardSlices } from "@/lib/admin/dashboard/dashboard-slices";

export function RevenueChart({
  slices,
}: {
  slices: DashboardSlices;
}) {
  return (
    <TrendPanel
      data={slices.revenueTrend.data}
      series={slices.revenueTrend.series}
      xKey="label"
      valueFormatter="currency"
    />
  );
}