/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { AtlasCard } from "@/components/atlas/card";
import { AtlasIcon } from "@/components/atlas/icons";
import { Button } from "@/components/atlas/button";
import { cn } from "@/lib/utils";
import { useMyDomain } from "@/lib/domains/hooks/use-my-domain";
import {
  dnsRecordsFor,
  subdomainFor,
} from "@/lib/domains/projection";
import {
  VERIFICATION_METHOD_LABEL,
} from "@/lib/domains/labels";
import type { StorefrontDomain } from "@/lib/domains/types";
import { AffiliateCard } from "./affiliate-card";


interface DomainSectionProps {
  storefrontId: string;
  storefrontName: string;
  variant: "reseller" | "merchant";
  ownerName?: string;
  ownerEmail?: string;
  planOptions?: {
    customDomain: boolean;
  };
  framed?: boolean;
}

const inputClass =
  "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white";

export function DomainSection(props: DomainSectionProps) {
  const { framed = true } = props;
  const inner = <DomainSectionInner {...props} />;
  if (!framed) {
    return <div className="space-y-6">{inner}</div>;
  }
  return <AtlasCard>{inner}</AtlasCard>;
}

function DomainSectionInner({
  storefrontId,
  storefrontName,
  variant,
  ownerName = "Store owner",
  ownerEmail = "owner@atlasgh.com",
  planOptions,
}: DomainSectionProps) {
  const {
    domain,
    loading,
    missing,
    changeSlug,
    addCustomDomain,
    removeCustomDomain,
    setMethod,
    verify,
    setPrimary,
  } = useMyDomain({ storefrontId, ownerName, ownerEmail });

  if (loading) {
    return (
      <div className="space-y-3 p-5">
        <div className="h-4 w-32 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-10 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800" />
        <div className="h-10 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800" />
      </div>
    );
  }

  if (missing || !domain) {
    return (
      <div className="p-5 text-sm text-neutral-500 dark:text-neutral-400">
        Domain settings are not available for this storefront yet. Refresh
        the page in a moment or contact support if this persists.
      </div>
    );
  }

  const customDomainEnabled = planOptions?.customDomain !== false;

  return (
    <div className="space-y-6 p-5">
      <div>
        <h2 className="text-sm font-semibold text-neutral-950 dark:text-white">
          Your storefront address
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
          Your storefront is always available on Atlas. Connect a custom
          domain to serve it from your own brand.
        </p>
      </div>

      <SubdomainBlock
        currentSlug={domain.subdomain.slug}
        root={domain.subdomain.root}
        isCustomSlug={domain.subdomain.isCustomSlug}
        onChange={changeSlug}
      />

      {customDomainEnabled ? (
        <div className="border-t border-neutral-200 pt-6 dark:border-neutral-800">
          <CustomDomainBlock
            domain={domain}
            onAdd={addCustomDomain}
            onRemove={removeCustomDomain}
            onSetMethod={setMethod}
            onVerify={verify}
            onSetPrimary={setPrimary}
          />
        </div>
      ) : (
        <div className="border-t border-neutral-200 pt-6 dark:border-neutral-800">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Custom domains are available on higher plans. Upgrade your
            subscription to connect your own domain.
          </p>
        </div>
      )}

      <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
        Storefront: {storefrontName} ·{" "}
        {variant === "merchant" ? "Merchant" : "Reseller"}
      </p>
    </div>
  );
}

/* ======================================================================
   Subdomain
   ====================================================================== */

interface SubdomainBlockProps {
  currentSlug: string;
  root: string;
  isCustomSlug: boolean;
  onChange: (slug: string) => { ok: boolean; error?: string };
}

function SubdomainBlock({
  currentSlug,
  root,
  isCustomSlug,
  onChange,
}: SubdomainBlockProps) {
  const [draft, setDraft] = useState(currentSlug);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(currentSlug);
  }, [currentSlug]);

  const dirty = draft.trim().toLowerCase() !== currentSlug;

  const handleSave = () => {
    const result = onChange(draft.trim().toLowerCase());
    if (!result.ok) {
      setError(result.error ?? "Could not save your subdomain.");
      return;
    }
    setError(null);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
          Atlas subdomain
        </p>
        <p className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
          Free. Always active. Customers can reach your storefront at this
          address.
        </p>
      </div>

      <div className="flex items-stretch">
        <input
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value.toLowerCase().replace(/\s+/g, "-"));
            setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSave();
            }
          }}
          aria-label="Subdomain slug"
          placeholder="your-store"
          autoComplete="off"
          className={cn(
            "min-w-0 flex-1 rounded-l-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white",
            error && "border-danger-500"
          )}
        />
        <span className="flex items-center rounded-r-lg border border-l-0 border-neutral-200 bg-neutral-50 px-3 text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
          .{root}
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p
          aria-live="polite"
          className={cn(
            "text-[11px]",
            error
              ? "text-danger-600 dark:text-danger-400"
              : saved
              ? "text-success-600 dark:text-success-400"
              : "text-neutral-500 dark:text-neutral-400"
          )}
        >
          {error
            ? error
            : saved
            ? "Saved. It may take a moment to propagate."
            : draft.trim()
            ? "Your storefront will be available at " +
              draft.trim() +
              "." +
              root
            : "Enter a subdomain"}
        </p>
        <Button variant="outline" onClick={handleSave} disabled={!dirty}>
          Save
        </Button>
      </div>

      {isCustomSlug && (
        <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
          This subdomain was changed from the default. The original
          auto-generated slug is no longer valid.
        </p>
      )}
    </div>
  );
}

