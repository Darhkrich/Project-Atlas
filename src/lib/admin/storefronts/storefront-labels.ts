import type {
  StorefrontStatus,
  StorefrontType,
} from "@/lib/admin/types/storefront";

type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "brand";

export const STOREFRONT_STATUS_LABEL: Record<StorefrontStatus, string> = {
  live: "Live",
  pending: "Pending review",
  disabled: "Disabled",
};

export const STOREFRONT_STATUS_VARIANT: Record<
  StorefrontStatus,
  BadgeVariant
> = {
  live: "success",
  pending: "warning",
  disabled: "danger",
};

export const STOREFRONT_STATUS_ORDER: StorefrontStatus[] = [
  "live",
  "pending",
  "disabled",
];

export const STOREFRONT_TYPE_LABEL: Record<StorefrontType, string> = {
  reseller: "Reseller",
  merchant: "Merchant",
};

export const STOREFRONT_TYPE_VARIANT: Record<StorefrontType, BadgeVariant> = {
  reseller: "info",
  merchant: "success",
};

export const ALL_STOREFRONT_TYPES: StorefrontType[] = [
  "reseller",
  "merchant",
];

export function storefrontStatusLabel(status: StorefrontStatus): string {
  return STOREFRONT_STATUS_LABEL[status];
}

export function storefrontTypeLabel(type: StorefrontType): string {
  return STOREFRONT_TYPE_LABEL[type];
}