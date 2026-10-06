/* eslint-disable react-hooks/purity */
"use client";

import { useEffect, useState } from "react";
import type { StorefrontSaveState } from "@/lib/merchant/storefront/types";

interface SaveIndicatorProps {
  state: StorefrontSaveState;
  lastSavedAt: number | null;
  errorMessage: string | null;
}

export function SaveIndicator({
  state,
  lastSavedAt,
  errorMessage,
}: SaveIndicatorProps) {
  const [, force] = useState(0);

  useEffect(() => {
    if (state !== "saved" || !lastSavedAt) return;
    const id = window.setInterval(() => force((n) => n + 1), 1000);
    return () => window.clearInterval(id);
  }, [state, lastSavedAt]);

  const label = (() => {
    if (state === "saving") return "Saving";
    if (state === "saved") return "Saved just now";
    if (state === "error") return errorMessage ?? "Could not save";
    if (lastSavedAt) {
      const seconds = Math.floor((Date.now() - lastSavedAt) / 1000);
      if (seconds < 60) return "Saved " + seconds + "s ago";
      const minutes = Math.floor(seconds / 60);
      return "Saved " + minutes + "m ago";
    }
    return "All changes saved";
  })();

  const tone =
    state === "error"
      ? "text-danger-600 dark:text-danger-400"
      : state === "saving"
      ? "text-neutral-500 dark:text-neutral-400"
      : state === "saved"
      ? "text-success-600 dark:text-success-400"
      : "text-neutral-500 dark:text-neutral-400";

  return (
    <span
      role="status"
      aria-live="polite"
      className={"inline-flex items-center gap-1.5 text-xs " + tone}
    >
      {state === "saving" && (
        <span
          aria-hidden="true"
          className="h-1.5 w-1.5 animate-pulse rounded-full bg-neutral-400"
        />
      )}
      {state === "saved" && (
        <span
          aria-hidden="true"
          className="h-1.5 w-1.5 rounded-full bg-success-500"
        />
      )}
      {state === "error" && (
        <span
          aria-hidden="true"
          className="h-1.5 w-1.5 rounded-full bg-danger-500"
        />
      )}
      {label}
    </span>
  );
}