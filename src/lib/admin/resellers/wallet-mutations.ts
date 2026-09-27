// Admin-side wrappers over the public reseller wallet mutations. The
// authoritative store is lib/reseller/mock/wallet-store.ts. This file
// translates the admin actor shape into the public API.
//
// Threshold and fee config live on the shared config store, edited only
// from the Operations Wallets tab. Reseller pages do not edit them.

import {
  approveResellerWithdrawal,
  rejectResellerWithdrawal,
  type ResellerActor,
} from "@/lib/reseller/wallet/wallet-mutations";

export interface WalletActor {
  name: string;
  email: string;
}

export interface WalletMutationResult {
  ok: boolean;
  error?: string;
}

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