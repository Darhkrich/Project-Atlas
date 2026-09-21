"use client";

import type { UnifiedStorefront } from "@/lib/admin/types/storefront";
import { Button } from "@/components/admin/ui/button";
import { ModalShell } from "@/components/admin/ui/model-shell";
import { AtlasIcon } from "@/components/atlas/icons";
import {
  STOREFRONT_TYPE_LABEL,
} from "@/lib/admin/storefronts/storefront-labels";

interface StorefrontPreviewModalProps {
  open: boolean;
  storefront: UnifiedStorefront | null;
  onClose: () => void;
}

export function StorefrontPreviewModal({
  open,
  storefront,
  onClose,
}: StorefrontPreviewModalProps) {
  if (!open || !storefront) return null;

  const bannerColor = storefront.primaryColor ?? "#166e59";

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={storefront.storeName + " — preview"}
      description={
        storefront.ownerName + " · " + STOREFRONT_TYPE_LABEL[storefront.type]
      }
      size="lg"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <a
            href={storefront.publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 items-center rounded-md bg-brand-600 px-3 text-xs font-medium text-white hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            Open public store
            <AtlasIcon
              name="link"
              aria-hidden="true"
              className="ml-1 h-3.5 w-3.5"
            />
          </a>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-md border border-info-200 bg-info-50 p-3 text-xs text-info-900 dark:border-info-800 dark:bg-info-900/20 dark:text-info-100">
          <p className="flex items-start gap-2">
            <AtlasIcon
              name="info"
              aria-hidden="true"
              className="mt-0.5 h-3.5 w-3.5 shrink-0"
            />
            <span>
              Mock preview. Real storefront rendering arrives when the
              customer-facing storefront ships.
            </span>
          </p>
        </div>

        <div className="rounded-lg border border-neutral-200 p-6 dark:border-neutral-700">
          <div
            className="flex h-32 items-center justify-center rounded-lg"
            style={{ backgroundColor: bannerColor }}
          >
            <p className="text-3xl font-bold text-white">
              {storefront.storeName}
            </p>
          </div>
          <div
            aria-hidden="true"
            className="mt-4 grid grid-cols-3 gap-4"
          >
            <div className="h-24 rounded-lg bg-neutral-100 dark:bg-neutral-800" />
            <div className="h-24 rounded-lg bg-neutral-100 dark:bg-neutral-800" />
            <div className="h-24 rounded-lg bg-neutral-100 dark:bg-neutral-800" />
          </div>
          <dl className="mt-4 grid grid-cols-1 gap-1 text-xs text-neutral-500 dark:text-neutral-400 sm:grid-cols-2">
            <div className="flex justify-between gap-3">
              <dt>Template</dt>
              <dd className="font-mono text-neutral-700 dark:text-neutral-300">
                {storefront.template}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>Slug</dt>
              <dd className="font-mono text-neutral-700 dark:text-neutral-300">
                {storefront.slug}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </ModalShell>
  );
}