// lib/domains/wallet/merchant-money/bridge.ts
//
// Admin-native events (storefront checkouts, plan charges, refunds) live
// in admin-owned stores. When those events touch merchant wallet money,
// they call into this bridge. The bridge writes a ledger entry in the
// shared merchant money store so balance derivation sees the movement.
//
// Every debit is gated on the running balance. A bridge call that would
// drive a wallet negative is rejected. No ledger entry is written for a
// rejected debit. The caller decides what to show the merchant or the
// admin.

import { getMerchantWalletState, internalAppendLedgerEntry } from "./store";
import type {
  MerchantCustomerPaymentLedgerEntry,
  MerchantPlanChargeLedgerEntry,
  MerchantRefundLedgerEntry,
} from "./types";

export interface BridgeResult {
  ok: boolean;
  error?: string;
}

export interface CheckoutBridgeInput {
  id: string;
  merchantId: string;
  orderId: string;
  orderNumber: string;
  customerEmail: string;
  amount: number;
  paymentMethod: string;
  paymentProvider?: string;
  createdAt: string;
  settledAt?: string;
  transactionRef?: string;
}

export function bridgeCheckoutToLedger(
  input: CheckoutBridgeInput
): BridgeResult {
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    return { ok: false, error: "Checkout amount must be a positive number." };
  }

  const state = getMerchantWalletState(input.merchantId);
  if (!state) return { ok: false, error: "Merchant wallet not found." };

  const entry: MerchantCustomerPaymentLedgerEntry = {
    id: "ML-CO-" + input.id,
    merchantId: input.merchantId,
    walletType: "main",
    kind: "customer_payment",
    amount: input.amount,
    relatedOrderId: input.orderId,
    relatedOrderNumber: input.orderNumber,
    customerEmail: input.customerEmail,
    paymentMethod: input.paymentMethod,
    paymentProvider: input.paymentProvider,
    createdAt: input.createdAt,
    settledAt: input.settledAt,
    transactionRef: input.transactionRef,
  };
  internalAppendLedgerEntry(entry);
  return { ok: true };
}

export interface PlanChargeBridgeInput {
  id: string;
  merchantId: string;
  planCode: string;
  billingCycle: "monthly" | "annual";
  amount: number;
  status: "successful" | "failed" | "pending";
  source: "billing_wallet" | "card";
  failureReason?: string;
  createdAt: string;
  completedAt?: string;
  transactionRef?: string;
}

export function bridgePlanChargeToLedger(
  input: PlanChargeBridgeInput
): BridgeResult {
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    return { ok: false, error: "Plan charge amount must be positive." };
  }

  const state = getMerchantWalletState(input.merchantId);
  if (!state) return { ok: false, error: "Merchant wallet not found." };

  // A successful plan charge debits the billing wallet. If the billing
  // wallet cannot cover it, write a failed entry instead. The attempt is
  // recorded so the merchant and admin both see it, but no money moves.
  if (input.status === "successful") {
    const billing = state.billing;
    if (billing.balance < input.amount) {
      const failedEntry: MerchantPlanChargeLedgerEntry = {
        id: "ML-PC-" + input.id,
        merchantId: input.merchantId,
        walletType: "billing",
        kind: "plan_charge",
        amount: input.amount,
        planCode: input.planCode,
        billingCycle: input.billingCycle,
        status: "failed",
        failureReason: "insufficient_billing_balance",
        source: input.source,
        createdAt: input.createdAt,
        transactionRef: input.transactionRef,
      };
      internalAppendLedgerEntry(failedEntry);
      return {
        ok: false,
        error:
          "Insufficient billing balance. Plan charge recorded as failed.",
      };
    }
  }

  const entry: MerchantPlanChargeLedgerEntry = {
    id: "ML-PC-" + input.id,
    merchantId: input.merchantId,
    walletType: "billing",
    kind: "plan_charge",
    amount: input.amount,
    planCode: input.planCode,
    billingCycle: input.billingCycle,
    status: input.status,
    failureReason: input.failureReason,
    source: input.source,
    createdAt: input.createdAt,
    completedAt: input.completedAt,
    transactionRef: input.transactionRef,
  };
  internalAppendLedgerEntry(entry);
  return { ok: true };
}

export interface RefundBridgeInput {
  id: string;
  merchantId: string;
  orderId: string;
  orderNumber: string;
  customerEmail: string;
  amount: number;
  reason: string;
  createdAt: string;
  settledAt?: string;
  transactionRef?: string;
}

export function bridgeRefundToLedger(
  input: RefundBridgeInput
): BridgeResult {
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    return { ok: false, error: "Refund amount must be positive." };
  }

  const state = getMerchantWalletState(input.merchantId);
  if (!state) return { ok: false, error: "Merchant wallet not found." };

  // Only settled refunds debit. A processing refund has no balance
  // impact yet. When it later settles, that call passes settledAt.
  const settlesNow = Boolean(input.settledAt);
  if (settlesNow && state.main.balance < input.amount) {
    return {
      ok: false,
      error: "Merchant main wallet balance does not cover this refund.",
    };
  }

  const entry: MerchantRefundLedgerEntry = {
    id: "ML-RF-" + input.id,
    merchantId: input.merchantId,
    walletType: "main",
    kind: "refund",
    amount: input.amount,
    relatedOrderId: input.orderId,
    relatedOrderNumber: input.orderNumber,
    customerEmail: input.customerEmail,
    reason: input.reason,
    createdAt: input.createdAt,
    settledAt: input.settledAt,
    transactionRef: input.transactionRef,
  };
  internalAppendLedgerEntry(entry);
  return { ok: true };
}