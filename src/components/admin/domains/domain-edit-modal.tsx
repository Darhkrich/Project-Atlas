"use client";

import { useEffect, useState } from "react";
import type { StorefrontDomain } from "@/lib/domains/types";
import type { UnifiedStorefront } from "@/lib/admin/types/storefront";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { ModalShell } from "@/components/admin/ui/model-shell";
import { SettingsField } from "@/components/admin/ui/settings-field";
import { AtlasIcon } from "@/components/atlas/icons";
import { DomainVerifyPanel } from "./domain-verify-panel";

interface DomainEditModalProps {
  open: boolean;
  domain: StorefrontDomain | null;
  storefront: UnifiedStorefront | null;
  existingSlugs: string[];
  verifying: boolean;
  onClose: () => void;
  onSaveSlug: (slug: string) => { ok: boolean; error?: string };
  onRunDnsCheck: () => void;
  onChangeMethod: (method: "cname" | "txt") => void;
  onSetPrimary: (isPrimary: boolean) => void;
  onRemoveCustomDomain: () => void;
  onForceVerify: () => void;
  onForceFail: () => void;
}

export function DomainEditModal({
  open,
  domain,
  storefront,
  existingSlugs,
  verifying,
  onClose,
  onSaveSlug,
  onRunDnsCheck,
  onChangeMethod,
  onSetPrimary,
  onRemoveCustomDomain,
  onForceVerify,
  onForceFail,
}: DomainEditModalProps) {
  const [overrideSlug, setOverrideSlug] = useState(false);
  const [slugDraft, setSlugDraft] = useState("");
  const [slugError, setSlugError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !domain) return;
    setOverrideSlug(false);
    setSlugDraft(domain.subdomain.slug);
    setSlugError(null);
  }, [open, domain]);

  if (!open || !domain || !storefront) return null;

  const cd = domain.customDomain;
  const slugChanged =
    overrideSlug && slugDraft.trim() !== domain.subdomain.slug;

  const handleSaveSlug = () => {
    const trimmed = slugDraft.trim().toLowerCase();
    if (trimmed === domain.subdomain.slug) return;
    const result = onSaveSlug(trimmed);
    if (!result.ok) setSlugError(result.error ?? "Could not save slug.");
    else {
      setSlugError(null);
      setOverrideSlug(false);
    }
  };

  const isVerified = cd?.verificationStatus === "verified";
  const isPending = cd?.verificationStatus === "pending";
  const isFailed = cd?.verificationStatus === "failed";

  void existingSlugs;

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={"Domains: " + storefront.storeName}
      description="Admin oversight. Owners manage their own domains from their dashboard."
      size="lg"
      footer={
        <Button variant="outline" size="sm" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="space-y-6">
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Subdomain
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            The owner sets their subdomain from their dashboard. Override
            only when the current slug violates policy.
          </p>

          <div className="flex items-center justify-between rounded-md bg-neutral-50 p-3 dark:bg-neutral-800">
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              Current
            </span>
            <span className="font-mono text-sm text-neutral-700 dark:text-neutral-300">
              {domain.subdomain.slug}.{domain.subdomain.root}
            </span>
          </div>

          {!overrideSlug ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOverrideSlug(true)}
            >
              Override slug
            </Button>
          ) : (
            <div className="space-y-2">
              <SettingsField
                label="New slug"
                htmlFor="domain-slug"
                hint={
                  "Will resolve to " +
                  (slugDraft || domain.subdomain.slug) +
                  "." +
                  domain.subdomain.root
                }
                error={slugError ?? undefined}
              >
                <Input
                  id="domain-slug"
                  value={slugDraft}
                  onChange={(e) => {
                    setSlugDraft(e.target.value.toLowerCase());
                    setSlugError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSaveSlug();
                    }
                  }}
                  placeholder="storefront-slug"
                  autoComplete="off"
                  autoFocus
                />
              </SettingsField>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSaveSlug}
                  disabled={!slugChanged}
                >
                  Save slug
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setOverrideSlug(false);
                    setSlugDraft(domain.subdomain.slug);
                    setSlugError(null);
                  }}
                >
                  Cancel override
                </Button>
              </div>
            </div>
          )}

          {domain.subdomain.isCustomSlug && (
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              This slug was changed by an admin. The original
              auto-generated slug is no longer valid.
            </p>
          )}
        </section>

        <section className="space-y-3 border-t border-neutral-200 pt-4 dark:border-neutral-800">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Custom domain
            </h3>
            <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
              Added and configured by the owner from their dashboard. Use
              the override actions when the automatic check needs
              intervention.
            </p>
          </div>

          {!cd && (
            <div className="rounded-md border border-dashed border-neutral-300 p-4 text-center text-xs text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
              <AtlasIcon
                name="link"
                aria-hidden="true"
                className="mx-auto h-5 w-5 text-neutral-400"
              />
              <p className="mt-2">
                No custom domain yet. The owner will set one up from
                their dashboard.
              </p>
            </div>
          )}

          {cd && (
            <>
              <DomainVerifyPanel
                domain={domain}
                verifying={verifying}
                onVerify={onRunDnsCheck}
                onChangeMethod={onChangeMethod}
              />

              <div className="rounded-md border border-neutral-200 p-3 dark:border-neutral-800">
                <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  Admin override
                </p>
                <p className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
                  Bypass the automatic DNS check when it is not reflecting
                  reality.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {!isVerified && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={onForceVerify}
                    >
                      <AtlasIcon
                        name="check"
                        aria-hidden="true"
                        className="mr-1 h-3.5 w-3.5"
                      />
                      Force verify
                    </Button>
                  )}
                  {!isFailed && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-danger-600"
                      onClick={onForceFail}
                    >
                      <AtlasIcon
                        name="x-circle"
                        aria-hidden="true"
                        className="mr-1 h-3.5 w-3.5"
                      />
                      Mark as failed
                    </Button>
                  )}
                  {isPending && !verifying && (
                    <span className="self-center text-[11px] text-neutral-500 dark:text-neutral-400">
                      Or wait for the owner to verify from their dashboard.
                    </span>
                  )}
                </div>
              </div>

              {isVerified && (
                <div className="flex items-center justify-between rounded-md border border-neutral-200 p-3 text-sm dark:border-neutral-700">
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-neutral-100">
                      Primary domain
                    </p>
                    <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                      {cd.isPrimary
                        ? "Customers are redirected here."
                        : "The subdomain is the primary address."}
                    </p>
                  </div>
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={cd.isPrimary}
                      onChange={(e) => onSetPrimary(e.target.checked)}
                      className="h-4 w-4"
                    />
                    Use as primary
                  </label>
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-danger-600"
                  onClick={onRemoveCustomDomain}
                  aria-label="Remove custom domain"
                >
                  <AtlasIcon
                    name="trash"
                    aria-hidden="true"
                    className="mr-1 h-3.5 w-3.5"
                  />
                  Remove custom domain
                </Button>
              </div>
            </>
          )}
        </section>
      </div>
    </ModalShell>
  );
}