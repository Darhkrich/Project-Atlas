// lib/admin/commissions/reseller-commission-bridge.ts
//
// Bridge between the admin commission store and the shared reseller
// wallet ledger. Called from commission mutations when a commission
// settles (credit) or reverses (accrue recovery).
//
// Under the auto-credit model:
//   - Settlement writes a commission entry to the wallet for the gross
//     amount. If the reseller has outstanding recovery, an offsetting
//     adjustment entry is written in the same call so the net credit
//     matches what the reseller actually receives.
//   - Reversal never touches the wallet. It accrues an outstanding
//     recovery that is consumed from future commission credits.
//
// Placed on the admin side because it is only invoked from admin
// commission mutations. It writes to the shared reseller wallet store,
// which both admin and public read.

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

const SYSTEM_ACTOR = { name: "System", email: "system@atlas.com" };

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

  // Consume outstanding recovery FIFO before the credit lands.
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
        ? Math.round((input.baseCommission / input.atlasPrice) * 10000) /
          100
        : 0,
    grossOrderValue: input.atlasPrice,
    createdAt: nowIso,
    commissionId: input.id,
  };
  internalAppendLedgerEntry(commissionEntry);

  // If recovery was applied, write the offsetting adjustment so the net
  // wallet impact matches what the reseller actually receives.
  if (recoveryApplied > 0) {
    const adjustmentEntry: ResellerAdjustmentLedgerEntry = {
      id: "RL-ADJ-" + crypto.randomUUID().slice(0, 8).toUpperCase(),
      resellerId: input.resellerId,
      kind: "adjustment",
      amount: -recoveryApplied,
      method: "atlas_wallet",
      reason:
        "Commission recovery applied against reversed commission " +
        input.id,
      actor: SYSTEM_ACTOR,
      createdAt: nowIso,
    };
    internalAppendLedgerEntry(adjustmentEntry);
  }

  internalPatchResellerWalletMeta(input.resellerId, {
    updatedAt: nowIso,
    lastCommissionAt: nowIso,
  });

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
  // A commission that was never paid has nothing to recover.
  if (!input.paidAt) {
    return { ok: true, recoveryApplied: 0, netCredited: 0 };
  }

  // Idempotency guard. If this commission already produced a recovery
  // entry, do not accrue a second time.
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

export function getResellerOutstandingRecovery(
  resellerId: string
): number {
  return getOutstandingRecovery(resellerId);
}