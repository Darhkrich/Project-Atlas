// lib/admin/ecommerce/payments/payment-mutations.ts
//
// Admin-facing wrappers over the shared merchant money mutations. RBAC
// is enforced by the UI layer (Can permission wrappers) at the point
// these are called. The wrapper translates the admin actor shape into
// the shared MerchantMoneyActor shape and dispatches.

"use client";

import {
  approveMerchantWithdrawal,
  rejectMerchantWithdrawal,
  applyAdminMerchantAdjustment,
} from "@/lib/domains/wallet/merchant-money/mutations";
import type { MerchantMoneyActor } from "@/lib/domains/wallet/merchant-money/types";

export interface AdminMoneyActor {
  id?: string;
  name: string;
  email: string;
}

export interface AdminMoneyMutationResult {
  ok: boolean;
  error?: string;
}

function toActor(admin: AdminMoneyActor | null | undefined): MerchantMoneyActor {
  if (!admin) {
    return { id: "system", name: "System", email: "system@atlas.com" };
  }
  return {
    id: admin.id ?? admin.email,
    name: admin.name,
    email: admin.email,
  };
}

export function adminApproveWithdrawal(
  withdrawalId: string,
  admin: AdminMoneyActor | null | undefined,
  note?: string
): AdminMoneyMutationResult {
  const result = approveMerchantWithdrawal(
    withdrawalId,
    toActor(admin),
    note
  );
  return { ok: result.ok, error: result.error };
}

export function adminRejectWithdrawal(
  withdrawalId: string,
  admin: AdminMoneyActor | null | undefined,
  reason: string
): AdminMoneyMutationResult {
  const result = rejectMerchantWithdrawal(
    withdrawalId,
    reason,
    toActor(admin)
  );
  return { ok: result.ok, error: result.error };
}

export function adminAdjustMerchantWallet(
  merchantId: string,
  amount: number,
  reason: string,
  admin: AdminMoneyActor | null | undefined
): AdminMoneyMutationResult {
  const result = applyAdminMerchantAdjustment({
    merchantId,
    amount,
    reason,
    actor: toActor(admin),
  });
  return { ok: result.ok, error: result.error };
}