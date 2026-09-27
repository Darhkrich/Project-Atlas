// lib/admin/customers/constants.ts

import type {
  CustomerStatus,
  RiskLevel,
  StorefrontType,
} from "@/lib/admin/types/customer";

type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "brand";

export const STATUS_LABEL: Record<CustomerStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  suspended: "Suspended",
};

export const STATUS_VARIANT: Record<CustomerStatus, BadgeVariant> = {
  active: "success",
  inactive: "neutral",
  suspended: "danger",
};

export const RISK_LABEL: Record<RiskLevel, string> = {
  low: "Low risk",
  medium: "Medium risk",
  high: "High risk",
};

export const RISK_VARIANT: Record<RiskLevel, BadgeVariant> = {
  low: "success",
  medium: "warning",
  high: "danger",
};

export const SOURCE_LABEL: Record<
  "direct" | "reseller" | "ecommerce",
  string
> = {
  direct: "Direct",
  reseller: "Reseller",
  ecommerce: "Ecommerce",
};

export const STOREFRONT_TYPE_LABEL: Record<StorefrontType, string> = {
  reseller: "Reseller storefront",
  merchant: "Merchant storefront",
};

export const TAG_PRESETS = [
  "VIP",
  "High Value",
  "Flagged",
  "Returning",
  "New",
  "At Risk",
];

export type SortKey =
  | "lastActive"
  | "joined"
  | "totalSpent"
  | "totalOrders"
  | "wallet";

export const SORT_LABEL: Record<SortKey, string> = {
  lastActive: "Last active",
  joined: "Newest join",
  totalSpent: "Highest spend",
  totalOrders: "Most orders",
  wallet: "Wallet balance",
};

export const ALL_SORT_KEYS: SortKey[] = [
  "lastActive",
  "joined",
  "totalSpent",
  "totalOrders",
  "wallet",
];

export type LastActiveFilter = "" | "7d" | "30d" | "90d" | "90d+";

export const LAST_ACTIVE_OPTIONS: {
  value: LastActiveFilter;
  label: string;
}[] = [
  { value: "", label: "Any activity" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "90d+", label: "90+ days ago" },
];

export const PAGE_SIZE = 12;

export const CUSTOMER_RETENTION_DAYS = 90;

export type WalletAdjustMethod = "atlas_wallet";

export const WALLET_METHOD_LABEL: Record<WalletAdjustMethod, string> = {
  atlas_wallet: "Atlas wallet balance",
};

export const WALLET_METHOD_HINT: Record<WalletAdjustMethod, string> = {
  atlas_wallet:
    "Bookkeeping correction. Writes a ledger entry and a treasury adjustment event.",
};

export function statusLabel(status: CustomerStatus): string {
  return STATUS_LABEL[status] ?? status;
}

export function riskLabel(risk: RiskLevel): string {
  return RISK_LABEL[risk] ?? risk;
}