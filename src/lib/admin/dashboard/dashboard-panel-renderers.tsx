"use client";

import type { ReactNode } from "react";
import { TrendPanel } from "@/components/admin/dashboard/trend-panel";
import { ListPanel } from "@/components/admin/dashboard/list-panel";
import { DistributionPanel } from "@/components/admin/dashboard/distribution-panel";
import { FocusPanel } from "@/components/admin/dashboard/focus-panel";
import { SecondaryPanel } from "@/components/admin/dashboard/secondary-panel";
import type { DashboardCardKey } from "./role-layouts";
import type { DashboardSlices } from "./dashboard-slices";
import type { DashboardSnapshot } from "./dashboard-projection";
import { DASHBOARD_CARD_REGISTRY } from "./dashboard-card-registry";
import { CHART_PALETTE } from "@/lib/admin/charts/theme";

export interface PanelRenderInput {
  key: DashboardCardKey;
  snapshot: DashboardSnapshot;
  slices: DashboardSlices;
}

function panelBody(
  key: DashboardCardKey,
  snapshot: DashboardSnapshot,
  slices: DashboardSlices
): ReactNode {
  switch (key) {
    case "focus_revenue_trend":
      return (
        <TrendPanel
          data={slices.revenueTrend.data}
          series={slices.revenueTrend.series}
          xKey="label"
          valueFormatter="currency"
        />
      );
    case "focus_orders_trend":
      return (
        <TrendPanel
          data={slices.ordersTrend.data}
          series={slices.ordersTrend.series}
          xKey="label"
          valueFormatter="number"
        />
      );
    case "focus_order_status":
      return (
        <DistributionPanel
          slices={slices.orderStatusBreakdown}
          variant="donut"
        />
      );
    case "focus_ticket_volume":
      return (
        <p className="py-12 text-center text-sm text-neutral-500">
          Support store wiring pending.
        </p>
      );
    case "focus_catalog_activity":
      return (
        <ListPanel
          rows={slices.catalogChanges}
          emptyMessage="No catalog changes recorded yet."
        />
      );
    case "focus_storefront_summary":
      return (
        <DistributionPanel
          slices={slices.storefrontStatus}
          variant="horizontal_bar"
        />
      );
    case "focus_incident_rollup":
      return (
        <ListPanel
          rows={slices.providerDegradedRows}
          emptyMessage="No incidents reported."
        />
      );
    case "focus_withdrawal_queue":
      return (
        <ListPanel
          rows={slices.withdrawalQueue}
          emptyMessage="No withdrawals waiting on approval."
        />
      );
    case "focus_provider_health":
      return (
        <DistributionPanel
          slices={slices.providerRows.map((p) => ({
            id: p.id,
            label: p.name,
            value: Math.round(p.successRate),
            color:
              p.healthStatus === "critical"
                ? CHART_PALETTE.danger
                : p.healthStatus === "warning"
                ? CHART_PALETTE.warning
                : CHART_PALETTE.success,
          }))}
          variant="horizontal_bar"
        />
      );
    case "focus_assigned_queue":
      return (
        <p className="py-12 text-center text-sm text-neutral-500">
          Support store wiring pending.
        </p>
      );
    case "secondary_top_performers":
      return (
        <ListPanel
          rows={snapshot.topPerformers.map((p) => ({
            id: p.id,
            label: p.name,
            sublabel: p.kind === "reseller" ? "Reseller" : "Merchant",
            value: formatCurrencyValue(p.revenue),
            href: p.href,
          }))}
          emptyMessage="No performers yet."
        />
      );
    case "secondary_wallet_rollup":
      return (
        <DistributionPanel
          slices={slices.walletRollup}
          variant="horizontal_bar"
          valueFormatter={formatCurrencyValue}
        />
      );
    case "secondary_open_tickets":
      return (
        <p className="py-8 text-center text-sm text-neutral-500">
          Support store wiring pending.
        </p>
      );
    case "secondary_recent_orders":
      return (
        <ListPanel
          rows={slices.recentOrders}
          emptyMessage="No orders yet."
        />
      );
    case "secondary_recent_refunds":
      return (
        <ListPanel
          rows={slices.recentRefunds}
          emptyMessage="No refunds yet."
        />
      );
    case "secondary_treasury_coverage":
      return (
        <ListPanel
          rows={[
            {
              id: "treasury-balance",
              label: "Cash at bank",
              value: formatCurrencyValue(
                snapshot.metrics.walletLiability
              ),
              href: "/admin/treasury",
            },
          ]}
          emptyMessage="Treasury not loaded."
        />
      );
    case "secondary_storefront_status":
      return (
        <DistributionPanel
          slices={slices.storefrontStatus}
          variant="horizontal_bar"
        />
      );
    case "secondary_catalog_changes":
      return (
        <ListPanel
          rows={slices.catalogChanges}
          emptyMessage="No catalog changes."
        />
      );
    case "secondary_verification_queue":
      return (
        <ListPanel
          rows={slices.verificationQueue}
          emptyMessage="No verifications pending."
        />
      );
    default:
      return null;
  }
}

function formatCurrencyValue(value: number): string {
  return (
    "GH\u20B5 " +
    value.toLocaleString("en-GH", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    })
  );
}

export function renderDashboardPanel(input: PanelRenderInput): ReactNode {
  const def = DASHBOARD_CARD_REGISTRY[input.key];
  if (!def) return null;

  const body = panelBody(input.key, input.snapshot, input.slices);
  if (body === null) return null;

  if (def.kind === "secondary") {
    return (
      <SecondaryPanel title={def.title} href={def.route}>
        {body}
      </SecondaryPanel>
    );
  }

  return (
    <FocusPanel title={def.title} href={def.route}>
      {body}
    </FocusPanel>
  );
}