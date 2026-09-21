import type { StorefrontWalletActor } from "@/lib/domains/wallet/storefront-user-wallet-mutations";
import type { StorefrontRefundActor } from "@/lib/domains/wallet/storefront-user-refund-mutations";
import {
  ensureStorefrontWallet as ensureShared,
  fundStorefrontUserWallet as fundShared,
  recordStorefrontPurchase as recordShared,
  deleteStorefrontUserWallet as deleteShared,
} from "@/lib/domains/wallet/storefront-user-wallet-mutations";
import {
  createStorefrontRefund,
  cancelStorefrontRefundRequest,
} from "@/lib/domains/wallet/storefront-user-refund-mutations";
import { getStorefrontUserState } from "@/lib/domains/wallet/storefront-user-state";

export interface StorefrontActor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  storefrontId: string;
  resellerSlug: string;
  storefrontName: string;
}

export interface StorefrontMutationResult {
  ok: boolean;
  error?: string;
  reference?: string;
  requiresApproval?: boolean;
}

function toWalletActor(actor: StorefrontActor): StorefrontWalletActor {
  return {
    id: actor.id,
    name: actor.name,
    email: actor.email,
    phone: actor.phone,
    storefrontId: actor.storefrontId,
    resellerSlug: actor.resellerSlug,
    storefrontName: actor.storefrontName,
  };
}

function toRefundActor(actor: StorefrontActor): StorefrontRefundActor {
  return {
    id: actor.id,
    name: actor.name,
    email: actor.email,
    phone: actor.phone,
    storefrontId: actor.storefrontId,
    resellerSlug: actor.resellerSlug,
    storefrontName: actor.storefrontName,
  };
}

export function ensureStorefrontWallet(actor: StorefrontActor): string {
  return ensureShared(toWalletActor(actor));
}

export interface FundInput {
  amount: number;
  method: "momo" | "card" | "bank";
  provider: string;
  maskedLabel: string;
}

export function fundStorefrontUserWallet(
  walletId: string,
  input: FundInput,
  actor: StorefrontActor
): StorefrontMutationResult {
  return fundShared(walletId, input, toWalletActor(actor));
}

export interface PurchaseInput {
  amount: number;
  service: string;
  plan: string;
  orderId: string;
}

export function recordStorefrontPurchase(
  walletId: string,
  input: PurchaseInput,
  actor: StorefrontActor
): StorefrontMutationResult {
  return recordShared(walletId, input, toWalletActor(actor));
}

export interface RefundInput {
  sourcePaymentId: string;
  amount: number;
}

export function requestStorefrontRefund(
  walletId: string,
  input: RefundInput,
  actor: StorefrontActor
): StorefrontMutationResult {
  const result = createStorefrontRefund(
    {
      walletId,
      sourcePaymentId: input.sourcePaymentId,
      amount: input.amount,
    },
    toRefundActor(actor)
  );
  return {
    ok: result.ok,
    error: result.error,
    reference: result.reference,
    requiresApproval: result.requiresApproval,
  };
}

export function cancelStorefrontRefund(
  walletId: string,
  requestId: string,
  actor: StorefrontActor
): StorefrontMutationResult {
  const state = getStorefrontUserState();
  const request = state.refundRequests.find((r) => r.id === requestId);
  if (!request) {
    return { ok: false, error: "Refund request not found." };
  }
  if (request.walletId !== walletId) {
    return {
      ok: false,
      error: "Refund request does not belong to this wallet.",
    };
  }
  const result = cancelStorefrontRefundRequest(requestId, toRefundActor(actor));
  return { ok: result.ok, error: result.error };
}

export function deleteStorefrontAccount(
  walletId: string,
  actor: StorefrontActor
): StorefrontMutationResult {
  void actor;
  const ok = deleteShared(walletId);
  return { ok };
}