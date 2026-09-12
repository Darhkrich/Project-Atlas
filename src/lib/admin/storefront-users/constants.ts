// lib/admin/storefront-users/constants.ts

import type {
  StorefrontUserRiskLevel,
  StorefrontUserSegment,
  StorefrontUserStatus,
} from "@/lib/admin/types/storefront-user";
import type { StorefrontUserOrderStatus } from "@/lib/admin/types/storefront-user-order";
import type { StorefrontStatus } from "@/lib/admin/types/storefront";

type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "brand";

export const STATUS_LABEL: Record<StorefrontUserStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  suspended: "Suspended",
};

export const STATUS_VARIANT: Record<StorefrontUserStatus, BadgeVariant> = {
  active: "success",
  inactive: "neutral",
  suspended: "danger",
};

export const RISK_LABEL: Record<StorefrontUserRiskLevel, string> = {
  low: "Low risk",
  medium: "Medium risk",
  high: "High risk",
};

export const RISK_VARIANT: Record<StorefrontUserRiskLevel, BadgeVariant> = {
  low: "success",
  medium: "warning",
  high: "danger",
};

export const SEGMENT_LABEL: Record<StorefrontUserSegment, string> = {
  new: "New",
  repeat: "Repeat",
  vip: "VIP",
  at_risk: "At risk",
};

export const SEGMENT_VARIANT: Record<StorefrontUserSegment, BadgeVariant> = {
  new: "neutral",
  repeat: "info",
  vip: "brand",
  at_risk: "danger",
};

export const STOREFRONT_STATUS_LABEL: Record<StorefrontStatus, string> = {
  live: "Live",
  disabled: "Disabled",
  pending: "Pending",
};

export const STOREFRONT_STATUS_VARIANT: Record<
  StorefrontStatus,
  BadgeVariant
> = {
  live: "success",
  disabled: "danger",
  pending: "warning",
};

export const ORDER_STATUS_LABEL: Record<StorefrontUserOrderStatus, string> = {
  paid: "Paid",
  pending: "Pending",
  refunded: "Refunded",
  cancelled: "Cancelled",
};

export const ORDER_STATUS_VARIANT: Record<
  StorefrontUserOrderStatus,
  BadgeVariant
> = {
  paid: "success",
  pending: "warning",
  refunded: "danger",
  cancelled: "neutral",
};

export type SortKey =
  | "name"
  | "lastActive"
  | "joined"
  | "totalSpent"
  | "orders";

export const SORT_LABEL: Record<SortKey, string> = {
  name: "Name",
  lastActive: "Last active",
  joined: "Newest join",
  totalSpent: "Highest spend",
  orders: "Most orders",
};

export const ALL_SORT_KEYS: SortKey[] = [
  "lastActive",
  "name",
  "joined",
  "totalSpent",
  "orders",
];

export const PAGE_SIZE = 12;

export const HIGH_VALUE_THRESHOLD = 1500;

export const TAG_PRESETS = [
  "VIP",
  "Repeat Buyer",
  "High Value",
  "Flagged",
  "At Risk",
  "Early Adopter",
];