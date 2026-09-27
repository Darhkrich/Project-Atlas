// lib/domains/treasury/liabilities.ts
//
// Live liability join. Sums every wallet balance Atlas owes to its
// users across the five user-facing pools, plus the provider settlement
// pool which is derived from treasury events.
//
// This file lives under lib/domains/ so both admin and public can read
// it. Public wallet stores expose a getter; the join reads it. No state
// is written here.

import { getCustomerWalletStore } from "@/lib/customer/mock/wallet-store";
import { getStorefrontUserState } from "@/lib/domains/wallet/storefront-user-state";
import { getResellerWalletStore } from "@/lib/reseller/mock/wallet-store";
import { getMerchantMoneyStoreState } from "@/lib/domains/wallet/merchant-money/store";
import type { TreasuryEvent } from "./types";
import { PROVIDER_SETTLEMENT_POOL } from "./pools";

export interface LiabilityBreakdown {
  customer: number;
  storefront_user: number;
  reseller: number;
  merchant_billing: number;
  merchant_main: number;
  /**
   * Derived from treasury events. Populated by the money-flow wiring
   * batch. Zero when events are not supplied.
   */
  provider_settlement_pending: number;
  userTotal: number;
  total: number;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function computeLiabilities(
  treasuryEvents?: TreasuryEvent[]
): LiabilityBreakdown {
  const customer = sumCustomerWallets();
  const storefrontUser = sumStorefrontUserWallets();
  const reseller = sumResellerWallets();
  const { billing, main } = sumMerchantWallets();

  const userTotal = round2(
    customer + storefrontUser + reseller + billing + main
  );

  const providerPending = treasuryEvents
    ? sumProviderObligation(treasuryEvents)
    : 0;

  return {
    customer,
    storefront_user: storefrontUser,
    reseller,
    merchant_billing: billing,
    merchant_main: main,
    provider_settlement_pending: providerPending,
    userTotal,
    total: round2(userTotal + providerPending),
  };
}

/**
 * User-facing liabilities only. Sum of the five user pools.
 */
export function computeUserLiabilities(): number {
  return computeLiabilities().userTotal;
}

/**
 * @deprecated Legacy name. Returns user liabilities only, not the
 * provider obligation. Use computeUserLiabilities for the user sum, or
 * computeCoverageLiabilities(events) for the coverage denominator.
 */
export function computeTotalLiabilities(): number {
  return computeUserLiabilities();
}

/**
 * Coverage denominator. User liabilities plus the provider settlement
 * obligation derived from treasury events. Section 4 coverage math uses
 * this number.
 */
export function computeCoverageLiabilities(
  treasuryEvents: TreasuryEvent[]
): number {
  return computeLiabilities(treasuryEvents).total;
}

export function computeProviderObligation(
  treasuryEvents: TreasuryEvent[]
): number {
  return sumProviderObligation(treasuryEvents);
}

// ---------------------------------------------------------------------------
// Pool readers
// ---------------------------------------------------------------------------

function sumProviderObligation(events: TreasuryEvent[]): number {
  let total = 0;
  for (const event of events) {
    if (event.poolType !== PROVIDER_SETTLEMENT_POOL) continue;
    if (event.kind === "internal_reclassification") {
      total += event.amount;
    } else if (event.kind === "provider_payout_debit") {
      total -= event.amount;
    }
  }
  return round2(total);
}

function sumCustomerWallets(): number {
  const store = getCustomerWalletStore();
  let total = 0;
  for (const id of Object.keys(store.wallets)) {
    const wallet = store.wallets[id];
    if (!wallet) continue;
    total += wallet.balance;
  }
  return round2(total);
}

function sumStorefrontUserWallets(): number {
  const state = getStorefrontUserState();
  let total = 0;
  for (const id of Object.keys(state.wallets)) {
    const wallet = state.wallets[id];
    if (!wallet) continue;
    total += wallet.balance;
  }
  return round2(total);
}

function sumResellerWallets(): number {
  const store = getResellerWalletStore();
  let total = 0;
  for (const id of Object.keys(store.wallets)) {
    const wallet = store.wallets[id];
    if (!wallet) continue;
    total += wallet.balance;
  }
  return round2(total);
}

function sumMerchantWallets(): { billing: number; main: number } {
  const store = getMerchantMoneyStoreState();
  let billing = 0;
  let main = 0;
  for (const merchantId of Object.keys(store)) {
    const state = store[merchantId];
    if (!state) continue;
    billing += state.billing.balance;
    main += state.main.balance;
  }
  return { billing: round2(billing), main: round2(main) };
}