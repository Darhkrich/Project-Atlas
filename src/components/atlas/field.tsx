"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AtlasIcon } from "@/components/atlas/icons";

interface AtlasFieldProps {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  dirty?: boolean;
  onRevertToDefault?: () => void;
  children: ReactNode;
  trailing?: ReactNode;
}

export function AtlasField({
  label,
  htmlFor,
  hint,
  error,
  dirty = false,
  onRevertToDefault,
  children,
  trailing,
}: AtlasFieldProps) {
  const [revertOpen, setRevertOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!revertOpen) return;
    const onDoc = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (wrapperRef.current && !wrapperRef.current.contains(target)) {
        setRevertOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setRevertOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [revertOpen]);

  return (
    <div ref={wrapperRef} className="space-y-1.5">
      <div className="flex items-center gap-2">
        {dirty && onRevertToDefault && (
          <span className="relative">
            <button
              type="button"
              onClick={() => setRevertOpen((p) => !p)}
              aria-label="Field edited. Revert to default."
              aria-haspopup="menu"
              aria-expanded={revertOpen}
              className="flex h-4 w-4 items-center justify-center"
            >
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-brand-500"
              />
            </button>
            {revertOpen && (
              <div
                role="menu"
                className="absolute left-0 top-6 z-20 w-44 rounded-lg border border-neutral-200 bg-white py-1 shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setRevertOpen(false);
                    onRevertToDefault();
                  }}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800"
                >
                  <AtlasIcon name="refresh" className="h-3.5 w-3.5" />
                  Revert to default
                </button>
              </div>
            )}
          </span>
        )}
        <label
          htmlFor={htmlFor}
          className="text-xs font-semibold text-neutral-700 dark:text-neutral-300"
        >
          {label}
        </label>
        {trailing && <div className="ml-auto">{trailing}</div>}
      </div>
      {children}
      {error ? (
        <p
          role="alert"
          className="text-[11px] text-danger-600 dark:text-danger-400"
        >
          {error}
        </p>
      ) : hint ? (
        <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
          {hint}
        </p>
      ) : null}
    </div>
  );
}