import type { ResellerSavedPaymentMethod } from "@/lib/reseller/types/wallet";
import type { WalletFundingMethod } from "@/lib/domains/wallet/enums";
import {
  getResellerSavedMethodsFor,
  getResellerSavedMethodsStore,
  internalAddResellerSavedMethod,
  internalPatchResellerSavedMethod,
  internalRemoveResellerSavedMethod,
} from "@/lib/reseller/mock/saved-methods-store";
import {
  MAX_RESELLER_SAVED_METHOD_LABEL_LENGTH,
  MIN_RESELLER_SAVED_METHOD_LABEL_LENGTH,
} from "./wallet-constants";

export interface SavedMethodsActor {
  id: string;
  name: string;
  email: string;
}

export interface SavedMethodsMutationResult {
  ok: boolean;
  error?: string;
  method?: ResellerSavedPaymentMethod;
}

function validateLabel(label: string): { ok: boolean; error?: string } {
  const trimmed = label.trim();
  if (trimmed.length < MIN_RESELLER_SAVED_METHOD_LABEL_LENGTH) {
    return {
      ok: false,
      error:
        "Label must be at least " +
        MIN_RESELLER_SAVED_METHOD_LABEL_LENGTH +
        " characters.",
    };
  }
  if (trimmed.length > MAX_RESELLER_SAVED_METHOD_LABEL_LENGTH) {
    return {
      ok: false,
      error:
        "Label must be " +
        MAX_RESELLER_SAVED_METHOD_LABEL_LENGTH +
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
  resellerId: string,
  input: AddSavedMethodInput,
  actor: SavedMethodsActor
): SavedMethodsMutationResult {
  const labelCheck = validateLabel(input.label);
  if (!labelCheck.ok) return { ok: false, error: labelCheck.error };

  const existing = getResellerSavedMethodsFor(resellerId);
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
  const method: ResellerSavedPaymentMethod = {
    id: "RSPM-" + crypto.randomUUID().slice(0, 8).toUpperCase(),
    resellerId,
    methodId: input.methodId,
    provider: input.provider,
    maskedLabel: input.maskedLabel,
    tokenRef: input.tokenRef,
    label: input.label.trim(),
    isDefault: existing.length === 0,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  internalAddResellerSavedMethod(method);
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
  const updated = internalPatchResellerSavedMethod(methodId, (m) => ({
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
  const removed = internalRemoveResellerSavedMethod(methodId);
  if (!removed) return { ok: false, error: "Saved method not found." };

  if (removed.isDefault) {
    const remaining = getResellerSavedMethodsFor(removed.resellerId);
    if (remaining.length > 0) {
      const promoted = [...remaining].sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )[0];
      internalPatchResellerSavedMethod(promoted.id, (m) => ({
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
  const state = getResellerSavedMethodsStore();
  const target = state.savedMethods.find((m) => m.id === methodId);
  if (!target) return { ok: false, error: "Saved method not found." };

  const nowIso = new Date().toISOString();
  for (const m of state.savedMethods) {
    if (m.resellerId !== target.resellerId) continue;
    internalPatchResellerSavedMethod(m.id, (current) => ({
      ...current,
      isDefault: current.id === methodId,
      updatedAt: nowIso,
    }));
  }
  void actor;
  return { ok: true, method: target };
}