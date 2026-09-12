// components/admin/security/security-allowlist.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { useNow } from "@/lib/admin/hooks/use-now";
import { formatAbsolute, formatRelative } from "@/lib/admin/support/format";
import type { AllowlistedIP } from "@/lib/admin/types/security";

interface SecurityAllowlistProps {
  entries: AllowlistedIP[];
  onAdd: (input: { ip: string; label: string }) => void;
  onRemove: (id: string) => void;
}

const IP_REGEX =
  /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/;

export function SecurityAllowlist({
  entries,
  onAdd,
  onRemove,
}: SecurityAllowlistProps) {
  const [ip, setIp] = useState("");
  const [label, setLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const now = useNow();

  const handleAdd = () => {
    const trimmedIP = ip.trim();
    const trimmedLabel = label.trim();
    if (!IP_REGEX.test(trimmedIP)) {
      setError("Enter a valid IPv4 address.");
      return;
    }
    if (!trimmedLabel) {
      setError("Add a short label so others know what this IP is for.");
      return;
    }
    if (entries.some((e) => e.ip === trimmedIP)) {
      setError("This IP is already allowlisted.");
      return;
    }
    onAdd({ ip: trimmedIP, label: trimmedLabel });
    setIp("");
    setLabel("");
    setError(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Allowlisted IPs</CardTitle>
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          These addresses bypass IP-based restrictions and maintenance mode.
          Keep this list short and audited.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <Input
            aria-label="IP address"
            placeholder="e.g. 154.160.1.1"
            value={ip}
            onChange={(e) => {
              setIp(e.target.value);
              setError(null);
            }}
          />
          <Input
            aria-label="Label"
            placeholder="e.g. Atlas HQ (Accra)"
            value={label}
            onChange={(e) => {
              setLabel(e.target.value);
              setError(null);
            }}
          />
          <Button variant="outline" size="sm" onClick={handleAdd}>
            Add
          </Button>
        </div>

        {error && (
          <p
            role="alert"
            className="text-xs text-danger-600 dark:text-danger-400"
          >
            {error}
          </p>
        )}

        {entries.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No allowlisted IPs. Admins will be subject to the same IP rules as
            everyone else.
          </p>
        ) : (
          <ul className="space-y-2">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-neutral-200 p-3 dark:border-neutral-700"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm text-neutral-900 dark:text-neutral-100">
                      {entry.ip}
                    </span>
                    {entry.countryCode && (
                      <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                        {entry.countryCode}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                    {entry.label}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-400 dark:text-neutral-500">
                    Added by {entry.addedBy} ·{" "}
                    <time
                      dateTime={entry.addedAt}
                      title={formatAbsolute(entry.addedAt)}
                    >
                      {formatRelative(entry.addedAt, now)}
                    </time>
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(entry.id)}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}