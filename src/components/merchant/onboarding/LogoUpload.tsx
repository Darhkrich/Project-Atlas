/* eslint-disable @next/next/no-img-element */
"use client";

import { useRef, useState } from "react";
import { AtlasIcon } from "@/components/atlas/icons";
import { MAX_LOGO_BYTES } from "@/lib/merchant/onboarding/constants";

interface LogoUploadProps {
  value: string;
  onChange: (dataUrl: string) => void;
}

export function LogoUpload({ value, onChange }: LogoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file: File) => {
    setError(null);
    if (file.size > MAX_LOGO_BYTES) {
      setError("Logo must be under 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result === "string") {
        onChange(result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
        Store logo
      </span>
      <div className="mt-2 flex items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
          {value ? (
            <img
              src={value}
              alt="Store logo"
              className="h-full w-full object-cover"
            />
          ) : (
            <AtlasIcon
              name="image"
              aria-hidden="true"
              className="h-6 w-6 text-neutral-400"
            />
          )}
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          Upload logo
        </button>
        {value && (
          <button
            type="button"
            onClick={() => {
              setError(null);
              onChange("");
            }}
            className="text-xs text-danger-600 hover:text-danger-700"
          >
            Remove
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/svg+xml"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>
      <p className="mt-1.5 text-[11px] text-neutral-500">
        PNG, JPG, or SVG. Recommended square. Under 2 MB.
      </p>
      {error && (
        <p role="alert" className="mt-1 text-[11px] text-danger-600">
          {error}
        </p>
      )}
    </div>
  );
}