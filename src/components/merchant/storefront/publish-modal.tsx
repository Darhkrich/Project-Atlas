"use client";

import { useMemo } from "react";
import { AtlasIcon } from "@/components/atlas/icons";
import { AtlasModalShell } from "@/components/atlas/modal-shell";
import { Button } from "@/components/atlas/button";
import {
  runPublishChecks,
  publishChecksBlocked,
} from "@/lib/merchant/storefront/publish-checks";
import type { MerchantStorefrontConfig } from "@/types/merchant-storefront";
import { cn } from "@/lib/utils";

interface PublishModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  config: MerchantStorefrontConfig;
  storeUrl: string;
}

export function PublishModal({
  open,
  onClose,
  onConfirm,
  config,
  storeUrl,
}: PublishModalProps) {
  const checks = useMemo(() => runPublishChecks(config), [config]);
  const blocked = useMemo(() => publishChecksBlocked(checks), [checks]);

  return (
    <AtlasModalShell
      open={open}
      onClose={onClose}
      title="Publish your store"
      description="We check a few things before your storefront goes live."
      size="md"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={blocked}>
            <AtlasIcon name="rocket" aria-hidden="true" className="h-4 w-4" />
            Publish store
          </Button>
        </div>
      }
    >
      <ul role="list" className="space-y-2">
        {checks.map((check) => (
          <li
            key={check.id}
            className={cn(
              "flex items-start gap-3 rounded-lg border p-3",
              check.passed
                ? "border-neutral-200 dark:border-neutral-800"
                : check.severity === "error"
                ? "border-danger-200 bg-danger-50 dark:border-danger-800/60 dark:bg-danger-900/20"
                : "border-warning-200 bg-warning-50 dark:border-warning-800/60 dark:bg-warning-900/20"
            )}
          >
            <AtlasIcon
              name={
                check.passed
                  ? "check-circle"
                  : check.severity === "error"
                  ? "alert-circle"
                  : "alert-triangle"
              }
              aria-hidden="true"
              className={cn(
                "mt-0.5 h-4 w-4 shrink-0",
                check.passed
                  ? "text-success-600 dark:text-success-400"
                  : check.severity === "error"
                  ? "text-danger-600 dark:text-danger-400"
                  : "text-warning-600 dark:text-warning-400"
              )}
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {check.label}
              </p>
              {!check.passed && check.hint && (
                <p className="mt-0.5 text-xs text-neutral-600 dark:text-neutral-400">
                  {check.hint}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>

      {!blocked && (
        <p className="mt-4 rounded-lg border border-info-200 bg-info-50 p-3 text-xs leading-relaxed text-info-900 dark:border-info-800/60 dark:bg-info-900/20 dark:text-info-200">
          Publishing makes your storefront live at{" "}
          <span className="font-mono font-semibold">{storeUrl}</span>.
        </p>
      )}

      {blocked && (
        <p className="mt-4 rounded-lg border border-danger-200 bg-danger-50 p-3 text-xs leading-relaxed text-danger-900 dark:border-danger-800/60 dark:bg-danger-900/20 dark:text-danger-200">
          Fix the items above to publish your store.
        </p>
      )}
    </AtlasModalShell>
  );
}