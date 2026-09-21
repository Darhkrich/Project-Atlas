import type {
  CustomerSavedPaymentMethod,
} from "@/lib/customer/types/wallet";
import type { WalletFundingMethod } from "@/lib/domains/wallet/enums";
import {
  getSavedMethodsFor,
  getSavedMethodsStore,
  internalAddSavedMethod,
  internalPatchSavedMethod,
  internalRemoveSavedMethod,
} from "@/lib/customer/mock/saved-methods-store";
import {
  MAX_SAVED_METHOD_LABEL_LENGTH,
  MIN_SAVED_METHOD_LABEL_LENGTH,
} from "./wallet-constants";

export interface SavedMethodsActor {
  id: string;
  name: string;
  email: string;
}

export interface SavedMethodsMutationResult {
  ok: boolean;
  error?: string;
  method?: CustomerSavedPaymentMethod;
}

export interface AddSavedMethodInput {
  methodId: WalletFundingMethod;
  provider: string;
  maskedLabel: string;
  tokenRef?: string;
  label: string;
}

function validateLabel(label: string): { ok: boolean; error?: string } {
  const trimmed = label.trim();
  if (trimmed.length < MIN_SAVED_METHOD_LABEL_LENGTH) {
    return {
      ok: false,
      error:
        "Label must be at least " +
        MIN_SAVED_METHOD_LABEL_LENGTH +
        " characters.",
    };
  }
  if (trimmed.length > MAX_SAVED_METHOD_LABEL_LENGTH) {
    return {
      ok: false,
      error:
        "Label must be " +
        MAX_SAVED_METHOD_LABEL_LENGTH +
        " characters or fewer.",
    };
  }
  return { ok: true };
}

export function addSavedMethod(
  customerId: string,
  input: AddSavedMethodInput,
  actor: SavedMethodsActor
): SavedMethodsMutationResult {
  const labelCheck = validateLabel(input.label);
  if (!labelCheck.ok) return { ok: false, error: labelCheck.error };

  const existing = getSavedMethodsFor(customerId);
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
  const method: CustomerSavedPaymentMethod = {
    id: "SPM-" + crypto.randomUUID().slice(0, 8).toUpperCase(),
    customerId,
    methodId: input.methodId,
    provider: input.provider,
    maskedLabel: input.maskedLabel,
    tokenRef: input.tokenRef,
    label: input.label.trim(),
    isDefault: existing.length === 0,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  internalAddSavedMethod(method);
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
  const updated = internalPatchSavedMethod(methodId, (m) => ({
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
  const removed = internalRemoveSavedMethod(methodId);
  if (!removed) return { ok: false, error: "Saved method not found." };

  if (removed.isDefault) {
    const remaining = getSavedMethodsFor(removed.customerId);
    if (remaining.length > 0) {
      const promoted = [...remaining].sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )[0];
      internalPatchSavedMethod(promoted.id, (m) => ({
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
  const state = getSavedMethodsStore();
  const target = state.savedMethods.find((m) => m.id === methodId);
  if (!target) return { ok: false, error: "Saved method not found." };

  const nowIso = new Date().toISOString();
  for (const m of state.savedMethods) {
    if (m.customerId !== target.customerId) continue;
    internalPatchSavedMethod(m.id, (current) => ({
      ...current,
      isDefault: current.id === methodId,
      updatedAt: nowIso,
    }));
  }
  void actor;
  return { ok: true, method: target };
}