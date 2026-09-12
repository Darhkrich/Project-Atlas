/* eslint-disable react-hooks/set-state-in-effect */
// components/admin/security/security-ip-block-modal.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { ModalShell } from "@/components/admin/ui/model-shell";
import { SettingsField } from "@/components/admin/ui/settings-field";
import type { BlockIPInput } from "@/lib/admin/hooks/use-security-feed";

interface SecurityIPBlockModalProps {
  open: boolean;
  ips: string[];
  onClose: () => void;
  onConfirm: (input: BlockIPInput) => void;
}

type Duration = "1h" | "24h" | "7d" | "permanent";

const DURATION_OPTIONS: { value: Duration; label: string; ms: number | null }[] = [
  { value: "1h", label: "1 hour", ms: 60 * 60 * 1000 },
  { value: "24h", label: "24 hours", ms: 24 * 60 * 60 * 1000 },
  { value: "7d", label: "7 days", ms: 7 * 24 * 60 * 60 * 1000 },
  { value: "permanent", label: "Permanent", ms: null },
];

const IP_REGEX =
  /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/;

export function SecurityIPBlockModal({
  open,
  ips,
  onClose,
  onConfirm,
}: SecurityIPBlockModalProps) {
  const [reason, setReason] = useState("");
  const [duration, setDuration] = useState<Duration>("24h");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setReason("");
      setDuration("24h");
      setError(null);
    }
  }, [open]);

  const validIPs = ips.filter((ip) => IP_REGEX.test(ip));
  const invalidIPs = ips.filter((ip) => !IP_REGEX.test(ip));

  const handleConfirm = () => {
    if (validIPs.length === 0) {
      setError("No valid IP addresses to block.");
      return;
    }
    if (!reason.trim()) {
      setError("Add a reason. This is recorded in the audit log.");
      return;
    }
    const ms = DURATION_OPTIONS.find((d) => d.value === duration)?.ms ?? null;
    for (const ip of validIPs) {
      onConfirm({ ip, reason: reason.trim(), durationMs: ms });
    }
    onClose();
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={
        validIPs.length === 1
          ? `Block ${validIPs[0]}`
          : `Block ${validIPs.length} IP addresses`
      }
      description="Blocked IPs cannot authenticate or place orders. Admins can still see the event stream from other IPs."
      size="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleConfirm}
            disabled={validIPs.length === 0}
          >
            Block {validIPs.length > 1 ? `${validIPs.length} IPs` : "IP"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {validIPs.length > 0 && (
          <div className="rounded-md border border-neutral-200 p-3 text-xs dark:border-neutral-700">
            <p className="font-medium text-neutral-700 dark:text-neutral-300">
              {validIPs.length === 1 ? "Address" : "Addresses"}
            </p>
            <ul className="mt-1 flex flex-wrap gap-1.5">
              {validIPs.map((ip) => (
                <li
                  key={ip}
                  className="rounded bg-neutral-100 px-2 py-0.5 font-mono text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200"
                >
                  {ip}
                </li>
              ))}
            </ul>
          </div>
        )}

        {invalidIPs.length > 0 && (
          <div className="rounded-md border border-warning-200 bg-warning-50 p-3 text-xs text-warning-900 dark:border-warning-800/60 dark:bg-warning-900/25 dark:text-warning-100">
            <p className="font-medium">
              {invalidIPs.length} entr
              {invalidIPs.length === 1 ? "y" : "ies"} skipped as invalid:
            </p>
            <ul className="mt-1 flex flex-wrap gap-1.5">
              {invalidIPs.map((ip) => (
                <li
                  key={ip}
                  className="rounded bg-white/60 px-2 py-0.5 font-mono dark:bg-neutral-900/60"
                >
                  {ip || "(blank)"}
                </li>
              ))}
            </ul>
          </div>
        )}

        <SettingsField
          label="Duration"
          htmlFor="ip-block-duration"
          hint="Permanent blocks require a manual unblock to lift."
        >
          <select
            id="ip-block-duration"
            className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            value={duration}
            onChange={(e) => setDuration(e.target.value as Duration)}
          >
            {DURATION_OPTIONS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </SettingsField>

        <SettingsField
          label="Reason"
          htmlFor="ip-block-reason"
          required
          hint="Shown in the blocklist and recorded in audit history."
        >
          <Input
            id="ip-block-reason"
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setError(null);
            }}
            placeholder="e.g. Repeated failed logins"
          />
        </SettingsField>

        {error && (
          <p
            role="alert"
            className="rounded-md border border-danger-200 bg-danger-50 p-2 text-xs text-danger-800 dark:border-danger-800/60 dark:bg-danger-900/25 dark:text-danger-200"
          >
            {error}
          </p>
        )}
      </div>
    </ModalShell>
  );
}