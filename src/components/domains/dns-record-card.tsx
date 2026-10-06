"use client";

import { useEffect, useState } from "react";
import { AtlasIcon } from "@/components/atlas/icons";

interface DnsRecordCardProps {
  label: string;
  type: string;
  name: string;
  value: string;
  description: string;
  onAnnounce?: (message: string) => void;
}

export function DnsRecordCard({
  label,
  type,
  name,
  value,
  description,
  onAnnounce,
}: DnsRecordCardProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(id);
  }, [copied]);

  const handleCopy = async (field: "name" | "value") => {
    const text = field === "name" ? name : value;
    try {
      if (typeof navigator === "undefined" || !navigator.clipboard) {
        throw new Error("Clipboard unavailable");
      }
      await navigator.clipboard.writeText(text);
      setCopied(true);
      onAnnounce?.(label + " " + field + " copied");
    } catch {
      onAnnounce?.("Could not copy. Select the value manually.");
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50 px-3 py-2 dark:border-neutral-800 dark:bg-neutral-950">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          {label}
        </p>
        <button
          type="button"
          onClick={() => handleCopy("value")}
          aria-label={"Copy " + label + " value"}
          className="inline-flex items-center gap-1 rounded text-[11px] font-medium text-neutral-600 transition-colors hover:text-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-neutral-300 dark:hover:text-white"
        >
          <AtlasIcon name="copy" aria-hidden="true" className="h-3 w-3" />
          {copied ? "Copied" : "Copy value"}
        </button>
      </div>
      <dl className="grid grid-cols-[64px_1fr] gap-x-2 gap-y-2 p-3 text-xs">
        <dt className="text-neutral-500 dark:text-neutral-400">Type</dt>
        <dd className="font-mono text-neutral-900 dark:text-white">{type}</dd>
        <dt className="text-neutral-500 dark:text-neutral-400">Name</dt>
        <dd className="flex items-center gap-2">
          <span className="break-all font-mono text-neutral-900 dark:text-white">
            {name}
          </span>
          <button
            type="button"
            onClick={() => handleCopy("name")}
            aria-label={"Copy " + label + " name"}
            className="rounded p-0.5 text-neutral-400 transition-colors hover:text-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:hover:text-neutral-200"
          >
            <AtlasIcon name="copy" aria-hidden="true" className="h-3 w-3" />
          </button>
        </dd>
        <dt className="text-neutral-500 dark:text-neutral-400">Value</dt>
        <dd className="break-all font-mono text-neutral-900 dark:text-white">
          {value}
        </dd>
      </dl>
      <p className="border-t border-neutral-200 px-3 py-2.5 text-[11px] leading-relaxed text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
        {description}
      </p>
    </div>
  );
}