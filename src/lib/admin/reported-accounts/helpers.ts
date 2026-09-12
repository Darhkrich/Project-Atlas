// lib/admin/reported-accounts/helpers.ts

import type {
  StorefrontUser,
  StorefrontUserReport,
  StorefrontUserReportCategory,
  StorefrontUserStatus,
} from "@/lib/admin/types/storefront-user";
import type { ReportAction } from "./actions";
import { CATEGORY_ACTIONS, SLA_WINDOW_HOURS } from "./constants";
import type { CurrentAdmin } from "@/lib/admin/rbac";

/* ------------------------------ Aggregated shape ----------------------- */

export interface AggregatedReport extends StorefrontUserReport {
  accountId: string;
  accountName: string;
  accountEmail: string;
  accountStatus: StorefrontUserStatus;
  storefrontId: string;
  storefrontType: "reseller" | "merchant";
  storefrontName: string;
}

export function aggregateReports(
  users: StorefrontUser[]
): AggregatedReport[] {
  const out: AggregatedReport[] = [];
  for (const user of users) {
    for (const report of user.reports) {
      out.push({
        ...report,
        accountId: user.id,
        accountName: user.name,
        accountEmail: user.email,
        accountStatus: user.status,
        storefrontId: user.storefrontId,
        storefrontType: user.storefrontType,
        storefrontName: user.storeName,
      });
    }
  }
  return out;
}

/* ------------------------------ Actions -------------------------------- */

export function actionsForCategory(
  category: StorefrontUserReportCategory
): ReportAction[] {
  return CATEGORY_ACTIONS[category] ?? [];
}

/* ------------------------------ SLA ------------------------------------ */

export type SlaTone = "danger" | "warning" | "neutral";

export function ageHours(report: StorefrontUserReport, now: number): number {
  const t = new Date(report.timestamp).getTime();
  return Math.floor((now - t) / 3_600_000);
}

export function slaTone(report: StorefrontUserReport, now: number): SlaTone {
  if (report.status !== "pending") return "neutral";
  const hours = ageHours(report, now);
  if (hours >= SLA_WINDOW_HOURS) return "danger";
  if (hours >= SLA_WINDOW_HOURS * 0.5) return "warning";
  return "neutral";
}

export function formatAge(hours: number): string {
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  return `${days}d ago`;
}

/* ------------------------------ Audit helpers -------------------------- */

export interface ReportAuditEntry {
  id: string;
  timestamp: string;
  admin: string;
  action: string;
}

export function buildReportAuditEntry(input: {
  admin: CurrentAdmin;
  action: string;
}): ReportAuditEntry {
  return {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    admin: input.admin.email,
    action: input.action,
  };
}

/* ------------------------------ Action text ---------------------------- */

export function describeAction(
  action: ReportAction,
  context: { category: StorefrontUserReportCategory; amount?: number }
): string {
  switch (action) {
    case "warn":
      return "Warning issued";
    case "suspend":
      return "Account suspended";
    case "issue_refund":
      return context.amount
        ? `Refund issued (GHS ${context.amount.toFixed(2)})`
        : "Refund issued";
    case "escalate":
      return "Escalated to specialist team";
    case "dismiss":
      return "Report dismissed";
  }
}