"use client";

import { useState } from "react";
import { AtlasCard } from "@/components/atlas/card";
import { AtlasIcon } from "@/components/atlas/icons";
import type { AtlasIconName } from "@/components/atlas/icons";
import { Button } from "@/components/atlas/button";
import { AtlasBadge } from "@/components/atlas/badge";
import { AtlasInput } from "@/components/atlas/Input";
import { AtlasModalShell } from "@/components/atlas/modal-shell";
import { useSavedMethods } from "@/lib/storefront-user/hooks/use-saved-methods";
import { useCurrentStorefrontCustomer } from "@/lib/storefront-user/hooks/use-current-storefront-customer";
import {
  deleteSavedMethod,
  setDefaultSavedMethod,
  updateSavedMethodLabel,
} from "@/lib/storefront-user/wallet/saved-methods-mutations";
import type { StorefrontSavedPaymentMethod } from "@/lib/storefront-user/types/wallet";

interface Props {
  onAdd: () => void;
}

function iconForMethod(methodId: string): AtlasIconName {
  if (methodId === "card") return "card";
  if (methodId === "bank") return "bank";
  if (methodId === "momo") return "mobile";
  return "credit-card";
}

export function SavedMethodsSection({ onAdd }: Props) {
  const customer = useCurrentStorefrontCustomer();
  const { savedMethods } = useSavedMethods();
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<StorefrontSavedPaymentMethod | null>(
    null
  );
  const [renameValue, setRenameValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!customer) return null;

  const actor = {
    id: customer.id,
    name: customer.name,
    email: customer.email,
  };

  const handleDelete = (methodId: string) => {
    const result = deleteSavedMethod(methodId, actor);
    if (!result.ok) setError(result.error ?? "Could not delete this method.");
    setConfirmingDelete(null);
  };

  const handleSetDefault = (methodId: string) => {
    const result = setDefaultSavedMethod(methodId, actor);
    if (!result.ok) setError(result.error ?? "Could not set default.");
  };

  const openRename = (method: StorefrontSavedPaymentMethod) => {
    setRenaming(method);
    setRenameValue(method.label);
    setError(null);
  };

  const handleSaveRename = () => {
    if (!renaming) return;
    const result = updateSavedMethodLabel(renaming.id, renameValue, actor);
    if (!result.ok) {
      setError(result.error ?? "Could not rename this method.");
      return;
    }
    setRenaming(null);
  };

  return (
    <section aria-labelledby="storefront-saved-methods-heading">
      <div className="mb-4 flex items-center justify-between">
        <h2
          id="storefront-saved-methods-heading"
          className="text-lg font-semibold text-neutral-900"
        >
          Saved payment methods
        </h2>
        <button
          type="button"
          onClick={onAdd}
          className="text-sm font-medium text-brand-700 hover:underline"
        >
          Add method
        </button>
      </div>

      <AtlasCard>
        {savedMethods.length === 0 ? (
          <div className="py-4 text-center">
            <p className="text-sm text-neutral-600">
              Save a payment method during checkout and it will appear here as
              your default.
            </p>
          </div>
        ) : (
          <ul role="list" className="divide-y divide-neutral-100">
            {savedMethods.map((method) => (
              <li
                key={method.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100">
                    <AtlasIcon
                      name={iconForMethod(method.methodId)}
                      className="h-5 w-5 text-neutral-700"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-neutral-900">
                        {method.label}
                      </p>
                      {method.isDefault && (
                        <AtlasBadge variant="brand" size="sm">
                          Default
                        </AtlasBadge>
                      )}
                    </div>
                    <p className="truncate text-xs text-neutral-500">
                      {method.provider} {method.maskedLabel}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {!method.isDefault && (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(method.id)}
                      className="rounded-md px-2 py-1 text-xs font-medium text-neutral-600 hover:text-brand-700"
                    >
                      Set default
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => openRename(method)}
                    className="rounded-md px-2 py-1 text-xs font-medium text-neutral-600 hover:text-brand-700"
                  >
                    Rename
                  </button>
                  {confirmingDelete === method.id ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleDelete(method.id)}
                        className="rounded-md bg-danger-100 px-2 py-1 text-xs font-medium text-danger-800"
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmingDelete(null)}
                        className="rounded-md px-2 py-1 text-xs text-neutral-500"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmingDelete(method.id)}
                      className="rounded-md px-2 py-1 text-xs font-medium text-danger-600 hover:text-danger-700"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        {error && (
          <p role="alert" className="mt-3 text-xs text-danger-600">
            {error}
          </p>
        )}
      </AtlasCard>

      <AtlasModalShell
        open={renaming !== null}
        onClose={() => setRenaming(null)}
        title="Rename saved method"
        size="sm"
      >
        <div className="space-y-4">
          <AtlasInput
            label="Label"
            value={renameValue}
            onChange={(e) => {
              setRenameValue(e.target.value);
              setError(null);
            }}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setRenaming(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveRename}>Save</Button>
          </div>
        </div>
      </AtlasModalShell>
    </section>
  );
}