import type { Role } from "@/lib/admin/rbac";
import { ROLES } from "@/lib/admin/rbac";

export type DashboardSectionKey =
  | "greeting"
  | "command"
  | "kpi"
  | "focus"
  | "secondary"
  | "activity";

export type DashboardCardKey =
  | "kpi_platform_revenue"
  | "kpi_today_revenue"
  | "kpi_orders_today"
  | "kpi_active_users"
  | "kpi_total_users"
  | "kpi_treasury_coverage"
  | "kpi_pending_payouts"
  | "kpi_refund_rate"
  | "kpi_providers_live"
  | "kpi_storefronts_live"
  | "kpi_verification_queue"
  | "kpi_open_tickets"
  | "kpi_first_response"
  | "kpi_resolution_rate"
  | "kpi_escalations"
  | "kpi_plans_total"
  | "kpi_low_margin"
  | "kpi_catalog_changes"
  | "focus_revenue_trend"
  | "focus_orders_trend"
  | "focus_order_status"
  | "focus_ticket_volume"
  | "focus_catalog_activity"
  | "focus_storefront_summary"
  | "focus_incident_rollup"
  | "focus_withdrawal_queue"
  | "focus_provider_health"
  | "focus_assigned_queue"
  | "secondary_top_performers"
  | "secondary_wallet_rollup"
  | "secondary_open_tickets"
  | "secondary_recent_orders"
  | "secondary_recent_refunds"
  | "secondary_treasury_coverage"
  | "secondary_storefront_status"
  | "secondary_catalog_changes"
  | "secondary_verification_queue";

export interface RoleLayout {
  command: boolean;
  kpis: DashboardCardKey[];
  focus: DashboardCardKey[];
  secondary: DashboardCardKey[];
  activity: boolean;
}

const SUPER_ADMIN: RoleLayout = {
  command: true,
  kpis: [
    "kpi_platform_revenue",
    "kpi_orders_today",
    "kpi_active_users",
    "kpi_treasury_coverage",
    "kpi_open_tickets",
  ],
  focus: ["focus_revenue_trend", "focus_incident_rollup"],
  secondary: [
    "secondary_top_performers",
    "secondary_wallet_rollup",
    "secondary_open_tickets",
  ],
  activity: true,
};

const FINANCE: RoleLayout = {
  command: true,
  kpis: [
    "kpi_today_revenue",
    "kpi_platform_revenue",
    "kpi_pending_payouts",
    "kpi_treasury_coverage",
    "kpi_refund_rate",
  ],
  focus: ["focus_revenue_trend", "focus_withdrawal_queue"],
  secondary: [
    "secondary_recent_refunds",
    "secondary_treasury_coverage",
    "secondary_wallet_rollup",
  ],
  activity: true,
};

const OPERATIONS: RoleLayout = {
  command: true,
  kpis: [
    "kpi_orders_today",
    "kpi_providers_live",
    "kpi_storefronts_live",
    "kpi_verification_queue",
    "kpi_active_users",
  ],
  focus: ["focus_order_status", "focus_provider_health"],
  secondary: [
    "secondary_recent_orders",
    "secondary_storefront_status",
    "secondary_catalog_changes",
  ],
  activity: true,
};

const SUPPORT: RoleLayout = {
  command: true,
  kpis: [
    "kpi_open_tickets",
    "kpi_first_response",
    "kpi_resolution_rate",
    "kpi_escalations",
    "kpi_refund_rate",
  ],
  focus: ["focus_ticket_volume", "focus_assigned_queue"],
  secondary: [
    "secondary_recent_refunds",
    "secondary_open_tickets",
    "secondary_storefront_status",
  ],
  activity: true,
};

const SERVICE: RoleLayout = {
  command: true,
  kpis: [
    "kpi_plans_total",
    "kpi_low_margin",
    "kpi_providers_live",
    "kpi_catalog_changes",
    "kpi_orders_today",
  ],
  focus: ["focus_catalog_activity", "focus_provider_health"],
  secondary: [
    "secondary_catalog_changes",
    "secondary_recent_orders",
    "secondary_top_performers",
  ],
  activity: true,
};

const ANALYST: RoleLayout = {
  command: false,
  kpis: [
    "kpi_platform_revenue",
    "kpi_orders_today",
    "kpi_active_users",
    "kpi_refund_rate",
  ],
  focus: ["focus_revenue_trend", "focus_orders_trend"],
  secondary: [
    "secondary_top_performers",
    "secondary_wallet_rollup",
    "secondary_storefront_status",
  ],
  activity: true,
};

const VIEWER: RoleLayout = {
  command: false,
  kpis: ["kpi_storefronts_live", "kpi_active_users", "kpi_orders_today"],
  focus: ["focus_storefront_summary"],
  secondary: ["secondary_storefront_status"],
  activity: true,
};

export const ROLE_LAYOUTS: Record<Role, RoleLayout> = {
  [ROLES.SUPER_ADMIN]: SUPER_ADMIN,
  [ROLES.FINANCE_ADMIN]: FINANCE,
  [ROLES.OPERATIONS_ADMIN]: OPERATIONS,
  [ROLES.SUPPORT_ADMIN]: SUPPORT,
  [ROLES.SERVICE_ADMIN]: SERVICE,
  [ROLES.ANALYST]: ANALYST,
  [ROLES.VIEWER]: VIEWER,
};

export function layoutForRole(role: Role): RoleLayout {
  return ROLE_LAYOUTS[role] ?? VIEWER;
}