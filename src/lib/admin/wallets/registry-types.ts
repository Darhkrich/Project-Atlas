// lib/admin/wallets/registry-types.ts
//
// Registry view types. Consumed by the projection, the hook, and the
// page. Every pool normalizes to one row shape.

import type { MetricWithDelta } from "@/lib/admin/types/customer-wallet";
import type { WalletStatus } from "@/lib/domains/wallet/enums";

export type WalletPoolType =
  | "customer"
  | "storefront_user"
  | "reseller"
  | "merchant_billing"
  | "merchant_main";

export interface RegistryRow {
  id: string;
  pool: WalletPoolType;
  ownerId: string;
  ownerName: string;
  ownerLabel: string;
  balance: number;
  status: WalletStatus;
  currency: "GHS";
  lastActivityAt: string | null;
  // Optional context the pools surface differently
  storefrontName?: string;
  merchantId?: string;
  resellerId?: string;
  customerId?: string;
  storefrontUserId?: string;
}

export interface RegistryPoolSummary {
  pool: WalletPoolType;
  walletCount: number;
  totalBalance: number;
  delta: MetricWithDelta;
  frozenCount: number;
}

export interface RegistrySummary {
  totalBalance: number;
  totalDelta: MetricWithDelta;
  totalWallets: number;
  totalFrozen: number;
  pools: RegistryPoolSummary[];
  grandTotalMatchesTreasury: boolean;
  treasuryLiabilities: number;
  currency: "GHS";
}