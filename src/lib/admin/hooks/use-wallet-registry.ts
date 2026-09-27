/* eslint-disable react-hooks/set-state-in-effect */
// lib/admin/hooks/use-wallet-registry.ts
//
// Read hook over the four authoritative wallet stores. Normalizes every
// pool to one row shape and produces the registry summary.
//
// Does not import any mutation module. Read-only.

"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getCustomerWalletStore,
  isCustomerWalletStoreLoaded,
  subscribeToCustomerWalletStore,
} from "@/lib/customer/mock/wallet-store";
import {
  getStorefrontUserState,
  isStorefrontUserStateLoaded,
  subscribeToStorefrontUserState,
} from "@/lib/domains/wallet/storefront-user-state";
import {
  getResellerWalletStore,
  isResellerWalletStoreLoaded,
  subscribeToResellerWalletStore,
} from "@/lib/reseller/mock/wallet-store";
import {
  getMerchantMoneyStoreState,
  isMerchantMoneyStoreLoaded,
  subscribeToMerchantMoneyStore,
} from "@/lib/domains/wallet/merchant-money/store";
import { computeTotalLiabilities } from "@/lib/domains/treasury/liabilities";
import { useNow } from "@/lib/shared/hooks/use-now";
import {
  filterRegistryRows,
  projectRegistryRows,
  projectRegistrySummary,
  type CustomerWalletSnapshot,
  type MerchantWalletSnapshot,
  type RegistryInputSnapshots,
  type ResellerWalletSnapshot,
  type StorefrontWalletSnapshot,
} from "@/lib/admin/wallets/registry-projection";
import type {
  RegistryFilterValues,
} from "@/lib/admin/wallets/registry-projection";
import type {
  RegistryRow,
  RegistrySummary,
} from "@/lib/admin/wallets/registry-types";

export interface UseWalletRegistryResult {
  rows: RegistryRow[];
  allRows: RegistryRow[];
  summary: RegistrySummary;
  loading: boolean;
  error: Error | null;
  nowMs: number | null;
}

// ---------------------------------------------------------------------------
// Latest timestamp helpers
// ---------------------------------------------------------------------------

function latestIso(
  isos: Array<string | null | undefined>
): string | null {
  let best = 0;
  let bestIso: string | null = null;
  for (const iso of isos) {
    if (!iso) continue;
    const t = new Date(iso).getTime();
    if (!Number.isFinite(t)) continue;
    if (t > best) {
      best = t;
      bestIso = iso;
    }
  }
  return bestIso;
}

// ---------------------------------------------------------------------------
// Snapshot builders. One per pool.
// ---------------------------------------------------------------------------

function buildCustomerSnapshots(): CustomerWalletSnapshot[] {
  const store = getCustomerWalletStore();
  const out: CustomerWalletSnapshot[] = [];

  for (const key of Object.keys(store.wallets)) {
    const w = store.wallets[key];
    if (!w) continue;
    const funding = store.fundingTransactions.filter(
      (f) => f.customerId === w.customerId
    );
    const withdrawals = store.withdrawalHistory.filter(
      (h) => h.customerId === w.customerId
    );
    const lastLedgerIso = latestIso([
      ...funding.map((f) => f.createdAt),
      ...withdrawals.map((h) => h.resolvedAt),
    ]);
    out.push({
      walletId: w.id,
      customerId: w.customerId,
      customerName: w.customerName,
      balance: w.balance,
      status: w.status,
      currency: "GHS",
      updatedAt: w.updatedAt ?? null,
      lastLedgerIso,
    });
  }

  return out;
}

function buildStorefrontSnapshots(): StorefrontWalletSnapshot[] {
  const state = getStorefrontUserState();
  const out: StorefrontWalletSnapshot[] = [];

  for (const key of Object.keys(state.wallets)) {
    const w = state.wallets[key];
    if (!w) continue;
    const funding = state.fundingLedger.filter(
      (f) => f.walletId === w.id && f.kind === "funding"
    );
    const refunds = state.refundHistory.filter((h) => h.walletId === w.id);
    const lastLedgerIso = latestIso([
      ...funding.map((f) => f.createdAt),
      ...refunds.map((h) => h.resolvedAt ?? h.requestedAt),
    ]);
    out.push({
      walletId: w.id,
      ownerId: w.ownerId,
      ownerName: w.ownerName,
      storefrontId: w.storefrontId,
      storefrontName: w.storefrontName,
      balance: w.balance,
      status: w.status,
      currency: "GHS",
      updatedAt: w.updatedAt ?? null,
      lastLedgerIso,
    });
  }

  return out;
}

