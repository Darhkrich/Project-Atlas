/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AtlasModalShell } from "@/components/atlas/modal-shell";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { useStorefrontConfig } from "@/contexts/storefront-config-context";
import { useCurrentMerchant } from "@/lib/merchant/hooks/use-current-merchant";
import { useMedia } from "@/lib/merchant/media/use-media";
import {
  MAX_UPLOAD_DIMENSION,
  MEDIA_USAGE_HINTS,
  MEDIA_USAGE_LABELS,
  UPLOAD_JPEG_QUALITY,
} from "@/lib/merchant/media/constants";
import type { MediaAsset, MediaUsage } from "@/lib/merchant/media/types";
import { heroLibraryFor, allHeroImages } from "@/lib/merchant/storefront/hero-library";
import type { MerchantTemplateCategory } from "@/types/merchant-storefront";

interface MediaLibraryModalProps {
  open: boolean;
  usage: MediaUsage;
  currentUrl: string | undefined;
  category: MerchantTemplateCategory;
  onCancel: () => void;
  onSelect: (url: string) => void;
}

type Tab = "library" | "curated" | "url";

const inputClass =
  "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500";

interface CompressionResult {
  dataUrl: string;
  byteSize: number;
  width: number;
  height: number;
}

async function compressUpload(file: File): Promise<CompressionResult> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read the file."));
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not load the image."));
    image.src = dataUrl;
  });

  let { width, height } = img;
  if (width > MAX_UPLOAD_DIMENSION || height > MAX_UPLOAD_DIMENSION) {
    const ratio = Math.min(
      MAX_UPLOAD_DIMENSION / width,
      MAX_UPLOAD_DIMENSION / height
    );
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process the image.");
  ctx.drawImage(img, 0, 0, width, height);

  const compressed = canvas.toDataURL("image/jpeg", UPLOAD_JPEG_QUALITY);
  const base64 = compressed.split(",")[1] ?? "";
  const byteSize = Math.round((base64.length * 3) / 4);

  return { dataUrl: compressed, byteSize, width, height };
}

