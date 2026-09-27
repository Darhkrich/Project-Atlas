// lib/admin/wallets/registry-constants.ts

import type { WalletPoolType } from "./registry-types";

export const REGISTRY_PAGE_SIZE = 20;

export const REGISTRY_PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

export const REGISTRY_POOLS: WalletPoolType[] = [
  "customer",
  "storefront_user",
  "reseller",
  "merchant_billing",
  "merchant_main",
];

export const REGISTRY_COLUMN_KEYS = [
  "owner",
  "pool",
  "walletId",
  "balance",
  "status",
  "lastActivity",
] as const;

export type RegistryColumnKey = (typeof REGISTRY_COLUMN_KEYS)[number];

export const REGISTRY_COLUMN_LABEL: Record<RegistryColumnKey, string> = {
  owner: "Owner",
  pool: "Pool",
  walletId: "Wallet",
  balance: "Balance",
  status: "Status",
  lastActivity: "Last activity",
};

export const REGISTRY_SORT_KEYS = [
  "lastActivity",
  "balance",
  "ownerName",
] as const;

export type RegistrySortKey = (typeof REGISTRY_SORT_KEYS)[number];

export const REGISTRY_SORT_LABEL: Record<RegistrySortKey, string> = {
  lastActivity: "Last activity",
  balance: "Highest balance",
  ownerName: "Owner name",
};