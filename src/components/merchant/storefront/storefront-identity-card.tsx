/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AtlasIcon } from "@/components/atlas/icons";
import { Button } from "@/components/atlas/button";
import type {
  StorefrontStatus,
} from "@/lib/merchant/storefront/types";
import { cn } from "@/lib/utils";

interface StorefrontIdentityCardProps {
  storeName: string;
  logo?: string;
  storeUrl: string;
  status: StorefrontStatus;
  onPublish: () => void;
  onUnpublish: () => void;
  onPreviewAsCustomer: () => void;
}

const STATUS_META: Record<
  StorefrontStatus,
  { label: string; className: string }
> = {
  live: {
    label: "Live",
    className:
      "bg-success-50 text-success-700 border-success-200 dark:bg-success-900/20 dark:text-success-300 dark:border-success-800/60",
  },
  draft: {
    label: "Draft",
    className:
      "bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700",
  },
  unpublished: {
    label: "Unpublished by Atlas",
    className:
      "bg-warning-50 text-warning-700 border-warning-200 dark:bg-warning-900/20 dark:text-warning-300 dark:border-warning-800/60",
  },
};

export function StorefrontIdentityCard({
  storeName,
  logo,
  storeUrl,
  status,
  onPublish,
  onUnpublish,
  onPreviewAsCustomer,
}: StorefrontIdentityCardProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(id);
  }, [copied]);

  const handleCopy = async () => {
    try {
      if (typeof navigator === "undefined" || !navigator.clipboard) {
        throw new Error("Clipboard unavailable");
      }
      await navigator.clipboard.writeText(storeUrl);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const meta = STATUS_META[status];

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950">
          {logo ? (
            <img
              src={logo}
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover"
            />
          ) : (
            <AtlasIcon
              name="store"
              aria-hidden="true"
              className="h-6 w-6 text-neutral-400"
            />
          )}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
              {storeName || "Untitled store"}
            </h1>
            <span
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                meta.className
              )}
            >
              {meta.label}
            </span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="break-all font-mono text-xs text-neutral-500 dark:text-neutral-400">
              {storeUrl}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              aria-label="Copy storefront URL"
              className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium text-neutral-500 transition-colors hover:text-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-neutral-400 dark:hover:text-neutral-200"
            >
              <AtlasIcon
                name="copy"
                aria-hidden="true"
                className="h-3 w-3"
              />
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" onClick={onPreviewAsCustomer}>
          <AtlasIcon name="eye" aria-hidden="true" className="h-4 w-4" />
          Preview as customer
        </Button>
        <Link
          href={storeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
        >
          <AtlasIcon name="external-link" aria-hidden="true" className="h-4 w-4" />
          View store
        </Link>
        {status === "live" ? (
          <Button variant="outline" onClick={onUnpublish}>
            Unpublish
          </Button>
        ) : (
          <Button onClick={onPublish}>
            <AtlasIcon name="rocket" aria-hidden="true" className="h-4 w-4" />
            Launch store
          </Button>
        )}
      </div>
    </div>
  );
}