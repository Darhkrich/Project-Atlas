/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { AtlasIcon } from "@/components/atlas/icons";

type CustomerStore = {
  storeName?: string;
  logo?: string;
  primaryColor?: string;
  whatsapp?: string;
};

type Props = {
  store: CustomerStore;
};

export function CustomerStoreHeader({ store }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200/80 bg-white/95 backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-950/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="#"
          className="flex min-w-0 items-center gap-3"
          aria-label={`${store.storeName} home`}
        >
          {store.logo ? (
            <img
              src={store.logo}
              alt={store.storeName}
              className="h-10 w-10 rounded-xl object-cover"
            />
          ) : (
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
              style={{ backgroundColor: store.primaryColor }}
            >
              {(store.storeName || "A").charAt(0).toUpperCase()}
            </div>
          )}

          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-neutral-950 dark:text-white">
              {store.storeName || "Atlas Store"}
            </p>

            <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
              Digital Services
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {store.whatsapp && (
            <a
              href={`https://wa.me/${store.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 sm:inline-flex dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-900"
            >
              <AtlasIcon name="phone" className="h-4 w-4" />
              Contact
            </a>
          )}

          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white sm:hidden"
            style={{ backgroundColor: store.primaryColor }}
          >
            <AtlasIcon name="phone" className="h-4 w-4" />
          </div>
        </div>
      </div>
    </header>
  );
}