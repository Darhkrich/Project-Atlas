"use client";

import { AtlasIcon } from "@/components/atlas/icons";

export function DomainAffiliateCard() {
  return (
    <div className="rounded-md border border-info-200 bg-info-50 p-3 text-xs dark:border-info-800/60 dark:bg-info-900/20">
      <p className="flex items-start gap-2 text-info-900 dark:text-info-100">
        <AtlasIcon
          name="info"
          aria-hidden="true"
          className="mt-0.5 h-3.5 w-3.5 shrink-0"
        />
        <span>
          Don&apos;t have a domain yet? Buy one from a registrar, then
          return here to connect it.{" "}
          <a
            href="https://www.namecheap.com/domains/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline"
          >
            See popular registrars
          </a>
          .
        </span>
      </p>
    </div>
  );
}