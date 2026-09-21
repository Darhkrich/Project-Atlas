"use client";

import { AtlasIcon } from "@/components/atlas/icons";

export function AffiliateCard() {
  return (
    <div className="rounded-xl border-2 border-info-200 bg-gradient-to-br from-info-50 to-white p-4 dark:border-info-800/60 dark:from-info-900/20 dark:to-neutral-900">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-info-100 text-info-700 dark:bg-info-900/40 dark:text-info-300">
          <AtlasIcon name="globe" aria-hidden="true" className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-neutral-900 dark:text-white">
            Don&apos;t have a domain yet?
          </p>
          <p className="mt-1 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
            Buy a domain from a popular registrar, then come back here to
            connect it to your storefront. Setup takes about 5 minutes.
          </p>
          <a
            href="https://www.namecheap.com/domains/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex h-9 items-center gap-2 rounded-lg bg-info-600 px-3 text-xs font-semibold text-white transition-colors hover:bg-info-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-info-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900"
          >
            Browse popular registrars
            <AtlasIcon
              name="external-link"
              aria-hidden="true"
              className="h-3.5 w-3.5"
            />
          </a>
        </div>
      </div>
    </div>
  );
}