function buildResellerSnapshots(): ResellerWalletSnapshot[] {
  const store = getResellerWalletStore();
  const out: ResellerWalletSnapshot[] = [];

  for (const key of Object.keys(store.wallets)) {
    const w = store.wallets[key];
    if (!w) continue;
    const ledger = store.ledger.filter((e) => e.resellerId === w.resellerId);
    const lastLedgerIso = latestIso(ledger.map((e) => e.createdAt));
    out.push({
      walletId: w.id,
      resellerId: w.resellerId,
      resellerName: w.resellerName,
      balance: w.balance,
      status: w.status,
      currency: "GHS",
      updatedAt: w.updatedAt ?? null,
      lastLedgerIso,
    });
  }

  return out;
}

function buildMerchantSnapshots(): MerchantWalletSnapshot[] {
  const store = getMerchantMoneyStoreState();
  const out: MerchantWalletSnapshot[] = [];

  for (const merchantId of Object.keys(store)) {
    const state = store[merchantId];
    if (!state) continue;

    const billingLedger = state.ledger.filter(
      (e) => e.walletType === "billing"
    );
    const mainLedger = state.ledger.filter((e) => e.walletType === "main");

    out.push({
      walletId: state.billing.id,
      merchantId: state.billing.merchantId,
      merchantName: state.billing.merchantName,
      walletType: "billing",
      balance: state.billing.balance,
      status: state.billing.status,
      currency: "GHS",
      updatedAt: state.billing.updatedAt ?? null,
      lastLedgerIso: latestIso(billingLedger.map((e) => e.createdAt)),
    });

    out.push({
      walletId: state.main.id,
      merchantId: state.main.merchantId,
      merchantName: state.main.merchantName,
      walletType: "main",
      balance: state.main.balance,
      status: state.main.status,
      currency: "GHS",
      updatedAt: state.main.updatedAt ?? null,
      lastLedgerIso: latestIso(mainLedger.map((e) => e.createdAt)),
    });
  }

  return out;
}

function buildSnapshots(): RegistryInputSnapshots {
  let treasuryLiabilities = 0;
  try {
    treasuryLiabilities = computeTotalLiabilities();
  } catch {
    treasuryLiabilities = 0;
  }
  return {
    customer: buildCustomerSnapshots(),
    storefront: buildStorefrontSnapshots(),
    reseller: buildResellerSnapshots(),
    merchant: buildMerchantSnapshots(),
    treasuryLiabilities,
  };
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useWalletRegistry(
  filters?: RegistryFilterValues
): UseWalletRegistryResult {
  const nowMs = useNow();
  const [tick, setTick] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(
      isCustomerWalletStoreLoaded() &&
        isStorefrontUserStateLoaded() &&
        isResellerWalletStoreLoaded() &&
        isMerchantMoneyStoreLoaded()
    );
    const a = subscribeToCustomerWalletStore(() => setTick((x) => x + 1));
    const b = subscribeToStorefrontUserState(() => setTick((x) => x + 1));
    const c = subscribeToResellerWalletStore(() => setTick((x) => x + 1));
    const d = subscribeToMerchantMoneyStore(() => setTick((x) => x + 1));
    return () => {
      a();
      b();
      c();
      d();
    };
  }, []);

  const snapshots = useMemo(() => buildSnapshots(), [tick]);

  const allRows = useMemo(
    () => projectRegistryRows(snapshots),
    [snapshots]
  );

  const rows = useMemo(
    () =>
      filters ? filterRegistryRows(allRows, filters) : allRows,
    [allRows, filters]
  );

  const summary = useMemo(
    () => projectRegistrySummary(allRows, snapshots),
    [allRows, snapshots]
  );

  return {
    rows,
    allRows,
    summary,
    loading: !loaded,
    error: null,
    nowMs,
  };
}