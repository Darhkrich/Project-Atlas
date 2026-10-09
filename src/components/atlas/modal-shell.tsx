"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AtlasIcon } from "./icons";

interface AtlasModalShellProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  footer?: ReactNode;
}

const SIZE_CLASS: Record<NonNullable<AtlasModalShellProps["size"]>, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
};

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function AtlasModalShell({
  open,
  onClose,
  title,
  description,
  size = "md",
  children,
  footer,
}: AtlasModalShellProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    previouslyFocusedRef.current =
      typeof document !== "undefined"
        ? (document.activeElement as HTMLElement | null)
        : null;

    const previousOverflow =
      typeof document !== "undefined" ? document.body.style.overflow : "";
    if (typeof document !== "undefined") {
      document.body.style.overflow = "hidden";
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const root = panelRef.current;
      if (!root) return;
      const focusable = root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    const focusTimer = window.setTimeout(() => {
      const root = panelRef.current;
      if (!root) return;
      const focusable = root.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      focusable?.focus();
    }, 0);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      if (typeof document !== "undefined") {
        document.body.style.overflow = previousOverflow;
      }
      window.clearTimeout(focusTimer);
      previouslyFocusedRef.current?.focus();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
      role="presentation"
    >
      <div
        className="absolute inset-0 bg-neutral-950/50 dark:bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{ marginBottom: "env(safe-area-inset-bottom, 0px)" }}
        className={cn(
          "relative flex max-h-[85dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl dark:bg-neutral-900 sm:mb-0 sm:max-h-[85vh] sm:rounded-2xl",
          SIZE_CLASS[size]
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-neutral-200 p-4 dark:border-neutral-800">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              {title}
            </h2>
            {description && (
              <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-neutral-500 transition-colors hover:text-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-neutral-400 dark:hover:text-neutral-100"
            aria-label="Close"
          >
            <AtlasIcon name="x-circle" className="h-5 w-5" />
          </button>
        </div>

        <div className="atlas-scroll-hidden flex-1 overflow-y-auto p-4">
          {children}
        </div>

        {footer && (
          <div className="border-t border-neutral-200 p-4 dark:border-neutral-800">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}