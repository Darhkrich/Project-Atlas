// lib/admin/wallets/registry-labels.ts

import type { WalletStatus } from "@/lib/domains/wallet/enums";
import type { WalletPoolType } from "./registry-types";

type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "brand";

export const WALLET_STATUS_LABELS: Record<WalletStatus, string> = {
  active: "Active",
  frozen: "Frozen",
};

export const WALLET_STATUS_VARIANTS: Record<WalletStatus, BadgeVariant> = {
  active: "success",
  frozen: "danger",
};

export const REGISTRY_POOL_LABELS: Record<WalletPoolType, string> = {
  customer: "Customer",
  storefront_user: "Storefront user",
  reseller: "Reseller",
  merchant_billing: "Merchant billing",
  merchant_main: "Merchant main",
};

export const REGISTRY_POOL_SHORT_LABELS: Record<WalletPoolType, string> = {
  customer: "Customer",
  storefront_user: "Storefront",
  reseller: "Reseller",
  merchant_billing: "Merchant billing",
  merchant_main: "Merchant main",
};

export const REGISTRY_POOL_VARIANTS: Record<WalletPoolType, BadgeVariant> = {
  customer: "info",
  storefront_user: "brand",
  reseller: "success",
  merchant_billing: "warning",
  merchant_main: "warning",
};

export function formatPoolLabel(pool: WalletPoolType): string {
  return REGISTRY_POOL_LABELS[pool];
}