"use client";

import { UnifiedStorefront } from "@/lib/admin/types/storefront";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { formatCurrency } from "@/lib/admin/formatters";
import { cn } from "@/lib/utils";
import { AtlasIcon } from "@/components/atlas/icons";
import Link from "next/link";

interface StorefrontTableProps {
  storefronts: UnifiedStorefront[];
  onView: (storefront: UnifiedStorefront) => void;
  onToggleStatus: (id: string) => void;
  onPreview: (storefront: UnifiedStorefront) => void;
  isSelected?: (id: string) => boolean;
  onToggleSelect?: (id: string) => void;
}

const statusVariant: Record<string, "success" | "warning" | "danger"> = {
  live: "success",
  pending: "warning",
  disabled: "danger",
};

const typeVariant: Record<string, "info" | "success"> = {
  reseller: "info",
  merchant: "success",
};

const typeIcon = {
  reseller: "users" as const,
  merchant: "briefcase" as const,
};

function timeAgo(dateString: string) {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function StorefrontTable({
  storefronts,
  onView,
  onToggleStatus,
  onPreview,
  isSelected,
  onToggleSelect,
}: StorefrontTableProps) {
  if (storefronts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-neutral-300 p-8 text-center dark:border-neutral-700">
        <AtlasIcon name="store" className="mx-auto h-8 w-8 text-neutral-400" />
        <p className="mt-2 text-sm text-neutral-500">No storefronts found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {storefronts.map((storefront) => {
        const selected = isSelected?.(storefront.id) ?? false;
        return (
          <div
            key={storefront.id}
            className={cn(
              "relative flex flex-col rounded-xl border bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:bg-neutral-900",
              selected
                ? "border-brand-500 ring-2 ring-brand-500"
                : "border-neutral-200 dark:border-neutral-700"
            )}
          >
            {onToggleSelect && (
              <input
                type="checkbox"
                checked={selected}
                onChange={() => onToggleSelect(storefront.id)}
                className="absolute left-3 top-3 z-10 h-4 w-4"
                onClick={(e) => e.stopPropagation()}
              />
            )}

            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
                  <AtlasIcon name={typeIcon[storefront.type]} className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h3 className="truncate text-base font-semibold">
                    {storefront.storeName}
                  </h3>
                  <p className="truncate text-xs text-neutral-500">
                    {storefront.ownerName}
                  </p>
                </div>
              </div>
              <Badge variant={statusVariant[storefront.status]}>
                {storefront.status}
              </Badge>
            </div>

            {/* Type + slug */}
            <div className="mt-3 flex items-center gap-2">
              <Badge variant={typeVariant[storefront.type]}>
                {storefront.type}
              </Badge>
              <span className="truncate font-mono text-xs text-neutral-500">
                {storefront.slug}
              </span>
            </div>

            {/* Metrics */}
            <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
              <div>
                <p className="text-xs text-neutral-500">Users</p>
                <p className="font-semibold">{storefront.usersCount}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">Orders</p>
                <p className="font-semibold">{storefront.orders30d}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">Revenue</p>
                <p className="font-semibold">
                  {formatCurrency(storefront.revenue30d)}
                </p>
              </div>
            </div>

            {/* Meta */}
            <div className="mt-3 flex items-center justify-between text-xs text-neutral-500">
              <span>Template: {storefront.template}</span>
              <span>{timeAgo(storefront.lastActive)}</span>
            </div>

            {/* Actions */}
            <div className="mt-4 flex flex-wrap gap-2 border-t border-neutral-100 pt-3 dark:border-neutral-800">
              <Button variant="outline" size="sm" onClick={() => onView(storefront)}>
                View
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPreview(storefront)}
              >
                <AtlasIcon name="eye" className="mr-1 h-3.5 w-3.5" />
                Preview
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleStatus(storefront.id)}
                className="ml-auto"
              >
                {storefront.status === "live" ? "Disable" : "Enable"}
              </Button>
            </div>

            {/* Public URL link */}
            {storefront.publicUrl && (
              <Link
                href={storefront.publicUrl}
                target="_blank"
                className="mt-2 text-xs text-brand-600 hover:underline"
              >
                {storefront.publicUrl}
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}