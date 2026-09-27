// lib/admin/mock/merchant-money-store.ts
//
// Admin overlay store for merchant money. Holds only the data that has
// no home in the shared merchant money store: wallet transactions
// (legacy admin-only ledger), disputes, and dunning events.
//
// Every other merchant money concept (wallets, withdrawals, plan charges,
// checkouts, refunds, destinations, cards, auto-pay, config) lives in the
// shared store at lib/domains/wallet/merchant-money/. This file no longer
// holds a parallel copy.
//
// Rename candidate: merchant-money-overlay-store.ts. Deferred to cleanup.

import type {
  DisputeEvent,
  DunningEvent,
  MerchantWalletTransaction,
} from "../types/merchant-money";

const REFERENCE_NOW_MS = Date.now();
const HOUR = 3_600_000;
const DAY = 86_400_000;

const ago = (ms: number) => new Date(REFERENCE_NOW_MS - ms).toISOString();

export interface MerchantMoneyOverlayState {
  walletTransactions: MerchantWalletTransaction[];
  disputes: DisputeEvent[];
  dunning: DunningEvent[];
}

function seedDisputes(): DisputeEvent[] {
  return [
    {
      id: "DP-0001",
      merchantId: "MER-006",
      type: "customer_refund_dispute",
      relatedPaymentId: "CO-0020",
      openedAt: ago(DAY * 1),
      openedBy: "customer",
      status: "open",
    },
    {
      id: "DP-0002",
      merchantId: "MER-013",
      type: "merchant_refuses_refund",
      openedAt: ago(DAY * 5),
      openedBy: "customer",
      status: "resolved",
      resolutionNote: "Merchant issued full refund after review.",
      resolvedAt: ago(DAY * 3),
      resolvedBy: "ops@atlas.com",
    },
  ];
}

function seedDunning(): DunningEvent[] {
  // Dunning entries reference plan charges by ID. The plan charges now
  // live in the shared merchant money store. The link is soft: the ID
  // is a reference, not a join. Fixing the ID generation to match the
  // shared store's charge IDs is a follow-up.
  const out: DunningEvent[] = [];
  const merchants = [
    { id: "MER-003" },
    { id: "MER-009" },
    { id: "MER-012" },
    { id: "MER-016" },
  ];
  let n = 1;
  for (const m of merchants) {
    const planCharge = `PC-${String(n).padStart(4, "0")}`;
    const channels: DunningEvent["channel"][] = ["email", "sms", "app"];
    for (const channel of channels) {
      out.push({
        id: `DN-${String(n).padStart(4, "0")}`,
        merchantId: m.id,
        planChargeId: planCharge,
        channel,
        sentAt: ago(DAY * 3),
        acknowledged: false,
      });
      n++;
    }
  }
  return out;
}

function seedWalletTransactions(): MerchantWalletTransaction[] {
  return [
    {
      id: "WT-0001",
      merchantId: "MER-001",
      walletType: "main",
      direction: "credit",
      amount: 350,
      balanceAfter: 800,
      rail: "card",
      relatedEventId: "CO-0001",
      relatedEventKind: "checkout",
      status: "completed",
      actorType: "customer",
      createdAt: ago(HOUR * 3),
    },
    {
      id: "WT-0002",
      merchantId: "MER-001",
      walletType: "main",
      direction: "credit",
      amount: 120,
      balanceAfter: 800,
      rail: "momo",
      relatedEventId: "CO-0002",
      relatedEventKind: "checkout",
      status: "completed",
      actorType: "customer",
      createdAt: ago(DAY),
    },
    {
      id: "WT-0003",
      merchantId: "MER-001",
      walletType: "billing",
      direction: "debit",
      amount: 400,
      balanceAfter: 400,
      rail: "internal_transfer",
      relatedEventId: "PC-0001",
      relatedEventKind: "plan_charge",
      status: "completed",
      actorType: "system",
      createdAt: ago(DAY * 30),
    },
  ];
}

function loadSeed(): MerchantMoneyOverlayState {
  return {
    walletTransactions: seedWalletTransactions(),
    disputes: seedDisputes(),
    dunning: seedDunning(),
  };
}

let store: MerchantMoneyOverlayState | null = null;
const listeners = new Set<() => void>();

function ensureStore(): MerchantMoneyOverlayState {
  if (!store) {
    store = structuredClone(loadSeed());
  }
  return store;
}

function notify() {
  for (const fn of listeners) fn();
}

export function getMerchantMoneyState(): MerchantMoneyOverlayState {
  return ensureStore();
}

export function subscribeToMerchantMoney(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function internalAddWalletTransaction(
  tx: MerchantWalletTransaction
): MerchantWalletTransaction {
  const s = ensureStore();
  s.walletTransactions = [tx, ...s.walletTransactions];
  notify();
  return tx;
}

export function internalPatchDispute(
  id: string,
  updater: (d: DisputeEvent) => DisputeEvent
): DisputeEvent | null {
  const s = ensureStore();
  const idx = s.disputes.findIndex((d) => d.id === id);
  if (idx === -1) return null;
  const next = [...s.disputes];
  next[idx] = updater(s.disputes[idx]);
  s.disputes = next;
  notify();
  return next[idx];
}

export function resetForTest(): void {
  store = structuredClone(loadSeed());
  notify();
}