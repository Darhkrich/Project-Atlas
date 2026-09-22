/* eslint-disable react-hooks/exhaustive-deps */
// lib/admin/hooks/use-merchant-money.ts
//
// Reads the shared merchant money store plus the admin-native overlays
// (disputes, dunning, walletTransactions) and produces the admin view
// state consumed by the payments page and the dashboard.

"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  getMerchantMoneyStoreState,
  subscribeToMerchantMoneyStore,
  isMerchantMoneyStoreLoaded,
} from "@/lib/domains/wallet/merchant-money/store";
import {
  getWalletConfig,
  subscribeToWalletConfig,
  isWalletConfigLoaded,
} from "@/lib/domains/wallet/config-store";
import {
  getMerchantMoneyState as getAdminOverlayState,
  subscribeToMerchantMoney as subscribeToAdminOverlay,
} from "@/lib/admin/mock/merchant-money-store";
import type {
  CheckoutEvent,
  MerchantMoneyState,
  PlanChargeEvent,
  RefundEvent,
} from "@/lib/admin/types/merchant-money";
import type {
  MerchantCustomerPaymentLedgerEntry,
  MerchantPlanChargeLedgerEntry,
  MerchantRefundLedgerEntry,
  MerchantMoneyStoreState,
} from "@/lib/domains/wallet/merchant-money/types";
import { getWalletConfig as readWalletConfig } from "@/lib/domains/wallet/config-store";
import type { WalletAutoApproveConfig } from "@/lib/domains/wallet/enums";

function planChargeToEvent(
  entry: MerchantPlanChargeLedgerEntry
): PlanChargeEvent {
  return {
    id: entry.id,
    kind: "plan_charge",
    merchantId: entry.merchantId,
    planCode: entry.planCode as PlanChargeEvent["planCode"],
    billingCycle: entry.billingCycle,
    amount: entry.amount,
    source: entry.source,
    status: entry.status,
    failureReason: entry.failureReason,
    transactionRef: entry.transactionRef ?? "TXN-" + entry.id,
    createdAt: entry.createdAt,
    completedAt: entry.completedAt,
  };
}

function customerPaymentToCheckout(
  entry: MerchantCustomerPaymentLedgerEntry
): CheckoutEvent {
  const method: CheckoutEvent["method"] =
    entry.paymentMethod.toLowerCase() === "card"
      ? "card"
      : entry.paymentMethod.toLowerCase().includes("mobile")
      ? "momo"
      : entry.paymentMethod.toLowerCase().includes("bank")
      ? "bank"
      : "wallet";
  const status: CheckoutEvent["status"] = entry.settledAt
    ? "successful"
    : "pending";
  return {
    id: entry.id,
    kind: "checkout",
    merchantId: entry.merchantId,
    orderId: entry.relatedOrderId,
    amount: entry.amount,
    method,
    mainWalletId: "MW-" + entry.merchantId + "-M",
    status,
    settledAt: entry.settledAt,
    transactionRef: entry.transactionRef ?? "TXN-" + entry.id,
    createdAt: entry.createdAt,
  };
}

function refundToEvent(entry: MerchantRefundLedgerEntry): RefundEvent {
  return {
    id: entry.id,
    kind: "refund",
    merchantId: entry.merchantId,
    originalPaymentId: entry.relatedOrderId,
    orderId: entry.relatedOrderId,
    amount: entry.amount,
    reason: entry.reason,
    initiatedBy: "merchant",
    customerRail: "momo",
    createdAt: entry.createdAt,
    settledAt: entry.settledAt,
  };
}

function buildWalletsFromShared(
  shared: MerchantMoneyStoreState
): MerchantMoneyState["wallets"] {
  const out: MerchantMoneyState["wallets"] = {};
  for (const merchantId of Object.keys(shared)) {
    const s = shared[merchantId];
    out[merchantId] = { billing: s.billing, main: s.main };
  }
  return out;
}

function buildDestinationsFromShared(
  shared: MerchantMoneyStoreState
): MerchantMoneyState["destinations"] {
  const out: MerchantMoneyState["destinations"] = {};
  for (const merchantId of Object.keys(shared)) {
    const d = shared[merchantId].destination;
    if (d) out[merchantId] = d;
  }
  return out;
}

function buildSavedMethodsFromShared(
  shared: MerchantMoneyStoreState
): MerchantMoneyState["savedMethods"] {
  const out: MerchantMoneyState["savedMethods"] = {};
  for (const merchantId of Object.keys(shared)) {
    out[merchantId] = shared[merchantId].savedMethods;
  }
  return out;
}

function buildAutoPayFromShared(
  shared: MerchantMoneyStoreState
): MerchantMoneyState["autopay"] {
  const out: MerchantMoneyState["autopay"] = {};
  for (const merchantId of Object.keys(shared)) {
    out[merchantId] = shared[merchantId].autoPay;
  }
  return out;
}

