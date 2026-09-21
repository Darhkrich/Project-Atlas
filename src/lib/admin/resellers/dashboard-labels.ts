import type { Reseller } from "@/lib/admin/types/reseller";
import type {
  RecentActivity,
  RecentActivitySource,
} from "@/lib/admin/types/reseller-dashboard";

type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "brand";

export const ACTIVITY_TYPE_LABEL: Record<RecentActivity["type"], string> = {
  registration: "Registration",
  verification: "Verification",
  storefront: "Storefront",
  commission: "Commission",
  wallet: "Wallet",
};

export const ACTIVITY_TYPE_VARIANT: Record<
  RecentActivity["type"],
  BadgeVariant
> = {
  registration: "info",
  verification: "success",
  storefront: "warning",
  commission: "success",
  wallet: "info",
};

export const ACTIVITY_SOURCE_LABEL: Record<
  RecentActivitySource,
  string
> = {
  activity: "Reseller action",
  audit: "Admin action",
};

export const RESELLER_STATUS_LABEL: Record<Reseller["status"], string> = {
  active: "Active",
  pending: "Pending",
  suspended: "Suspended",
};

export const VERIFICATION_STATUS_LABEL: Record<
  Reseller["verificationStatus"],
  string
> = {
  verified: "Verified",
  pending: "Pending",
  rejected: "Rejected",
  not_submitted: "Not submitted",
};

export const TIER_ORDER: Record<string, number> = {
  Bronze: 1,
  Silver: 2,
  Gold: 3,
};