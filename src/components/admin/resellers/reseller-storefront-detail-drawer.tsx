/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { UnifiedStorefront } from "@/lib/admin/types/storefront";
import type { Reseller } from "@/lib/admin/types/reseller";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { formatCurrency, formatNumber } from "@/lib/admin/formatters";
import { formatRelative } from "@/lib/admin/support/format";
import { useNow } from "@/lib/admin/hooks/use-now";
import { Can, PERMISSIONS } from "@/lib/admin/rbac";
import {
  STOREFRONT_STATUS_LABEL,
  STOREFRONT_STATUS_VARIANT,
} from "@/lib/admin/resellers/storefront-labels";
import { StorefrontUsersList } from "@/components/admin/shared/storefront-users-list";

interface ResellerStorefrontDetailDrawerProps {
  storefront: UnifiedStorefront | null;
  owner: Reseller | undefined;
  onClose: () => void;
  onApprove: () => void;
  onDisable: () => void;
  onReactivate: () => void;
}

type Tab = "overview" | "users" | "configuration";

const TABS: { key: Tab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "users", label: "Storefront users" },
  { key: "configuration", label: "Configuration" },
];

export function ResellerStorefrontDetailDrawer({
  storefront,
  owner,
  onClose,
  onApprove,
  onDisable,
  onReactivate,
}: ResellerStorefrontDetailDrawerProps) {
  const now = useNow();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  useEffect(() => {
    if (!storefront) return;
    setActiveTab("overview");
  }, [storefront?.id]);

  useEffect(() => {
    if (!storefront) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [storefront, onClose]);

  if (!storefront) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close storefront detail"
        className="absolute inset-0 cursor-default bg-black/50"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={"Storefront detail for " + storefront.storeName}
        className={cn(
          "absolute right-0 top-0 flex h-full w-full max-w-lg flex-col",
          "bg-white shadow-xl dark:bg-neutral-900"
        )}
      >
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <h2 className="text-base font-semibold">{storefront.storeName}</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close drawer"
          >
            Close
          </Button>
        </div>

        <div className="border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-lg font-bold text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
              {storefront.storeName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold">{storefront.storeName}</p>
              <p className="truncate font-mono text-xs text-neutral-500 dark:text-neutral-400">
                {storefront.slug}
              </p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant={STOREFRONT_STATUS_VARIANT[storefront.status]}>
              {STOREFRONT_STATUS_LABEL[storefront.status]}
            </Badge>
            {owner ? (
              <Link
                href={"/admin/resellers/" + owner.id}
                className="rounded-sm text-sm text-brand-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-brand-400"
              >
                Owner: {storefront.ownerName}
              </Link>
            ) : (
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                Owner: {storefront.ownerName}
              </span>
            )}
          </div>
          {storefront.status === "disabled" && storefront.statusReason && (
            <div className="mt-3 rounded-md border border-danger-200 bg-danger-50 p-2 text-xs text-danger-800 dark:border-danger-800/60 dark:bg-danger-900/20 dark:text-danger-200">
              <span className="font-medium">Disabled: </span>
              {storefront.statusReason}
            </div>
          )}
        </div>

        <div
          role="tablist"
          aria-label="Storefront detail tabs"
          className="flex border-b border-neutral-200 dark:border-neutral-800"
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
                "flex-1 px-3 py-2 text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                activeTab === tab.key
                  ? "border-b-2 border-brand-600 text-brand-600 dark:text-brand-400"
                  : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
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
            <dl className="grid grid-cols-2 gap-4">
              <Field label="Users" value={formatNumber(storefront.usersCount)} />
              <Field
                label="Orders (30d)"
                value={formatNumber(storefront.orders30d)}
              />
              <Field
                label="Revenue (30d)"
                value={formatCurrency(storefront.revenue30d)}
              />
              <Field label="Template" value={storefront.template} />
              <Field
                label="Created"
                value={now ? formatRelative(storefront.createdAt, now) : "—"}
              />
              <Field
                label="Last active"
                value={now ? formatRelative(storefront.lastActive, now) : "—"}
              />
              <Field label="Public URL" value={storefront.publicUrl} mono />
              {storefront.updatedAt && (
                <Field
                  label="Status changed"
                  value={now ? formatRelative(storefront.updatedAt, now) : "—"}
                />
              )}
            </dl>
          )}

          {activeTab === "users" && (
            <div className="space-y-2">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Customers registered on this storefront.
              </p>
              <StorefrontUsersList
                storefrontId={storefront.id}
                storefrontType="reseller"
              />
            </div>
          )}

          {activeTab === "configuration" && (
            <div className="space-y-3">
              <ConfigBlock label="Template" value={storefront.template} />
              <ConfigBlock
                label="Primary color"
                value={storefront.primaryColor}
              />
              <ConfigBlock
                label="Accent color"
                value={storefront.accentColor}
              />
              <ConfigBlock label="Public URL" value={storefront.publicUrl} />
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Fields marked &ldquo;Not configured&rdquo; have no value on
                this storefront. Editing is not available from this page.
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 border-t border-neutral-200 p-4 dark:border-neutral-800">
          <a
            href={storefront.publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex h-8 items-center rounded-md border px-3 text-xs font-medium",
              "border-neutral-300 text-neutral-700 hover:bg-neutral-100",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
              "dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
            )}
          >
            <AtlasIcon
              name="link"
              aria-hidden="true"
              className="mr-1 h-3.5 w-3.5"
            />
            Preview
          </a>

          <Can permission={PERMISSIONS.RESELLERS_STOREFRONT_TOGGLE}>
            {storefront.status === "pending" && (
              <Button size="sm" onClick={onApprove}>
                Approve storefront
              </Button>
            )}
            {storefront.status === "live" && (
              <Button size="sm" variant="outline" onClick={onDisable}>
                Disable storefront
              </Button>
            )}
            {storefront.status === "disabled" && (
              <Button size="sm" onClick={onReactivate}>
                Reactivate storefront
              </Button>
            )}
          </Can>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs text-neutral-500 dark:text-neutral-400">
        {label}
      </dt>
      <dd
        className={cn(
          "mt-0.5 text-sm font-semibold text-neutral-900 dark:text-neutral-100",
          mono && "font-mono text-xs font-normal"
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function ConfigBlock({
  label,
  value,
}: {
  label: string;
  value: string | undefined;
}) {
  const configured = Boolean(value);
  return (
    <div className="rounded-md border border-neutral-200 p-3 dark:border-neutral-800">
      <p className="text-xs text-neutral-500 dark:text-neutral-400">{label}</p>
      <div className="mt-1 flex items-center gap-2">
        {configured ? (
          <>
            {label.toLowerCase().includes("color") && (
              <span
                aria-hidden="true"
                className="h-4 w-4 rounded border border-neutral-300 dark:border-neutral-700"
                style={{ backgroundColor: value }}
              />
            )}
            <span className="font-mono text-xs text-neutral-900 dark:text-neutral-100">
              {value}
            </span>
          </>
        ) : (
          <span className="text-xs text-neutral-400 dark:text-neutral-500">
            Not configured
          </span>
        )}
      </div>
    </div>
  );
}