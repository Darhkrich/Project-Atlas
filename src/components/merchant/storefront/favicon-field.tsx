/* eslint-disable @next/next/no-img-element */
"use client";

import { useRef, useState } from "react";
import { AtlasIcon } from "@/components/atlas/icons";
import {
  compressImage,
  formatBytes,
} from "@/lib/merchant/storefront/compress-image";

interface FaviconFieldProps {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
}

const MAX_BYTES = 40 * 1024;
const MAX_ACCEPT_BYTES = 3 * 1024 * 1024;

export function FaviconField({ value, onChange }: FaviconFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [working, setWorking] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setInfo(null);
    if (file.size > MAX_ACCEPT_BYTES) {
      setError("Favicon must be under 3 MB.");
      return;
    }
    setWorking(true);
    try {
      const result = await compressImage(file, {
        maxWidth: 128,
        maxHeight: 128,
        maxBytes: MAX_BYTES,
        quality: 0.9,
        format: "image/png",
      });
      onChange(result.dataUrl);
      setInfo(
        result.width + "\u00D7" + result.height + " \u00B7 " + formatBytes(result.bytes)
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not process the image."
      );
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="space-y-2">
      <div>
        <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
          Favicon
        </p>
        <p className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
          The small icon in the browser tab. PNG or JPG works best.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
          {value ? (
            <img
              src={value}
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover"
            />
          ) : (
            <AtlasIcon
              name="image"
              aria-hidden="true"
              className="h-5 w-5 text-neutral-400"
            />
          )}
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={working}
          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          {working ? "Processing..." : "Upload favicon"}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => {
              setError(null);
              setInfo(null);
              onChange(undefined);
            }}
            className="text-xs text-danger-600 hover:text-danger-700 dark:text-danger-400"
          >
            Remove
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />
      </div>

      {info && (
        <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
          {info}
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="text-[11px] text-danger-600 dark:text-danger-400"
        >
          {error}
        </p>
      )}
    </div>
  );
}