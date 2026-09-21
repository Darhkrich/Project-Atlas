// Treasury movements are mock. No real money moves. Wire to the banking
// layer before any live use.

import type {
  TreasuryActor,
  TreasuryCounterparty,
  TreasuryEvent,
  TreasuryEventKind,
} from "../types/treasury";

const ANCHOR_MS = new Date("2025-01-15T10:00:00.000Z").getTime();
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function ago(ms: number): string {
  return new Date(ANCHOR_MS - ms).toISOString();
}

const SYSTEM: TreasuryActor = {
  id: "system",
  name: "System",
  email: "system@atlas.com",
};

const FINANCE: TreasuryActor = {
  id: "ADM-003",
  name: "Finance Admin",
  email: "finance@atlas.com",
};

const OPS: TreasuryActor = {
  id: "ADM-001",
  name: "Operations Admin",
  email: "ops@atlas.com",
};

const SUPER: TreasuryActor = {
  id: "ADM-000",
  name: "Super Admin",
  email: "root@atlas.com",
};

const MTN: TreasuryCounterparty = { type: "provider", id: "prov-mtn-gh", name: "MTN Ghana" };
const TELECEL: TreasuryCounterparty = { type: "provider", id: "prov-telecel-gh", name: "Telecel Ghana" };
const ECG: TreasuryCounterparty = { type: "provider", id: "prov-ecg-gh", name: "ECG Ghana" };
const MULTICHOICE: TreasuryCounterparty = { type: "provider", id: "prov-multichoice", name: "MultiChoice" };
const WAEC: TreasuryCounterparty = { type: "provider", id: "prov-waec", name: "WAEC" };

interface SeedSpec {
  kind: TreasuryEventKind;
  amount: number;
  counterparty: TreasuryCounterparty | null;
  reference: string;
  description: string;
  msAgo: number;
  actor: TreasuryActor;
  approvedBy?: TreasuryActor;
  approvalStatus?: TreasuryEvent["approvalStatus"];
  reconciliationStatus?: TreasuryEvent["reconciliationStatus"];
  settledOffsetMs?: number;
  poolType?: TreasuryEvent["poolType"];
  ownerId?: string;
}

function build(spec: SeedSpec, seq: number): TreasuryEvent {
  const createdAt = ago(spec.msAgo);
  const isOut = spec.kind.endsWith("_debit");
  const isInternal = spec.kind === "internal_reclassification";
  const direction = isInternal ? "internal" : isOut ? "out" : "in";
  const approvalStatus = spec.approvalStatus ?? "auto";
  const reconciliationStatus = spec.reconciliationStatus ?? "matched";

  const approvedAt =
    spec.approvedBy && approvalStatus !== "auto"
      ? ago(spec.msAgo - 30 * MINUTE)
      : undefined;
  const settledAt =
    spec.settledOffsetMs !== undefined
      ? ago(spec.msAgo - spec.settledOffsetMs)
      : undefined;

  return {
    id: "AT-" + String(seq).padStart(4, "0"),
    kind: spec.kind,
    direction,
    amount: spec.amount,
    currency: "GHS",
    counterparty: spec.counterparty,
    poolType: spec.poolType,
    ownerId: spec.ownerId,
    reference: spec.reference,
    description: spec.description,
    approvalStatus,
    reconciliationStatus,
    createdAt,
    createdBy: spec.actor,
    approvedBy: spec.approvedBy,
    approvedAt,
    settledAt,
  };
}

