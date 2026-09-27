/* eslint-disable @typescript-eslint/no-unused-vars */
// lib/admin/wallets/registry-projection.ts
//
// Pure projection over four pool snapshots. No store imports. Callers
// look up each store and pass the snapshots in.
//
// Wallet IDs and keys:
//   Customer       key WAL-{customerId}         id === key
//   Storefront user key SW-{sfId}-{ownerId}     id === key
//   Reseller        key {resellerId}            id = WAL-{resellerId}
//   Merchant        key {merchantId}            id = MW-{merchantId}-{B|M}
//                                                 two wallets per merchant
//
// lastActivityAt: for every pool except customer, wallet.updatedAt is
// stale on ledger appends. Derive from the latest ledger entry where
// available, fall back to wallet.updatedAt, then null.

import type {
  WalletStatus,
} from "@/lib/domains/wallet/enums";
import type { MetricWithDelta } from "@/lib/admin/types/customer-wallet";
import type {
  RegistryPoolSummary,
  RegistryRow,
  RegistrySummary,
  WalletPoolType,
} from "./registry-types";

const THIRTY_DAYS_MS = 30 * 86_400_000;

// ---------------------------------------------------------------------------
// Input snapshot shapes. Deliberately minimal. The projection reads only
// what it needs.
// ---------------------------------------------------------------------------

export interface CustomerWalletSnapshot {
  walletId: string;
  customerId: string;
  customerName: string;
  balance: number;
  status: WalletStatus;
  currency: "GHS";
  updatedAt: string | null;
  lastLedgerIso: string | null;
}

export interface StorefrontWalletSnapshot {
  walletId: string;
  ownerId: string;
  ownerName: string;
  storefrontId: string;
  storefrontName: string;
  balance: number;
  status: WalletStatus;
  currency: "GHS";
  updatedAt: string | null;
  lastLedgerIso: string | null;
}

export interface ResellerWalletSnapshot {
  walletId: string;
  resellerId: string;
  resellerName: string;
  balance: number;
  status: WalletStatus;
  currency: "GHS";
  updatedAt: string | null;
  lastLedgerIso: string | null;
}

export interface MerchantWalletSnapshot {
  walletId: string;
  merchantId: string;
  merchantName: string;
  walletType: "billing" | "main";
  balance: number;
  status: WalletStatus;
  currency: "GHS";
  updatedAt: string | null;
  lastLedgerIso: string | null;
}

