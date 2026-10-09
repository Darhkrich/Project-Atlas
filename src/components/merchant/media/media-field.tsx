/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { MEDIA_USAGE_LABELS } from "@/lib/merchant/media/constants";
import type { MediaUsage } from "@/lib/merchant/media/types";
import type { MerchantTemplateCategory } from "@/types/merchant-storefront";
import { MediaLibraryModal } from "./media-library-modal";

interface MediaFieldProps {
  label?: string;
  hint?: string;
  value: string | undefined;
  usage: MediaUsage;
  category: MerchantTemplateCategory;
  onChange: (value: string | undefined) => void;
  previewAspect?: string;
  previewClassName?: string;
}

const inputClass =
  "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500";

export function MediaField({
  label,
  hint,
  value,
  usage,
  category,
  onChange,
  previewAspect = "aspect-[16/9]",
  previewClassName,
}: MediaFieldProps) {
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [urlMode, setUrlMode] = useState(false);
  const [urlDraft, setUrlDraft] = useState("");

  const displayLabel = label ?? MEDIA_USAGE_LABELS[usage];

  function commitUrl() {
    const trimmed = urlDraft.trim();
    if (trimmed.length === 0) return;
    onChange(trimmed);
    setUrlMode(false);
    setUrlDraft("");
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
          {displayLabel}
        </p>
        {hint && (
          <p className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
            {hint}
          </p>
        )}
      </div>

      {value && !urlMode && (
        <div
          className={cn(
            "relative overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800",
            previewClassName
          )}
        >
          <div className={cn("w-full", previewAspect)}>
            <img
              src={value}
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover"
            />
          </div>
          <button
            type="button"
            onClick={() => onChange(undefined)}
            aria-label={"Remove " + displayLabel.toLowerCase()}
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900/70 text-white transition-colors hover:bg-neutral-900"
          >
            <AtlasIcon name="x-circle" className="h-4 w-4" />
          </button>
        </div>
      )}

      {urlMode && (
        <div className="space-y-2">
          <input
            type="url"
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitUrl();
              }
            }}
            placeholder="https://example.com/image.jpg"
            autoComplete="off"
            autoFocus
            className={inputClass}
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={commitUrl}
              disabled={urlDraft.trim().length === 0}
              className="rounded-md bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Save URL
            </button>
            <button
              type="button"
              onClick={() => {
                setUrlMode(false);
                setUrlDraft("");
              }}
              className="text-xs font-medium text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {!urlMode && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setLibraryOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            <AtlasIcon name="image" className="h-3.5 w-3.5" aria-hidden="true" />
            {value ? "Replace" : "Choose from library"}
          </button>
          <button
            type="button"
            onClick={() => setUrlMode(true)}
            className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            Paste URL
          </button>
        </div>
      )}

      <MediaLibraryModal
        open={libraryOpen}
        usage={usage}
        currentUrl={value}
        category={category}
        onCancel={() => setLibraryOpen(false)}
        onSelect={(url) => {
          onChange(url);
          setLibraryOpen(false);
        }}
      />
    </div>
  );
}