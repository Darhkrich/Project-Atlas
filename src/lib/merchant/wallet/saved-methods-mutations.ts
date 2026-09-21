import type { MerchantSavedPaymentMethod } from "@/lib/merchant/types/wallet";
import type { WalletFundingMethod } from "@/lib/domains/wallet/enums";
import {
  getMerchantSavedMethodsFor,
  getMerchantSavedMethodsStore,
  internalAddMerchantSavedMethod,
  internalPatchMerchantSavedMethod,
  internalRemoveMerchantSavedMethod,
} from "@/lib/merchant/mock/saved-methods-store";
import {
  MAX_MERCHANT_SAVED_METHOD_LABEL_LENGTH,
  MIN_MERCHANT_SAVED_METHOD_LABEL_LENGTH,
} from "./wallet-constants";

export interface SavedMethodsActor {
  id: string;
  name: string;
  email: string;
}

export interface SavedMethodsMutationResult {
  ok: boolean;
  error?: string;
  method?: MerchantSavedPaymentMethod;
}

function validateLabel(label: string): { ok: boolean; error?: string } {
  const trimmed = label.trim();
  if (trimmed.length < MIN_MERCHANT_SAVED_METHOD_LABEL_LENGTH) {
    return {
      ok: false,
      error:
        "Label must be at least " +
        MIN_MERCHANT_SAVED_METHOD_LABEL_LENGTH +
        " characters.",
    };
  }
  if (trimmed.length > MAX_MERCHANT_SAVED_METHOD_LABEL_LENGTH) {
    return {
      ok: false,
      error:
        "Label must be " +
        MAX_MERCHANT_SAVED_METHOD_LABEL_LENGTH +
        " characters or fewer.",
    };
  }
  return { ok: true };
}

export interface AddSavedMethodInput {
  methodId: WalletFundingMethod;
  provider: string;
  maskedLabel: string;
  tokenRef?: string;
  label: string;
}

export function addSavedMethod(
  merchantId: string,
  input: AddSavedMethodInput,
  actor: SavedMethodsActor
): SavedMethodsMutationResult {
  const labelCheck = validateLabel(input.label);
  if (!labelCheck.ok) return { ok: false, error: labelCheck.error };

  const existing = getMerchantSavedMethodsFor(merchantId);
  const duplicate = existing.find(
    (m) => m.methodId === input.methodId && m.provider === input.provider
  );
  if (duplicate) {
    return {
      ok: false,
      error:
        "You already have a " + input.provider + " method saved. Edit it instead.",
    };
  }

  const nowIso = new Date().toISOString();
  const method: MerchantSavedPaymentMethod = {
    id: "MSPM-" + crypto.randomUUID().slice(0, 8).toUpperCase(),
    merchantId,
    methodId: input.methodId,
    provider: input.provider,
    maskedLabel: input.maskedLabel,
    tokenRef: input.tokenRef,
    label: input.label.trim(),
    isDefault: existing.length === 0,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  internalAddMerchantSavedMethod(method);
  void actor;
  return { ok: true, method };
}

export interface UpdateSavedMethodPatch {
  label?: string;
  provider?: string;
  maskedLabel?: string;
  tokenRef?: string;
}

export function updateSavedMethod(
  methodId: string,
  patch: UpdateSavedMethodPatch,
  actor: SavedMethodsActor
): SavedMethodsMutationResult {
  if (patch.label !== undefined) {
    const labelCheck = validateLabel(patch.label);
    if (!labelCheck.ok) return { ok: false, error: labelCheck.error };
  }

  const nowIso = new Date().toISOString();
  const updated = internalPatchMerchantSavedMethod(methodId, (m) => ({
    ...m,
    label: patch.label !== undefined ? patch.label.trim() : m.label,
    provider: patch.provider ?? m.provider,
    maskedLabel: patch.maskedLabel ?? m.maskedLabel,
    tokenRef: patch.tokenRef ?? m.tokenRef,
    updatedAt: nowIso,
  }));
  if (!updated) return { ok: false, error: "Saved method not found." };
  void actor;
  return { ok: true, method: updated };
}

export function deleteSavedMethod(
  methodId: string,
  actor: SavedMethodsActor
): SavedMethodsMutationResult {
  const removed = internalRemoveMerchantSavedMethod(methodId);
  if (!removed) return { ok: false, error: "Saved method not found." };

  if (removed.isDefault) {
    const remaining = getMerchantSavedMethodsFor(removed.merchantId);
    if (remaining.length > 0) {
      const promoted = [...remaining].sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )[0];
      internalPatchMerchantSavedMethod(promoted.id, (m) => ({
        ...m,
        isDefault: true,
        updatedAt: new Date().toISOString(),
      }));
    }
  }

  void actor;
  return { ok: true, method: removed };
}

export function setDefaultSavedMethod(
  methodId: string,
  actor: SavedMethodsActor
): SavedMethodsMutationResult {
  const state = getMerchantSavedMethodsStore();
  const target = state.savedMethods.find((m) => m.id === methodId);
  if (!target) return { ok: false, error: "Saved method not found." };

  const nowIso = new Date().toISOString();
  for (const m of state.savedMethods) {
    if (m.merchantId !== target.merchantId) continue;
    internalPatchMerchantSavedMethod(m.id, (current) => ({
      ...current,
      isDefault: current.id === methodId,
      updatedAt: nowIso,
    }));
  }
  void actor;
  return { ok: true, method: target };
}