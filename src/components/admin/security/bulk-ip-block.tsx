// components/admin/security/bulk-ip-block.tsx
"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Button } from "@/components/admin/ui/button";
import { cn } from "@/lib/utils";

interface BulkIPBlockProps {
  existingBlockedIPs: string[];
  onReview: (ips: string[]) => void;
}

const IP_REGEX =
  /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/;

interface ParseResult {
  valid: string[];
  invalid: string[];
  duplicates: string[];
  alreadyBlocked: string[];
  blockable: string[];
}

function parseInput(raw: string, existing: string[]): ParseResult {
  const lines = raw
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const seen = new Set<string>();
  const valid: string[] = [];
  const invalid: string[] = [];
  const duplicates: string[] = [];
  const alreadyBlocked: string[] = [];
  const blockable: string[] = [];

  for (const line of lines) {
    if (!IP_REGEX.test(line)) {
      invalid.push(line);
      continue;
    }
    if (seen.has(line)) {
      duplicates.push(line);
      continue;
    }
    seen.add(line);
    valid.push(line);

    if (existing.includes(line)) {
      alreadyBlocked.push(line);
    } else {
      blockable.push(line);
    }
  }

  return { valid, invalid, duplicates, alreadyBlocked, blockable };
}

export function BulkIPBlock({
  existingBlockedIPs,
  onReview,
}: BulkIPBlockProps) {
  const [raw, setRaw] = useState("");

  const parsed = useMemo(
    () => parseInput(raw, existingBlockedIPs),
    [raw, existingBlockedIPs]
  );

  const hasInput = raw.trim().length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk IP block</CardTitle>
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          Paste one IP per line or comma-separated. Invalid entries and
          duplicates are skipped.
        </p>
      </CardHeader>

      <CardContent className="space-y-3">
        <label htmlFor="bulk-ip-input" className="sr-only">
          IP addresses
        </label>
        <textarea
          id="bulk-ip-input"
          className="w-full rounded-md border border-neutral-300 p-2 font-mono text-xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          rows={5}
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder={"203.0.113.10\n198.51.100.22\n192.0.2.44"}
        />

        {hasInput && (
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
              {parsed.valid.length} valid
            </span>
            {parsed.invalid.length > 0 && (
              <span className="rounded-full bg-danger-50 px-2 py-0.5 text-danger-700 dark:bg-danger-900/30 dark:text-danger-300">
                {parsed.invalid.length} invalid
              </span>
            )}
            {parsed.duplicates.length > 0 && (
              <span className="rounded-full bg-warning-50 px-2 py-0.5 text-warning-700 dark:bg-warning-900/30 dark:text-warning-300">
                {parsed.duplicates.length} duplicate
              </span>
            )}
            {parsed.alreadyBlocked.length > 0 && (
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                {parsed.alreadyBlocked.length} already blocked
              </span>
            )}
          </div>
        )}

        {parsed.invalid.length > 0 && (
          <div className="rounded-md border border-danger-200 bg-danger-50 p-2 text-xs dark:border-danger-800/60 dark:bg-danger-900/25">
            <p className="font-medium text-danger-800 dark:text-danger-200">
              Invalid entries skipped:
            </p>
            <ul className="mt-1 flex flex-wrap gap-1.5">
              {parsed.invalid.slice(0, 8).map((ip) => (
                <li
                  key={ip}
                  className="rounded bg-white/70 px-1.5 py-0.5 font-mono text-danger-800 dark:bg-neutral-900/60 dark:text-danger-200"
                >
                  {ip}
                </li>
              ))}
              {parsed.invalid.length > 8 && (
                <li className="px-1.5 py-0.5 text-danger-700 dark:text-danger-300">
                  +{parsed.invalid.length - 8} more
                </li>
              )}
            </ul>
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <p
            className={cn(
              "text-xs",
              parsed.blockable.length === 0
                ? "text-neutral-500 dark:text-neutral-400"
                : "text-neutral-700 dark:text-neutral-300"
            )}
          >
            {parsed.blockable.length === 0
              ? "Nothing to block yet."
              : `${parsed.blockable.length} address${
                  parsed.blockable.length === 1 ? "" : "es"
                } ready to block.`}
          </p>
          <Button
            size="sm"
            variant="destructive"
            disabled={parsed.blockable.length === 0}
            onClick={() => {
              onReview(parsed.blockable);
              setRaw("");
            }}
          >
            Review &amp; block
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}