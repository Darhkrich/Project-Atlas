"use client";

import Link from "next/link";
import type { UnifiedStorefront } from "@/lib/admin/types/storefront";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { formatCurrency, formatNumber } from "@/lib/admin/formatters";
import { formatRelative } from "@/lib/admin/support/format";
import { useNow } from "@/lib/admin/hooks/use-now";
import { Can, PERMISSIONS } from "@/lib/admin/rbac";
import {
  STOREFRONT_STATUS_LABEL,
  STOREFRONT_STATUS_VARIANT,
  STOREFRONT_TYPE_LABEL,
  STOREFRONT_TYPE_VARIANT,
} from "@/lib/admin/storefronts/storefront-labels";
import type { StorefrontType } from "@/lib/admin/types/storefront";

interface StorefrontTableProps {
  storefronts: UnifiedStorefront[];
  onView: (storefront: UnifiedStorefront) => void;
  onToggleStatus: (storefront: UnifiedStorefront) => void;
  onPreview: (storefront: UnifiedStorefront) => void;
  isSelected?: (id: string) => boolean;
  onToggleSelect?: (id: string) => void;
}

const TYPE_ICON: Record<StorefrontType, AtlasIconName> = {
  reseller: "users",
  merchant: "briefcase",
};

export function StorefrontTable({
  storefronts,
  onView,
  onToggleStatus,
  onPreview,
  isSelected,
  onToggleSelect,
}: StorefrontTableProps) {
  const now = useNow();

  if (storefronts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-neutral-300 p-8 text-center dark:border-neutral-700">
        <AtlasIcon
          name="store"
          aria-hidden="true"
          className="mx-auto h-8 w-8 text-neutral-400"
        />
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          No storefronts match these filters.
        </p>
      </div>
    );
  }

  return (
    <ul
      role="list"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {storefronts.map((storefront) => {
        const isMerchant = storefront.type === "merchant";
        const selected = isSelected?.(storefront.id) ?? false;

        return (
          <li key={storefront.id}>
            <div
              data-storefront-id={storefront.id}
              className={cn(
                "relative flex h-full flex-col rounded-xl border bg-white p-4 shadow-sm transition-all dark:bg-neutral-900",
                selected
                  ? "border-brand-500 ring-2 ring-brand-500"
                  : "border-neutral-200 hover:shadow-md dark:border-neutral-700"
              )}
            >
              {isMerchant && onToggleSelect && (
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => onToggleSelect(storefront.id)}
                  aria-label={"Select " + storefront.storeName}
                  className="absolute left-3 top-3 z-10 h-4 w-4"
                />
              )}

              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
                    <AtlasIcon
                      name={TYPE_ICON[storefront.type] ?? "store"}
                      aria-hidden="true"
                      className="h-5 w-5"
                    />
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold text-neutral-900 dark:text-neutral-100">
                      {storefront.storeName}
                    </h3>
                    <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                      {storefront.ownerName}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={STOREFRONT_STATUS_VARIANT[storefront.status]}
                  size="sm"
                  className="shrink-0"
                >
                  {STOREFRONT_STATUS_LABEL[storefront.status]}
                </Badge>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <Badge
                  variant={STOREFRONT_TYPE_VARIANT[storefront.type]}
                  size="sm"
                >
                  {STOREFRONT_TYPE_LABEL[storefront.type]}
                </Badge>
                <span className="truncate font-mono text-xs text-neutral-500 dark:text-neutral-400">
                  {storefront.slug}
                </span>
              </div>

              <dl className="mt-3 grid grid-cols-3 gap-2 text-sm">
                <div>
                  <dt className="text-xs text-neutral-500 dark:text-neutral-400">
                    Users
                  </dt>
                  <dd className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {formatNumber(storefront.usersCount)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-neutral-500 dark:text-neutral-400">
                    Orders
                  </dt>
                  <dd className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {formatNumber(storefront.orders30d)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-neutral-500 dark:text-neutral-400">
                    Revenue
                  </dt>
                  <dd className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {formatCurrency(storefront.revenue30d)}
                  </dd>
                </div>
              </dl>

              <div className="mt-3 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                <span className="truncate">
                  Template: {storefront.template}
                </span>
                <span title={storefront.lastActive}>
                  {now ? formatRelative(storefront.lastActive, now) : "—"}
                </span>
              </div>

              {storefront.status === "disabled" && storefront.statusReason && (
                <p className="mt-2 rounded-md bg-danger-50 p-2 text-xs text-danger-800 dark:bg-danger-900/20 dark:text-danger-200">
                  {storefront.statusReason}
                </p>
              )}

              <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-3 dark:border-neutral-800">
                {isMerchant ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onView(storefront)}
                      aria-label={"View " + storefront.storeName}
                    >
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onPreview(storefront)}
                      aria-label={"Preview " + storefront.storeName}
                    >
                      <AtlasIcon
                        name="eye"
                        aria-hidden="true"
                        className="mr-1 h-3.5 w-3.5"
                      />
                      Preview
                    </Button>
                    <Can permission={PERMISSIONS.STOREFRONTS_MANAGE}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={
                          storefront.status === "live"
                            ? "ml-auto text-danger-600"
                            : "ml-auto"
                        }
                        onClick={() => onToggleStatus(storefront)}
                        aria-label={
                          (storefront.status === "live"
                            ? "Disable "
                            : "Manage ") + storefront.storeName
                        }
                      >
                        {storefront.status === "live"
                          ? "Disable"
                          : storefront.status === "pending"
                          ? "Review"
                          : "Reactivate"}
                      </Button>
                    </Can>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onPreview(storefront)}
                      aria-label={"Preview " + storefront.storeName}
                    >
                      <AtlasIcon
                        name="eye"
                        aria-hidden="true"
                        className="mr-1 h-3.5 w-3.5"
                      />
                      Preview
                    </Button>
                    <Link
                      href="/admin/resellers/storefronts"
                      className="ml-auto rounded-sm text-xs font-medium text-brand-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-brand-400"
                    >
                      Manage on reseller storefronts
                    </Link>
                  </>
                )}
              </div>

              {storefront.publicUrl && (
                <a
                  href={storefront.publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 truncate rounded-sm text-xs text-brand-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-brand-400"
                >
                  {storefront.publicUrl}
                </a>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}