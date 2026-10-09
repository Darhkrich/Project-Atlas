/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { AtlasModalShell } from "@/components/atlas/modal-shell";
import { MediaField } from "@/components/merchant/media/media-field";
import { cn } from "@/lib/utils";
import {
  PROMO_BANNER_BADGE_MAX,
  PROMO_BANNER_HEADLINE_MAX,
  PROMO_BANNER_LINK_LABEL_MAX,
  PROMO_BANNER_LINK_URL_MAX,
  PROMO_BANNER_SUBHEAD_MAX,
} from "@/lib/merchant/storefront/promos-constants";
import type {
  MerchantTemplateCategory,
  PromoBanner,
  PromoBannerAlignment,
  PromoPlacement,
} from "@/types/merchant-storefront";

interface PromoBannerFormModalProps {
  open: boolean;
  onClose: () => void;
  banner: PromoBanner | null;
  placement: PromoPlacement;
  category: MerchantTemplateCategory;
  onSubmit: (input: Omit<PromoBanner, "id" | "order">) => void;
}

interface FormState {
  imageUrl: string | undefined;
  headline: string;
  subhead: string;
  badge: string;
  linkUrl: string;
  linkLabel: string;
  alignment: PromoBannerAlignment;
  backgroundColor: string;
  enabled: boolean;
}

const EMPTY_FORM: FormState = {
  imageUrl: undefined,
  headline: "",
  subhead: "",
  badge: "",
  linkUrl: "",
  linkLabel: "",
  alignment: "left",
  backgroundColor: "",
  enabled: true,
};

const inputClass =
  "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500";

const ALIGNMENTS: { value: PromoBannerAlignment; label: string }[] = [
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right" },
];

function usageForPlacement(placement: PromoPlacement) {
  if (placement === "before_hero") return "promo_before_hero" as const;
  if (placement === "after_hero") return "promo_after_hero" as const;
  return "promo_as_hero_background" as const;
}

function formFromBanner(banner: PromoBanner): FormState {
  return {
    imageUrl: banner.imageUrl,
    headline: banner.headline,
    subhead: banner.subhead ?? "",
    badge: banner.badge ?? "",
    linkUrl: banner.linkUrl ?? "",
    linkLabel: banner.linkLabel ?? "",
    alignment: banner.alignment,
    backgroundColor: banner.backgroundColor ?? "",
    enabled: banner.enabled,
  };
}

