"use client";

import { useState } from "react";
import { AtlasCard } from "@/components/atlas/card";
import { AtlasIcon } from "@/components/atlas/icons";
import type { AtlasIconName } from "@/components/atlas/icons";
import { Button } from "@/components/atlas/button";
import { AtlasEmptyState } from "@/components/atlas/empty-state";
import { AtlasBadge } from "@/components/atlas/badge";
import type { ResellerSavedPaymentMethod } from "@/lib/reseller/types/wallet";

interface Props {
  savedMethods: ResellerSavedPaymentMethod[];
  onSetDefault: (methodId: string) => void;
  onEdit: (method: ResellerSavedPaymentMethod) => void;
  onDelete: (methodId: string) => void;
  onAdd: () => void;
}

function iconForMethod(methodId: string): AtlasIconName {
  if (methodId === "card") return "card";
  if (methodId === "bank") return "bank";
  if (methodId === "momo") return "mobile";
  return "star";
}

export function WalletSavedMethods({
  savedMethods,
  onSetDefault,
  onEdit,
  onDelete,
  onAdd,
}: Props) {
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);

  return (
    <section aria-labelledby="reseller-saved-methods-heading">
      <div className="mb-4 flex items-center justify-between">
        <h2
          id="reseller-saved-methods-heading"
          className="text-lg font-semibold text-neutral-950 dark:text-white"
        >
          Saved payment methods
        </h2>
        <span className="text-sm text-neutral-500 dark:text-neutral-400">
          {savedMethods.length}{" "}
          {savedMethods.length === 1 ? "method" : "methods"}
        </span>
      </div>

      {savedMethods.length === 0 ? (
        <AtlasEmptyState
          title="No saved payment methods"
          description="Save a payment method to make future wallet funding faster."
          action={
            <Button variant="outline" onClick={onAdd}>
              Add payment method
            </Button>
          }
        />
      ) : (
        <ul role="list" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {savedMethods.map((method) => (
            <li key={method.id}>
              <AtlasCard>
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                    <AtlasIcon
                      name={iconForMethod(method.methodId)}
                      className="h-5 w-5"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-neutral-950 dark:text-white">
                        {method.label}
                      </p>
                      {method.isDefault && (
                        <AtlasBadge variant="brand">Default</AtlasBadge>
                      )}
                    </div>
                    <p className="mt-1 truncate text-xs text-neutral-500 dark:text-neutral-400">
                      {method.provider} {method.maskedLabel}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-end gap-1 border-t border-neutral-100 pt-3 dark:border-neutral-800">
                  {!method.isDefault && (
                    <button
                      type="button"
                      onClick={() => onSetDefault(method.id)}
                      className="rounded-md p-1.5 text-neutral-400 transition-colors hover:text-brand-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:hover:text-brand-300"
                      aria-label={"Set " + method.label + " as default"}
                    >
                      <AtlasIcon name="star" className="h-4 w-4" aria-hidden="true" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onEdit(method)}
                    className="rounded-md p-1.5 text-neutral-400 transition-colors hover:text-brand-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:hover:text-brand-300"
                    aria-label={"Edit " + method.label}
                  >
                    <AtlasIcon name="settings" className="h-4 w-4" aria-hidden="true" />
                  </button>
                  {confirmingDelete === method.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          onDelete(method.id);
                          setConfirmingDelete(null);
                        }}
                        className="rounded-md bg-danger-100 px-2 py-1 text-xs font-medium text-danger-800 dark:bg-danger-900/60 dark:text-danger-200"
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmingDelete(null)}
                        className="rounded-md px-2 py-1 text-xs text-neutral-500 dark:text-neutral-400"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmingDelete(method.id)}
                      className="rounded-md p-1.5 text-neutral-400 transition-colors hover:text-danger-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-danger-500 dark:hover:text-danger-400"
                      aria-label={"Delete " + method.label}
                    >
                      <AtlasIcon name="x-circle" className="h-4 w-4" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </AtlasCard>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}