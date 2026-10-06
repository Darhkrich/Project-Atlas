"use client";

import { useState } from "react";
import { AtlasIcon } from "@/components/atlas/icons";
import { Button } from "@/components/atlas/button";
import type { StorefrontDomain } from "@/lib/domains/types";

interface CustomDomainVerifiedProps {
  domain: StorefrontDomain;
  onSetPrimary: (isPrimary: boolean) => { ok: boolean; error?: string };
  onRemove: () => { ok: boolean; error?: string };
}

export function CustomDomainVerified({
  domain,
  onSetPrimary,
  onRemove,
}: CustomDomainVerifiedProps) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cd = domain.customDomain;
  if (!cd) return null;

  const handlePrimary = (isPrimary: boolean) => {
    const result = onSetPrimary(isPrimary);
    if (!result.ok) setError(result.error ?? "Could not change primary.");
    else setError(null);
  };

  const handleRemove = () => {
    const result = onRemove();
    if (!result.ok) setError(result.error ?? "Could not remove this domain.");
    else setError(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
          Custom domain
        </p>
        <p className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
          Connected to <span className="font-mono">{cd.hostname}</span>.
        </p>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-success-200 bg-success-50 p-3 dark:border-success-800/60 dark:bg-success-900/20">
        <AtlasIcon
          name="check-circle"
          aria-hidden="true"
          className="mt-0.5 h-4 w-4 shrink-0 text-success-600 dark:text-success-400"
        />
        <div className="min-w-0">
          <p className="text-xs font-semibold text-success-800 dark:text-success-200">
            {cd.hostname} is verified
          </p>
          <p className="mt-0.5 text-[11px] text-success-700 dark:text-success-300">
            Your storefront can serve from this domain.
          </p>
        </div>
      </div>

      <label className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
        <span className="min-w-0">
          <span className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200">
            Primary address
          </span>
          <span className="mt-0.5 block text-[11px] text-neutral-500 dark:text-neutral-400">
            {cd.isPrimary
              ? "Customers are sent to your custom domain."
              : "Your Atlas subdomain remains primary."}
          </span>
        </span>
        <span className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center">
          <input
            type="checkbox"
            checked={cd.isPrimary}
            onChange={(e) => handlePrimary(e.target.checked)}
            className="peer sr-only"
            aria-label="Use custom domain as primary address"
          />
          <span className="absolute inset-0 rounded-full bg-neutral-300 transition-colors peer-checked:bg-brand-600 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500 dark:bg-neutral-700" />
          <span className="absolute left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
        </span>
      </label>

      {!confirming ? (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="text-xs font-medium text-danger-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-danger-400"
        >
          Remove custom domain
        </button>
      ) : (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-danger-200 bg-danger-50 p-3 dark:border-danger-800/60 dark:bg-danger-900/20">
          <p className="flex-1 text-xs text-danger-800 dark:text-danger-200">
            Remove {cd.hostname}? Your storefront returns to the Atlas subdomain.
          </p>
          <Button variant="outline" size="sm" onClick={() => setConfirming(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleRemove}
            className="bg-danger-600 text-white hover:bg-danger-700"
          >
            Remove
          </Button>
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="text-[11px] text-danger-600 dark:text-danger-400"
        >
          {error}
        </p>
      )}
    </div>
  );
}