// lib/admin/ecommerce/payments/payment-mutations.ts
//
// Admin-facing wrappers over the shared merchant money mutations. RBAC
// is enforced by the UI layer (Can permission wrappers) at the point
// these are called. The wrapper translates the admin actor shape into
// the shared MerchantMoneyActor shape and dispatches.
//
// Withdrawal approval and rejection are not here. They live in the
// Operations Wallets tab and dispatch through the four-pool router
// in app/admin/payments/page.tsx.

"use client";

import {
  adjustMerchantWallet,
  freezeMerchantWallet,
  unfreezeMerchantWallet,
} from "@/lib/domains/wallet/merchant-money/mutations";
import type {
  MerchantMoneyActor,
  MerchantWalletType,
} from "@/lib/domains/wallet/merchant-money/types";

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

export function adminAdjustMerchantWallet(
  merchantId: string,
  merchantName: string,
  walletType: MerchantWalletType,
  amount: number,
  reason: string,
  admin: AdminMoneyActor | null | undefined
): AdminMoneyMutationResult {
  const result = adjustMerchantWallet({
    merchantId,
    merchantName,
    walletType,
    amount,
    reason,
    actor: toActor(admin),
  });
  return { ok: result.ok, error: result.error };
}

export function adminFreezeMerchantWallet(
  merchantId: string,
  walletType: MerchantWalletType,
  reason: string,
  admin: AdminMoneyActor | null | undefined
): AdminMoneyMutationResult {
  const result = freezeMerchantWallet(
    merchantId,
    walletType,
    reason,
    toActor(admin)
  );
  return { ok: result.ok, error: result.error };
}

export function adminUnfreezeMerchantWallet(
  merchantId: string,
  walletType: MerchantWalletType,
  admin: AdminMoneyActor | null | undefined
): AdminMoneyMutationResult {
  const result = unfreezeMerchantWallet(
    merchantId,
    walletType,
    toActor(admin)
  );
  return { ok: result.ok, error: result.error };
}