/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { AtlasIcon } from "@/components/atlas/icons";
import { Button } from "@/components/atlas/button";
import { HeroLibraryModal } from "./hero-library-modal";
import type { MerchantTemplateCategory } from "@/types/merchant-storefront";
import { cn } from "@/lib/utils";

interface HeroImageFieldProps {
  value: string | undefined;
  category: MerchantTemplateCategory;
  onChange: (value: string | undefined) => void;
}

type Mode = "none" | "library" | "url";

const inputClass =
  "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500";

function detectMode(value: string | undefined): Mode {
  if (!value) return "none";
  if (value.includes("images.unsplash.com")) return "library";
  return "url";
}

export function HeroImageField({
  value,
  category,
  onChange,
}: HeroImageFieldProps) {
  const [mode, setMode] = useState<Mode>(detectMode(value));
  const [urlDraft, setUrlDraft] = useState(value ?? "");
  const [libraryOpen, setLibraryOpen] = useState(false);

  useEffect(() => {
    setMode(detectMode(value));
    setUrlDraft(value ?? "");
  }, [value]);

  const handleModeChange = (next: Mode) => {
    setMode(next);
    if (next === "none") {
      onChange(undefined);
      return;
    }
    if (next === "url" && !urlDraft) {
      onChange(undefined);
      return;
    }
    if (next === "library") {
      setLibraryOpen(true);
    }
  };

  const handleUrlCommit = () => {
    const trimmed = urlDraft.trim();
    if (!trimmed) {
      onChange(undefined);
      return;
    }
    onChange(trimmed);
  };

  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
          Hero image
        </p>
        <p className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
          The large image at the top of your storefront. Optional. Some
          templates do not use one.
        </p>
      </div>

      {value && (
        <div className="relative overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
          <img
            src={value}
            alt=""
            aria-hidden="true"
            className="h-40 w-full object-cover"
          />
          <button
            type="button"
            onClick={() => onChange(undefined)}
            aria-label="Remove hero image"
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900/70 text-white transition-colors hover:bg-neutral-900"
          >
            <AtlasIcon name="x-circle" className="h-4 w-4" />
          </button>
        </div>
      )}

      <div
        role="radiogroup"
        aria-label="Hero image source"
        className="flex flex-wrap gap-1.5"
      >
        {(["none", "library", "url"] as Mode[]).map((m) => {
          const selected = mode === m;
          const label =
            m === "none"
              ? "No image"
              : m === "library"
              ? "Choose from library"
              : "Paste a URL";
          return (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => handleModeChange(m)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                selected
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-neutral-600"
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      {mode === "library" && (
        <Button variant="outline" onClick={() => setLibraryOpen(true)}>
          <AtlasIcon name="image" aria-hidden="true" className="h-4 w-4" />
          Open library
        </Button>
      )}

      {mode === "url" && (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            onBlur={handleUrlCommit}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleUrlCommit();
              }
            }}
            placeholder="https://example.com/image.jpg"
            autoComplete="off"
            className={cn(inputClass, "min-w-0 flex-1")}
          />
        </div>
      )}

      <HeroLibraryModal
        open={libraryOpen}
        category={category}
        currentUrl={value}
        onCancel={() => setLibraryOpen(false)}
        onSelect={(url) => {
          onChange(url);
          setLibraryOpen(false);
          setMode("library");
        }}
      />
    </div>
  );
}