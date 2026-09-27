import type { DashboardCardKey } from "./role-layouts";
import type { DashboardSnapshot } from "./dashboard-projection";
import type {
  KpiCardProps,
  KpiDeltaPolarity,
} from "@/components/admin/dashboard/kpi-card";
import { formatCurrency } from "@/lib/admin/formatters";

const KPI_META: Partial<
  Record<
    DashboardCardKey,
    {
      label: string;
      icon: KpiCardProps["icon"];
      href: string;
      polarity: KpiDeltaPolarity;
    }
  >
> = {
  kpi_platform_revenue: {
    label: "Platform revenue",
    icon: "sales",
    href: "/admin/revenue",
    polarity: "up-good",
  },
  kpi_today_revenue: {
    label: "Today",
    icon: "trending-up",
    href: "/admin/revenue?range=today",
    polarity: "up-good",
  },
  kpi_orders_today: {
    label: "Orders today",
    icon: "orders",
    href: "/admin/orders",
    polarity: "neutral",
  },
  kpi_active_users: {
    label: "Active users",
    icon: "users",
    href: "/admin/customers",
    polarity: "neutral",
  },
  kpi_total_users: {
    label: "Total users",
    icon: "users",
    href: "/admin/customers",
    polarity: "neutral",
  },
  kpi_treasury_coverage: {
    label: "Treasury coverage",
    icon: "shield",
    href: "/admin/treasury",
    polarity: "up-good",
  },
  kpi_pending_payouts: {
    label: "Pending payouts",
    icon: "wallet",
    href: "/admin/payments",
    polarity: "up-bad",
  },
  kpi_refund_rate: {
    label: "Refund rate",
    icon: "repeat",
    href: "/admin/refunds",
    polarity: "up-bad",
  },
  kpi_providers_live: {
    label: "Providers live",
    icon: "server",
    href: "/admin/providers",
    polarity: "up-good",
  },
  kpi_storefronts_live: {
    label: "Storefronts live",
    icon: "store",
    href: "/admin/storefronts",
    polarity: "up-good",
  },
  kpi_verification_queue: {
    label: "Verification queue",
    icon: "file-text",
    href: "/admin/resellers/verification",
    polarity: "up-bad",
  },
  kpi_open_tickets: {
    label: "Open tickets",
    icon: "inbox",
    href: "/admin/support",
    polarity: "up-bad",
  },
  kpi_first_response: {
    label: "First response",
    icon: "clock",
    href: "/admin/support",
    polarity: "up-good",
  },
  kpi_resolution_rate: {
    label: "Resolution rate",
    icon: "check-circle",
    href: "/admin/support",
    polarity: "up-good",
  },
  kpi_escalations: {
    label: "Escalations",
    icon: "alert",
    href: "/admin/support",
    polarity: "up-bad",
  },
  kpi_plans_total: {
    label: "Total plans",
    icon: "list",
    href: "/admin/pricing",
    polarity: "neutral",
  },
  kpi_low_margin: {
    label: "Low margin",
    icon: "alert",
    href: "/admin/pricing?lowMargin=1",
    polarity: "up-bad",
  },
  kpi_catalog_changes: {
    label: "Catalog changes 7d",
    icon: "repeat",
    href: "/admin/pricing",
    polarity: "neutral",
  },
};

function valueFor(
  key: DashboardCardKey,
  snapshot: DashboardSnapshot
): { value: string; sublabel?: string; tone?: KpiCardProps["tone"] } | null {
  const m = snapshot.metrics;
  const a = snapshot.accountsByStatus;

  switch (key) {
    case "kpi_platform_revenue":
      return { value: formatCurrency(m.totalRevenue) };
    case "kpi_today_revenue":
      return { value: formatCurrency(m.todayRevenue) };
    case "kpi_orders_today":
      return { value: String(m.ordersToday) };
    case "kpi_active_users":
      return { value: String(m.activeUsers) };
    case "kpi_total_users":
      return { value: String(m.totalUsers) };
    case "kpi_treasury_coverage":
      return { value: "—", sublabel: "See Treasury" };
    case "kpi_pending_payouts":
      return { value: "—", sublabel: "See Payments" };
    case "kpi_refund_rate":
      return { value: m.refundRate.toFixed(2) + "%" };
    case "kpi_providers_live":
      return {
        value: String(m.providersHealthy),
        sublabel:
          m.providersDegraded + m.providersUnhealthy === 0
            ? "all healthy"
            : m.providersDegraded +
              m.providersUnhealthy +
              " degraded or worse",
        tone: m.providersUnhealthy > 0 ? "danger" : "neutral",
      };
    case "kpi_storefronts_live":
      return { value: String(m.liveStores) };
    case "kpi_verification_queue":
      return { value: String(a.resellers.pending) };
    case "kpi_open_tickets":
      return {
        value: String(m.supportTicketsOpen),
        sublabel:
          m.supportTicketsPastSla > 0
            ? m.supportTicketsPastSla + " past SLA"
            : undefined,
        tone: m.supportTicketsPastSla > 0 ? "danger" : "neutral",
      };
    case "kpi_first_response":
      return { value: "—", sublabel: "Support metrics pending" };
    case "kpi_resolution_rate":
      return { value: "—", sublabel: "Support metrics pending" };
    case "kpi_escalations":
      return { value: "0" };
    case "kpi_plans_total":
      return { value: String(m.plansTotal) };
    case "kpi_low_margin":
      return {
        value: String(m.plansLowMargin),
        tone: m.plansLowMargin > 0 ? "warning" : "neutral",
      };
    case "kpi_catalog_changes":
      return { value: "—" };
    default:
      return null;
  }
}

function deltaFor(
  key: DashboardCardKey,
  snapshot: DashboardSnapshot
): number | null {
  const d = snapshot.deltas;
  switch (key) {
    case "kpi_platform_revenue":
      return d.totalRevenue;
    case "kpi_today_revenue":
      return d.todayRevenue;
    case "kpi_orders_today":
      return d.ordersToday;
    case "kpi_active_users":
      return d.activeUsers;
    case "kpi_total_users":
      return d.totalUsers;
    case "kpi_pending_payouts":
      return d.walletLiability;
    case "kpi_refund_rate":
      return d.refundRate;
    case "kpi_storefronts_live":
      return d.liveStores;
    default:
      return null;
  }
}

export function kpiPropsFor(
  key: DashboardCardKey,
  snapshot: DashboardSnapshot
): KpiCardProps | null {
  const meta = KPI_META[key];
  if (!meta) return null;
  const value = valueFor(key, snapshot);
  if (!value) return null;
  return {
    label: meta.label,
    value: value.value,
    delta: deltaFor(key, snapshot),
    deltaPolarity: meta.polarity,
    icon: meta.icon,
    href: meta.href,
    sublabel: value.sublabel,
    tone: value.tone,
  };
}