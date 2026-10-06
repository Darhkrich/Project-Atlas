// lib/domains/wallet/merchant-money/refund-mutations.ts
//
// Merchant refund money write. Separate file from mutations.ts to avoid
// rewriting a 700-line module for an append. The two files share the
// same store, the same audit pattern, and the same treasury emission
// rules. Registered for a merge in a cleanup batch.
//
// A merchant refund debits the merchant main wallet and emits a
// treasury refund_rail_debit. The customer is credited on the original
// rail, not via an Atlas wallet, since merchant storefront customers
// have no wallet.
//
// Atlas takes zero cut on merchant refunds. No atlasShareAmount, no
// resellerShareAmount, no resellerRecovery.

import { appendAuditEntry } from "@/lib/domains/audit";
import { emitLedgerEvent } from "@/lib/domains/treasury/emit";
import type { TreasuryActor } from "@/lib/domains/treasury/types";
import {
  getMerchantWalletState,
  internalAppendLedgerEntry,
  internalPatchWalletMeta,
} from "./store";
import type {
  MerchantMoneyActor,
  MerchantRefundLedgerEntry,
} from "./types";

export interface RecordMerchantRefundInput {
  merchantId: string;
  amount: number;
  orderId: string;
  orderNumber: string;
  customerEmail: string;
  reason: string;
  originalSettlementEventId?: string;
}

export interface RecordMerchantRefundResult {
  ok: boolean;
  error?: string;
  ledgerEntryId?: string;
  treasuryEventId?: string;
  reference?: string;
}

function toTreasuryActor(actor: MerchantMoneyActor): TreasuryActor {
  return { id: actor.id, name: actor.name, email: actor.email };
}

export function recordMerchantRefund(
  input: RecordMerchantRefundInput,
  actor: MerchantMoneyActor
): RecordMerchantRefundResult {
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    return { ok: false, error: "Enter a valid refund amount." };
  }

  const state = getMerchantWalletState(input.merchantId);
  if (!state) {
    return { ok: false, error: "Merchant wallet not found." };
  }

  if (state.main.status === "frozen") {
    return { ok: false, error: "Your main wallet is frozen." };
  }

  if (state.main.balance < input.amount) {
    return {
      ok: false,
      error: "Your main wallet balance does not cover this refund.",
    };
  }

  const nowIso = new Date().toISOString();
  const reference = "RFD-" + crypto.randomUUID().slice(0, 8).toUpperCase();
  const entryId = "ML-RF-" + crypto.randomUUID().slice(0, 8).toUpperCase();

  const entry: MerchantRefundLedgerEntry = {
    id: entryId,
    merchantId: input.merchantId,
    walletType: "main",
    kind: "refund",
    amount: input.amount,
    relatedOrderId: input.orderId,
    relatedOrderNumber: input.orderNumber,
    customerEmail: input.customerEmail,
    reason: input.reason,
    createdAt: nowIso,
    settledAt: nowIso,
    transactionRef: reference,
  };

  internalAppendLedgerEntry(entry);
  internalPatchWalletMeta(input.merchantId, "main", {
    updatedAt: nowIso,
    lastDebitAt: nowIso,
  });

  const treasuryEvent = emitLedgerEvent({
    kind: "refund_rail_debit",
    direction: "out",
    amount: input.amount,
    poolType: "merchant_main",
    ownerId: input.merchantId,
    counterparty: {
      type: "customer",
      id: input.customerEmail,
      name: input.customerEmail,
    },
    reference,
    description:
      "Merchant refund for order " + input.orderNumber + ".",
    actor: toTreasuryActor(actor),
    relatedEventId: input.originalSettlementEventId,
    settledAt: nowIso,
  });

  appendAuditEntry({
    action: "wallet.merchant.refund_settled",
    resourceType: "wallet",
    resourceId: input.merchantId,
    actor: {
      id: actor.id,
      name: actor.name,
      email: actor.email,
    },
    metadata: {
      amount: input.amount,
      orderId: input.orderId,
      orderNumber: input.orderNumber,
      reference,
    },
  });

  return {
    ok: true,
    ledgerEntryId: entryId,
    treasuryEventId: treasuryEvent.id,
    reference,
  };
}