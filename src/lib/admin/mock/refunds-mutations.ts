// Refund mutations. Order refunds only. Wallet deposit refunds live on
// each pool's own wallet-mutations file.
//
// Destination rule:
//   - wallet: credit the payer's wallet. No treasury event.
//   - original_rail: fire refund_rail_debit. No wallet credit.
//
// Order refund recipient map:
//   direct           -> customer wallet
//   storefront_user  -> storefront user wallet (compound key)
//   reseller         -> reseller wallet

import type { Order } from "../types/orders";
import type {
  CustomerRefundHistoryItem,
  Refund,
  RefundActor,
  RefundReason,
  RefundSettlement,
} from "../types/refund";
import {
  getRefunds,
  internalAppendRefund,
  internalReplaceRefund,
  notifyRefunds,
} from "./refunds-store";
import { splitFor } from "../refunds/refunds-helpers";
import { appendAuditEntry } from "@/lib/domains/audit";
import { emitLedgerEvent } from "@/lib/domains/treasury/emit";
import type {
  TreasuryActor,
  TreasuryCounterparty,
} from "@/lib/domains/treasury/types";
import { creditCustomerWallet } from "@/lib/customer/wallet/wallet-mutations";
import { creditResellerWallet } from "@/lib/reseller/wallet/wallet-mutations";
import { creditStorefrontUserWallet } from "@/lib/domains/wallet/storefront-user-refund-mutations";
import { walletIdFor } from "@/lib/domains/wallet/storefront-user-types";

interface ActivityEntry {
  refundId: string;
  audience: Refund["audience"];
  message: string;
}

function writeActivity(entry: ActivityEntry): void {
  if (typeof console !== "undefined") {
    console.warn("[activity]", entry);
  }
}

function newId(prefix: string): string {
  return prefix + "-" + crypto.randomUUID().slice(0, 8).toUpperCase();
}

function buildCustomerHistory(
  customerId: string,
  excludeRefundId?: string
): CustomerRefundHistoryItem[] {
  return getRefunds()
    .filter((r) => r.customer.id === customerId && r.id !== excludeRefundId)
    .map((r) => ({
      id: r.id,
      orderId: r.order.orderId,
      amount: r.amount,
      status: r.status,
      date: r.requestedAt,
    }));
}

function audienceFromOrder(order: Order): Refund["audience"] {
  return order.audience;
}

function customerForOrder(order: Order): { id: string; name: string } {
  if (order.audience === "direct") {
    return { id: order.customerId ?? order.id, name: order.customer.name };
  }
  if (order.audience === "storefront_user") {
    return {
      id: order.storefrontUserId ?? order.id,
      name: order.customer.name,
    };
  }
  return {
    id: order.resellerId ?? order.id,
    name: order.reseller?.name ?? order.customer.name,
  };
}

function resellerForOrder(order: Order): { id: string; name: string } | null {
  if (order.audience === "storefront_user" && order.reseller) {
    return { id: order.reseller.id, name: order.reseller.name };
  }
  return null;
}

function treasuryCounterpartyForRefund(
  refund: Refund
): TreasuryCounterparty {
  if (refund.audience === "direct") {
    return {
      type: "customer",
      id: refund.customer.id,
      name: refund.customer.name,
    };
  }
  if (refund.audience === "storefront_user") {
    return {
      type: "storefront_user",
      id: refund.customer.id,
      name: refund.customer.name,
    };
  }
  return {
    type: "reseller",
    id: refund.customer.id,
    name: refund.customer.name,
  };
}

function poolForRefund(
  refund: Refund
): "customer" | "storefront_user" | "reseller" {
  if (refund.audience === "direct") return "customer";
  if (refund.audience === "storefront_user") return "storefront_user";
  return "reseller";
}

// Resolves the destination wallet ID for a refund. Only storefront_user
// needs the compound key. Returns null when the required identity is
// missing (legacy seeds without storefrontId).
function destinationWalletIdFor(refund: Refund): string | null {
  if (refund.audience === "storefront_user") {
    if (!refund.storefrontId) return null;
    return walletIdFor(refund.storefrontId, refund.customer.id);
  }
  return refund.customer.id;
}

