"use client";

import { useState } from "react";
import { AtlasIcon } from "@/components/atlas/icons";
import { Button } from "@/components/atlas/button";
import { AffiliateCard } from "./affiliate-card";
import { cn } from "@/lib/utils";

interface CustomDomainEmptyProps {
  subdomainDisplay: string;
  onAdd: (hostname: string) => { ok: boolean; error?: string };
}

export function CustomDomainEmpty({
  subdomainDisplay,
  onAdd,
}: CustomDomainEmptyProps) {
  const [hostname, setHostname] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleAdd = () => {
    const value = hostname.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
    const result = onAdd(value);
    if (!result.ok) {
      setError(result.error ?? "Could not add this domain.");
      return;
    }
    setError(null);
    setHostname("");
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
          Custom domain
        </p>
        <p className="mt-0.5 text-[11px] leading-relaxed text-neutral-500 dark:text-neutral-400">
          Serve your storefront from your own domain instead of{" "}
          <span className="font-mono">{subdomainDisplay}</span>.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={hostname}
          onChange={(e) => {
            setHostname(e.target.value);
            setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
          aria-label="Custom domain name"
          placeholder="www.yourdomain.com"
          autoComplete="off"
          className={cn(
            "min-w-0 flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500",
            error && "border-danger-500"
          )}
        />
        <Button onClick={handleAdd} disabled={!hostname.trim()}>
          <AtlasIcon name="globe" aria-hidden="true" className="h-4 w-4" />
          Connect domain
        </Button>
      </div>

      {error && (
        <p
          role="alert"
          className="text-[11px] text-danger-600 dark:text-danger-400"
        >
          {error}
        </p>
      )}

      <AffiliateCard />
    </div>
  );
}