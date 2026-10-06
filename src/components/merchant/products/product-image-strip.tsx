"use client";

import { useRef } from "react";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { MAX_IMAGES_PER_PRODUCT } from "@/lib/merchant/products/constants";

interface ProductImageStripProps {
  images: string[];
  onAdd: (file: File) => void;
  onRemove: (index: number) => void;
  error?: string | null;
  busy?: boolean;
  disabled?: boolean;
}

export function ProductImageStrip({
  images,
  onAdd,
  onRemove,
  error,
  busy,
  disabled,
}: ProductImageStripProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const canAdd = images.length < MAX_IMAGES_PER_PRODUCT && !disabled;

  const triggerFilePicker = () => {
    if (!canAdd) return;
    inputRef.current?.click();
  };

  return (
    <div>
      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
        Product images
      </label>
      <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
        Up to {MAX_IMAGES_PER_PRODUCT} images. The first image is the primary
        one customers see.
      </p>

      <ul
        role="list"
        className="mt-3 flex flex-wrap gap-3"
      >
        {images.map((src, index) => (
          <li
            key={src.slice(0, 32) + String(index)}
            className="relative"
          >
            <div className="h-24 w-24 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={index === 0 ? "Primary product image" : "Product image"}
                className="h-full w-full object-cover"
              />
            </div>
            {index === 0 && (
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                Primary
              </span>
            )}
            <button
              type="button"
              onClick={() => onRemove(index)}
              disabled={disabled}
              className="absolute -right-1.5 -top-1.5 rounded-full bg-neutral-900 p-1 text-white shadow-sm hover:bg-danger-600 disabled:opacity-50 dark:bg-neutral-800 dark:hover:bg-danger-600"
              aria-label={"Remove image " + String(index + 1)}
            >
              <AtlasIcon name="x-circle" className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </li>
        ))}

        {canAdd && (
          <li>
            <button
              type="button"
              onClick={triggerFilePicker}
              disabled={busy}
              className={cn(
                "flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-neutral-300 text-xs font-medium text-neutral-500 transition hover:border-brand-400 hover:text-brand-600 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-brand-500 dark:hover:text-brand-300",
                busy && "cursor-wait opacity-60"
              )}
              aria-label="Add product image"
            >
              <AtlasIcon
                name={busy ? "refresh" : "add"}
                className={cn("h-5 w-5", busy && "animate-spin")}
                aria-hidden="true"
              />
              {busy ? "Processing" : "Add image"}
            </button>
          </li>
        )}
      </ul>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onAdd(file);
          if (inputRef.current) inputRef.current.value = "";
        }}
      />

      {error && (
        <p className="mt-2 text-xs text-danger-600 dark:text-danger-400">
          {error}
        </p>
      )}
    </div>
  );
}