function buildSeed(): TreasuryEvent[] {
  const specs: SeedSpec[] = [];

  // Order settlements in, over the last 30 days.
  const orderCredits: Array<{
    amount: number;
    msAgo: number;
    ref: string;
    actor: TreasuryActor;
    recon: TreasuryEvent["reconciliationStatus"];
  }> = [
    { amount: 45200, msAgo: 29 * DAY, ref: "ORD-SETTLE-29D", actor: SYSTEM, recon: "matched" },
    { amount: 38900, msAgo: 26 * DAY, ref: "ORD-SETTLE-26D", actor: SYSTEM, recon: "matched" },
    { amount: 41750, msAgo: 22 * DAY, ref: "ORD-SETTLE-22D", actor: SYSTEM, recon: "matched" },
    { amount: 52300, msAgo: 18 * DAY, ref: "ORD-SETTLE-18D", actor: SYSTEM, recon: "matched" },
    { amount: 47600, msAgo: 14 * DAY, ref: "ORD-SETTLE-14D", actor: SYSTEM, recon: "matched" },
    { amount: 55100, msAgo: 10 * DAY, ref: "ORD-SETTLE-10D", actor: SYSTEM, recon: "matched" },
    { amount: 49800, msAgo: 7 * DAY, ref: "ORD-SETTLE-7D", actor: SYSTEM, recon: "matched" },
    { amount: 43400, msAgo: 4 * DAY, ref: "ORD-SETTLE-4D", actor: SYSTEM, recon: "matched" },
    { amount: 51900, msAgo: 2 * DAY, ref: "ORD-SETTLE-2D", actor: SYSTEM, recon: "matched" },
    { amount: 28700, msAgo: 1 * DAY, ref: "ORD-SETTLE-1D", actor: SYSTEM, recon: "matched" },
    { amount: 12400, msAgo: 6 * HOUR, ref: "ORD-SETTLE-6H", actor: SYSTEM, recon: "unmatched" },
    { amount: 9800, msAgo: 2 * HOUR, ref: "ORD-SETTLE-2H", actor: SYSTEM, recon: "unmatched" },
  ];
  for (const c of orderCredits) {
    specs.push({
      kind: "order_settlement_credit",
      amount: c.amount,
      counterparty: { type: "system", id: "order-batch", name: "Order settlements" },
      reference: c.ref,
      description: "Order settlement batch",
      msAgo: c.msAgo,
      actor: c.actor,
      reconciliationStatus: c.recon,
      settledOffsetMs: 60 * MINUTE,
    });
  }

  // Storefront sale credits, smaller, more frequent.
  const storefrontCredits: Array<{ amount: number; msAgo: number; ref: string }> = [
    { amount: 6200, msAgo: 25 * DAY, ref: "SFS-25D" },
    { amount: 5400, msAgo: 20 * DAY, ref: "SFS-20D" },
    { amount: 7100, msAgo: 15 * DAY, ref: "SFS-15D" },
    { amount: 6800, msAgo: 11 * DAY, ref: "SFS-11D" },
    { amount: 5900, msAgo: 6 * DAY, ref: "SFS-6D" },
    { amount: 8100, msAgo: 3 * DAY, ref: "SFS-3D" },
    { amount: 4200, msAgo: 1 * DAY + 4 * HOUR, ref: "SFS-1D" },
    { amount: 3600, msAgo: 8 * HOUR, ref: "SFS-8H" },
  ];
  for (const c of storefrontCredits) {
    specs.push({
      kind: "storefront_order_credit",
      amount: c.amount,
      counterparty: { type: "system", id: "storefront-batch", name: "Storefront sales" },
      reference: c.ref,
      description: "Storefront order settlement",
      msAgo: c.msAgo,
      actor: SYSTEM,
      settledOffsetMs: 30 * MINUTE,
    });
  }

  // Wallet funding credits.
  const fundingCredits: Array<{ amount: number; msAgo: number; ref: string }> = [
    { amount: 3200, msAgo: 27 * DAY, ref: "WFC-27D" },
    { amount: 2800, msAgo: 21 * DAY, ref: "WFC-21D" },
    { amount: 4100, msAgo: 16 * DAY, ref: "WFC-16D" },
    { amount: 3900, msAgo: 12 * DAY, ref: "WFC-12D" },
    { amount: 3400, msAgo: 8 * DAY, ref: "WFC-8D" },
    { amount: 2900, msAgo: 3 * DAY, ref: "WFC-3D" },
    { amount: 1800, msAgo: 1 * DAY, ref: "WFC-1D" },
    { amount: 900, msAgo: 4 * HOUR, ref: "WFC-4H" },
  ];
  for (const c of fundingCredits) {
    specs.push({
      kind: "wallet_funding_credit",
      amount: c.amount,
      counterparty: { type: "system", id: "wallet-funding", name: "Wallet funding" },
      reference: c.ref,
      description: "Wallet funding via momo and card",
      msAgo: c.msAgo,
      actor: SYSTEM,
      settledOffsetMs: 45 * MINUTE,
    });
  }

  // Admin funding credit, one event.
  specs.push({
    kind: "admin_funding_credit",
    amount: 50000,
    counterparty: { type: "bank", id: "gcb-main", name: "GCB Main Account" },
    reference: "BANK-TOPUP-001",
    description: "Initial capitalization from Atlas bank",
    msAgo: 30 * DAY,
    actor: FINANCE,
    approvedBy: SUPER,
    approvalStatus: "approved",
    settledOffsetMs: 2 * HOUR,
  });

  // Provider payouts, out.
  const payouts: Array<{
    amount: number;
    msAgo: number;
    ref: string;
    provider: TreasuryCounterparty;
    desc: string;
  }> = [
    { amount: 14800, msAgo: 20 * DAY, ref: "PAY-MTN-20D", provider: MTN, desc: "MTN data and airtime settlement" },
    { amount: 6200, msAgo: 20 * DAY, ref: "PAY-TEL-20D", provider: TELECEL, desc: "Telecel airtime settlement" },
    { amount: 9400, msAgo: 13 * DAY, ref: "PAY-MTN-13D", provider: MTN, desc: "MTN data settlement" },
    { amount: 3400, msAgo: 13 * DAY, ref: "PAY-ECG-13D", provider: ECG, desc: "ECG prepaid tokens settlement" },
    { amount: 5200, msAgo: 7 * DAY, ref: "PAY-MC-7D", provider: MULTICHOICE, desc: "DSTV and GOtv settlement" },
    { amount: 8800, msAgo: 5 * DAY, ref: "PAY-MTN-5D", provider: MTN, desc: "MTN data settlement" },
    { amount: 4100, msAgo: 3 * DAY, ref: "PAY-WAEC-3D", provider: WAEC, desc: "WAEC results check settlement" },
    { amount: 6400, msAgo: 1 * DAY, ref: "PAY-MTN-1D", provider: MTN, desc: "MTN data settlement" },
  ];
  for (const p of payouts) {
    specs.push({
      kind: "provider_payout_debit",
      amount: p.amount,
      counterparty: p.provider,
      reference: p.ref,
      description: p.desc,
      msAgo: p.msAgo,
      actor: FINANCE,
      approvedBy: SUPER,
      approvalStatus: "approved",
      settledOffsetMs: 3 * HOUR,
    });
  }

  // One provider payout pending approval (dual required, over threshold).
  specs.push({
    kind: "provider_payout_debit",
    amount: 12500,
    counterparty: MTN,
    reference: "PAY-MTN-PENDING",
    description: "MTN data settlement awaiting approval",
    msAgo: 4 * HOUR,
    actor: FINANCE,
    approvalStatus: "pending",
    settledOffsetMs: undefined,
    reconciliationStatus: "unmatched",
  });

  // Withdrawals.
  specs.push({
    kind: "withdrawal_debit",
    amount: 500,
    counterparty: { type: "reseller", id: "RS-001", name: "Kwame Store" },
    reference: "WD-RS-001-001",
    description: "Reseller commission withdrawal",
    msAgo: 3 * DAY,
    actor: SYSTEM,
    settledOffsetMs: 2 * HOUR,
  });
  specs.push({
    kind: "withdrawal_debit",
    amount: 2500,
    counterparty: { type: "merchant", id: "MER-008", name: "TechHub Store" },
    reference: "WD-MER-008-001",
    description: "Merchant main wallet withdrawal",
    msAgo: 2 * DAY,
    actor: SYSTEM,
    settledOffsetMs: 3 * HOUR,
  });

  // Refund rail debits.
  specs.push({
    kind: "refund_rail_debit",
    amount: 120,
    counterparty: { type: "customer", id: "CUS-1002", name: "Ama Serwaa" },
    reference: "REF-2001",
    description: "Order refund to original rail",
    msAgo: 12 * DAY,
    actor: FINANCE,
    approvedBy: SUPER,
    approvalStatus: "approved",
    settledOffsetMs: 2 * HOUR,
  });
  specs.push({
    kind: "refund_rail_debit",
    amount: 250,
    counterparty: { type: "storefront_user", id: "SFU-3721", name: "Guest Kwame" },
    reference: "REF-2002",
    description: "Storefront refund to wallet",
    msAgo: 8 * DAY,
    actor: SYSTEM,
    settledOffsetMs: 30 * MINUTE,
  });

  // Bank transfer to Atlas own account.
  specs.push({
    kind: "bank_transfer_debit",
    amount: 20000,
    counterparty: { type: "bank", id: "gcb-main", name: "GCB Main Account" },
    reference: "SWEEP-001",
    description: "Monthly profit sweep to Atlas bank",
    msAgo: 15 * DAY,
    actor: FINANCE,
    approvedBy: SUPER,
    approvalStatus: "approved",
    settledOffsetMs: 4 * HOUR,
  });

  // Adjustments.
  specs.push({
    kind: "adjustment_credit",
    amount: 250,
    counterparty: null,
    reference: "ADJ-CR-001",
    description: "Rounding correction on order batch",
    msAgo: 20 * DAY,
    actor: FINANCE,
  });
  specs.push({
    kind: "adjustment_debit",
    amount: 80,
    counterparty: null,
    reference: "ADJ-DB-001",
    description: "Duplicate settlement reversal",
    msAgo: 9 * DAY,
    actor: FINANCE,
    approvedBy: SUPER,
    approvalStatus: "approved",
    settledOffsetMs: 30 * MINUTE,
    reconciliationStatus: "disputed",
  });

  // Internal reclassification, one example.
  specs.push({
    kind: "internal_reclassification",
    amount: 1500,
    counterparty: { type: "reseller", id: "RS-002", name: "Adjoa Ventures" },
    poolType: "reseller",
    ownerId: "RS-002",
    reference: "RECLASS-001",
    description: "Commission credit reclassification",
    msAgo: 5 * DAY,
    actor: SYSTEM,
    settledOffsetMs: 0,
  });

  return specs.map((spec, idx) => build(spec, idx + 1));
}

export function seedTreasuryEvents(): TreasuryEvent[] {
  return buildSeed().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}