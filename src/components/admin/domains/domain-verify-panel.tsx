/* eslint-disable react-hooks/static-components */
"use client";

import { useState } from "react";
import type { StorefrontDomain } from "@/lib/domains/types";
import { Button } from "@/components/admin/ui/button";
import { Badge } from "@/components/admin/ui/badge";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { formatRelative } from "@/lib/admin/support/format";
import { useNow } from "@/lib/admin/hooks/use-now";
import {
  VERIFICATION_METHOD_LABEL,
  VERIFICATION_STATUS_LABEL,
  VERIFICATION_STATUS_VARIANT,
} from "@/lib/domains/labels";
import { dnsRecordsFor } from "@/lib/domains/projection";

interface DomainVerifyPanelProps {
  domain: StorefrontDomain;
  verifying: boolean;
  onVerify: () => void;
  onChangeMethod: (method: "cname" | "txt") => void;
}

export function DomainVerifyPanel({
  domain,
  verifying,
  onVerify,
  onChangeMethod,
}: DomainVerifyPanelProps) {
  const now = useNow();
  const cd = domain.customDomain;
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!cd) return null;

  const records = dnsRecordsFor(domain);
  const cname = records.find((r) => r.type === "CNAME");
  const txt = records.find((r) => r.type === "TXT");
  const isVerified = cd.verificationStatus === "verified";
  const isFailed = cd.verificationStatus === "failed";

  const copy = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(label);
      window.setTimeout(() => setCopiedField(null), 1500);
    } catch {
      setCopiedField("error");
      window.setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const RecordBlock = ({
    label,
    type,
    name,
    value,
    description,
  }: {
    label: string;
    type: string;
    name: string;
    value: string;
    description: string;
  }) => (
    <div className="rounded-md border border-neutral-200 p-3 dark:border-neutral-700">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          {label}
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => copy(label, value)}
          aria-label={"Copy " + label + " value"}
        >
          <AtlasIcon
            name="copy"
            aria-hidden="true"
            className="mr-1 h-3 w-3"
          />
          {copiedField === label ? "Copied" : "Copy"}
        </Button>
      </div>
      <dl className="mt-1 grid grid-cols-[80px_1fr] gap-x-2 gap-y-1 text-xs">
        <dt className="text-neutral-500 dark:text-neutral-400">Type</dt>
        <dd className="font-mono text-neutral-900 dark:text-neutral-100">
          {type}
        </dd>
        <dt className="text-neutral-500 dark:text-neutral-400">Name</dt>
        <dd className="font-mono text-neutral-900 dark:text-neutral-100">
          {name}
        </dd>
        <dt className="text-neutral-500 dark:text-neutral-400">Value</dt>
        <dd className="break-all font-mono text-neutral-900 dark:text-neutral-100">
          {value}
        </dd>
      </dl>
      <p className="mt-2 text-[11px] text-neutral-500 dark:text-neutral-400">
        {description}
      </p>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-neutral-200 p-3 dark:border-neutral-700">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm text-neutral-900 dark:text-neutral-100">
            {cd.hostname}
          </span>
          <Badge variant={VERIFICATION_STATUS_VARIANT[cd.verificationStatus]}>
            {VERIFICATION_STATUS_LABEL[cd.verificationStatus]}
          </Badge>
        </div>
        {!isVerified && (
          <Button
            size="sm"
            onClick={onVerify}
            disabled={verifying}
            aria-label="Verify custom domain now"
          >
            {verifying ? (
              <>
                <span
                  aria-hidden="true"
                  className="mr-1 inline-block h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white"
                />
                Verifying...
              </>
            ) : (
              "Verify now"
            )}
          </Button>
        )}
      </div>

      {isVerified && (
        <div className="flex items-center gap-2 rounded-md border border-success-200 bg-success-50 p-3 text-xs text-success-800 dark:border-success-800/60 dark:bg-success-900/20 dark:text-success-200">
          <AtlasIcon
            name="check"
            aria-hidden="true"
            className="h-4 w-4 shrink-0"
          />
          <span>
            Verified{" "}
            {now && cd.verifiedAt
              ? formatRelative(cd.verifiedAt, now)
              : "recently"}
            . The storefront serves from this domain.
          </span>
        </div>
      )}

      {isFailed && cd.failureReason && (
        <div
          role="alert"
          className="rounded-md border border-danger-200 bg-danger-50 p-3 text-xs text-danger-800 dark:border-danger-800/60 dark:bg-danger-900/20 dark:text-danger-200"
        >
          <p className="flex items-center gap-1.5 font-medium">
            <AtlasIcon
              name="alert"
              aria-hidden="true"
              className="h-3.5 w-3.5"
            />
            Verification failed
          </p>
          <p className="mt-1">{cd.failureReason}</p>
        </div>
      )}

      {!isVerified && (
        <>
          <div
            role="group"
            aria-label="Verification method"
            className="flex gap-1"
          >
            {(["cname", "txt"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => onChangeMethod(m)}
                aria-pressed={cd.verificationMethod === m}
                className={cn(
                  "rounded-md px-3 py-1 text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                  cd.verificationMethod === m
                    ? "bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300"
                    : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
                )}
              >
                {VERIFICATION_METHOD_LABEL[m]}
              </button>
            ))}
          </div>

          {cd.verificationMethod === "cname" && cname && (
            <>
              <RecordBlock
                label="CNAME record"
                type={cname.type}
                name={cname.name}
                value={cname.value}
                description={cname.description}
              />
              <details className="rounded-md border border-neutral-200 p-3 text-xs dark:border-neutral-700">
                <summary className="cursor-pointer text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200">
                  Alternative verification via TXT
                </summary>
                <p className="mt-2 text-[11px] text-neutral-500 dark:text-neutral-400">
                  Use this if your DNS provider does not allow CNAME records
                  at this hostname.
                </p>
                {txt && (
                  <div className="mt-2">
                    <RecordBlock
                      label="TXT record"
                      type={txt.type}
                      name={txt.name}
                      value={txt.value}
                      description={txt.description}
                    />
                  </div>
                )}
              </details>
            </>
          )}

          {cd.verificationMethod === "txt" && txt && (
            <>
              <RecordBlock
                label="TXT record"
                type={txt.type}
                name={txt.name}
                value={txt.value}
                description={txt.description}
              />
              <details className="rounded-md border border-neutral-200 p-3 text-xs dark:border-neutral-700">
                <summary className="cursor-pointer text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200">
                  Alternative verification via CNAME
                </summary>
                <p className="mt-2 text-[11px] text-neutral-500 dark:text-neutral-400">
                  Use the CNAME method if your DNS provider supports it.
                </p>
                {cname && (
                  <div className="mt-2">
                    <RecordBlock
                      label="CNAME record"
                      type={cname.type}
                      name={cname.name}
                      value={cname.value}
                      description={cname.description}
                    />
                  </div>
                )}
              </details>
            </>
          )}

          <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
            After adding the record, allow a few minutes for DNS
            propagation before verifying.
          </p>
        </>
      )}
    </div>
  );
}