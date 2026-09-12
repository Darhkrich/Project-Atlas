// lib/admin/hooks/use-unsaved-changes.ts
"use client";

import { useEffect } from "react";

interface UseUnsavedChangesOptions {
  hasChanges: boolean;
  message?: string;
}

export function useUnsavedChanges({
  hasChanges,
  message = "You have unsaved changes. Leave anyway?",
}: UseUnsavedChangesOptions) {
  useEffect(() => {
    if (!hasChanges) return;
    if (typeof window === "undefined") return;

    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = message;
      return message;
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasChanges, message]);
}