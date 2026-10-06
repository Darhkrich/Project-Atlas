// lib/domains/audit/seed.ts
//
// Seed for the domain audit store. Covers the last 30 days across the
// 60-action union. Self-contained: does not import from lib/admin/.
// Actors mirror the admin users mock but are inlined to keep the domain
// layer dependency-free.

import type { AuditEntry } from "./types";

const NOW = Date.now();
const MIN = 60_000;
const HR = 60 * MIN;
const DAY = 24 * HR;

const at = (offsetMs: number) => new Date(NOW + offsetMs).toISOString();
const min = (n: number) => at(-n * MIN);
const hr = (n: number) => at(-n * HR);
const day = (n: number) => at(-n * DAY);

const ACTOR_YAW = {
  id: "usr-001",
  name: "Yaw Mensah",
  email: "yaw.mensah@atlas.com",
};
const ACTOR_AKOSUA = {
  id: "usr-002",
  name: "Akosua Boateng",
  email: "akosua.boateng@atlas.com",
};
const ACTOR_KOFI = {
  id: "usr-003",
  name: "Kofi Asante",
  email: "kofi.asante@atlas.com",
};
const ACTOR_EFUA = {
  id: "usr-004",
  name: "Efua Owusu",
  email: "efua.owusu@atlas.com",
};

function entry(
  input: Omit<AuditEntry, "id" | "actorId" | "actorName" | "actorEmail"> & {
    actor: { id: string; name: string; email: string };
  }
): AuditEntry {
  return {
    id: crypto.randomUUID(),
    action: input.action,
    resourceType: input.resourceType,
    resourceId: input.resourceId,
    actorId: input.actor.id,
    actorName: input.actor.name,
    actorEmail: input.actor.email,
    metadata: input.metadata,
    createdAt: input.createdAt,
  };
}