/* ======================================================================
   Custom domain
   ====================================================================== */

interface CustomDomainBlockProps {
  domain: StorefrontDomain;
  onAdd: (hostname: string) => { ok: boolean; error?: string };
  onRemove: () => { ok: boolean; error?: string };
  onSetMethod: (method: "cname" | "txt") => { ok: boolean; error?: string };
  onVerify: () => Promise<{ ok: boolean; error?: string }>;
  onSetPrimary: (isPrimary: boolean) => { ok: boolean; error?: string };
}

function CustomDomainBlock({
  domain,
  onAdd,
  onRemove,
  onSetMethod,
  onVerify,
  onSetPrimary,
}: CustomDomainBlockProps) {
  const cd = domain.customDomain;

  if (!cd) {
    return (
      <div className="space-y-3">
        <div>
          <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            Custom domain
          </p>
          <p className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
            Serve your storefront from your own domain instead of{" "}
            <span className="font-mono">{subdomainFor(domain)}</span>.
          </p>
        </div>

        <AddCustomDomainForm onAdd={onAdd} />

        <AffiliateCard />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
          Custom domain
        </p>
        <p className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
          Connected to <span className="font-mono">{cd.hostname}</span>
        </p>
      </div>

      {cd.verificationStatus === "verified" ? (
        <VerifiedState
          domain={domain}
          onSetPrimary={onSetPrimary}
          onRemove={onRemove}
        />
      ) : (
        <PendingOrFailedState
          domain={domain}
          onSetMethod={onSetMethod}
          onVerify={onVerify}
          onRemove={onRemove}
        />
      )}
    </div>
  );
}

function AddCustomDomainForm({
  onAdd,
}: {
  onAdd: (hostname: string) => { ok: boolean; error?: string };
}) {
  const [hostname, setHostname] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleAdd = () => {
    const result = onAdd(hostname.trim());
    if (!result.ok) {
      setError(result.error ?? "Could not add domain.");
      return;
    }
    setError(null);
    setHostname("");
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
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
            inputClass,
            "min-w-0 flex-1",
            error && "border-danger-500"
          )}
        />
        <Button onClick={handleAdd} disabled={!hostname.trim()}>
          Add
        </Button>
      </div>
      {error && (
        <p className="text-[11px] text-danger-600 dark:text-danger-400">
          {error}
        </p>
      )}
    </div>
  );
}

