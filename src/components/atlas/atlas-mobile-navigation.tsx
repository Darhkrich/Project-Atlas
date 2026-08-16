"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { publicNavItems } from "@/lib/navigation";
import { AtlasLogo } from "./atlas-logo";
import { Button } from "./button";

interface AtlasMobileNavigationProps {
  open: boolean;
  onClose: () => void;
}

export function AtlasMobileNavigation({
  open,
  onClose,
}: AtlasMobileNavigationProps) {
  const pathname = usePathname();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Handle focus and Escape key
  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      // Focus close button after a short delay to allow rendering
      const timeout = setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          onClose();
        }
      };

      document.addEventListener("keydown", handleEscape);
      // Prevent background scrolling
      document.body.style.overflow = "hidden";

      return () => {
        clearTimeout(timeout);
        document.removeEventListener("keydown", handleEscape);
        document.body.style.overflow = "";
        // Restore focus
        previousFocusRef.current?.focus();
      };
    }
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Mobile navigation">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-neutral-950/40 dark:bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="absolute right-0 top-0 flex h-full w-80 max-w-[85vw] flex-col bg-white shadow-lg dark:bg-neutral-900">
        {/* Header with logo and close */}
        <div className="flex items-center justify-between border-b border-neutral-200 p-4 dark:border-neutral-800">
          <AtlasLogo />
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-neutral-600 transition-colors hover:text-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-neutral-400 dark:hover:text-neutral-100"
            aria-label="Close menu"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 overflow-y-auto p-4" aria-label="Mobile main navigation">
          <ul className="space-y-1">
            {publicNavItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "block rounded-md px-4 py-3 text-base font-medium transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                      isActive
                        ? "bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-400"
                        : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

      <div className="border-t border-neutral-200 p-4 dark:border-neutral-800">
  <div className="flex flex-col gap-3">
    <Link
      href="/login"
      onClick={onClose}
      className="inline-flex w-full items-center justify-center rounded-full border border-neutral-300 bg-transparent px-4 py-3 text-base font-medium text-neutral-900 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-800"
    >
      Log in
    </Link>
    <Link
      href="/sign-up"
      onClick={onClose}
      className="inline-flex w-full items-center justify-center rounded-full bg-brand-800 px-4 py-3 text-base font-medium text-white transition-colors hover:bg-brand-900"
    >
      Sign up
    </Link>
  </div>
</div>
      </div>
    </div>
  );
}