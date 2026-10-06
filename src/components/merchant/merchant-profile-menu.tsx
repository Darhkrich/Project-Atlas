"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AtlasIcon } from "@/components/atlas/icons";
import { useCurrentMerchant } from "@/lib/merchant/hooks/use-current-merchant";
import { useAuth } from "@/contexts/auth-context";

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function MerchantProfileMenu() {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const merchant = useCurrentMerchant();
  const { logout } = useAuth();

  useEffect(() => {
    if (!open) return;
    const onDocClick = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (wrapperRef.current && !wrapperRef.current.contains(target)) {
        setOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!merchant) return null;

  const initials = initialsFromName(merchant.name);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-md p-1 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
          {initials}
        </span>
        <span className="hidden text-sm font-medium text-neutral-800 dark:text-neutral-200 md:block">
          {merchant.name}
        </span>
        <AtlasIcon
          name="chevron-down"
          className="hidden h-4 w-4 text-neutral-400 md:block"
        />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Account menu"
          className="absolute right-0 mt-2 w-56 rounded-xl border border-neutral-200 bg-white shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div className="border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
            <p className="truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {merchant.name}
            </p>
            <p className="truncate text-xs text-neutral-500">
              {merchant.email}
            </p>
          </div>
          <Link
            href="/merchant/settings"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            Settings
          </Link>
          <Link
            href="/merchant/billing"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            Billing
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              logout();
            }}
            className="w-full px-4 py-2 text-left text-sm text-danger-600 hover:bg-neutral-50 dark:hover:bg-neutral-800"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}