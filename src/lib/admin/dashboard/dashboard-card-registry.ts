import type { DashboardCardKey } from "./role-layouts";
import type { Permission } from "@/lib/admin/rbac";
import { PERMISSIONS } from "@/lib/admin/rbac";

export type DashboardCardKind =
  | "kpi"
  | "focus_wide"
  | "focus_narrow"
  | "focus_full"
  | "secondary";

export interface DashboardCardDef {
  key: DashboardCardKey;
  kind: DashboardCardKind;
  title: string;
  permission: Permission | null;
  route: string;
}

export const DASHBOARD_CARD_REGISTRY: Record<
  DashboardCardKey,
  DashboardCardDef
> = {
  kpi_platform_revenue: {
    key: "kpi_platform_revenue",
    kind: "kpi",
    title: "Platform revenue",
    permission: PERMISSIONS.ANALYTICS_VIEW,
    route: "/admin/revenue",
  },
  kpi_today_revenue: {
    key: "kpi_today_revenue",
    kind: "kpi",
    title: "Today",
    permission: PERMISSIONS.ANALYTICS_VIEW,
    route: "/admin/revenue?range=today",
  },
  kpi_orders_today: {
    key: "kpi_orders_today",
    kind: "kpi",
    title: "Orders today",
    permission: PERMISSIONS.ORDERS_VIEW,
    route: "/admin/orders",
  },
  kpi_active_users: {
    key: "kpi_active_users",
    kind: "kpi",
    title: "Active users",
    permission: PERMISSIONS.CUSTOMERS_VIEW,
    route: "/admin/customers",
  },
  kpi_total_users: {
    key: "kpi_total_users",
    kind: "kpi",
    title: "Total users",
    permission: PERMISSIONS.CUSTOMERS_VIEW,
    route: "/admin/customers",
  },
  kpi_treasury_coverage: {
    key: "kpi_treasury_coverage",
    kind: "kpi",
    title: "Treasury coverage",
    permission: PERMISSIONS.TREASURY_VIEW,
    route: "/admin/treasury",
  },
  kpi_pending_payouts: {
    key: "kpi_pending_payouts",
    kind: "kpi",
    title: "Pending payouts",
    permission: PERMISSIONS.PAYMENTS_WITHDRAWALS_APPROVE,
    route: "/admin/payments",
  },
  kpi_refund_rate: {
    key: "kpi_refund_rate",
    kind: "kpi",
    title: "Refund rate",
    permission: PERMISSIONS.REFUNDS_VIEW,
    route: "/admin/refunds",
  },
  kpi_providers_live: {
    key: "kpi_providers_live",
    kind: "kpi",
    title: "Providers live",
    permission: PERMISSIONS.PROVIDERS_VIEW,
    route: "/admin/providers",
  },
  kpi_storefronts_live: {
    key: "kpi_storefronts_live",
    kind: "kpi",
    title: "Storefronts live",
    permission: PERMISSIONS.STOREFRONTS_VIEW,
    route: "/admin/storefronts",
  },
  kpi_verification_queue: {
    key: "kpi_verification_queue",
    kind: "kpi",
    title: "Verification queue",
    permission: PERMISSIONS.RESELLERS_VERIFY,
    route: "/admin/resellers/verification",
  },
  kpi_open_tickets: {
    key: "kpi_open_tickets",
    kind: "kpi",
    title: "Open tickets",
    permission: PERMISSIONS.SUPPORT_VIEW,
    route: "/admin/support",
  },
  kpi_first_response: {
    key: "kpi_first_response",
    kind: "kpi",
    title: "First response",
    permission: PERMISSIONS.SUPPORT_VIEW,
    route: "/admin/support",
  },
  kpi_resolution_rate: {
    key: "kpi_resolution_rate",
    kind: "kpi",
    title: "Resolution rate",
    permission: PERMISSIONS.SUPPORT_VIEW,
    route: "/admin/support",
  },
  kpi_escalations: {
    key: "kpi_escalations",
    kind: "kpi",
    title: "Escalations",
    permission: PERMISSIONS.SUPPORT_VIEW,
    route: "/admin/support",
  },
  kpi_plans_total: {
    key: "kpi_plans_total",
    kind: "kpi",
    title: "Total plans",
    permission: PERMISSIONS.PRICING_VIEW,
    route: "/admin/pricing",
  },
  kpi_low_margin: {
    key: "kpi_low_margin",
    kind: "kpi",
    title: "Low margin",
    permission: PERMISSIONS.PRICING_VIEW,
    route: "/admin/pricing?lowMargin=1",
  },
  kpi_catalog_changes: {
    key: "kpi_catalog_changes",
    kind: "kpi",
    title: "Catalog changes 7d",
    permission: PERMISSIONS.PRICING_VIEW,
    route: "/admin/pricing",
  },
  focus_revenue_trend: {
    key: "focus_revenue_trend",
    kind: "focus_wide",
    title: "Revenue trend",
    permission: PERMISSIONS.ANALYTICS_VIEW,
    route: "/admin/revenue",
  },
  focus_orders_trend: {
    key: "focus_orders_trend",
    kind: "focus_wide",
    title: "Orders trend",
    permission: PERMISSIONS.ORDERS_VIEW,
    route: "/admin/orders",
  },
  focus_order_status: {
    key: "focus_order_status",
    kind: "focus_wide",
    title: "Order status",
    permission: PERMISSIONS.ORDERS_VIEW,
    route: "/admin/orders",
  },
  focus_ticket_volume: {
    key: "focus_ticket_volume",
    kind: "focus_wide",
    title: "Ticket volume",
    permission: PERMISSIONS.SUPPORT_VIEW,
    route: "/admin/support",
  },
  focus_catalog_activity: {
    key: "focus_catalog_activity",
    kind: "focus_wide",
    title: "Catalog activity",
    permission: PERMISSIONS.PRICING_VIEW,
    route: "/admin/pricing",
  },
  focus_storefront_summary: {
    key: "focus_storefront_summary",
    kind: "focus_full",
    title: "Storefront summary",
    permission: PERMISSIONS.STOREFRONTS_VIEW,
    route: "/admin/storefronts",
  },
  focus_incident_rollup: {
    key: "focus_incident_rollup",
    kind: "focus_narrow",
    title: "Incident rollup",
    permission: PERMISSIONS.SECURITY_VIEW,
    route: "/admin/security",
  },
  focus_withdrawal_queue: {
    key: "focus_withdrawal_queue",
    kind: "focus_narrow",
    title: "Withdrawal queue",
    permission: PERMISSIONS.PAYMENTS_WITHDRAWALS_APPROVE,
    route: "/admin/payments",
  },
  focus_provider_health: {
    key: "focus_provider_health",
    kind: "focus_narrow",
    title: "Provider health",
    permission: PERMISSIONS.PROVIDERS_VIEW,
    route: "/admin/providers",
  },
  focus_assigned_queue: {
    key: "focus_assigned_queue",
    kind: "focus_narrow",
    title: "Assigned queue",
    permission: PERMISSIONS.SUPPORT_VIEW,
    route: "/admin/support",
  },
  secondary_top_performers: {
    key: "secondary_top_performers",
    kind: "secondary",
    title: "Top performers",
    permission: PERMISSIONS.ANALYTICS_VIEW,
    route: "/admin/revenue",
  },
  secondary_wallet_rollup: {
    key: "secondary_wallet_rollup",
    kind: "secondary",
    title: "Wallet rollup",
    permission: PERMISSIONS.WALLETS_VIEW,
    route: "/admin/wallets",
  },
  secondary_open_tickets: {
    key: "secondary_open_tickets",
    kind: "secondary",
    title: "Open tickets",
    permission: PERMISSIONS.SUPPORT_VIEW,
    route: "/admin/support",
  },
  secondary_recent_orders: {
    key: "secondary_recent_orders",
    kind: "secondary",
    title: "Recent orders",
    permission: PERMISSIONS.ORDERS_VIEW,
    route: "/admin/orders",
  },
  secondary_recent_refunds: {
    key: "secondary_recent_refunds",
    kind: "secondary",
    title: "Recent refunds",
    permission: PERMISSIONS.REFUNDS_VIEW,
    route: "/admin/refunds",
  },
  secondary_treasury_coverage: {
    key: "secondary_treasury_coverage",
    kind: "secondary",
    title: "Treasury coverage",
    permission: PERMISSIONS.TREASURY_VIEW,
    route: "/admin/treasury",
  },
  secondary_storefront_status: {
    key: "secondary_storefront_status",
    kind: "secondary",
    title: "Storefront status",
    permission: PERMISSIONS.STOREFRONTS_VIEW,
    route: "/admin/storefronts",
  },
  secondary_catalog_changes: {
    key: "secondary_catalog_changes",
    kind: "secondary",
    title: "Catalog changes",
    permission: PERMISSIONS.PRICING_VIEW,
    route: "/admin/pricing",
  },
  secondary_verification_queue: {
    key: "secondary_verification_queue",
    kind: "secondary",
    title: "Verification queue",
    permission: PERMISSIONS.RESELLERS_VERIFY,
    route: "/admin/resellers/verification",
  },
};