// lib/domains/wallet/merchant-money/ensure.ts
//
// Auto-create a merchant wallet on first read. Called by the merchant
// wallet hook when a signed-in merchant has no state in the store. Seed
// merchants (MER-001 through MER-020) keep their seeded state; new
// merchants start clean.
//
// Idempotent. If the merchant already has state, returns it unchanged.

import {
  getMerchantMoneyStoreState,
  internalUpsertMerchantState,
} from "./store";
import { buildBlankAutoPayConfig, buildWalletRecord } from "./seed";
import type { MerchantWalletState } from "./types";

export function ensureMerchantWallet(
  merchantId: string,
  merchantName: string
): MerchantWalletState {
  const s = getMerchantMoneyStoreState();
  const existing = s[merchantId];
  if (existing) return existing;

  const nowMs = Date.now();
  const created: MerchantWalletState = {
    billing: buildWalletRecord(merchantId, merchantName, "billing", nowMs),
    main: buildWalletRecord(merchantId, merchantName, "main", nowMs),
    ledger: [],
    withdrawalRequests: [],
    withdrawalHistory: [],
    destination: null,
    savedMethods: [],
    autoPay: buildBlankAutoPayConfig(nowMs),
  };
  internalUpsertMerchantState(merchantId, created);
  return created;
}