function creditWalletForRefund(
  refund: Refund,
  actor: TreasuryActor
): { ok: true } | { ok: false; reason: string } {
  if (refund.audience === "direct") {
    creditCustomerWallet(refund.id, refund.customer.id, refund.amount, actor);
    return { ok: true };
  }
  if (refund.audience === "reseller") {
    creditResellerWallet(refund.id, refund.customer.id, refund.amount, actor);
    return { ok: true };
  }
  const walletId = destinationWalletIdFor(refund);
  if (!walletId) {
    return { ok: false, reason: "storefrontId missing on refund" };
  }
  const result = creditStorefrontUserWallet(
    refund.id,
    walletId,
    refund.amount,
    actor
  );
  if (!result.ok) {
    return { ok: false, reason: result.error ?? "credit failed" };
  }
  return { ok: true };
}

export interface CreateRequestedRefundInput {
  order: Order;
  reason: RefundReason;
  amount: number;
  reasonNote?: string;
  supportTicketId?: string;
}

export interface RefundMutationResult {
  ok: boolean;
  refund?: Refund;
  error?: string;
}

export function createRequestedRefund(
  input: CreateRequestedRefundInput,
  actor: RefundActor
): RefundMutationResult {
  if (input.amount <= 0) {
    return { ok: false, error: "Amount must be greater than zero." };
  }
  if (input.amount > input.order.amount) {
    return { ok: false, error: "Refund exceeds the order amount." };
  }

  const audience = audienceFromOrder(input.order);
  const customer = customerForOrder(input.order);
  const reseller = resellerForOrder(input.order);
  const split = splitFor(audience, input.amount);

  const nowIso = new Date().toISOString();
  const refundId = newId("REF");

  const refund: Refund = {
    id: refundId,
    type: "requested",
    audience,
    status: "pending_admin",
    order: {
      orderId: input.order.id,
      serviceId: input.order.serviceId,
      providerId: input.order.providerId,
      paymentMethodId: input.order.paymentMethodId,
      amount: input.order.amount,
      createdAt: input.order.createdAt,
    },
    customer,
    reseller,
    storefrontId:
      audience === "storefront_user" ? input.order.storefrontId : undefined,
    amount: input.amount,
    settlements: [],
    atlasShareAmount: split.atlasShareAmount,
    resellerShareAmount: split.resellerShareAmount,
    reason: input.reason,
    reasonNote: input.reasonNote,
    supportTicketId: input.supportTicketId,
    customerHistory: buildCustomerHistory(customer.id),
    requestedAt: nowIso,
    createdBy: actor,
    timeline: [
      {
        type: "created",
        status: "info",
        timestamp: nowIso,
        label: "Refund created",
        actor,
      },
    ],
  };

  internalAppendRefund(refund);

  appendAuditEntry({
    action: "refund.create_requested",
    resourceType: "refund",
    resourceId: refundId,
    actor: { id: actor.id, name: actor.name, email: actor.email },
    metadata: { orderId: input.order.id, amount: input.amount },
  });
  writeActivity({
    refundId,
    audience,
    message: "Refund requested for " + input.order.id,
  });
  notifyRefunds();

  return { ok: true, refund };
}

export function approveRefund(
  refundId: string,
  actor: RefundActor
): RefundMutationResult {
  const refunds = getRefunds();
  const refund = refunds.find((r) => r.id === refundId);
  if (!refund) return { ok: false, error: "Refund not found." };
  if (refund.status !== "pending_admin") {
    return { ok: false, error: "Refund is not awaiting approval." };
  }

  const nowIso = new Date().toISOString();
  const next: Refund = {
    ...refund,
    status: "approved",
    approvedAt: nowIso,
    approvedBy: actor,
    timeline: [
      ...refund.timeline,
      {
        type: "approved",
        status: "success",
        timestamp: nowIso,
        label: "Approved",
        actor,
      },
    ],
  };

  internalReplaceRefund(refundId, next);

  appendAuditEntry({
    action: "refund.approve",
    resourceType: "refund",
    resourceId: refundId,
    actor: { id: actor.id, name: actor.name, email: actor.email },
  });
  writeActivity({
    refundId,
    audience: next.audience,
    message: "Refund approved",
  });
  notifyRefunds();

  return { ok: true, refund: next };
}

