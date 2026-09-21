// Admin-side wrappers over the public reseller wallet mutations. The
// authoritative store is lib/reseller/mock/wallet-store.ts. This file
// translates the admin actor shape and the admin config shape into the
// public API.

import type {
  ResellerCommissionConfig,
} from "@/lib/admin/types/reseller-commission-wallet";
import {
  approveResellerWithdrawal,
  rejectResellerWithdrawal,
  type ResellerActor,
} from "@/lib/reseller/wallet/wallet-mutations";
import {
  getWalletConfig,
  internalPatchWalletConfig,
  notifyWalletConfig,
} from "@/lib/domains/wallet/config-store";

export interface WalletActor {
  name: string;
  email: string;
}

export interface WalletMutationResult {
  ok: boolean;
  error?: string;
}

export interface UpdateRulesPatch {
  withdrawalApprovalThreshold?: number;
  withdrawalFeePercent?: number;
}

export interface UpdateRulesResult {
  ok: boolean;
  value?: ResellerCommissionConfig;
  previous?: ResellerCommissionConfig;
  error?: string;
}

const MIN_THRESHOLD = 100;
const MAX_THRESHOLD = 100_000;
const MIN_FEE_PERCENT = 0;
const MAX_FEE_PERCENT = 10;

export const THRESHOLD_BOUNDS = {
  min: MIN_THRESHOLD,
  max: MAX_THRESHOLD,
  defaultValue: 5000,
} as const;

export const FEE_PERCENT_BOUNDS = {
  min: MIN_FEE_PERCENT,
  max: MAX_FEE_PERCENT,
  defaultValue: 0.5,
} as const;

function toResellerActor(
  resellerId: string,
  actor: WalletActor
): ResellerActor {
  return {
    id: resellerId,
    name: actor.name,
    email: actor.email,
  };
}

export function approveWalletWithdrawal(
  resellerId: string,
  requestId: string,
  actor: WalletActor
): WalletMutationResult {
  const result = approveResellerWithdrawal(
    resellerId,
    requestId,
    toResellerActor(resellerId, actor)
  );
  return { ok: result.ok, error: result.error };
}

export function rejectWalletWithdrawal(
  resellerId: string,
  requestId: string,
  reason: string,
  actor: WalletActor
): WalletMutationResult {
  const result = rejectResellerWithdrawal(
    resellerId,
    requestId,
    reason,
    toResellerActor(resellerId, actor)
  );
  return { ok: result.ok, error: result.error };
}

export function setResellerWithdrawalRules(
  patch: UpdateRulesPatch,
  actor: { name: string; email: string }
): UpdateRulesResult {
  if (patch.withdrawalApprovalThreshold !== undefined) {
    const v = patch.withdrawalApprovalThreshold;
    if (!Number.isFinite(v) || !Number.isInteger(v)) {
      return { ok: false, error: "Threshold must be a whole number." };
    }
    if (v < MIN_THRESHOLD) {
      return {
        ok: false,
        error: "Threshold must be at least " + MIN_THRESHOLD + ".",
      };
    }
    if (v > MAX_THRESHOLD) {
      return {
        ok: false,
        error: "Threshold must be at most " + MAX_THRESHOLD + ".",
      };
    }
  }
  if (patch.withdrawalFeePercent !== undefined) {
    const v = patch.withdrawalFeePercent;
    if (!Number.isFinite(v)) {
      return { ok: false, error: "Fee rate must be a number." };
    }
    if (v < MIN_FEE_PERCENT || v > MAX_FEE_PERCENT) {
      return {
        ok: false,
        error:
          "Fee rate must be between " +
          MIN_FEE_PERCENT +
          " and " +
          MAX_FEE_PERCENT +
          ".",
      };
    }
  }

  const current = getWalletConfig();
  const previous: ResellerCommissionConfig = {
    withdrawalApprovalThreshold: current.thresholdGHS,
    withdrawalFeePercent: current.feeRatePercent,
    updatedAt: current.updatedAt,
    updatedBy: current.updatedBy,
  };

  internalPatchWalletConfig((c) => ({
    ...c,
    ...(patch.withdrawalApprovalThreshold !== undefined
      ? { thresholdGHS: patch.withdrawalApprovalThreshold }
      : {}),
    ...(patch.withdrawalFeePercent !== undefined
      ? { feeRatePercent: patch.withdrawalFeePercent }
      : {}),
    updatedAt: new Date().toISOString(),
    updatedBy: actor.name,
  }));
  notifyWalletConfig();

  const next = getWalletConfig();
  return {
    ok: true,
    value: {
      withdrawalApprovalThreshold: next.thresholdGHS,
      withdrawalFeePercent: next.feeRatePercent,
      updatedAt: next.updatedAt,
      updatedBy: next.updatedBy,
    },
    previous,
  };
}

export function getWalletThresholdConfig(): ResellerCommissionConfig {
  const c = getWalletConfig();
  return {
    withdrawalApprovalThreshold: c.thresholdGHS,
    withdrawalFeePercent: c.feeRatePercent,
    updatedAt: c.updatedAt,
    updatedBy: c.updatedBy,
  };
}