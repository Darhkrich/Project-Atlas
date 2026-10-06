"use client";

import { useEffect } from "react";
import { AtlasIcon } from "@/components/atlas/icons";
import { MerchantStorefrontPreview } from "./merchant-storefront-preview";
import { cn } from "@/lib/utils";
import type { MerchantStorefrontConfig } from "@/types/merchant-storefront";

type PreviewMode = "desktop" | "mobile";

interface PreviewFullscreenProps {
  open: boolean;
  onClose: () => void;
  config: MerchantStorefrontConfig;
  mode: PreviewMode;
  onModeChange: (mode: PreviewMode) => void;
}

export function PreviewFullscreen({
  open,
  onClose,
  config,
  mode,
  onModeChange,
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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Full-screen storefront preview"
      className="fixed inset-0 z-50 flex flex-col bg-neutral-950"
    >
      <div className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-neutral-800 bg-neutral-900 px-4">
        <div>
          <p className="text-sm font-semibold text-white">
            Storefront preview
          </p>
          <p className="text-[11px] text-neutral-400">
            Interactive. Click through as a customer would.
          </p>
        </div>
        <div className="flex items-center gap-2">
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
      <div className="flex flex-1 items-stretch justify-center overflow-hidden bg-neutral-950 p-4">
        <div className="flex max-h-full w-full max-w-6xl flex-col overflow-hidden">
          <MerchantStorefrontPreview
            store={config}
            mode={mode}
            interactive
          />
        </div>
      </div>
    </div>
  );
}