function formatSize(bytes: number | undefined): string {
  if (!bytes || bytes <= 0) return "";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export function MediaLibraryModal({
  open,
  usage,
  currentUrl,
  category,
  onCancel,
  onSelect,
}: MediaLibraryModalProps) {
  const { storefrontConfig } = useStorefrontConfig();
  const merchant = useCurrentMerchant();
  const { library, add, remove } = useMedia(storefrontConfig.storefrontId);

  const [tab, setTab] = useState<Tab>("library");
  const [showAllCurated, setShowAllCurated] = useState(false);
  const [pending, setPending] = useState<string | undefined>(undefined);
  const [urlDraft, setUrlDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    setPending(undefined);
    setUrlDraft("");
    setError(null);
    setTab(library.length > 0 ? "library" : "curated");
  }, [open, library.length]);

  const curated = useMemo(
    () =>
      showAllCurated ? allHeroImages() : heroLibraryFor(category),
    [showAllCurated, category]
  );

  const selected = pending ?? currentUrl;

  async function handleFile(file: File) {
    setError(null);
    setBusy(true);
    try {
      const result = await compressUpload(file);
      const response = add({
        url: result.dataUrl,
        alt: file.name.replace(/\.[^.]+$/, ""),
        source: "upload",
        uploadedBy: merchant?.email,
        byteSize: result.byteSize,
        width: result.width,
        height: result.height,
      });
      if (!response.ok) {
        setError(response.error ?? "Could not add the image.");
        return;
      }
      setPending(result.dataUrl);
      setTab("library");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  function handleConfirm() {
    if (!selected) return;
    onSelect(selected);
  }

  return (
    <AtlasModalShell
      open={open}
      onClose={onCancel}
      title={"Choose " + MEDIA_USAGE_LABELS[usage].toLowerCase()}
      description={MEDIA_USAGE_HINTS[usage]}
      size="lg"
      footer={
        <div className="flex items-center justify-between gap-3">
          <span className="truncate text-[11px] text-neutral-500 dark:text-neutral-400">
            {library.length} in library
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!selected}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Use this image
            </button>
          </div>
        </div>
      }
    >
      <div
        role="tablist"
        aria-label="Image source"
        className="flex gap-1 border-b border-neutral-200 pb-2 dark:border-neutral-800"
      >
        {(["library", "curated", "url"] as Tab[]).map((t) => {
          const active = tab === t;
          const label =
            t === "library"
              ? "My library"
              : t === "curated"
                ? "Curated"
                : "Paste a URL";
          return (
            <button
              key={t}
              role="tab"
              type="button"
              aria-selected={active}
              onClick={() => setTab(t)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-semibold transition",
                active
                  ? "bg-brand-600 text-white"
                  : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      {error && (
        <div
          role="alert"
          className="mt-3 rounded-lg border border-danger-200 bg-danger-50 px-3 py-2 text-xs text-danger-700 dark:border-danger-900 dark:bg-danger-900/20 dark:text-danger-300"
        >
          {error}
        </div>
      )}

      {tab === "library" && (
        <div className="mt-4 space-y-4">
          <div
            role="button"
            tabIndex={0}
            onClick={() => fileRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                fileRef.current?.click();
              }
            }}
            className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 px-6 py-8 text-center transition-colors hover:border-brand-500 hover:bg-brand-50/30 dark:border-neutral-700 dark:bg-neutral-950 dark:hover:border-brand-500"
          >
            <AtlasIcon
              name="plus"
              className="h-5 w-5 text-neutral-400"
              aria-hidden="true"
            />
            <p className="mt-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {busy ? "Processing..." : "Upload an image"}
            </p>
            <p className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
              JPG or PNG. Files are compressed and stored on this device.
            </p>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
              e.target.value = "";
            }}
            className="hidden"
          />

          {library.length === 0 ? (
            <p className="rounded-lg border border-dashed border-neutral-200 px-4 py-6 text-center text-[11px] text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
              No uploads yet. Drop a file above to start your library.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {library.map((asset) => {
                const isSelected = selected === asset.url;
                return (
                  <div
                    key={asset.id}
                    className={cn(
                      "group relative overflow-hidden rounded-lg border-2 transition",
                      isSelected
                        ? "border-brand-600 dark:border-brand-500"
                        : "border-transparent hover:border-neutral-300 dark:hover:border-neutral-700"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setPending(asset.url)}
                      onDoubleClick={() => onSelect(asset.url)}
                      aria-pressed={isSelected}
                      aria-label={asset.alt || "Uploaded image"}
                      className="block aspect-[16/9] w-full"
                    >
                      <img
                        src={asset.url}
                        alt=""
                        aria-hidden="true"
                        className="h-full w-full object-cover"
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(asset.id)}
                      aria-label="Remove from library"
                      className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-neutral-900/70 text-white opacity-0 transition-opacity hover:bg-neutral-900 group-hover:opacity-100 focus:opacity-100"
                    >
                      <AtlasIcon
                        name="x-circle"
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      />
                    </button>
                    {asset.byteSize && (
                      <span className="absolute bottom-1.5 left-1.5 rounded bg-neutral-900/70 px-1.5 py-0.5 text-[9px] font-medium text-white">
                        {formatSize(asset.byteSize)}
                      </span>
                    )}
                    {isSelected && (
                      <span className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-white">
                        <AtlasIcon
                          name="check"
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === "curated" && (
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Atlas-hosted images. Free to use anywhere.
            </p>
            <button
              type="button"
              onClick={() => setShowAllCurated((p) => !p)}
              className="text-[11px] font-medium text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
            >
              {showAllCurated ? "Show for my category" : "Show all"}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {curated.map((img) => {
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
                    "relative aspect-[16/9] overflow-hidden rounded-lg border-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                    isSelected
                      ? "border-brand-600 dark:border-brand-500"
                      : "border-transparent hover:border-neutral-300 dark:hover:border-neutral-700"
                  )}
                >
                  <img
                    src={img.url}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                  {isSelected && (
                    <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-white">
                      <AtlasIcon
                        name="check"
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {tab === "url" && (
        <div className="mt-4 space-y-3">
          <label
            htmlFor="media-url"
            className="block text-xs font-medium text-neutral-700 dark:text-neutral-300"
          >
            Image URL
          </label>
          <input
            id="media-url"
            type="url"
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            placeholder="https://example.com/image.jpg"
            autoComplete="off"
            className={inputClass}
          />
          <button
            type="button"
            onClick={() => {
              const trimmed = urlDraft.trim();
              if (trimmed.length === 0) return;
              const response = add({
                url: trimmed,
                source: "url",
                alt: "",
                uploadedBy: merchant?.email,
              });
              if (!response.ok) {
                setError(response.error ?? "Could not add the URL.");
                return;
              }
              setPending(trimmed);
              setTab("library");
            }}
            disabled={urlDraft.trim().length === 0}
            className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 px-3 py-2 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            Save to library
          </button>
        </div>
      )}
    </AtlasModalShell>
  );
}