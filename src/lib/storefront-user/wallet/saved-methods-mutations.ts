import type { StorefrontSavedPaymentMethod } from "@/lib/storefront-user/types/wallet";
import type { WalletFundingMethod } from "@/lib/domains/wallet/enums";
import {
  getStorefrontSavedMethodsFor,
  getStorefrontSavedMethodsStore,
  internalAddStorefrontSavedMethod,
  internalPatchStorefrontSavedMethod,
  internalRemoveStorefrontSavedMethod,
} from "@/lib/storefront-user/mock/saved-methods-store";

export interface SavedMethodsActor {
  id: string;
  name: string;
  email: string;
}

export interface SavedMethodsMutationResult {
  ok: boolean;
  error?: string;
  method?: StorefrontSavedPaymentMethod;
}

export interface AddSavedMethodInput {
  methodId: WalletFundingMethod;
  provider: string;
  maskedLabel: string;
  tokenRef?: string;
  label: string;
  fieldValues: Record<string, string>;
}

export function addSavedMethod(
  walletId: string,
  ownerId: string,
  input: AddSavedMethodInput,
  actor: SavedMethodsActor
): SavedMethodsMutationResult {
  const existing = getStorefrontSavedMethodsFor(walletId);
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
  const method: StorefrontSavedPaymentMethod = {
    id: "SSM-" + crypto.randomUUID().slice(0, 8).toUpperCase(),
    walletId,
    ownerId,
    methodId: input.methodId,
    provider: input.provider,
    maskedLabel: input.maskedLabel,
    tokenRef: input.tokenRef,
    label: input.label.trim(),
    isDefault: existing.length === 0,
    createdAt: nowIso,
    updatedAt: nowIso,
    fieldValues: { ...input.fieldValues },
  };

  internalAddStorefrontSavedMethod(method);
  void actor;
  return { ok: true, method };
}

export function deleteSavedMethod(
  methodId: string,
  actor: SavedMethodsActor
): SavedMethodsMutationResult {
  const removed = internalRemoveStorefrontSavedMethod(methodId);
  if (!removed) return { ok: false, error: "Saved method not found." };

  if (removed.isDefault) {
    const remaining = getStorefrontSavedMethodsFor(removed.walletId);
    if (remaining.length > 0) {
      const promoted = [...remaining].sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )[0];
      internalPatchStorefrontSavedMethod(promoted.id, (m) => ({
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
  const state = getStorefrontSavedMethodsStore();
  const target = state.savedMethods.find((m) => m.id === methodId);
  if (!target) return { ok: false, error: "Saved method not found." };

  const nowIso = new Date().toISOString();
  for (const m of state.savedMethods) {
    if (m.walletId !== target.walletId) continue;
    internalPatchStorefrontSavedMethod(m.id, (current) => ({
      ...current,
      isDefault: current.id === methodId,
      updatedAt: nowIso,
    }));
  }
  void actor;
  return { ok: true, method: target };
}

export function updateSavedMethodLabel(
  methodId: string,
  nextLabel: string,
  actor: SavedMethodsActor
): SavedMethodsMutationResult {
  const trimmed = nextLabel.trim();
  if (trimmed.length < 2) {
    return { ok: false, error: "Label must be at least 2 characters." };
  }
  const updated = internalPatchStorefrontSavedMethod(methodId, (m) => ({
    ...m,
    label: trimmed,
    updatedAt: new Date().toISOString(),
  }));
  if (!updated) return { ok: false, error: "Saved method not found." };
  void actor;
  return { ok: true, method: updated };
}