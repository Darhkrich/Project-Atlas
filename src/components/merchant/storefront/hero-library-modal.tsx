/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState } from "react";
import { AtlasModalShell } from "@/components/atlas/modal-shell";
import { Button } from "@/components/atlas/button";
import { AtlasIcon } from "@/components/atlas/icons";
import {
  heroLibraryFor,
  allHeroImages,
} from "@/lib/merchant/storefront/hero-library";
import type { MerchantTemplateCategory } from "@/types/merchant-storefront";
import { cn } from "@/lib/utils";

interface HeroLibraryModalProps {
  open: boolean;
  category: MerchantTemplateCategory;
  currentUrl: string | undefined;
  onCancel: () => void;
  onSelect: (url: string) => void;
}

export function HeroLibraryModal({
  open,
  category,
  currentUrl,
  onCancel,
  onSelect,
}: HeroLibraryModalProps) {
  const [showAll, setShowAll] = useState(false);
  const [pending, setPending] = useState<string | undefined>(undefined);

  const images = useMemo(
    () => (showAll ? allHeroImages() : heroLibraryFor(category)),
    [showAll, category]
  );

  const selected = pending ?? currentUrl;

  return (
    <AtlasModalShell
      open={open}
      onClose={onCancel}
      title="Choose a hero image"
      description="These images are hosted for you. You can replace them with your own any time."
      size="lg"
      footer={
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setShowAll((p) => !p)}
            className="text-xs font-medium text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
          >
            {showAll ? "Show for my category" : "Show all images"}
          </button>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              onClick={() => selected && onSelect(selected)}
              disabled={!selected}
            >
              <AtlasIcon name="check" aria-hidden="true" className="h-4 w-4" />
              Use this image
            </Button>
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((img) => {
          const isSelected = selected === img.url;

          return (
            <button
              key={img.id}
              type="button"
              onClick={() => setPending(img.url)}
              onDoubleClick={() => onSelect(img.url)}
              aria-pressed={isSelected}
              aria-label={img.alt}
              className={cn(
                "group relative aspect-[16/9] overflow-hidden rounded-lg border-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
                isSelected
                  ? "border-brand-600 shadow-md dark:border-brand-500"
                  : "border-transparent hover:border-neutral-300 dark:hover:border-neutral-700"
              )}
            >
              <img
                src={img.url}
                alt=""
                aria-hidden="true"
                loading="lazy"
                className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
              />
              {isSelected && (
                <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-white">
                  <AtlasIcon name="check" className="h-3.5 w-3.5" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </AtlasModalShell>
  );
}