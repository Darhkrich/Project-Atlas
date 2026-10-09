"use client";

import { useEffect } from "react";
import { AtlasIcon } from "@/components/atlas/icons";
import { MerchantStorefrontPreview } from "./merchant-storefront-preview";
import { cn } from "@/lib/utils";
import type { MerchantStorefrontConfig } from "@/types/merchant-storefront";
import type {
  PreviewPage,
  PreviewPageOption,
} from "@/lib/merchant/storefront/preview-pages";

type PreviewMode = "desktop" | "mobile";

interface PreviewFullscreenProps {
  open: boolean;
  onClose: () => void;
  config: MerchantStorefrontConfig;
  mode: PreviewMode;
  onModeChange: (mode: PreviewMode) => void;
  page: PreviewPage;
  customPageSlug?: string;
  pageOptions: PreviewPageOption[];
  onPageChange: (page: PreviewPage, customPageSlug?: string) => void;
}

export function PreviewFullscreen({
  open,
  onClose,
  config,
  mode,
  onModeChange,
  page,
  customPageSlug,
  pageOptions,
  onPageChange,
}: PreviewFullscreenProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const selectedValue =
    page === "custom_page" && customPageSlug
      ? "custom_page:" + customPageSlug
      : page;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Full-screen storefront preview"
      className="fixed inset-0 z-50 flex flex-col bg-neutral-950"
    >
      <div className="flex min-h-14 shrink-0 flex-wrap items-center justify-between gap-2 border-b border-neutral-800 bg-neutral-900 px-4 py-2 sm:gap-3 sm:py-0">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white">
            Storefront preview
          </p>
          <p className="text-[11px] text-neutral-400">
            Interactive. Click through as a customer would.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="fullscreen-preview-page" className="sr-only">
            Preview page
          </label>
          <select
            id="fullscreen-preview-page"
            value={selectedValue}
            onChange={(e) => {
              const raw = e.target.value;
              if (raw.startsWith("custom_page:")) {
                onPageChange("custom_page", raw.slice("custom_page:".length));
              } else {
                onPageChange(raw as PreviewPage);
              }
            }}
            className="rounded-lg border border-neutral-700 bg-neutral-800 px-2.5 py-1.5 text-xs font-medium text-neutral-200 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
          >
            {pageOptions.map((opt) => {
              const value =
                opt.value === "custom_page" && opt.customPageSlug
                  ? "custom_page:" + opt.customPageSlug
                  : opt.value;
              return (
                <option key={value} value={value}>
                  {opt.label}
                </option>
              );
            })}
          </select>

          <div
            role="group"
            aria-label="Preview device"
            className="flex rounded-lg bg-neutral-800 p-0.5"
          >
            <button
              type="button"
              onClick={() => onModeChange("desktop")}
              aria-pressed={mode === "desktop"}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-semibold transition",
                mode === "desktop"
                  ? "bg-neutral-700 text-white"
                  : "text-neutral-400 hover:text-neutral-200"
              )}
            >
              Desktop
            </button>
            <button
              type="button"
              onClick={() => onModeChange("mobile")}
              aria-pressed={mode === "mobile"}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-semibold transition",
                mode === "mobile"
                  ? "bg-neutral-700 text-white"
                  : "text-neutral-400 hover:text-neutral-200"
              )}
            >
              Mobile
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close full-screen preview"
            className="rounded-md p-2 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
          >
            <AtlasIcon name="x-circle" className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="flex flex-1 items-stretch justify-center overflow-x-hidden overflow-y-auto bg-neutral-950 p-2 sm:p-4">
        <div className="flex max-h-full w-full max-w-6xl flex-col overflow-hidden">
          <MerchantStorefrontPreview
            store={config}
            mode={mode}
            interactive
            page={page}
            customPageSlug={customPageSlug}
          />
        </div>
      </div>
    </div>
  );
}