export interface RegistryInputSnapshots {
  customer: CustomerWalletSnapshot[];
  storefront: StorefrontWalletSnapshot[];
  reseller: ResellerWalletSnapshot[];
  merchant: MerchantWalletSnapshot[];
  treasuryLiabilities: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function computeDelta(current: number, previous: number): MetricWithDelta {
  const diff = current - previous;
  let direction: "up" | "down" | "flat" = "flat";
  if (diff > 0) direction = "up";
  else if (diff < 0) direction = "down";
  const changePct = previous === 0 ? null : (diff / previous) * 100;
  return {
    current: Math.round(current * 100) / 100,
    previous: Math.round(previous * 100) / 100,
    changePct,
    direction,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// lastActivityAt: prefer the latest ledger timestamp. Fall back to
// wallet.updatedAt. Fall back to null.
function lastActivity(
  lastLedgerIso: string | null,
  updatedAt: string | null
): string | null {
  const a = lastLedgerIso ? new Date(lastLedgerIso).getTime() : NaN;
  const b = updatedAt ? new Date(updatedAt).getTime() : NaN;
  const hasA = Number.isFinite(a);
  const hasB = Number.isFinite(b);
  if (!hasA && !hasB) return null;
  if (!hasA) return updatedAt;
  if (!hasB) return lastLedgerIso;
  return a >= b ? lastLedgerIso : updatedAt;
}

// ---------------------------------------------------------------------------
// Row projection
// ---------------------------------------------------------------------------

export function projectRegistryRows(
  snapshots: RegistryInputSnapshots
): RegistryRow[] {
  const rows: RegistryRow[] = [];

  for (const w of snapshots.customer) {
    rows.push({
      id: w.walletId,
      pool: "customer",
      ownerId: w.customerId,
      ownerName: w.customerName,
      ownerLabel: w.customerName,
      balance: round2(w.balance),
      status: w.status,
      currency: "GHS",
      lastActivityAt: lastActivity(w.lastLedgerIso, w.updatedAt),
      customerId: w.customerId,
    });
  }

  for (const w of snapshots.storefront) {
    rows.push({
      id: w.walletId,
      pool: "storefront_user",
      ownerId: w.ownerId,
      ownerName: w.ownerName,
      ownerLabel: w.ownerName,
      balance: round2(w.balance),
      status: w.status,
      currency: "GHS",
      lastActivityAt: lastActivity(w.lastLedgerIso, w.updatedAt),
      storefrontName: w.storefrontName,
      storefrontUserId: w.ownerId,
    });
  }

  for (const w of snapshots.reseller) {
    rows.push({
      id: w.walletId,
      pool: "reseller",
      ownerId: w.resellerId,
      ownerName: w.resellerName,
      ownerLabel: w.resellerName,
      balance: round2(w.balance),
      status: w.status,
      currency: "GHS",
      lastActivityAt: lastActivity(w.lastLedgerIso, w.updatedAt),
      resellerId: w.resellerId,
    });
  }

  for (const w of snapshots.merchant) {
    rows.push({
      id: w.walletId,
      pool: w.walletType === "billing" ? "merchant_billing" : "merchant_main",
      ownerId: w.merchantId,
      ownerName: w.merchantName,
      ownerLabel: w.merchantName,
      balance: round2(w.balance),
      status: w.status,
      currency: "GHS",
      lastActivityAt: lastActivity(w.lastLedgerIso, w.updatedAt),
      merchantId: w.merchantId,
    });
  }

  rows.sort(
    (a, b) =>
      new Date(b.lastActivityAt ?? 0).getTime() -
      new Date(a.lastActivityAt ?? 0).getTime()
  );

  return rows;
}

// ---------------------------------------------------------------------------
// Summary projection
// ---------------------------------------------------------------------------

function summarizePool(
  pool: WalletPoolType,
  rows: RegistryRow[]
): RegistryPoolSummary {
  const inPool = rows.filter((r) => r.pool === pool);
  const total = round2(inPool.reduce((s, r) => s + r.balance, 0));
  return {
    pool,
    walletCount: inPool.length,
    totalBalance: total,
    delta: computeDelta(total, total),
    frozenCount: inPool.filter((r) => r.status === "frozen").length,
  };
}

export function projectRegistrySummary(
  rows: RegistryRow[],
  snapshots: RegistryInputSnapshots
): RegistrySummary {
  const pools: RegistryPoolSummary[] = [
    summarizePool("customer", rows),
    summarizePool("storefront_user", rows),
    summarizePool("reseller", rows),
    summarizePool("merchant_billing", rows),
    summarizePool("merchant_main", rows),
  ];

  const totalBalance = round2(
    pools.reduce((s, p) => s + p.totalBalance, 0)
  );
  const treasuryLiabilities = round2(snapshots.treasuryLiabilities);
  const totalWallets = rows.length;
  const totalFrozen = rows.filter((r) => r.status === "frozen").length;

  return {
    totalBalance,
    totalDelta: computeDelta(totalBalance, totalBalance),
    totalWallets,
    totalFrozen,
    pools,
    grandTotalMatchesTreasury:
      Math.abs(totalBalance - treasuryLiabilities) < 0.01,
    treasuryLiabilities,
    currency: "GHS",
  };
}

// ---------------------------------------------------------------------------
// Filters
// ---------------------------------------------------------------------------

export interface RegistryFilterValues {
  search: string;
  pool: WalletPoolType | "";
  status: WalletStatus | "";
}

export function filterRegistryRows(
  rows: RegistryRow[],
  filters: RegistryFilterValues
): RegistryRow[] {
  const q = filters.search.trim().toLowerCase();
  return rows.filter((r) => {
    if (filters.pool && r.pool !== filters.pool) return false;
    if (filters.status && r.status !== filters.status) return false;
    if (q) {
      const hay = (r.ownerName + " " + r.id + " " + r.ownerId).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}