function buildWithdrawalsFromShared(
  shared: MerchantMoneyStoreState
): {
  pending: MerchantMoneyState["withdrawals"];
  history: MerchantMoneyState["withdrawalHistory"];
} {
  const pending: MerchantMoneyState["withdrawals"] = [];
  const history: MerchantMoneyState["withdrawalHistory"] = [];
  for (const merchantId of Object.keys(shared)) {
    const s = shared[merchantId];
    for (const r of s.withdrawalRequests) pending.push(r);
    for (const h of s.withdrawalHistory) history.push(h);
  }
  return { pending, history };
}

function buildEventStreamsFromShared(
  shared: MerchantMoneyStoreState
): {
  planCharges: PlanChargeEvent[];
  checkouts: CheckoutEvent[];
  refunds: RefundEvent[];
} {
  const planCharges: PlanChargeEvent[] = [];
  const checkouts: CheckoutEvent[] = [];
  const refunds: RefundEvent[] = [];
  for (const merchantId of Object.keys(shared)) {
    for (const entry of shared[merchantId].ledger) {
      if (entry.kind === "plan_charge") {
        planCharges.push(planChargeToEvent(entry));
      } else if (entry.kind === "customer_payment") {
        checkouts.push(customerPaymentToCheckout(entry));
      } else if (entry.kind === "refund") {
        refunds.push(refundToEvent(entry));
      }
    }
  }
  planCharges.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  checkouts.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  refunds.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return { planCharges, checkouts, refunds };
}

function buildAdminState(): MerchantMoneyState {
  const shared = getMerchantMoneyStoreState();
  const overlay = getAdminOverlayState();
  const config: WalletAutoApproveConfig = getWalletConfig();

  const wallets = buildWalletsFromShared(shared);
  const destinations = buildDestinationsFromShared(shared);
  const savedMethods = buildSavedMethodsFromShared(shared);
  const autopay = buildAutoPayFromShared(shared);
  const { pending, history } = buildWithdrawalsFromShared(shared);
  const { planCharges, checkouts, refunds } =
    buildEventStreamsFromShared(shared);

  return {
    wallets,
    walletTransactions: overlay.walletTransactions,
    destinations,
    savedMethods,
    autopay,
    withdrawals: pending,
    withdrawalHistory: history,
    planCharges,
    checkouts,
    refunds,
    disputes: overlay.disputes,
    dunning: overlay.dunning,
    config,
  };
}

// useSyncExternalStore wants a stable snapshot. Cache by reference so
// repeated calls within a render return the same object until a
// subscription fires.
let cachedSnapshot: MerchantMoneyState | null = null;
let cachedSharedVersion = -1;
let cachedOverlayVersion = -1;
let cachedConfigVersion = -1;
let sharedVersion = 0;
let overlayVersion = 0;
let configVersion = 0;

function subscribe(
  onStoreChange: () => void
): () => void {
  const unsubShared = subscribeToMerchantMoneyStore(() => {
    sharedVersion++;
    onStoreChange();
  });
  const unsubOverlay = subscribeToAdminOverlay(() => {
    overlayVersion++;
    onStoreChange();
  });
  const unsubConfig = subscribeToWalletConfig(() => {
    configVersion++;
    onStoreChange();
  });
  return () => {
    unsubShared();
    unsubOverlay();
    unsubConfig();
  };
}

function getSnapshot(): MerchantMoneyState {
  if (
    cachedSnapshot &&
    cachedSharedVersion === sharedVersion &&
    cachedOverlayVersion === overlayVersion &&
    cachedConfigVersion === configVersion
  ) {
    return cachedSnapshot;
  }
  cachedSnapshot = buildAdminState();
  cachedSharedVersion = sharedVersion;
  cachedOverlayVersion = overlayVersion;
  cachedConfigVersion = configVersion;
  return cachedSnapshot;
}

function getServerSnapshot(): MerchantMoneyState {
  return buildAdminState();
}

export function useMerchantMoney() {
  const state = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const loading = useMemo(
    () =>
      !isMerchantMoneyStoreLoaded() ||
      !isWalletConfigLoaded(),
    [state]
  );

  return {
    state,
    loading,
    wallets: state.wallets,
    walletTransactions: state.walletTransactions,
    destinations: state.destinations,
    savedMethods: state.savedMethods,
    autopay: state.autopay,
    withdrawals: state.withdrawals,
    withdrawalHistory: state.withdrawalHistory,
    planCharges: state.planCharges,
    checkouts: state.checkouts,
    refunds: state.refunds,
    disputes: state.disputes,
    dunning: state.dunning,
    config: state.config,
  };
}

// Keep readWalletConfig referenced so the import is retained for later
// batches that read config through a helper.
void readWalletConfig;