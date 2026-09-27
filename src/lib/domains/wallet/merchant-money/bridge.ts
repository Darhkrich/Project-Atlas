// lib/domains/wallet/merchant-money/bridge.ts
//
// Admin-native events (storefront checkouts, plan charges, refunds) live
// in admin-owned stores. When those events touch merchant wallet money,
// they call into this bridge.
//
// Layer 3 A1: every bridge call writes one audit entry. The bridge is
// always invoked by a system process (order settlement pipeline, plan
// billing scheduler, refund flow), so the audit actor is SYSTEM.

import { getMerchantWalletState, internalAppendLedgerEntry } from "./store";
import type {
  MerchantCustomerPaymentLedgerEntry,
  MerchantPlanChargeLedgerEntry,
  MerchantRefundLedgerEntry,
} from "./types";
import { emitLedgerEvent } from "@/lib/domains/treasury/emit";
import type {
  TreasuryActor,
  TreasuryCounterparty,
} from "@/lib/domains/treasury/types";
import { appendAuditEntry } from "@/lib/domains/audit";

const SYSTEM_ACTOR: TreasuryActor = {
  id: "system",
  name: "System",
  email: "system@atlas.com",
};

function merchantCounterparty(
  merchantId: string,
  merchantName: string
): TreasuryCounterparty {
  return { type: "merchant", id: merchantId, name: merchantName };
}

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

  emitLedgerEvent({
    kind: "storefront_order_credit",
    direction: "in",
    amount: input.amount,
    poolType: "merchant_main",
    ownerId: input.merchantId,
    counterparty: merchantCounterparty(
      input.merchantId,
      state.main.merchantName
    ),
    reference: input.transactionRef ?? input.orderId,
    description:
      "Storefront order credit: " +
      input.orderNumber +
      " via " +
      input.paymentMethod,
    actor: SYSTEM_ACTOR,
    relatedEventId: entry.id,
    settledAt: input.settledAt ?? input.createdAt,
  });

  appendAuditEntry({
    action: "wallet.merchant.checkout_credit",
    resourceType: "wallet",
    resourceId: input.merchantId,
    actor: SYSTEM_ACTOR,
    metadata: {
      orderId: input.orderId,
      amount: input.amount,
      method: input.paymentMethod,
    },
  });

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

      appendAuditEntry({
        action: "wallet.merchant.plan_charge",
        resourceType: "wallet",
        resourceId: input.merchantId,
        actor: SYSTEM_ACTOR,
        metadata: {
          planCode: input.planCode,
          amount: input.amount,
          outcome: "failed_insufficient_billing_balance",
        },
      });

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

  if (input.status === "successful") {
    emitLedgerEvent({
      kind: "internal_reclassification",
      direction: "internal",
      amount: input.amount,
      poolType: "merchant_billing",
      ownerId: input.merchantId,
      counterparty: merchantCounterparty(
        input.merchantId,
        state.billing.merchantName
      ),
      reference: input.transactionRef ?? input.id,
      description:
        "Plan charge: " + input.planCode + " (" + input.billingCycle + ")",
      actor: SYSTEM_ACTOR,
      relatedEventId: entry.id,
      settledAt: input.completedAt ?? input.createdAt,
    });
  }

  appendAuditEntry({
    action: "wallet.merchant.plan_charge",
    resourceType: "wallet",
    resourceId: input.merchantId,
    actor: SYSTEM_ACTOR,
    metadata: {
      planCode: input.planCode,
      amount: input.amount,
      outcome: input.status,
    },
  });

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

  if (settlesNow) {
    emitLedgerEvent({
      kind: "refund_rail_debit",
      direction: "out",
      amount: input.amount,
      poolType: "merchant_main",
      ownerId: input.merchantId,
      counterparty: merchantCounterparty(
        input.merchantId,
        state.main.merchantName
      ),
      reference: input.transactionRef ?? input.id,
      description:
        "Merchant refund to customer: " +
        input.orderNumber +
        " (" +
        input.reason +
        ")",
      actor: SYSTEM_ACTOR,
      relatedEventId: entry.id,
      settledAt: input.settledAt!,
    });

    appendAuditEntry({
      action: "wallet.merchant.refund_settled",
      resourceType: "wallet",
      resourceId: input.merchantId,
      actor: SYSTEM_ACTOR,
      metadata: {
        orderId: input.orderId,
        amount: input.amount,
        reason: input.reason,
      },
    });
  }

  return { ok: true };
}