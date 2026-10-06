"use client";

import { AtlasIcon } from "@/components/atlas/icons";

interface RegistrarLink {
  name: string;
  href: string;
  hint: string;
}

const REGISTRARS: RegistrarLink[] = [
  {
    name: "Namecheap",
    href: "https://www.namecheap.com/domains/",
    hint: "Popular, low prices",
  },
  {
    name: "Cloudflare",
    href: "https://www.cloudflare.com/products/registrar/",
    hint: "Free DNS, at-cost domains",
  },
  {
    name: "GoDaddy",
    href: "https://www.godaddy.com/domains",
    hint: "Wide selection",
  },
];

export function AffiliateCard() {
  return (
    <div className="rounded-xl border border-info-200 bg-info-50 p-4 dark:border-info-800/60 dark:bg-info-900/20">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-info-100 text-info-700 dark:bg-info-900/60 dark:text-info-300">
          <AtlasIcon name="globe" aria-hidden="true" className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-neutral-900 dark:text-white">
            Need a domain?
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
            Buy a domain from a registrar, then come back here to connect it.
            Setup takes about five minutes.
          </p>
          <ul role="list" className="mt-3 space-y-1">
            {REGISTRARS.map((r) => (
              <li key={r.name}>
                <a
                  href={r.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-xs text-neutral-700 transition-colors hover:bg-info-100/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-info-500 dark:text-neutral-300 dark:hover:bg-info-900/30"
                >
                  <span className="font-medium">{r.name}</span>
                  <span className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400">
                    {r.hint}
                    <AtlasIcon
                      name="external-link"
                      aria-hidden="true"
                      className="h-3 w-3"
                    />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}