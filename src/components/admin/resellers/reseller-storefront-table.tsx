"use client";

import type { UnifiedStorefront } from "@/lib/admin/types/storefront";
import type { Reseller } from "@/lib/admin/types/reseller";
import type { StorefrontRow } from "@/lib/admin/resellers/storefront-projection";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { AtlasIcon } from "@/components/atlas/icons";
import { formatCurrency, formatNumber } from "@/lib/admin/formatters";
import { formatRelative } from "@/lib/admin/support/format";
import { useNow } from "@/lib/admin/hooks/use-now";
import { Can, PERMISSIONS } from "@/lib/admin/rbac";
import {
  STOREFRONT_STATUS_LABEL,
  STOREFRONT_STATUS_VARIANT,
} from "@/lib/admin/resellers/storefront-labels";

interface ResellerStorefrontTableProps {
  rows: StorefrontRow[];
  onView: (storefront: UnifiedStorefront) => void;
  onApprove: (row: StorefrontRow) => void;
  onDisable: (row: StorefrontRow) => void;
  onReactivate: (row: StorefrontRow) => void;
  onOpenReseller?: (owner: Reseller) => void;
}

export function ResellerStorefrontTable({
  rows,
  onView,
  onApprove,
  onDisable,
  onReactivate,
  onOpenReseller,
}: ResellerStorefrontTableProps) {
  const now = useNow();

  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
      <table className="w-full text-sm">
        <caption className="sr-only">
          Reseller storefronts with owner, template, usage, and status
        </caption>
        <thead className="bg-neutral-50 dark:bg-neutral-900">
          <tr className="text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400">
            <th scope="col" className="px-4 py-3">
              Storefront
            </th>
            <th scope="col" className="px-4 py-3">
              Owner
            </th>
            <th scope="col" className="px-4 py-3">
              Template
            </th>
            <th scope="col" className="px-4 py-3">
              Users
            </th>
            <th scope="col" className="px-4 py-3">
              Orders (30d)
            </th>
            <th scope="col" className="px-4 py-3">
              Revenue (30d)
            </th>
            <th scope="col" className="px-4 py-3">
              Status
            </th>
            <th scope="col" className="px-4 py-3 text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ storefront: sf, owner }) => (
            <tr
              key={sf.id}
              data-storefront-id={sf.id}
              className="border-t border-neutral-100 dark:border-neutral-800"
            >
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => onView(sf)}
                  className="rounded-sm text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  <span className="block font-medium text-neutral-900 hover:underline dark:text-neutral-100">
                    {sf.storeName}
                  </span>
                  <span className="block font-mono text-xs text-neutral-500 dark:text-neutral-400">
                    {sf.slug}
                  </span>
                </button>
              </td>
              <td className="px-4 py-3">
                {owner && onOpenReseller ? (
                  <button
                    type="button"
                    onClick={() => onOpenReseller(owner)}
                    className="rounded-sm text-neutral-800 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-neutral-200"
                  >
                    {sf.ownerName}
                  </button>
                ) : (
                  <span className="text-neutral-800 dark:text-neutral-200">
                    {sf.ownerName}
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">
                {sf.template}
              </td>
              <td className="px-4 py-3 text-neutral-800 dark:text-neutral-200">
                {formatNumber(sf.usersCount)}
              </td>
              <td className="px-4 py-3 text-neutral-800 dark:text-neutral-200">
                {formatNumber(sf.orders30d)}
              </td>
              <td className="px-4 py-3 font-medium text-neutral-900 dark:text-neutral-100">
                {formatCurrency(sf.revenue30d)}
              </td>
              <td className="px-4 py-3">
                <Badge
                  variant={STOREFRONT_STATUS_VARIANT[sf.status]}
                  size="sm"
                >
                  {STOREFRONT_STATUS_LABEL[sf.status]}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onView(sf)}
                    aria-label={"View " + sf.storeName}
                  >
                    View
                  </Button>
                  <Can permission={PERMISSIONS.RESELLERS_STOREFRONT_TOGGLE}>
                    {sf.status === "pending" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onApprove({ storefront: sf, owner })}
                        aria-label={"Approve " + sf.storeName}
                      >
                        Approve
                      </Button>
                    )}
                    {sf.status === "live" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDisable({ storefront: sf, owner })}
                        aria-label={"Disable " + sf.storeName}
                      >
                        Disable
                      </Button>
                    )}
                    {sf.status === "disabled" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onReactivate({ storefront: sf, owner })}
                        aria-label={"Reactivate " + sf.storeName}
                      >
                        Reactivate
                      </Button>
                    )}
                  </Can>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && (
        <div className="flex items-center justify-center gap-2 border-t border-neutral-100 px-4 py-6 text-sm text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
          <AtlasIcon name="store" aria-hidden="true" className="h-4 w-4" />
          No storefronts match these filters.
        </div>
      )}
      <p
        className="border-t border-neutral-100 px-4 py-2 text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-400"
        title={now ? "Values refresh on tab focus" : undefined}
      >
        Showing {rows.length} reseller storefront
        {rows.length === 1 ? "" : "s"}
      </p>
    </div>
  );
}