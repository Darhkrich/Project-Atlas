"use client";

import { DistributionPanel } from "./distribution-panel";
import type { DashboardSlices } from "@/lib/admin/dashboard/dashboard-slices";

export function OrderStatusChart({
  slices,
}: {
  slices: DashboardSlices;
}) {
  return (
    <DistributionPanel
      slices={slices.orderStatusBreakdown}
      variant="donut"
    />
  );
}