export function rejectRefund(
  refundId: string,
  reason: string,
  actor: RefundActor
): RefundMutationResult {
  const trimmed = reason.trim();
  if (trimmed.length < 10) {
    return { ok: false, error: "Reason must be at least 10 characters." };
  }

  const refunds = getRefunds();
  const refund = refunds.find((r) => r.id === refundId);
  if (!refund) return { ok: false, error: "Refund not found." };
  if (refund.status !== "pending_admin") {
    return { ok: false, error: "Refund is not awaiting approval." };
  }

  const nowIso = new Date().toISOString();
  const next: Refund = {
    ...refund,
    status: "rejected",
    rejectedAt: nowIso,
    rejectedBy: actor,
    rejectionReason: trimmed,
    timeline: [
      ...refund.timeline,
      {
        type: "rejected",
        status: "danger",
        timestamp: nowIso,
        label: "Rejected",
        description: trimmed,
        actor,
      },
    ],
  };

  internalReplaceRefund(refundId, next);

  appendAuditEntry({
    action: "refund.reject",
    resourceType: "refund",
    resourceId: refundId,
    actor: { id: actor.id, name: actor.name, email: actor.email },
    metadata: { reason: trimmed },
  });
  writeActivity({
    refundId,
    audience: next.audience,
    message: "Refund rejected",
  });
  notifyRefunds();

  return { ok: true, refund: next };
}

export function processRefund(
  refundId: string,
  actor: RefundActor
): RefundMutationResult {
  const refunds = getRefunds();
  const refund = refunds.find((r) => r.id === refundId);
  if (!refund) return { ok: false, error: "Refund not found." };
  if (refund.status !== "approved") {
    return { ok: false, error: "Refund is not approved." };
  }

  const nowIso = new Date().toISOString();
  const settlementId = newId("RFST");

  const walletFunded = refund.order.paymentMethodId === "wallet";
  const destination: RefundSettlement["destination"] = walletFunded
    ? "wallet"
    : "original_rail";

  const settlement: RefundSettlement = {
    id: settlementId,
    amount: refund.amount,
    settledAt: nowIso,
    destination,
    destinationDetail: walletFunded
      ? "Wallet credit"
      : "Original payment rail",
    railReversalPending: walletFunded ? undefined : true,
    actor,
  };

  const needsRecovery =
    refund.resellerShareAmount > 0 && refund.reseller !== null;

  let atlasTreasuryDebitId: string | undefined;

  if (destination === "wallet") {
    const creditResult = creditWalletForRefund(refund, actor);
    if (!creditResult.ok) {
      writeActivity({
        refundId,
        audience: refund.audience,
        message:
          "Wallet credit skipped (" +
          creditResult.reason +
          "). Falling back to rail debit.",
      });
      const event = emitLedgerEvent({
        kind: "refund_rail_debit",
        direction: "out",
        amount: refund.amount,
        poolType: poolForRefund(refund),
        ownerId: refund.customer.id,
        counterparty: treasuryCounterpartyForRefund(refund),
        reference: refund.id,
        description: "Refund payout for " + refund.order.orderId,
        actor,
        relatedEventId: refund.id,
        settledAt: nowIso,
      });
      atlasTreasuryDebitId = event.id;
    }
  } else {
    const event = emitLedgerEvent({
      kind: "refund_rail_debit",
      direction: "out",
      amount: refund.amount,
      poolType: poolForRefund(refund),
      ownerId: refund.customer.id,
      counterparty: treasuryCounterpartyForRefund(refund),
      reference: refund.id,
      description: "Refund payout for " + refund.order.orderId,
      actor,
      relatedEventId: refund.id,
      settledAt: nowIso,
    });
    atlasTreasuryDebitId = event.id;
  }

  const next: Refund = {
    ...refund,
    status: "completed",
    completedAt: nowIso,
    atlasTreasuryDebitId,
    settlements: [...refund.settlements, settlement],
    resellerRecovery: needsRecovery
      ? {
          resellerId: refund.reseller!.id,
          walletId: "RW-" + refund.reseller!.id,
          amount: refund.resellerShareAmount,
          recoveredAmount: 0,
          recoveryStartedAt: nowIso,
        }
      : refund.resellerRecovery,
    timeline: [
      ...refund.timeline,
      {
        type: "settled",
        status: "success",
        timestamp: nowIso,
        label: "Settled",
        actor,
      },
    ],
  };

  internalReplaceRefund(refundId, next);

  appendAuditEntry({
    action: "refund.process",
    resourceType: "refund",
    resourceId: refundId,
    actor: { id: actor.id, name: actor.name, email: actor.email },
    metadata: { amount: refund.amount, destination },
  });
  writeActivity({
    refundId,
    audience: next.audience,
    message: "Refund settled to " + destination,
  });
  notifyRefunds();

  return { ok: true, refund: next };
}

