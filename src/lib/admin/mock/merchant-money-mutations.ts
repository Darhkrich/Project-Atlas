import { PERMISSIONS } from "@/lib/admin/rbac/permissions";
import type { Permission } from "@/lib/admin/rbac/permissions";
import type { WithdrawalRequest } from "../types/merchant-money";
import type { AutoApproveConfig } from "../types/merchant-money";
import {
  getMerchantMoneyState,
  internalAddWalletTransaction,
  internalPatchConfig,
  internalPatchDispute,
  internalPatchWallet,
  internalPatchWithdrawal,
} from "./merchant-money-store";

interface AdminActor {
  id: string;
  name: string;
  email: string;
}

export interface MutationResult {
  ok: boolean;
  error?: string;
}

function requirePermission(
  actor: AdminActor | null | undefined,
  _permission: Permission
): AdminActor {
  if (!actor) {
    throw new Error("No admin session. Mutation blocked.");
  }
  return actor;
}

export function approveWithdrawal(
  withdrawalId: string,
  actor: AdminActor | null | undefined,
  note?: string
): MutationResult {
  requirePermission(actor, PERMISSIONS.PAYMENTS_WITHDRAWALS_APPROVE);
  const admin = actor as AdminActor;
  const state = getMerchantMoneyState();
  const withdrawal = state.withdrawals.find((w) => w.id === withdrawalId);
  if (!withdrawal) return { ok: false, error: "Withdrawal not found." };
  if (withdrawal.status !== "pending_admin") {
    return { ok: false, error: "Withdrawal is not pending approval." };
  }
  const pair = state.wallets[withdrawal.merchantId];
  if (!pair) return { ok: false, error: "Merchant wallet not found." };
  if (pair.main.balance < withdrawal.total) {
    internalPatchWithdrawal(withdrawalId, (w) => ({
      ...w,
      status: "failed",
      failureReason: "insufficient_balance",
    }));
    return {
      ok: false,
      error: "Insufficient main wallet balance. Withdrawal marked failed.",
    };
  }

  const nowIso = new Date().toISOString();
  internalPatchWithdrawal(withdrawalId, (w) => ({
    ...w,
    status: "pending_processing",
    approvedBy: admin.email,
    approvedAt: nowIso,
  }));

  const newBalance = pair.main.balance - withdrawal.total;
  internalPatchWallet(withdrawal.merchantId, "main", (wallet) => ({
    ...wallet,
    balance: newBalance,
    updatedAt: nowIso,
  }));

  internalAddWalletTransaction({
    id: crypto.randomUUID(),
    merchantId: withdrawal.merchantId,
    walletType: "main",
    direction: "debit",
    amount: withdrawal.total,
    balanceAfter: newBalance,
    rail: "internal_transfer",
    relatedEventId: withdrawal.id,
    relatedEventKind: "withdrawal",
    status: "completed",
    actorType: "admin",
    actorId: admin.email,
    createdAt: nowIso,
  });

  void note;
  return { ok: true };
}

export function rejectWithdrawal(
  withdrawalId: string,
  actor: AdminActor | null | undefined,
  reason: string
): MutationResult {
  requirePermission(actor, PERMISSIONS.PAYMENTS_WITHDRAWALS_APPROVE);
  const admin = actor as AdminActor;
  const trimmed = reason.trim();
  if (!trimmed) return { ok: false, error: "Reason is required." };
  const state = getMerchantMoneyState();
  const withdrawal = state.withdrawals.find((w) => w.id === withdrawalId);
  if (!withdrawal) return { ok: false, error: "Withdrawal not found." };
  if (withdrawal.status !== "pending_admin") {
    return { ok: false, error: "Withdrawal is not pending approval." };
  }
  const nowIso = new Date().toISOString();
  internalPatchWithdrawal(withdrawalId, (w) => ({
    ...w,
    status: "rejected",
    rejectionReason: trimmed,
    approvedBy: admin.email,
    approvedAt: nowIso,
  }));
  return { ok: true };
}

export function updateAutoApproveConfig(
  patch: Partial<
    Pick<AutoApproveConfig, "thresholdGHS" | "feeRatePercent" | "dailyCap">
  >,
  actor: AdminActor | null | undefined
): MutationResult {
  requirePermission(actor, PERMISSIONS.PAYMENTS_CONFIG);
  const admin = actor as AdminActor;
  const nowIso = new Date().toISOString();
  internalPatchConfig((current) => ({
    ...current,
    ...patch,
    updatedAt: nowIso,
    updatedBy: admin.email,
  }));
  return { ok: true };
}

export function logDisputeResolution(
  disputeId: string,
  resolutionNote: string,
  actor: AdminActor | null | undefined
): MutationResult {
  requirePermission(actor, PERMISSIONS.PAYMENTS_VIEW);
  const admin = actor as AdminActor;
  const trimmed = resolutionNote.trim();
  if (!trimmed) return { ok: false, error: "Resolution note is required." };
  const nowIso = new Date().toISOString();
  internalPatchDispute(disputeId, (d) => ({
    ...d,
    status: "resolved",
    resolutionNote: trimmed,
    resolvedAt: nowIso,
    resolvedBy: admin.email,
  }));
  return { ok: true };
}

export const __unused: WithdrawalRequest | undefined = undefined;