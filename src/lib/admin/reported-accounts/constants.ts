// lib/admin/reported-accounts/constants.ts

import type {
  StorefrontUserReportCategory,
  StorefrontUserReportStatus,
} from "@/lib/admin/types/storefront-user";
import type { ReportAction } from "./actions";

type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "brand";

export const CATEGORY_LABEL: Record<
  StorefrontUserReportCategory,
  string
> = {
  fraud: "Fraud",
  chargeback: "Chargeback",
  abuse: "Abuse",
  spam: "Spam",
  policy_violation: "Policy violation",
  other: "Other",
};

export const CATEGORY_VARIANT: Record<
  StorefrontUserReportCategory,
  BadgeVariant
> = {
  fraud: "danger",
  chargeback: "warning",
  abuse: "danger",
  spam: "neutral",
  policy_violation: "warning",
  other: "neutral",
};

export const CATEGORY_ACTIONS: Record<
  StorefrontUserReportCategory,
  ReportAction[]
> = {
  fraud: ["warn", "suspend", "escalate", "dismiss"],
  chargeback: ["suspend", "issue_refund", "dismiss"],
  abuse: ["warn", "suspend", "escalate", "dismiss"],
  spam: ["warn", "dismiss"],
  policy_violation: ["warn", "suspend", "dismiss"],
  other: ["warn", "suspend", "escalate", "dismiss"],
};

export const STATUS_LABEL: Record<StorefrontUserReportStatus, string> = {
  pending: "Pending",
  action_taken: "Action taken",
  dismissed: "Dismissed",
};

export const STATUS_VARIANT: Record<
  StorefrontUserReportStatus,
  BadgeVariant
> = {
  pending: "warning",
  action_taken: "success",
  dismissed: "neutral",
};

export const SLA_WINDOW_HOURS = 24;

export type SortKey =
  | "newest"
  | "oldest"
  | "reporter"
  | "account"
  | "sla";

export const SORT_LABEL: Record<SortKey, string> = {
  newest: "Newest first",
  oldest: "Oldest first",
  reporter: "Reporter",
  account: "Reported account",
  sla: "Past SLA first",
};

export const ALL_SORT_KEYS: SortKey[] = [
  "newest",
  "oldest",
  "reporter",
  "account",
  "sla",
];

export const PAGE_SIZE = 10;