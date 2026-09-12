// lib/admin/merchants/constants.ts

import type {
  MerchantStatus,
  StoreStatus,
  SubscriptionStatus,
  VerificationStatus,
} from "@/lib/admin/types/merchant";

type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "brand";

export const MERCHANT_STATUS_LABEL: Record<MerchantStatus, string> = {
  active: "Active",
  suspended: "Suspended",
  pending: "Pending",
};

export const MERCHANT_STATUS_VARIANT: Record<MerchantStatus, BadgeVariant> = {
  active: "success",
  suspended: "danger",
  pending: "warning",
};

export const SUBSCRIPTION_STATUS_LABEL: Record<SubscriptionStatus, string> = {
  active: "Active",
  past_due: "Past due",
  cancelled: "Cancelled",
  expired: "Expired",
};

export const SUBSCRIPTION_STATUS_VARIANT: Record<
  SubscriptionStatus,
  BadgeVariant
> = {
  active: "success",
  past_due: "warning",
  cancelled: "neutral",
  expired: "neutral",
};

export const STORE_STATUS_LABEL: Record<StoreStatus, string> = {
  live: "Live",
  disabled: "Disabled",
};

export const STORE_STATUS_VARIANT: Record<StoreStatus, BadgeVariant> = {
  live: "success",
  disabled: "danger",
};

export const VERIFICATION_LABEL: Record<VerificationStatus, string> = {
  verified: "Verified",
  pending: "Pending",
  rejected: "Rejected",
  not_submitted: "Not submitted",
};

export const VERIFICATION_VARIANT: Record<
  VerificationStatus,
  BadgeVariant
> = {
  verified: "success",
  pending: "warning",
  rejected: "danger",
  not_submitted: "neutral",
};

export const TEMPLATE_LABEL: Record<string, string> = {
  "tpl-general-store": "General Store",
  "tpl-cosmetics-luxe": "Cosmetics Luxe",
  "tpl-fashion-modern": "Fashion Modern",
};

export type SortKey =
  | "lastActive"
  | "created"
  | "revenue"
  | "orders"
  | "mrr"
  | "renewal";

export const SORT_LABEL: Record<SortKey, string> = {
  lastActive: "Last active",
  created: "Newest",
  revenue: "Highest revenue",
  orders: "Most orders",
  mrr: "Highest MRR",
  renewal: "Renewal date",
};

export const ALL_SORT_KEYS: SortKey[] = [
  "lastActive",
  "created",
  "revenue",
  "orders",
  "mrr",
  "renewal",
];

export const PAGE_SIZE = 10;

export type ColumnKey =
  | "businessName"
  | "contact"
  | "plan"
  | "subStatus"
  | "orders"
  | "revenue"
  | "mrr"
  | "wallet"
  | "storeStatus"
  | "verification";

export const OPTIONAL_COLUMN_KEYS: ColumnKey[] = [
  "businessName",
  "contact",
  "plan",
  "subStatus",
  "orders",
  "revenue",
  "mrr",
  "wallet",
  "storeStatus",
  "verification",
];

export const COLUMN_LABEL: Record<ColumnKey, string> = {
  businessName: "Merchant",
  contact: "Contact",
  plan: "Plan",
  subStatus: "Subscription",
  orders: "Orders",
  revenue: "Revenue",
  mrr: "MRR",
  wallet: "Wallet",
  storeStatus: "Store",
  verification: "Verification",
};

export type RenewalWindow = "" | "overdue" | "7d" | "14d" | "30d";

export const RENEWAL_WINDOW_OPTIONS: {
  value: RenewalWindow;
  label: string;
}[] = [
  { value: "", label: "Any renewal" },
  { value: "overdue", label: "Overdue" },
  { value: "7d", label: "Renews within 7 days" },
  { value: "14d", label: "Renews within 14 days" },
  { value: "30d", label: "Renews within 30 days" },
];