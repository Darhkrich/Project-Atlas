"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { AtlasIcon } from "@/components/atlas/icons";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface MerchantDrawerShellProps {
  open: boolean;
  onClose: () => void;
  title: string;
  side?: "left" | "right";
  footer?: ReactNode;
  children: ReactNode;
}

export function MerchantDrawerShell({
  open,
  onClose,
  title,
  side = "left",
  footer,
  children,
}: MerchantDrawerShellProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  const titleId = "merchant-drawer-title";

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

    const getFocusable = (): HTMLElement[] => {
      const root = panelRef.current;
      if (!root) return [];
      return Array.from(
        root.querySelectorAll<HTMLElement>(FOCUSABLE)
      ).filter((node) => {
        if (node.offsetParent !== null) return true;
        const rect = node.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      });
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const items = getFocusable();
      if (items.length === 0) {
        event.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    const focusTimer = window.setTimeout(() => {
      const items = getFocusable();
      if (items.length > 0) {
        items[0].focus();
      } else {
        const root = panelRef.current;
        if (root) {
          if (!root.hasAttribute("tabindex")) {
            root.setAttribute("tabindex", "-1");
          }
          root.focus();
        }
      }
    }, 0);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      if (typeof document !== "undefined") {
        document.body.style.overflow = previousOverflow;
      }
      window.clearTimeout(focusTimer);
      const previous = previouslyFocusedRef.current;
      if (previous && document.contains(previous)) {
        previous.focus();
      }
      previouslyFocusedRef.current = null;
    };
  }, [open]);

  if (!open) return null;

  const positionClass = side === "left" ? "left-0" : "right-0";

  return (
    <div className="fixed inset-0 z-50" role="presentation">
      <div
        className="absolute inset-0 bg-neutral-950/60 dark:bg-black/70"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={
          "absolute inset-y-0 flex w-[300px] max-w-[85%] flex-col bg-white shadow-2xl dark:bg-neutral-900 " +
          positionClass
        }
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-neutral-200 px-4 dark:border-neutral-800">
          <h2
            id={titleId}
            className="text-sm font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-md p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
          >
            <AtlasIcon name="x-circle" className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scroll-smooth px-3 py-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {children}
        </div>

        {footer && (
          <div className="shrink-0 border-t border-neutral-200 p-3 dark:border-neutral-800">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}