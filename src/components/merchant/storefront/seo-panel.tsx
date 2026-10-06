/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { AtlasField } from "@/components/atlas/field";
import { AtlasIcon } from "@/components/atlas/icons";
import type { MerchantStorefrontConfig } from "@/types/merchant-storefront";

interface SeoPanelProps {
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

const TITLE_SOFT_LIMIT = 60;
const DESCRIPTION_SOFT_LIMIT = 160;

export function SeoPanel({
  draft,
  setField,
  isDefault,
  resetToDefault,
}: SeoPanelProps) {
  const [titleDraft, setTitleDraft] = useState(draft.seoTitle ?? "");
  const [descDraft, setDescDraft] = useState(draft.seoDescription ?? "");

  useEffect(() => {
    setTitleDraft(draft.seoTitle ?? "");
  }, [draft.seoTitle]);

  useEffect(() => {
    setDescDraft(draft.seoDescription ?? "");
  }, [draft.seoDescription]);

  const titleLength = titleDraft.length;
  const descLength = descDraft.length;

  const titleOver = titleLength > TITLE_SOFT_LIMIT;
  const descOver = descLength > DESCRIPTION_SOFT_LIMIT;

  const effectiveTitle = draft.seoTitle?.trim() || draft.storeName;
  const effectiveDescription =
    draft.seoDescription?.trim() || draft.description;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          Search engine listing
        </h2>
        <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
          How your storefront appears on Google and when shared on
          WhatsApp, Facebook, or X.
        </p>
      </div>

      <AtlasField
        label="Page title"
        htmlFor="seoTitle"
        dirty={!isDefault("seoTitle")}
        onRevertToDefault={() => resetToDefault("seoTitle")}
        hint="Keep it short. Google shows roughly 60 characters."
      >
        <input
          id="seoTitle"
          type="text"
          value={titleDraft}
          onChange={(e) => setTitleDraft(e.target.value)}
          onBlur={() => setField("seoTitle", titleDraft)}
          placeholder={draft.storeName}
          className={inputClass}
        />
      </AtlasField>

      <div className="flex items-center justify-between text-[11px]">
        <span className="text-neutral-500 dark:text-neutral-400">
          {titleLength} characters
        </span>
        {titleOver && (
          <span className="font-medium text-warning-700 dark:text-warning-400">
            Google may cut this off
          </span>
        )}
      </div>

      <AtlasField
        label="Meta description"
        htmlFor="seoDescription"
        dirty={!isDefault("seoDescription")}
        onRevertToDefault={() => resetToDefault("seoDescription")}
        hint="One or two sentences. Google shows roughly 160 characters."
      >
        <textarea
          id="seoDescription"
          value={descDraft}
          onChange={(e) => setDescDraft(e.target.value)}
          onBlur={() => setField("seoDescription", descDraft)}
          rows={3}
          placeholder="Tell customers what your store is about in one or two sentences."
          className={inputClass + " resize-none"}
        />
      </AtlasField>

      <div className="flex items-center justify-between text-[11px]">
        <span className="text-neutral-500 dark:text-neutral-400">
          {descLength} characters
        </span>
        {descOver && (
          <span className="font-medium text-warning-700 dark:text-warning-400">
            Google may cut this off
          </span>
        )}
      </div>

      <div className="border-t border-neutral-200 pt-6 dark:border-neutral-800">
        <AtlasField
          label="Share image URL"
          htmlFor="ogImage"
          dirty={!isDefault("ogImage")}
          onRevertToDefault={() => resetToDefault("ogImage")}
          hint="Shown when your store is shared on social media. Leave blank to use your logo."
        >
          <input
            id="ogImage"
            type="url"
            value={draft.ogImage ?? ""}
            onChange={(e) =>
              setField("ogImage", e.target.value || undefined)
            }
            placeholder="https://example.com/share-image.jpg"
            autoComplete="off"
            className={inputClass}
          />
        </AtlasField>
      </div>

      <div className="border-t border-neutral-200 pt-6 dark:border-neutral-800">
        <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
          Preview
        </p>
        <p className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
          This is roughly how your store appears in Google search results.
        </p>
        <div className="mt-3 rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950">
              <AtlasIcon
                name="globe"
                className="h-4 w-4 text-neutral-500 dark:text-neutral-400"
              />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[11px] text-neutral-500 dark:text-neutral-400">
                {draft.slug || "your-store"}.atlasgh.com
              </p>
              <p className="truncate text-sm font-medium text-info-700 hover:underline dark:text-info-400">
                {effectiveTitle}
              </p>
            </div>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
            {effectiveDescription}
          </p>
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-info-200 bg-info-50 p-3 dark:border-info-800/60 dark:bg-info-900/20">
        <AtlasIcon
          name="info"
          aria-hidden="true"
          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-info-600 dark:text-info-400"
        />
        <p className="text-[11px] leading-relaxed text-info-900 dark:text-info-200">
          If you leave these blank, we use your store name and description.
        </p>
      </div>
    </div>
  );
}