/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { UnifiedStorefront } from "@/lib/admin/types/storefront";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate, formatNumber } from "@/lib/admin/formatters";
import { formatRelative } from "@/lib/admin/support/format";
import { useNow } from "@/lib/admin/hooks/use-now";
import { useFocusTrap } from "@/lib/admin/hooks/use-focus-trap";
import { Can, PERMISSIONS } from "@/lib/admin/rbac";
import {
  STOREFRONT_STATUS_LABEL,
  STOREFRONT_STATUS_VARIANT,
  STOREFRONT_TYPE_LABEL,
  STOREFRONT_TYPE_VARIANT,
} from "@/lib/admin/storefronts/storefront-labels";
import { StorefrontUsersList } from "@/components/admin/shared/storefront-users-list";

interface StorefrontDetailDrawerProps {
  storefront: UnifiedStorefront | null;
  onClose: () => void;
  onToggleStatus: (storefront: UnifiedStorefront) => void;
  onPreview: (storefront: UnifiedStorefront) => void;
}

type Tab = "overview" | "users" | "orders" | "configuration";

const TABS: { key: Tab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "users", label: "Users" },
  { key: "orders", label: "Orders" },
  { key: "configuration", label: "Configuration" },
];

export function StorefrontDetailDrawer({
  storefront,
  onClose,
  onToggleStatus,
  onPreview,
}: StorefrontDetailDrawerProps) {
  const now = useNow();
  const isOpen = storefront !== null;
  const trapRef = useFocusTrap<HTMLDivElement>(isOpen, onClose);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  useEffect(() => {
    if (!storefront) return;
    setActiveTab("overview");
  }, [storefront?.id]);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!storefront) return null;

  const isReseller = storefront.type === "reseller";

  return (
    <div
      ref={trapRef}
      role="dialog"
      aria-modal="true"
      aria-label={"Storefront detail for " + storefront.storeName}
      className="fixed inset-0 z-50"
    >
      <button
        type="button"
        aria-label="Close storefront detail"
        className="absolute inset-0 cursor-default bg-black/50"
        onClick={onClose}
      />
      <div className="absolute right-0 top-0 flex h-full w-full max-w-lg flex-col bg-white shadow-xl dark:bg-neutral-900">
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
              <AtlasIcon
                name={isReseller ? "users" : "briefcase"}
                aria-hidden="true"
                className="h-4 w-4"
              />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {storefront.storeName}
              </p>
              <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                {storefront.ownerName}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close drawer"
          >
            Close
          </Button>
        </div>

        {isReseller ? (
          <div className="flex-1 space-y-4 p-6">
            <div className="rounded-md border border-info-200 bg-info-50 p-4 text-sm text-info-900 dark:border-info-800 dark:bg-info-900/20 dark:text-info-100">
              <p className="font-medium">Managed on the reseller storefronts page</p>
              <p className="mt-1">
                Reseller storefronts are approved, disabled, and reactivated
                from the reseller section, where the reseller's account
                status and verification are visible alongside the storefront.
              </p>
            </div>
            <Link
              href="/admin/resellers/storefronts"
              className="inline-flex h-8 items-center rounded-md border border-neutral-300 px-3 text-xs font-medium text-neutral-700 hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
            >
              Open reseller storefronts
            </Link>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
              <Badge variant={STOREFRONT_STATUS_VARIANT[storefront.status]}>
                {STOREFRONT_STATUS_LABEL[storefront.status]}
              </Badge>
              <Badge variant={STOREFRONT_TYPE_VARIANT[storefront.type]}>
                {STOREFRONT_TYPE_LABEL[storefront.type]}
              </Badge>
              <span className="truncate font-mono text-xs text-neutral-500 dark:text-neutral-400">
                {storefront.slug}
              </span>
            </div>

            {storefront.status === "disabled" && storefront.statusReason && (
              <div className="border-b border-neutral-200 px-4 py-2 text-xs dark:border-neutral-800">
                <span className="font-medium text-danger-700 dark:text-danger-300">
                  Disabled:
                </span>{" "}
                <span className="text-neutral-600 dark:text-neutral-400">
                  {storefront.statusReason}
                </span>
              </div>
            )}

            <div
              role="tablist"
              aria-label="Storefront detail tabs"
              className="flex overflow-x-auto border-b border-neutral-200 dark:border-neutral-800"
            >
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  id={"sf-tab-" + tab.key}
                  aria-selected={activeTab === tab.key}
                  aria-controls={"sf-panel-" + tab.key}
                  tabIndex={activeTab === tab.key ? 0 : -1}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    "flex-1 whitespace-nowrap border-b-2 px-3 py-2 text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                    activeTab === tab.key
                      ? "border-brand-600 text-brand-600 dark:text-brand-400"
                      : "border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div
              role="tabpanel"
              id={"sf-panel-" + activeTab}
              aria-labelledby={"sf-tab-" + activeTab}
              className="flex-1 overflow-y-auto p-4"
            >
              {activeTab === "overview" && (
                <div className="space-y-4">
                  <dl className="grid grid-cols-3 gap-3">
                    <Field
                      label="Users"
                      value={formatNumber(storefront.usersCount)}
                    />
                    <Field
                      label="Orders (30d)"
                      value={formatNumber(storefront.orders30d)}
                    />
                    <Field
                      label="Revenue (30d)"
                      value={formatCurrency(storefront.revenue30d)}
                    />
                  </dl>

                  <dl className="space-y-2 rounded-md bg-neutral-50 p-3 text-sm dark:bg-neutral-900">
                    <Row label="Owner" value={storefront.ownerName} />
                    <Row label="Owner ID" value={storefront.ownerId} mono />
                    <Row label="Template" value={storefront.template} mono />
                    <Row
                      label="Created"
                      value={formatDate(storefront.createdAt)}
                    />
                    <Row
                      label="Last active"
                      value={
                        now
                          ? formatRelative(storefront.lastActive, now)
                          : "—"
                      }
                    />
                    <Row
                      label="Public URL"
                      value={storefront.publicUrl}
                      mono
                    />
                  </dl>

                  <Link
                    href={
                      "/admin/ecommerce/merchants/" + storefront.ownerId
                    }
                    className="inline-flex h-8 items-center rounded-md border border-neutral-300 px-3 text-xs font-medium text-neutral-700 hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
                  >
                    View merchant account
                  </Link>
                </div>
              )}

              {activeTab === "users" && (
                <div className="space-y-2">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Customers registered on this storefront. These are the
                    merchant's own customers, not Atlas customers.
                  </p>
                  <StorefrontUsersList
                    storefrontId={storefront.id}
                    storefrontType="merchant"
                  />
                </div>
              )}

              {activeTab === "orders" && (
                <div className="space-y-2">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Recent orders
                  </p>
                  <div className="rounded-md border border-neutral-200 p-4 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
                    Order list integration coming soon. Currently{" "}
                    {formatNumber(storefront.orders30d)} orders in the last 30
                    days.
                  </div>
                </div>
              )}

              {activeTab === "configuration" && (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                      Branding colors
                    </p>
                    <div className="mt-2 flex gap-3">
                      <ColorSwatch
                        label="Primary"
                        value={storefront.primaryColor}
                      />
                      <ColorSwatch
                        label="Accent"
                        value={storefront.accentColor}
                      />
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                      Template
                    </p>
                    <p className="mt-1 font-mono text-sm">
                      {storefront.template}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                      Public URL
                    </p>
                    <p className="mt-1 font-mono text-xs">
                      {storefront.publicUrl}
                    </p>
                  </div>

                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Full configuration is managed by the merchant from their
                    dashboard. Template and theme changes on the merchant's
                    side take effect on the next page load.
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 border-t border-neutral-200 p-4 dark:border-neutral-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPreview(storefront)}
              >
                <AtlasIcon
                  name="eye"
                  aria-hidden="true"
                  className="mr-1 h-4 w-4"
                />
                Preview
              </Button>
              <Can permission={PERMISSIONS.STOREFRONTS_MANAGE}>
                <Button
                  variant={
                    storefront.status === "live" ? "destructive" : "primary"
                  }
                  size="sm"
                  onClick={() => onToggleStatus(storefront)}
                >
                  {storefront.status === "live"
                    ? "Disable storefront"
                    : storefront.status === "pending"
                    ? "Approve storefront"
                    : "Reactivate storefront"}
                </Button>
              </Can>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-neutral-50 p-3 dark:bg-neutral-900">
      <dt className="text-xs text-neutral-500 dark:text-neutral-400">
        {label}
      </dt>
      <dd className="mt-1 text-lg font-bold text-neutral-900 dark:text-neutral-100">
        {value}
      </dd>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-neutral-500 dark:text-neutral-400">{label}</dt>
      <dd
        className={cn(
          "text-right font-medium text-neutral-900 dark:text-neutral-100",
          mono && "truncate font-mono text-xs font-normal"
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function ColorSwatch({
  label,
  value,
}: {
  label: string;
  value: string | undefined;
}) {
  if (!value) {
    return (
      <div>
        <div className="flex h-10 w-10 items-center justify-center rounded border border-dashed border-neutral-300 text-[10px] text-neutral-400 dark:border-neutral-700 dark:text-neutral-500">
          —
        </div>
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          {label}
        </p>
        <p className="text-[10px] text-neutral-400 dark:text-neutral-500">
          Not configured
        </p>
      </div>
    );
  }
  return (
    <div>
      <div
        className="h-10 w-10 rounded border dark:border-neutral-700"
        style={{ backgroundColor: value }}
      />
      <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
        {label}
      </p>
      <p className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500">
        {value}
      </p>
    </div>
  );
}