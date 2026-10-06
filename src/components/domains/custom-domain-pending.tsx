"use client";

import { useState } from "react";
import { AtlasIcon } from "@/components/atlas/icons";
import { Button } from "@/components/atlas/button";
import { DnsRecordCard } from "./dns-record-card";
import { dnsRecordsFor } from "@/lib/domains/projection";
import { VERIFICATION_METHOD_LABEL } from "@/lib/domains/labels";
import type { StorefrontDomain } from "@/lib/domains/types";
import { cn } from "@/lib/utils";

interface CustomDomainPendingProps {
  domain: StorefrontDomain;
  onSetMethod: (method: "cname" | "txt") => { ok: boolean; error?: string };
  onVerify: () => Promise<{ ok: boolean; error?: string }>;
  onRemove: () => { ok: boolean; error?: string };
  onAnnounce: (message: string) => void;
}

export function CustomDomainPending({
  domain,
  onSetMethod,
  onVerify,
  onRemove,
  onAnnounce,
}: CustomDomainPendingProps) {
  const [verifying, setVerifying] = useState(false);
  const [showAlternative, setShowAlternative] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cd = domain.customDomain;
  if (!cd) return null;

  const records = dnsRecordsFor(domain);
  const cname = records.find((r) => r.type === "CNAME");
  const txt = records.find((r) => r.type === "TXT");
  const isFailed = cd.verificationStatus === "failed";

  const handleVerify = async () => {
    setVerifying(true);
    setError(null);
    const result = await onVerify();
    setVerifying(false);
    if (!result.ok) {
      setError(result.error ?? "Verification failed.");
    } else {
      onAnnounce("Domain verified.");
    }
  };

  const handleRemove = () => {
    const result = onRemove();
    if (!result.ok) setError(result.error ?? "Could not remove this domain.");
  };

  const primaryRecord =
    cd.verificationMethod === "cname" ? cname : txt;
  const alternateRecord =
    cd.verificationMethod === "cname" ? txt : cname;
  const alternateLabel =
    cd.verificationMethod === "cname" ? "TXT record" : "CNAME record";

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
          Custom domain
        </p>
        <p className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
          Setting up <span className="font-mono">{cd.hostname}</span>.
        </p>
      </div>

      <div
        role="status"
        className={cn(
          "rounded-lg border p-3",
          isFailed
            ? "border-danger-200 bg-danger-50 dark:border-danger-800/60 dark:bg-danger-900/20"
            : "border-info-200 bg-info-50 dark:border-info-800/60 dark:bg-info-900/20"
        )}
      >
        <div className="flex items-start gap-2">
          <AtlasIcon
            name={isFailed ? "alert" : "info"}
            aria-hidden="true"
            className={cn(
              "mt-0.5 h-4 w-4 shrink-0",
              isFailed
                ? "text-danger-600 dark:text-danger-400"
                : "text-info-600 dark:text-info-400"
            )}
          />
          <div className="min-w-0">
            <p
              className={cn(
                "text-xs font-semibold",
                isFailed
                  ? "text-danger-800 dark:text-danger-200"
                  : "text-info-800 dark:text-info-200"
              )}
            >
              {isFailed ? "Verification failed" : "DNS setup needed"}
            </p>
            <p
              className={cn(
                "mt-0.5 text-[11px] leading-relaxed",
                isFailed
                  ? "text-danger-700 dark:text-danger-300"
                  : "text-info-700 dark:text-info-300"
              )}
            >
              {isFailed
                ? cd.failureReason ??
                  "We could not verify your DNS records. Check the values below and try again."
                : "Add the record below at your registrar, wait a few minutes, then verify."}
            </p>
          </div>
        </div>
      </div>

      <div
        role="group"
        aria-label="Verification method"
        className="flex gap-1 rounded-lg border border-neutral-200 p-1 dark:border-neutral-800"
      >
        {(["cname", "txt"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => onSetMethod(m)}
            aria-pressed={cd.verificationMethod === m}
            className={cn(
              "flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
              cd.verificationMethod === m
                ? "bg-brand-100 text-brand-800 dark:bg-brand-900/40 dark:text-brand-200"
                : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            )}
          >
            {VERIFICATION_METHOD_LABEL[m]}
          </button>
        ))}
      </div>

      {primaryRecord && (
        <DnsRecordCard
          label={
            cd.verificationMethod === "cname" ? "CNAME record" : "TXT record"
          }
          type={primaryRecord.type}
          name={primaryRecord.name}
          value={primaryRecord.value}
          description={primaryRecord.description}
          onAnnounce={onAnnounce}
        />
      )}

      <button
        type="button"
        onClick={() => setShowAlternative((p) => !p)}
        aria-expanded={showAlternative}
        className="inline-flex items-center gap-1.5 text-[11px] font-medium text-neutral-500 transition-colors hover:text-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-neutral-400 dark:hover:text-neutral-200"
      >
        <AtlasIcon
          name={showAlternative ? "chevron-up" : "chevron-down"}
          aria-hidden="true"
          className="h-3 w-3"
        />
        {showAlternative ? "Hide" : "Use"} {alternateLabel.toLowerCase()} instead
      </button>

      {showAlternative && alternateRecord && (
        <DnsRecordCard
          label={alternateLabel}
          type={alternateRecord.type}
          name={alternateRecord.name}
          value={alternateRecord.value}
          description={alternateRecord.description}
          onAnnounce={onAnnounce}
        />
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={handleVerify} disabled={verifying}>
          {verifying ? (
            <>
              <span
                aria-hidden="true"
                className="mr-1.5 inline-block h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white"
              />
              Verifying...
            </>
          ) : isFailed ? (
            "Retry verification"
          ) : (
            "Verify now"
          )}
        </Button>
        <Button variant="outline" onClick={handleRemove}>
          Remove domain
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
    </div>
  );
}