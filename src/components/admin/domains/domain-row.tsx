"use client";

import Link from "next/link";
import type { DomainRow as DomainRowType } from "@/lib/admin/domains/domain-projection";
import { subdomainFor } from "@/lib/admin/domains/domain-projection";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { AtlasIcon } from "@/components/atlas/icons";
import { formatRelative } from "@/lib/admin/support/format";
import { useNow } from "@/lib/admin/hooks/use-now";
import { Can, PERMISSIONS } from "@/lib/admin/rbac";
import {
  STOREFRONT_TYPE_LABEL,
  STOREFRONT_TYPE_VARIANT,
} from "@/lib/admin/storefronts/storefront-labels";
import {
  VERIFICATION_STATUS_LABEL,
  VERIFICATION_STATUS_VARIANT,
} from "@/lib/admin/domains/domain-labels";

interface DomainRowProps {
  row: DomainRowType;
  onEdit: () => void;
}

export function DomainRow({ row, onEdit }: DomainRowProps) {
  const now = useNow();
  const { domain, storefront } = row;
  const cd = domain.customDomain;
  const subdomain = subdomainFor(domain);

  const ownerHref =
    storefront.type === "reseller"
      ? "/admin/resellers/" + storefront.ownerId
      : "/admin/ecommerce/merchants/" + storefront.ownerId;

  const storefrontHref =
    "/admin/storefronts?q=" + encodeURIComponent(storefront.storeName);

  return (
    <div
      data-storefront-id={storefront.id}
      className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:flex-row sm:items-start sm:justify-between"
    >
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={storefrontHref}
            className="truncate text-base font-semibold text-brand-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-brand-400"
          >
            {storefront.storeName}
          </Link>
          <Badge variant={STOREFRONT_TYPE_VARIANT[storefront.type]} size="sm">
            {STOREFRONT_TYPE_LABEL[storefront.type]}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400">
          <span>
            Owner:{" "}
            <Link
              href={ownerHref}
              className="rounded-sm font-medium text-neutral-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-neutral-300"
            >
              {storefront.ownerName}
            </Link>
          </span>
          <span aria-hidden="true">·</span>
          <span>Updated {now ? formatRelative(domain.updatedAt, now) : "—"}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-md bg-neutral-50 px-2 py-1 dark:bg-neutral-800">
            <AtlasIcon
              name="globe"
              aria-hidden="true"
              className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400"
            />
            <span className="font-mono text-xs text-neutral-700 dark:text-neutral-300">
              {subdomain}
            </span>
            {!cd?.isPrimary && (
              <Badge variant="neutral" size="sm">
                Primary
              </Badge>
            )}
          </div>

          {cd ? (
            <div className="flex items-center gap-1.5 rounded-md bg-neutral-50 px-2 py-1 dark:bg-neutral-800">
              <AtlasIcon
                name="link"
                aria-hidden="true"
                className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400"
              />
              <span className="font-mono text-xs text-neutral-700 dark:text-neutral-300">
                {cd.hostname}
              </span>
              <Badge
                variant={VERIFICATION_STATUS_VARIANT[cd.verificationStatus]}
                size="sm"
              >
                {VERIFICATION_STATUS_LABEL[cd.verificationStatus]}
              </Badge>
              {cd.isPrimary && (
                <Badge variant="brand" size="sm">
                  Primary
                </Badge>
              )}
            </div>
          ) : (
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              No custom domain
            </span>
          )}
        </div>

        {cd?.failureReason && (
          <p className="rounded-md border border-danger-200 bg-danger-50 p-2 text-xs text-danger-800 dark:border-danger-800/60 dark:bg-danger-900/20 dark:text-danger-200">
            {cd.failureReason}
          </p>
        )}
      </div>

      <Can permission={PERMISSIONS.DOMAINS_MANAGE}>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            aria-label={"Admin actions for " + storefront.storeName}
          >
            <AtlasIcon
              name="settings"
              aria-hidden="true"
              className="mr-1 h-3.5 w-3.5"
            />
            Admin actions
          </Button>
        </div>
      </Can>
    </div>
  );
}