export function runAutomaticRefund(order: Order): RefundMutationResult {
  if (!order.walletDebit) {
    return { ok: false, error: "Order is not wallet-funded." };
  }
  if (order.failure?.class !== "system") {
    return { ok: false, error: "Order failure was not system-class." };
  }

  const nowIso = new Date().toISOString();
  const refundId = newId("REF");
  const settlementId = newId("RFST");
  const audience = audienceFromOrder(order);
  const customer = customerForOrder(order);
  const reseller = resellerForOrder(order);
  const amount = order.walletDebit.amount;
  const split = splitFor(audience, amount);

  const systemActor = {
    id: "system",
    name: "System",
    email: "system@atlas.com",
  };

  const settlement: RefundSettlement = {
    id: settlementId,
    amount,
    settledAt: nowIso,
    destination: "wallet",
    destinationDetail: "Wallet credit",
    walletId: order.walletDebit.walletId,
    actor: systemActor,
  };

  const needsRecovery = split.resellerShareAmount > 0 && reseller !== null;

  const refund: Refund = {
    id: refundId,
    type: "automatic",
    audience,
    status: "completed",
    order: {
      orderId: order.id,
      serviceId: order.serviceId,
      providerId: order.providerId,
      paymentMethodId: order.paymentMethodId,
      amount: order.amount,
      createdAt: order.createdAt,
    },
    customer,
    reseller,
    storefrontId:
      audience === "storefront_user" ? order.storefrontId : undefined,
    amount,
    settlements: [settlement],
    atlasShareAmount: split.atlasShareAmount,
    resellerShareAmount: split.resellerShareAmount,
    resellerRecovery: needsRecovery
      ? {
          resellerId: reseller!.id,
          walletId: "RW-" + reseller!.id,
          amount: split.resellerShareAmount,
          recoveredAmount: 0,
          recoveryStartedAt: nowIso,
        }
      : undefined,
    reason: "provider_failure",
    reasonNote: "Automatic refund after three failed retry attempts.",
    customerHistory: buildCustomerHistory(customer.id, refundId),
    requestedAt: nowIso,
    completedAt: nowIso,
    timeline: [
      {
        type: "automatic",
        status: "success",
        timestamp: nowIso,
        label: "Automatic refund issued",
        actor: systemActor,
      },
      {
        type: "settled",
        status: "success",
        timestamp: nowIso,
        label: "Settled",
        actor: systemActor,
      },
    ],
  };

  // Wallet credit. Falls back to rail debit when storefrontId is
  // unavailable (legacy seeds).
  const creditResult = creditWalletForRefund(refund, systemActor);
  if (!creditResult.ok) {
    const event = emitLedgerEvent({
      kind: "refund_rail_debit",
      direction: "out",
      amount,
      poolType: poolForRefund(refund),
      ownerId: customer.id,
      counterparty: treasuryCounterpartyForRefund(refund),
      reference: refundId,
      description: "Automatic refund for " + order.id,
      actor: systemActor,
      relatedEventId: refundId,
      settledAt: nowIso,
    });
    refund.atlasTreasuryDebitId = event.id;
  }

  internalAppendRefund(refund);

  appendAuditEntry({
    action: "refund.automatic",
    resourceType: "refund",
    resourceId: refundId,
    actor: systemActor,
    metadata: { orderId: order.id, amount },
  });
  writeActivity({
    refundId,
    audience,
    message: "Automatic refund issued for " + order.id,
  });
  notifyRefunds();

  return { ok: true, refund };
}

export function resetRefundsMutationsForTest(): void {
  // Store reset is handled by resetRefundsForTest.
}