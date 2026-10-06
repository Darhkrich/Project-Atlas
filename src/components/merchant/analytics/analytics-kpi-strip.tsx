"use client";

import { KPI_LABELS } from "@/lib/merchant/analytics/labels";
import type {
  AnalyticsKpis,
  AnalyticsRange,
} from "@/lib/merchant/analytics/types";
import { AnalyticsKpiTile } from "./analytics-kpi-tile";

interface AnalyticsKpiStripProps {
  kpis: AnalyticsKpis;
  range: AnalyticsRange;
}

function formatCedi(value: number): string {
  return "GH\u20B5 " + value.toFixed(2);
}

function formatCount(value: number): string {
  return String(value);
}

export function AnalyticsKpiStrip({ kpis, range }: AnalyticsKpiStripProps) {
  const isAllTime = range === "all";

  return (
    <section aria-label="Key metrics">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <AnalyticsKpiTile
          label={KPI_LABELS.revenue}
          value={formatCedi(kpis.revenue.current)}
          icon="wallet"
          delta={kpis.revenue}
          hideDelta={isAllTime}
        />
        <AnalyticsKpiTile
          label={KPI_LABELS.orders}
          value={formatCount(kpis.orders.current)}
          icon="orders"
          delta={kpis.orders}
          hideDelta={isAllTime}
        />
        <AnalyticsKpiTile
          label={KPI_LABELS.averageOrderValue}
          value={formatCedi(kpis.averageOrderValue.current)}
          icon="trending-up"
          delta={kpis.averageOrderValue}
          hideDelta={isAllTime}
        />
        <AnalyticsKpiTile
          label={KPI_LABELS.customers}
          value={formatCount(kpis.customers.current)}
          icon="users"
          delta={kpis.customers}
          hideDelta={isAllTime}
        />
      </div>
    </section>
  );
}