function VerifiedState({
  domain,
  onSetPrimary,
  onRemove,
}: {
  domain: StorefrontDomain;
  onSetPrimary: (isPrimary: boolean) => { ok: boolean; error?: string };
  onRemove: () => { ok: boolean; error?: string };
}) {
  const cd = domain.customDomain!;
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePrimary = (isPrimary: boolean) => {
    const result = onSetPrimary(isPrimary);
    if (!result.ok) setError(result.error ?? "Could not change primary.");
    else setError(null);
  };

  const handleRemove = () => {
    const result = onRemove();
    if (!result.ok) setError(result.error ?? "Could not remove domain.");
    else setError(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2 rounded-lg border border-success-200 bg-success-50 p-3 dark:border-success-800/60 dark:bg-success-900/20">
        <AtlasIcon
          name="check"
          aria-hidden="true"
          className="mt-0.5 h-4 w-4 shrink-0 text-success-600 dark:text-success-400"
        />
        <div className="min-w-0">
          <p className="text-xs font-semibold text-success-800 dark:text-success-200">
            {cd.hostname} is verified
          </p>
          <p className="mt-0.5 text-[11px] text-success-700 dark:text-success-300">
            Your storefront serves from this domain.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
            Primary address
          </p>
          <p className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
            {cd.isPrimary
              ? "Customers are redirected to your custom domain."
              : "The subdomain remains the primary address."}
          </p>
        </div>
 <       label className="flex shrink-0 items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={cd.isPrimary}
            onChange={(e) => handlePrimary(e.target.checked)}
            className="h-4 w-4 rounded border-neutral-300 text-brand-700 focus:ring-brand-500"
          />
          Use as primary
        </label>
      </div>

      {error && (
        <p className="text-[11px] text-danger-600 dark:text-danger-400">
          {error}
        </p>
      )}

      {!confirming ? (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="text-xs font-medium text-danger-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-danger-400"
        >
          Remove custom domain
        </button>
      ) : (
        <div className="flex items-center gap-2 rounded-lg border border-danger-200 bg-danger-50 p-3 dark:border-danger-800/60 dark:bg-danger-900/20">
          <p className="flex-1 text-xs text-danger-800 dark:text-danger-200">
            Remove {cd.hostname}? Your storefront returns to the subdomain.
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
    </div>
  );
}

function PendingOrFailedState({
  domain,
  onSetMethod,
  onVerify,
  onRemove,
}: {
  domain: StorefrontDomain;
  onSetMethod: (method: "cname" | "txt") => { ok: boolean; error?: string };
  onVerify: () => Promise<{ ok: boolean; error?: string }>;
  onRemove: () => { ok: boolean; error?: string };
}) {
  const cd = domain.customDomain!;
  const [verifying, setVerifying] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
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
    }
  };

  const handleRemove = () => {
    const result = onRemove();
    if (!result.ok) setError(result.error ?? "Could not remove domain.");
  };

  const copy = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      window.setTimeout(() => setCopied(null), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="space-y-3">
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
              {isFailed ? "Verification failed" : "DNS setup required"}
            </p>
            <p
              className={cn(
                "mt-0.5 text-[11px]",
                isFailed
                  ? "text-danger-700 dark:text-danger-300"
                  : "text-info-700 dark:text-info-300"
              )}
            >
              {isFailed
                ? cd.failureReason ??
                  "We could not verify your DNS records. Check the values below and try again."
                : "Add the record below to your domain registrar's DNS settings, then verify."}
            </p>
          </div>
        </div>
      </div>

      <div
        role="group"
        aria-label="Verification method"
        className="flex gap-1"
      >
        {(["cname", "txt"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => onSetMethod(m)}
            aria-pressed={cd.verificationMethod === m}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
              cd.verificationMethod === m
                ? "bg-brand-100 text-brand-800 dark:bg-brand-900/40 dark:text-brand-200"
                : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            )}
          >
            {VERIFICATION_METHOD_LABEL[m]}
          </button>
        ))}
      </div>

      {cd.verificationMethod === "cname" && cname && (
        <DnsRecord
          label="CNAME record"
          type={cname.type}
          name={cname.name}
          value={cname.value}
          description={cname.description}
          copied={copied === "cname"}
          onCopy={() => copy("cname", cname.value)}
        />
      )}

      {cd.verificationMethod === "txt" && txt && (
        <DnsRecord
          label="TXT record"
          type={txt.type}
          name={txt.name}
          value={txt.value}
          description={txt.description}
          copied={copied === "txt"}
          onCopy={() => copy("txt", txt.value)}
        />
      )}

      <details className="rounded-lg border border-neutral-200 dark:border-neutral-800">
        <summary className="cursor-pointer px-3 py-2 text-xs font-medium text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200">
          {cd.verificationMethod === "cname"
            ? "Alternative verification via TXT"
            : "Alternative verification via CNAME"}
        </summary>
        <div className="border-t border-neutral-200 p-3 dark:border-neutral-800">
          {cd.verificationMethod === "cname" && txt && (
            <DnsRecord
                          label="TXT record"
                          type={txt.type}
                          name={txt.name}
                          value={txt.value}
                          copied={copied === "txt"}
                          onCopy={() => copy("txt", txt.value)} description={""}            />
          )}
          {cd.verificationMethod === "txt" && cname && (
            <DnsRecord
              label="CNAME record"
              type={cname.type}
              name={cname.name}
              value={cname.value}
              description={cname.description}
              copied={copied === "cname"}
              onCopy={() => copy("cname", cname.value)}
            />
          )}
        </div>
      </details>

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

      <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
        After adding the record, wait a few minutes for DNS propagation
        before clicking Verify.
      </p>

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

function DnsRecord({
  label,
  type,
  name,
  value,
  description,
  copied,
  onCopy,
}: {
  label: string;
  type: string;
  name: string;
  value: string;
  description: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="rounded-lg border border-neutral-200 dark:border-neutral-800">
      <div className="flex items-center justify-between border-b border-neutral-200 px-3 py-2 dark:border-neutral-800">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          {label}
        </p>
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center gap-1 rounded text-[11px] font-medium text-neutral-600 hover:text-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-neutral-300 dark:hover:text-white"
          aria-label={"Copy " + label + " value"}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-3 w-3"
          >
            <rect width="13" height="13" x="9" y="9" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <dl className="grid grid-cols-[70px_1fr] gap-x-2 gap-y-1 p-3 text-xs">
        <dt className="text-neutral-500 dark:text-neutral-400">Type</dt>
        <dd className="font-mono text-neutral-900 dark:text-white">{type}</dd>
        <dt className="text-neutral-500 dark:text-neutral-400">Name</dt>
        <dd className="font-mono text-neutral-900 dark:text-white">{name}</dd>
        <dt className="text-neutral-500 dark:text-neutral-400">Value</dt>
        <dd className="break-all font-mono text-neutral-900 dark:text-white">
          {value}
        </dd>
      </dl>
      <p className="px-3 pb-3 text-[11px] text-neutral-500 dark:text-neutral-400">
        {description}
      </p>
    </div>
  );
}