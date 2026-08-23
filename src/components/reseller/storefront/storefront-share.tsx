"use client";

import { useState } from "react";
import { AtlasCard } from "@/components/atlas/card";
import { AtlasIcon } from "@/components/atlas/icons";
type StorefrontShareProps = {
  storefront: {
    slug: string;
    name: string;
  };
};

export function StorefrontShare({
  storefront,
}: StorefrontShareProps) {
  const [copied, setCopied] = useState(false);

  const storeUrl = `https://atlas.com/store/${storefront.slug}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(storeUrl);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setCopied(false);
    }
  };

  const shareWhatsApp = () => {
    const message = `Shop from ${storefront.name}: ${storeUrl}`;

    window.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <AtlasCard className="overflow-hidden border-brand-100 dark:border-brand-900/40">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-800 dark:bg-brand-900/40 dark:text-brand-300">
            <AtlasIcon name="store" className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <h2 className="text-base font-semibold text-neutral-950 dark:text-white">
              Share your storefront
            </h2>

            <p className="mt-1 max-w-xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              Your storefront is ready. Share your link with customers and
              let them purchase services directly from your store.
            </p>

            <div className="mt-3 max-w-full truncate rounded-lg bg-neutral-50 px-3 py-2 text-xs text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">
              {storeUrl}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={copyLink}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-800 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            <AtlasIcon
              name={copied ? "check" : "receipt"}
              className="h-4 w-4"
            />

            {copied ? "Copied" : "Copy Link"}
          </button>

          <button
            type="button"
            onClick={shareWhatsApp}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-800 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-900"
          >
            <AtlasIcon name="phone" className="h-4 w-4" />
            WhatsApp
          </button>
        </div>
      </div>
    </AtlasCard>
  );
}