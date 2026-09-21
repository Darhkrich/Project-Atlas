// Admin wallet mutations. Customer requests route to the customer wallet
// store. Storefront user requests route to the shared storefront user
// store. Config writes go to the shared config store.

import type { WalletAutoApproveConfig } from "@/lib/domains/wallet/enums";
import {
  getCustomerWalletStore,
} from "@/lib/customer/mock/wallet-store";
import {
  approveCustomerWithdrawal,
  rejectCustomerWithdrawal,
  type CustomerActor,
} from "@/lib/customer/wallet/wallet-mutations";
import {
  getStorefrontUserState,
} from "@/lib/domains/wallet/storefront-user-state";
import {
  approveStorefrontRefund,
  rejectStorefrontRefund,
} from "@/lib/domains/wallet/storefront-user-refund-mutations";
import {
  internalPatchWalletConfig,
  notifyWalletConfig,
} from "@/lib/domains/wallet/config-store";

export interface WalletActor {
  id?: string;
  name: string;
  email: string;
}

export interface WalletMutationResult {
  ok: boolean;
  error?: string;
}

function toCustomerActor(
  customerId: string,
  actor: WalletActor
): CustomerActor {
  return {
    id: customerId,
    name: actor.name,
    email: actor.email,
  };
}

function toStorefrontAdminActor(actor: WalletActor) {
  return {
    id: actor.id ?? actor.email,
    name: actor.name,
    email: actor.email,
  };
}

function findCustomerRequestOwner(requestId: string): string | null {
  const store = getCustomerWalletStore();
  const request = store.withdrawalRequests.find((r) => r.id === requestId);
  return request ? request.customerId : null;
}

export function approveWalletWithdrawal(
  requestId: string,
  actor: WalletActor
): WalletMutationResult {
  // Customer pool first. The request lives in the customer store.
  const customerOwnerId = findCustomerRequestOwner(requestId);
  if (customerOwnerId) {
    const result = approveCustomerWithdrawal(
      requestId,
      toCustomerActor(customerOwnerId, actor)
    );
    return { ok: result.ok, error: result.error };
  }

  // Storefront user pool. The request lives in the shared store.
  const storefrontState = getStorefrontUserState();
  const request = storefrontState.refundRequests.find(
    (r) => r.id === requestId
  );
  if (request) {
    const result = approveStorefrontRefund(
      requestId,
      toStorefrontAdminActor(actor)
    );
    return { ok: result.ok, error: result.error };
  }

  return { ok: false, error: "Withdrawal request not found." };
}

export function rejectWalletWithdrawal(
  requestId: string,
  reason: string,
  actor: WalletActor
): WalletMutationResult {
  const trimmed = reason.trim();
  if (trimmed.length < 10) {
    return { ok: false, error: "Reason must be at least 10 characters." };
  }

  // Customer pool first.
  const customerOwnerId = findCustomerRequestOwner(requestId);
  if (customerOwnerId) {
    const result = rejectCustomerWithdrawal(
      requestId,
      trimmed,
      toCustomerActor(customerOwnerId, actor)
    );
    return { ok: result.ok, error: result.error };
  }

  // Storefront user pool.
  const storefrontState = getStorefrontUserState();
  const request = storefrontState.refundRequests.find(
    (r) => r.id === requestId
  );
  if (request) {
    const result = rejectStorefrontRefund(
      requestId,
      trimmed,
      toStorefrontAdminActor(actor)
    );
    return { ok: result.ok, error: result.error };
  }

  return { ok: false, error: "Withdrawal request not found." };
}

export function updateWalletAutoApproveConfig(
  patch: Partial<
    Pick<WalletAutoApproveConfig, "thresholdGHS" | "feeRatePercent" | "dailyCap">
  >,
  actor: WalletActor
): WalletMutationResult {
  if (patch.thresholdGHS !== undefined) {
    if (
      !Number.isFinite(patch.thresholdGHS) ||
      !Number.isInteger(patch.thresholdGHS) ||
      patch.thresholdGHS < 100 ||
      patch.thresholdGHS > 100_000
    ) {
      return { ok: false, error: "Threshold must be between 100 and 100000." };
    }
  }
  if (patch.feeRatePercent !== undefined) {
    if (
      !Number.isFinite(patch.feeRatePercent) ||
      patch.feeRatePercent < 0 ||
      patch.feeRatePercent > 10
    ) {
      return { ok: false, error: "Fee rate must be between 0 and 10." };
    }
  }
  if (patch.dailyCap !== undefined) {
    if (
      !Number.isInteger(patch.dailyCap) ||
      patch.dailyCap < 0 ||
      patch.dailyCap > 20
    ) {
      return { ok: false, error: "Daily cap must be between 0 and 20." };
    }
  }

  internalPatchWalletConfig((current) => ({
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
    updatedBy: actor.name,
  }));
  notifyWalletConfig();
  return { ok: true };
}