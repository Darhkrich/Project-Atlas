import type { TeamRole } from "./types";

export const TEAM_ROLES: TeamRole[] = ["manager", "staff"];

export const TEAM_ROLE_LABELS: Record<TeamRole, string> = {
  manager: "Manager",
  staff: "Staff",
};

export const TEAM_ROLE_DESCRIPTIONS: Record<TeamRole, string> = {
  manager:
    "Full access to products, orders, customers, and storefront. Cannot manage billing.",
  staff:
    "Access to orders and customers. Cannot edit products or storefront.",
};

export const TEAM_NAME_MAX = 60;
export const TEAM_EMAIL_MAX = 120;

export const DEFAULT_TEAM_SEAT_LIMIT = 0;