export function PromoBannerFormModal({
  open,
  onClose,
  banner,
  placement,
  category,
  onSubmit,
}: PromoBannerFormModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setForm(banner ? formFromBanner(banner) : EMPTY_FORM);
    setError(null);
  }, [open, banner]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  }

  function handleSubmit() {
    const headline = form.headline.trim();
    const imageUrl = form.imageUrl;

    if (headline.length === 0 && !imageUrl) {
      setError("Add a headline or an image. A banner needs at least one.");
      return;
    }

    const linkUrl = form.linkUrl.trim();
    const linkLabel = form.linkLabel.trim();
    if (linkLabel.length > 0 && linkUrl.length === 0) {
      setError("Add a link URL to use a custom link label.");
      return;
    }

    onSubmit({
      imageUrl,
      headline: headline.slice(0, PROMO_BANNER_HEADLINE_MAX),
      subhead:
        form.subhead.trim().slice(0, PROMO_BANNER_SUBHEAD_MAX) || undefined,
      badge: form.badge.trim().slice(0, PROMO_BANNER_BADGE_MAX) || undefined,
      linkUrl: linkUrl.slice(0, PROMO_BANNER_LINK_URL_MAX) || undefined,
      linkLabel:
        linkUrl.length > 0
          ? linkLabel.slice(0, PROMO_BANNER_LINK_LABEL_MAX) || "Shop now"
          : undefined,
      alignment: form.alignment,
      backgroundColor: form.backgroundColor.trim() || undefined,
      enabled: form.enabled,
    });
  }

  return (
    <AtlasModalShell
      open={open}
      onClose={onClose}
      title={banner ? "Edit banner" : "New banner"}
      description="Add a headline, an image, or both."
      size="lg"
    >
      <div className="space-y-5">
        <MediaField
          label="Banner image (optional)"
          hint={"Shown on the " + placement.replace(/_/g, " ") + " banner."}
          value={form.imageUrl}
          usage={usageForPlacement(placement)}
          category={category}
          onChange={(value) => setField("imageUrl", value)}
          previewAspect="aspect-[16/9]"
        />

        <div>
          <label
            htmlFor="banner-headline"
            className="mb-1.5 block text-xs font-medium text-neutral-700 dark:text-neutral-300"
          >
            Headline
          </label>
          <input
            id="banner-headline"
            type="text"
            value={form.headline}
            onChange={(e) => setField("headline", e.target.value)}
            placeholder={"e.g. Free delivery in Accra this week"}
            maxLength={PROMO_BANNER_HEADLINE_MAX}
            className={inputClass}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor="banner-subhead"
              className="mb-1.5 block text-xs font-medium text-neutral-700 dark:text-neutral-300"
            >
              Subtext (optional)
            </label>
            <input
              id="banner-subhead"
              type="text"
              value={form.subhead}
              onChange={(e) => setField("subhead", e.target.value)}
              placeholder={"A short second line"}
              maxLength={PROMO_BANNER_SUBHEAD_MAX}
              className={inputClass}
            />
          </div>
          <div>
            <label
              htmlFor="banner-badge"
              className="mb-1.5 block text-xs font-medium text-neutral-700 dark:text-neutral-300"
            >
              Badge (optional)
            </label>
            <input
              id="banner-badge"
              type="text"
              value={form.badge}
              onChange={(e) => setField("badge", e.target.value)}
              placeholder={"e.g. Up to 40% off"}
              maxLength={PROMO_BANNER_BADGE_MAX}
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor="banner-link"
              className="mb-1.5 block text-xs font-medium text-neutral-700 dark:text-neutral-300"
            >
              Link URL (optional)
            </label>
            <input
              id="banner-link"
              type="text"
              value={form.linkUrl}
              onChange={(e) => setField("linkUrl", e.target.value)}
              placeholder="/products or https://"
              maxLength={PROMO_BANNER_LINK_URL_MAX}
              autoComplete="off"
              spellCheck={false}
              className={inputClass + " font-mono text-xs"}
            />
          </div>
          <div>
            <label
              htmlFor="banner-link-label"
              className="mb-1.5 block text-xs font-medium text-neutral-700 dark:text-neutral-300"
            >
              Link label
            </label>
            <input
              id="banner-link-label"
              type="text"
              value={form.linkLabel}
              onChange={(e) => setField("linkLabel", e.target.value)}
              placeholder="Shop now"
              maxLength={PROMO_BANNER_LINK_LABEL_MAX}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300">
            Text alignment
          </p>
          <div className="flex gap-2">
            {ALIGNMENTS.map((a) => {
              const selected = form.alignment === a.value;
              return (
                <button
                  key={a.value}
                  type="button"
                  onClick={() => setField("alignment", a.value)}
                  aria-pressed={selected}
                  className={cn(
                    "rounded-md border px-3 py-1.5 text-xs font-semibold transition",
                    selected
                      ? "border-brand-600 bg-brand-600 text-white"
                      : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200"
                  )}
                >
                  {a.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label
            htmlFor="banner-bg"
            className="mb-1.5 block text-xs font-medium text-neutral-700 dark:text-neutral-300"
          >
            Banner background (optional)
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={form.backgroundColor || "#ffffff"}
              onChange={(e) => setField("backgroundColor", e.target.value)}
              aria-label="Banner background color"
              className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-neutral-200 bg-white p-1 dark:border-neutral-800 dark:bg-neutral-900"
            />
            <input
              id="banner-bg"
              type="text"
              value={form.backgroundColor}
              onChange={(e) => setField("backgroundColor", e.target.value)}
              placeholder="Leave blank to use your theme"
              className={
                inputClass + " min-w-0 flex-1 font-mono text-xs uppercase"
              }
            />
          </div>
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
          <input
            type="checkbox"
            checked={form.enabled}
            onChange={(e) => setField("enabled", e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-500 dark:border-neutral-600"
          />
          <span>
            <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
              Enabled
            </span>
            <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
              Disabled banners are saved but skipped in the rotation.
            </span>
          </span>
        </label>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-danger-200 bg-danger-50 px-3 py-2 text-xs text-danger-700 dark:border-danger-900 dark:bg-danger-900/20 dark:text-danger-300"
          >
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            {banner ? "Save banner" : "Add banner"}
          </button>
        </div>
      </div>
    </AtlasModalShell>
  );
}