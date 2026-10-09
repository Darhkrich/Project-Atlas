"use client";

import { useState } from "react";
import { AtlasIcon } from "@/components/atlas/icons";
import { Button } from "@/components/atlas/button";

interface OnboardingSuccessProps {
  storeName: string;
  storefrontUrl: string;
  onContinue: () => void;
}

export function OnboardingSuccess({
  storeName,
  storefrontUrl,
  onContinue,
}: OnboardingSuccessProps) {
  const [copied, setCopied] = useState(false);

  const fullUrl =
    typeof window !== "undefined"
      ? window.location.origin + storefrontUrl
      : storefrontUrl;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-4 py-12 text-center">
        <span
          aria-hidden="true"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300"
        >
          <AtlasIcon name="sparkles" className="h-7 w-7" />
        </span>

        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-3xl">
          {storeName} is live
        </h1>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Share the link. Customers can buy from you right now.
        </p>

        <div className="mt-8 flex w-full items-stretch gap-2 rounded-lg border border-neutral-200 bg-white p-2 dark:border-neutral-800 dark:bg-neutral-900">
          <code className="flex-1 truncate px-2 py-1.5 text-left text-xs text-neutral-700 dark:text-neutral-300">
            {fullUrl}
          </code>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            aria-label="Copy storefront link"
          >
            <AtlasIcon
              name={copied ? "check" : "copy"}
              className="h-3.5 w-3.5"
              aria-hidden="true"
            />
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>

        <div className="mt-8 w-full">
          <Button size="lg" onClick={onContinue} className="w-full">
            Go to my storefront
          </Button>
        </div>

        {copied ? (
          <p role="status" className="sr-only">
            Link copied to clipboard
          </p>
        ) : null}
      </div>
    </div>
  );
}