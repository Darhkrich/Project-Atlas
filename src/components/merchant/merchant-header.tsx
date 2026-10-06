"use client";

import { useEffect, useRef } from "react";
import { AtlasIcon } from "@/components/atlas/icons";
import { MerchantSearch } from "./merchant-search";
import { MerchantStoreLink } from "./merchant-store-link";
import { MerchantNotificationsMenu } from "./merchant-notifications-menu";
import { MerchantProfileMenu } from "./merchant-profile-menu";
import { MerchantThemeToggle } from "./merchant-theme-toggle";

interface MerchantHeaderProps {
  onMenuToggle: () => void;
}

export function MerchantHeader({ onMenuToggle }: MerchantHeaderProps) {
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    return () => {
      menuButtonRef.current = null;
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-4 sm:px-6 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center gap-3">
        <button
          ref={menuButtonRef}
          type="button"
          onClick={onMenuToggle}
          aria-label="Open menu"
          className="rounded-md p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 lg:hidden"
        >
          <AtlasIcon name="menu" className="h-6 w-6" />
        </button>
        <MerchantSearch />
      </div>

      <div className="flex items-center gap-2">
        <MerchantStoreLink />
        <MerchantThemeToggle />
        <MerchantNotificationsMenu />
        <MerchantProfileMenu />
      </div>
    </header>
  );
}