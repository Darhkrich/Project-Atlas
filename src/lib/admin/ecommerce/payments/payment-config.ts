// lib/admin/ecommerce/payments/payment-config.ts
//
// Admin wrapper for updating the shared auto-approve config. The config
// lives in lib/domains/wallet/config-store.ts and is shared across every
// pool. This file enforces the admin-facing bounds and dispatches into
// the shared store.

"use client";

import {
  getWalletConfig,
  internalPatchWalletConfig,
  notifyWalletConfig,
} from "@/lib/domains/wallet/config-store";

export interface AdminMoneyActor {
  id?: string;
  name: string;
  email: string;
}

export interface AutoApproveConfigPatch {
  thresholdGHS: number;
  feeRatePercent: number;
  dailyCap: number;
}

export interface AutoApproveConfigResult {
  ok: boolean;
  error?: string;
}

const MIN_THRESHOLD = 100;
const MAX_THRESHOLD = 100_000;
const MIN_FEE_PERCENT = 0;
const MAX_FEE_PERCENT = 5;
const MIN_DAILY_CAP = 1;
const MAX_DAILY_CAP = 20;

export function adminUpdateAutoApproveConfig(
  patch: AutoApproveConfigPatch,
  admin: AdminMoneyActor | null | undefined
): AutoApproveConfigResult {
  if (!Number.isFinite(patch.thresholdGHS)) {
    return { ok: false, error: "Threshold must be a number." };
  }
  if (patch.thresholdGHS < MIN_THRESHOLD || patch.thresholdGHS > MAX_THRESHOLD) {
    return {
      ok: false,
      error:
        "Threshold must be between " +
        MIN_THRESHOLD +
        " and " +
        MAX_THRESHOLD +
        ".",
    };
  }
  if (
    !Number.isFinite(patch.feeRatePercent) ||
    patch.feeRatePercent < MIN_FEE_PERCENT ||
    patch.feeRatePercent > MAX_FEE_PERCENT
  ) {
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
  if (
    !Number.isInteger(patch.dailyCap) ||
    patch.dailyCap < MIN_DAILY_CAP ||
    patch.dailyCap > MAX_DAILY_CAP
  ) {
    return {
      ok: false,
      error:
        "Daily cap must be between " +
        MIN_DAILY_CAP +
        " and " +
        MAX_DAILY_CAP +
        ".",
    };
  }

  const nowIso = new Date().toISOString();
  const updatedBy = admin?.name ?? "System";

  const current = getWalletConfig();
  if (
    current.thresholdGHS === patch.thresholdGHS &&
    current.feeRatePercent === patch.feeRatePercent &&
    current.dailyCap === patch.dailyCap
  ) {
    return { ok: true };
  }

  internalPatchWalletConfig((c) => ({
    ...c,
    thresholdGHS: patch.thresholdGHS,
    feeRatePercent: patch.feeRatePercent,
    dailyCap: patch.dailyCap,
    updatedAt: nowIso,
    updatedBy,
  }));
  notifyWalletConfig();

  return { ok: true };
}