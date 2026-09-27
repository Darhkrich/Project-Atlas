// lib/admin/commissions/reseller-commision-bridge.ts
//
// Bridge between the admin commission store and the shared reseller
// wallet ledger. Called from commission mutations when a commission
// settles (credit) or reverses (accrue recovery).
//
// Layer 2: the wallet credit is internal reclassification. Money already
// inside Atlas. Amount is netCredited (what actually hits the wallet
// after recovery).
//
// Layer 3 A1: one audit entry per credit call, matching the emit.
//
// Filename note: misspelled ("commision" not "commission"). Rename
// deferred to cleanup.

import {
  getOutstandingRecovery,
  getRecoveryFor,
  internalAccrueRecovery,
  internalConsumeRecovery,
} from "@/lib/admin/mock/reseller-recovery-store";
import {
  getResellerWalletStore,
  internalAppendLedgerEntry,
  internalPatchResellerWalletMeta,
} from "@/lib/reseller/mock/wallet-store";
import type {
  ResellerAdjustmentLedgerEntry,
  ResellerCommissionLedgerEntry,
} from "@/lib/reseller/types/wallet";
import { emitLedgerEvent } from "@/lib/domains/treasury/emit";
import type { TreasuryActor } from "@/lib/domains/treasury/types";
import { appendAuditEntry } from "@/lib/domains/audit";

export interface CommissionBridgeInput {
  id: string;
  resellerId: string;
  orderId: string;
  service: string;
  baseCommission: number;
  atlasPrice: number;
  totalCommission: number;
  status: "paid" | "reversed";
  paidAt?: string;
}

export interface BridgeResult {
  ok: boolean;
  error?: string;
  commissionEntryId?: string;
  recoveryId?: string;
  recoveryApplied?: number;
  netCredited?: number;
}

const SYSTEM_ACTOR: TreasuryActor = {
  id: "system",
  name: "System",
  email: "system@atlas.com",
};

export function creditResellerCommission(
  input: CommissionBridgeInput
): BridgeResult {
  if (input.status !== "paid") {
    return { ok: false, error: "Only paid commissions credit the wallet." };
  }

  const walletStore = getResellerWalletStore();
  const wallet = walletStore.wallets[input.resellerId];
  if (!wallet) {
    return { ok: false, error: "Reseller wallet not found." };
  }

  const grossAmount = Math.round(input.totalCommission * 100) / 100;
  if (grossAmount <= 0) {
    return { ok: false, error: "Commission amount must be positive." };
  }

  const nowIso = new Date().toISOString();

  const consume = internalConsumeRecovery(input.resellerId, grossAmount);
  const recoveryApplied = consume.applied;
  const netCredited = consume.remaining;

  const commissionEntryId =
    "RL-COM-" + crypto.randomUUID().slice(0, 8).toUpperCase();
  const commissionEntry: ResellerCommissionLedgerEntry = {
    id: commissionEntryId,
    resellerId: input.resellerId,
    kind: "commission",
    amount: grossAmount,
    relatedOrderId: input.orderId,
    service: input.service,
    commissionRate:
      input.atlasPrice > 0
        ? Math.round((input.baseCommission / input.atlasPrice) * 10000) / 100
        : 0,
    grossOrderValue: input.atlasPrice,
    createdAt: nowIso,
    commissionId: input.id,
  };
  internalAppendLedgerEntry(commissionEntry);

  if (recoveryApplied > 0) {
    const adjustmentEntry: ResellerAdjustmentLedgerEntry = {
      id: "RL-ADJ-" + crypto.randomUUID().slice(0, 8).toUpperCase(),
      resellerId: input.resellerId,
      kind: "adjustment",
      amount: -recoveryApplied,
      method: "atlas_wallet",
      reason:
        "Commission recovery applied against reversed commission " + input.id,
      actor: SYSTEM_ACTOR,
      createdAt: nowIso,
    };
    internalAppendLedgerEntry(adjustmentEntry);
  }

  internalPatchResellerWalletMeta(input.resellerId, {
    updatedAt: nowIso,
    lastCommissionAt: nowIso,
  });

  if (netCredited > 0) {
    emitLedgerEvent({
      kind: "internal_reclassification",
      direction: "internal",
      amount: netCredited,
      poolType: "reseller",
      ownerId: input.resellerId,
      counterparty: {
        type: "reseller",
        id: input.resellerId,
        name: wallet.resellerName,
      },
      reference: input.id,
      description: "Reseller commission credit for order " + input.orderId,
      actor: SYSTEM_ACTOR,
      settledAt: nowIso,
    });

    appendAuditEntry({
      action: "commission.reseller.credit",
      resourceType: "commission",
      resourceId: input.id,
      actor: SYSTEM_ACTOR,
      metadata: {
        resellerId: input.resellerId,
        orderId: input.orderId,
        grossAmount,
        netCredited,
        recoveryApplied,
      },
    });
  }

  return {
    ok: true,
    commissionEntryId,
    recoveryApplied,
    netCredited,
  };
}

export function reverseResellerCommission(
  input: CommissionBridgeInput,
  reason: string
): BridgeResult {
  if (input.status !== "reversed") {
    return { ok: false, error: "Only reversed commissions accrue recovery." };
  }
  const trimmed = reason.trim();
  if (trimmed.length < 8) {
    return {
      ok: false,
      error: "Reversal reason must be at least 8 characters.",
    };
  }
  if (!input.paidAt) {
    return { ok: true, recoveryApplied: 0, netCredited: 0 };
  }

  const existing = getRecoveryFor(input.resellerId).find(
    (e) => e.sourceCommissionId === input.id
  );
  if (existing) {
    return { ok: true, recoveryId: existing.id };
  }

  const amount = Math.round(input.totalCommission * 100) / 100;
  if (amount <= 0) {
    return { ok: true, recoveryApplied: 0, netCredited: 0 };
  }

  const entry = internalAccrueRecovery(input.resellerId, input.id, amount);
  return { ok: true, recoveryId: entry.id };
}

export function getResellerOutstandingRecovery(resellerId: string): number {
  return getOutstandingRecovery(resellerId);
}