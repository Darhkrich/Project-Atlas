"use client";

import { useCallback } from "react";
import { useStorefrontConfig } from "@/contexts/storefront-config-context";
import { useCurrentMerchant } from "@/lib/merchant/hooks/use-current-merchant";
import { useStorefrontDraft } from "@/lib/merchant/storefront/use-storefront-draft";
import { useAutosave } from "@/lib/merchant/storefront/use-autosave";
import { SaveIndicator } from "@/components/merchant/storefront/save-indicator";
import { PromosPanel } from "@/components/merchant/storefront/promos-panel";
import type { MerchantStorefrontConfig } from "@/types/merchant-storefront";

export function PromosPageContent() {
  const { storefrontConfig, updateStorefrontConfig } = useStorefrontConfig();
  const merchant = useCurrentMerchant();
  const draft = useStorefrontDraft(storefrontConfig);

  const autosave = useAutosave({
    value: draft.draft,
    delay: 500,
    onSave: useCallback(
      (value: MerchantStorefrontConfig) => {
        if (!merchant) return;
        updateStorefrontConfig(value, merchant.email);
        draft.markCommitted();
      },
      [merchant, updateStorefrontConfig, draft]
    ),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-300">
            Marketing
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-950 dark:text-white sm:text-3xl">
            Run promo
          </h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Banners your customers see on the storefront.
          </p>
        </div>
        <SaveIndicator
          state={autosave.state}
          lastSavedAt={autosave.lastSavedAt}
          errorMessage={autosave.errorMessage}
        />
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <PromosPanel draft={draft.draft} setField={draft.setField} />
      </div>
    </div>
  );
}