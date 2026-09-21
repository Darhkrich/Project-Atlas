// Refund mutations. Layer 1 treasury writes are mock. No real money moves.

import type { Order } from "../types/orders";
import type {
  CustomerRefundHistoryItem,
  Refund,
  RefundActor,
  RefundReason,
  RefundSettlement,
} from "../types/refund";
import type { TreasuryEvent } from "../types/treasury";
import {
  getRefunds,
  internalAppendRefund,
  internalReplaceRefund,
  notifyRefunds,
} from "./refunds-store";
import {
  internalAppendEvent,
  notifyTreasury,
} from "./treasury-store";
import { splitFor } from "../refunds/refunds-helpers";

interface AuditEntry {
  action: string;
  refundId: string;
  actor: string;
  meta?: Record<string, unknown>;
}

interface ActivityEntry {
  refundId: string;
  audience: Refund["audience"];
  message: string;
}

function writeAudit(entry: AuditEntry): void {
  if (typeof console !== "undefined") {
    console.warn("[admin-audit]", entry);
  }
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
): TreasuryEvent["counterparty"] {
  if (refund.audience === "direct") {
    return { type: "customer", id: refund.customer.id, name: refund.customer.name };
  }
  if (refund.audience === "storefront_user") {
    return {
      type: "storefront_user",
      id: refund.customer.id,
      name: refund.customer.name,
    };
  }
  return { type: "reseller", id: refund.customer.id, name: refund.customer.name };
}

function buildTreasuryDebitEvent(
  refund: Refund,
  settledAt: string
): TreasuryEvent {
  return {
    id: newId("AT"),
    kind: "refund_rail_debit",
    direction: "out",
    amount: refund.amount,
    currency: "GHS",
    counterparty: treasuryCounterpartyForRefund(refund),
    reference: refund.id,
    description: "Refund payout for " + refund.order.orderId,
    approvalStatus: "auto",
    reconciliationStatus: "unmatched",
    relatedEventId: refund.id,
    createdAt: settledAt,
    createdBy: {
      id: "system",
      name: "System",
      email: "system@atlas.com",
    },
    settledAt,
  };
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

  writeAudit({
    action: "refund.create_requested",
    refundId,
    actor: actor.email,
    meta: { orderId: input.order.id, amount: input.amount },
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

  writeAudit({
    action: "refund.approve",
    refundId,
    actor: actor.email,
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

  writeAudit({
    action: "refund.reject",
    refundId,
    actor: actor.email,
    meta: { reason: trimmed },
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

  const treasuryEvent = buildTreasuryDebitEvent(refund, nowIso);

  const needsRecovery =
    refund.resellerShareAmount > 0 && refund.reseller !== null;

  const next: Refund = {
    ...refund,
    status: "completed",
    completedAt: nowIso,
    atlasTreasuryDebitId: treasuryEvent.id,
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
  internalAppendEvent(treasuryEvent);

  writeAudit({
    action: "refund.process",
    refundId,
    actor: actor.email,
    meta: { amount: refund.amount, destination },
  });
  writeActivity({
    refundId,
    audience: next.audience,
    message: "Refund settled to " + destination,
  });
  notifyRefunds();
  notifyTreasury();

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

  const settlement: RefundSettlement = {
    id: settlementId,
    amount,
    settledAt: nowIso,
    destination: "wallet",
    destinationDetail: "Wallet credit",
    walletId: order.walletDebit.walletId,
    actor: { id: "system", name: "System", email: "system@atlas.com" },
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
        actor: { id: "system", name: "System", email: "system@atlas.com" },
      },
      {
        type: "settled",
        status: "success",
        timestamp: nowIso,
        label: "Settled",
        actor: { id: "system", name: "System", email: "system@atlas.com" },
      },
    ],
  };

  const treasuryEvent = buildTreasuryDebitEvent(refund, nowIso);
  refund.atlasTreasuryDebitId = treasuryEvent.id;

  internalAppendRefund(refund);
  internalAppendEvent(treasuryEvent);

  writeAudit({
    action: "refund.automatic",
    refundId,
    actor: "system@atlas.com",
    meta: { orderId: order.id, amount },
  });
  writeActivity({
    refundId,
    audience,
    message: "Automatic refund issued for " + order.id,
  });
  notifyRefunds();
  notifyTreasury();

  return { ok: true, refund };
}

export function resetRefundsMutationsForTest(): void {
  // Store reset is handled by resetRefundsForTest.
}