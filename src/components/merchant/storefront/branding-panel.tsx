/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { AtlasField } from "@/components/atlas/field";
import { AtlasSuggestionList } from "@/components/atlas/suggestion-chip";
import { LogoUpload } from "@/components/merchant/onboarding/LogoUpload";
import { HeroImageField } from "./hero-image-field";
import { FaviconField } from "./favicon-field";
import type { MerchantStorefrontConfig } from "@/types/merchant-storefront";
import { defaultMerchantStorefront } from "@/types/merchant-storefront";
import {
  nextSuggestions,
  type BrandingField,
} from "@/lib/merchant/storefront/branding-suggestions";

interface BrandingPanelProps {
  draft: MerchantStorefrontConfig;
  setField: <K extends keyof MerchantStorefrontConfig>(
    key: K,
    value: MerchantStorefrontConfig[K]
  ) => void;
  isDefault: (key: keyof MerchantStorefrontConfig) => boolean;
  resetToDefault: (key: keyof MerchantStorefrontConfig) => void;
}

const inputClass =
  "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500";

export function BrandingPanel({
  draft,
  setField,
  isDefault,
  resetToDefault,
}: BrandingPanelProps) {
  const [offsets, setOffsets] = useState<Record<BrandingField, number>>({
    tagline: 0,
    description: 0,
    heroTitle: 0,
    heroDescription: 0,
  });

  const suggestions = (field: BrandingField) =>
    nextSuggestions(field, offsets[field], 3).items;

  const shuffle = (field: BrandingField) => {
    setOffsets((prev) => ({
      ...prev,
      [field]: nextSuggestions(field, prev[field], 3).nextOffset,
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          Brand
        </h2>
        <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
          These details appear at the top of your storefront.
        </p>
      </div>

      <AtlasField
        label="Store name"
        htmlFor="storeName"
        dirty={!isDefault("storeName")}
        onRevertToDefault={() => resetToDefault("storeName")}
      >
        <input
          id="storeName"
          type="text"
          value={draft.storeName}
          onChange={(e) => setField("storeName", e.target.value)}
          placeholder="e.g., Glow Beauty"
          autoComplete="organization"
          className={inputClass}
        />
      </AtlasField>

      <div className="space-y-2">
        <AtlasField
          label="Tagline"
          htmlFor="tagline"
          dirty={!isDefault("tagline")}
          onRevertToDefault={() => resetToDefault("tagline")}
          hint="A short line that appears under your store name."
        >
          <input
            id="tagline"
            type="text"
            value={draft.tagline}
            onChange={(e) => setField("tagline", e.target.value)}
            placeholder="e.g., Beauty that shines"
            className={inputClass}
          />
        </AtlasField>
        <AtlasSuggestionList
          suggestions={suggestions("tagline")}
          onSelect={(s) => setField("tagline", s)}
          onShuffle={() => shuffle("tagline")}
        />
      </div>

      <div className="space-y-2">
        <AtlasField
          label="Store description"
          htmlFor="description"
          dirty={!isDefault("description")}
          onRevertToDefault={() => resetToDefault("description")}
          hint="A short paragraph about your store. Shown on the storefront."
        >
          <textarea
            id="description"
            value={draft.description}
            onChange={(e) => setField("description", e.target.value)}
            rows={3}
            placeholder="Tell customers about your store"
            className={inputClass + " resize-none"}
          />
        </AtlasField>
        <AtlasSuggestionList
          suggestions={suggestions("description")}
          onSelect={(s) => setField("description", s)}
          onShuffle={() => shuffle("description")}
        />
      </div>

      <div className="border-t border-neutral-200 pt-6 dark:border-neutral-800">
        <div className="grid gap-4 sm:grid-cols-2">
          <AtlasField
            label="Store logo"
            htmlFor="logo"
            dirty={!isDefault("logo")}
            onRevertToDefault={() => resetToDefault("logo")}
            hint="PNG, JPG, or SVG. Square works best."
          >
            <LogoUpload
              value={draft.logo ?? ""}
              onChange={(value) => setField("logo", value || undefined)}
            />
          </AtlasField>

          <div>
            <FaviconField
              value={draft.favicon}
              onChange={(value) => setField("favicon", value)}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2 border-t border-neutral-200 pt-6 dark:border-neutral-800">
        <AtlasField
          label="Hero headline"
          htmlFor="heroTitle"
          dirty={!isDefault("heroTitle")}
          onRevertToDefault={() => resetToDefault("heroTitle")}
          hint="Leave blank to use your store name."
        >
          <input
            id="heroTitle"
            type="text"
            value={draft.heroTitle}
            onChange={(e) => setField("heroTitle", e.target.value)}
            className={inputClass}
          />
        </AtlasField>
        <AtlasSuggestionList
          suggestions={suggestions("heroTitle")}
          onSelect={(s) => setField("heroTitle", s)}
          onShuffle={() => shuffle("heroTitle")}
        />
      </div>

      <div className="space-y-2">
        <AtlasField
          label="Hero description"
          htmlFor="heroDescription"
          dirty={!isDefault("heroDescription")}
          onRevertToDefault={() => resetToDefault("heroDescription")}
        >
          <textarea
            id="heroDescription"
            value={draft.heroDescription}
            onChange={(e) => setField("heroDescription", e.target.value)}
            rows={3}
            className={inputClass + " resize-none"}
          />
        </AtlasField>
        <AtlasSuggestionList
          suggestions={suggestions("heroDescription")}
          onSelect={(s) => setField("heroDescription", s)}
          onShuffle={() => shuffle("heroDescription")}
        />
      </div>

      <div className="border-t border-neutral-200 pt-6 dark:border-neutral-800">
        <HeroImageField
          value={draft.heroImage}
          category={draft.templateCategory}
          onChange={(value) => setField("heroImage", value)}
        />
      </div>

      <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
        Defaults come from the template. Reverting a field restores the
        template default for that field only.
      </p>
    </div>
  );
}