"use client";

import { ResellerNavigation } from "./reseller-navigation";
import { resellerNavItems } from "@/lib/reseller-navigation";
import { AtlasIcon } from "@/components/atlas/icons";

interface ResellerMobileNavigationProps {
  open: boolean;
  onClose: () => void;
}

export function ResellerMobileNavigation({
  open,
  onClose,
}: ResellerMobileNavigationProps) {
  if (!open) return null;

  return (
    <div
      id="reseller-mobile-navigation"
      className="fixed inset-0 z-40 lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Reseller mobile navigation"
    >
      <div
        className="absolute inset-0 bg-neutral-950/50 dark:bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-lg dark:bg-neutral-900">
        <div className="p-4">
          <div className="mb-6 flex items-center justify-between">
            <span className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Navigation
            </span>
            <button
              onClick={onClose}
              className="rounded-md p-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
              aria-label="Close navigation"
            >
              <AtlasIcon name="x-circle" className="h-5 w-5" />
            </button>
          </div>
          <ResellerNavigation items={resellerNavItems} ariaLabel="Reseller navigation" />
        </div>
      </div>
    </div>
  );
}