export const domainAuditSeed: AuditEntry[] = [
  entry({
    actor: ACTOR_YAW,
    action: "wallet.customer.adjust",
    resourceType: "wallet",
    resourceId: "CUST-001",
    createdAt: min(12),
    metadata: {
      previousValue: "GHS 45.00",
      newValue: "GHS 65.00",
      reason: "Goodwill credit for delayed MTN data delivery",
    },
  }),
  entry({
    actor: ACTOR_AKOSUA,
    action: "wallet.reseller.adjust",
    resourceType: "wallet",
    resourceId: "RS-001",
    createdAt: min(48),
    metadata: {
      previousValue: "GHS 1,500.00",
      newValue: "GHS 2,000.00",
      reason: "Commission correction for ATX-983821",
    },
  }),
  entry({
    actor: ACTOR_KOFI,
    action: "wallet.customer.freeze",
    resourceType: "wallet",
    resourceId: "CUST-014",
    createdAt: hr(2),
    metadata: {
      reason: "Suspicious withdrawal pattern flagged by security",
    },
  }),
  entry({
    actor: ACTOR_AKOSUA,
    action: "wallet.customer.withdraw_approve",
    resourceType: "wallet",
    resourceId: "CUST-007",
    createdAt: hr(3),
    metadata: {
      amount: 850,
      destination: "MTN MoMo **** 4567",
    },
  }),
  entry({
    actor: ACTOR_AKOSUA,
    action: "wallet.reseller.withdraw_approve",
    resourceType: "wallet",
    resourceId: "RS-005",
    createdAt: hr(5),
    metadata: {
      amount: 4320,
      destination: "GCB Bank **** 8891",
    },
  }),
  entry({
    actor: ACTOR_KOFI,
    action: "wallet.customer.withdraw_reject",
    resourceType: "wallet",
    resourceId: "CUST-022",
    createdAt: hr(8),
    metadata: {
      amount: 200,
      reason: "Destination account name does not match holder",
    },
  }),
  entry({
    actor: ACTOR_EFUA,
    action: "wallet.reseller.refund_credit",
    resourceType: "wallet",
    resourceId: "RS-003",
    createdAt: hr(12),
    metadata: {
      amount: 45,
      reason: "Customer dispute resolved in reseller favour",
      orderId: "ATX-982914",
    },
  }),
  entry({
    actor: ACTOR_YAW,
    action: "order.cancel",
    resourceType: "order",
    resourceId: "ATX-983001",
    createdAt: hr(20),
    metadata: {
      reason: "Provider timeout on retry exhaustion",
    },
  }),
  entry({
    actor: ACTOR_KOFI,
    action: "refund.create_requested",
    resourceType: "refund",
    resourceId: "REF-4021",
    createdAt: day(1),
    metadata: {
      amount: 20,
      orderId: "ATX-982877",
      reason: "Customer reports airtime not received",
    },
  }),
  entry({
    actor: ACTOR_AKOSUA,
    action: "refund.approve",
    resourceType: "refund",
    resourceId: "REF-4021",
    createdAt: day(1),
    metadata: {
      amount: 20,
      method: "atlas_wallet",
    },
  }),
  entry({
    actor: ACTOR_AKOSUA,
    action: "refund.process",
    resourceType: "refund",
    resourceId: "REF-4021",
    createdAt: day(1),
    metadata: {
      amount: 20,
      creditIssued: "CUST-008 wallet",
    },
  }),
  entry({
    actor: ACTOR_AKOSUA,
    action: "commission.reseller.credit",
    resourceType: "commission",
    resourceId: "COMM-1182",
    createdAt: day(2),
    metadata: {
      resellerId: "RS-002",
      amount: 12.4,
      orderId: "ATX-982995",
    },
  }),
  entry({
    actor: ACTOR_AKOSUA,
    action: "commission.settle",
    resourceType: "commission",
    resourceId: "COMM-1170",
    createdAt: day(2),
    metadata: {
      resellerId: "RS-004",
      amount: 84.5,
    },
  }),
  entry({
    actor: ACTOR_YAW,
    action: "payout_run.create",
    resourceType: "payout_run",
    resourceId: "RUN-210",
    createdAt: day(3),
    metadata: {
      resellerCount: 18,
      totalAmount: 14280,
    },
  }),
  entry({
    actor: ACTOR_YAW,
    action: "payout_run.complete",
    resourceType: "payout_run",
    resourceId: "RUN-210",
    createdAt: day(3),
    metadata: {
      resellerCount: 18,
      totalAmount: 14280,
    },
  }),
  entry({
    actor: ACTOR_AKOSUA,
    action: "wallet.merchant.adjust",
    resourceType: "wallet",
    resourceId: "MER-004",
    createdAt: day(5),
    metadata: {
      previousValue: "GHS 0.00",
      newValue: "GHS 120.00",
      reason: "Goodwill credit for storefront outage on 24 September",
    },
  }),
  entry({
    actor: ACTOR_AKOSUA,
    action: "wallet.merchant.transfer",
    resourceType: "wallet",
    resourceId: "MER-001",
    createdAt: day(6),
    metadata: {
      amount: 500,
      from: "billing",
      to: "main",
    },
  }),
  entry({
    actor: ACTOR_YAW,
    action: "wallet.merchant.plan_charge",
    resourceType: "wallet",
    resourceId: "MER-006",
    createdAt: day(7),
    metadata: {
      plan: "Growth",
      amount: 150,
      billingCycle: "October 2026",
    },
  }),
  entry({
    actor: ACTOR_YAW,
    action: "treasury.fund",
    resourceType: "treasury_event",
    resourceId: "TE-0042",
    createdAt: day(9),
    metadata: {
      amount: 250000,
      source: "GCB operating account",
    },
  }),
  entry({
    actor: ACTOR_AKOSUA,
    action: "treasury.adjustment",
    resourceType: "treasury_event",
    resourceId: "TE-0043",
    createdAt: day(11),
    metadata: {
      amount: -1200,
      direction: "debit",
      reason: "Bank charge correction for September",
    },
  }),
  entry({
    actor: ACTOR_YAW,
    action: "treasury.approve_outbound",
    resourceType: "treasury_event",
    resourceId: "TE-0044",
    createdAt: day(14),
    metadata: {
      amount: 68000,
      counterparty: "DataHub",
      purpose: "Provider settlement",
    },
  }),
  entry({
    actor: ACTOR_AKOSUA,
    action: "treasury.reconcile",
    resourceType: "treasury_event",
    resourceId: "TE-0039",
    createdAt: day(18),
    metadata: {
      matchedAgainst: "GCB statement 2026-09-05",
      status: "matched",
    },
  }),
  entry({
    actor: ACTOR_YAW,
    action: "catalog.pricing.update",
    resourceType: "catalog_plan",
    resourceId: "PLAN-MTN-5GB",
    createdAt: day(21),
    metadata: {
      previousValue: "GHS 20.00",
      newValue: "GHS 22.00",
      reason: "Provider cost increase effective October",
    },
  }),
  entry({
    actor: ACTOR_KOFI,
    action: "subscription.plan.update",
    resourceType: "subscription_plan",
    resourceId: "growth",
    createdAt: day(24),
    metadata: {
      previousValue: "GHS 150/mo",
      newValue: "GHS 165/mo",
      reason: "Annual pricing review",
    },
  }),
  entry({
    actor: ACTOR_EFUA,
    action: "support.ticket.compensation",
    resourceType: "support_conversation",
    resourceId: "SUP-1010",
    createdAt: day(26),
    metadata: {
      amount: 15,
      method: "atlas_wallet",
      reason: "Commission not credited within SLA",
    },
  }),
  entry({
    actor: ACTOR_EFUA,
    action: "support.ticket.credit_commission",
    resourceType: "support_conversation",
    resourceId: "SUP-1011",
    createdAt: day(28),
    metadata: {
      orderId: "ATX-983744",
      resellerId: "RS-002",
    },
  }),
  entry({
    actor: ACTOR_YAW,
    action: "wallet.storefront_user.adjust",
    resourceType: "wallet",
    resourceId: "SW-SF-RS-001-SU-2041",
    createdAt: day(29),
    metadata: {
      previousValue: "GHS 12.00",
      newValue: "GHS 20.00",
      reason: "Correction for duplicate checkout debit",
    },
  }),
];