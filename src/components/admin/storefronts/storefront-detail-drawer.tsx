"use client";

import { useState } from "react";
import { UnifiedStorefront } from "@/lib/admin/types/storefront";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { formatCurrency } from "@/lib/admin/formatters";
import { cn } from "@/lib/utils";
import { AtlasIcon } from "@/components/atlas/icons";
import { StorefrontUsersList } from "@/components/admin/shared/storefront-users-list";
import Link from "next/link";

interface StorefrontDetailDrawerProps {
  storefront: UnifiedStorefront | null;
  onClose: () => void;
  onToggleStatus: (id: string) => void;
  onPreview: (storefront: UnifiedStorefront) => void;
}

type Tab = "overview" | "users" | "orders" | "configuration";

const statusVariant: Record<string, "success" | "warning" | "danger"> = {
  live: "success",
  pending: "warning",
  disabled: "danger",
};

export function StorefrontDetailDrawer({
  storefront,
  onClose,
  onToggleStatus,
  onPreview,
}: StorefrontDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  if (!storefront) return null;

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "users", label: "Users" },
    { key: "orders", label: "Orders" },
    { key: "configuration", label: "Configuration" },
  ];

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute right-0 top-0 flex h-full w-full max-w-lg flex-col bg-white shadow-xl dark:bg-neutral-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
              <AtlasIcon
                name={storefront.type === "reseller" ? "users" : "briefcase"}
                className="h-4 w-4"
              />
            </span>
            <div>
              <p className="text-sm font-semibold">{storefront.storeName}</p>
              <p className="text-xs text-neutral-500">{storefront.ownerName}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>

        {/* Status bar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <Badge variant={statusVariant[storefront.status]}>
            {storefront.status}
          </Badge>
          <Badge variant={storefront.type === "reseller" ? "info" : "success"}>
            {storefront.type}
          </Badge>
          <span className="font-mono text-xs text-neutral-500">
            {storefront.slug}
          </span>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-neutral-200 dark:border-neutral-800">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex-1 whitespace-nowrap border-b-2 px-3 py-2 text-xs font-medium",
                activeTab === tab.key
                  ? "border-brand-600 text-brand-600"
                  : "border-transparent text-neutral-500 hover:text-neutral-700"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === "overview" && (
            <div className="space-y-4">
              {/* Metrics */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-md bg-neutral-50 p-3 dark:bg-neutral-900">
                  <p className="text-xs text-neutral-500">Users</p>
                  <p className="mt-1 text-lg font-bold">
                    {storefront.usersCount}
                  </p>
                </div>
                <div className="rounded-md bg-neutral-50 p-3 dark:bg-neutral-900">
                  <p className="text-xs text-neutral-500">Orders (30d)</p>
                  <p className="mt-1 text-lg font-bold">
                    {storefront.orders30d}
                  </p>
                </div>
                <div className="rounded-md bg-neutral-50 p-3 dark:bg-neutral-900">
                  <p className="text-xs text-neutral-500">Revenue (30d)</p>
                  <p className="mt-1 text-lg font-bold">
                    {formatCurrency(storefront.revenue30d)}
                  </p>
                </div>
              </div>

              {/* Meta */}
              <div className="space-y-2 rounded-md bg-neutral-50 p-3 text-sm dark:bg-neutral-900">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Owner</span>
                  <span className="font-medium">{storefront.ownerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Template</span>
                  <span className="font-mono text-xs">
                    {storefront.template}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Created</span>
                  <span>
                    {new Date(storefront.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Last Active</span>
                  <span>
                    {new Date(storefront.lastActive).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Public URL</span>
                  <Link
                    href={storefront.publicUrl}
                    target="_blank"
                    className="text-brand-600 hover:underline"
                  >
                    {storefront.publicUrl}
                  </Link>
                </div>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div>
              <p className="mb-2 text-xs font-medium text-neutral-500">
                Customers tied to this storefront
              </p>
              <StorefrontUsersList
                storefrontId={storefront.ownerId}
                storefrontType={storefront.type}
              />
            </div>
          )}

          {activeTab === "orders" && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-neutral-500">
                Recent Orders
              </p>
              <div className="rounded-md border border-neutral-200 p-4 text-center text-sm text-neutral-500 dark:border-neutral-700">
                Order list integration coming soon. Currently {storefront.orders30d} orders in the last 30 days.
              </div>
            </div>
          )}

          {activeTab === "configuration" && (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-neutral-500">
                  Branding Colors
                </p>
                <div className="mt-2 flex gap-3">
                  {storefront.primaryColor && (
                    <div>
                      <div
                        className="h-10 w-10 rounded border dark:border-neutral-700"
                        style={{ backgroundColor: storefront.primaryColor }}
                      />
                      <p className="mt-1 text-xs">Primary</p>
                    </div>
                  )}
                  {storefront.accentColor && (
                    <div>
                      <div
                        className="h-10 w-10 rounded border dark:border-neutral-700"
                        style={{ backgroundColor: storefront.accentColor }}
                      />
                      <p className="mt-1 text-xs">Accent</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-neutral-500">
                  Template
                </p>
                <p className="mt-1 font-mono text-sm">{storefront.template}</p>
              </div>

              <div className="rounded-md border border-neutral-200 p-3 text-sm text-neutral-500 dark:border-neutral-700">
                Full configuration is managed on the storefront owner’s page.
                Visit the {storefront.type} account to edit appearance, hero,
                and services.
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 border-t border-neutral-200 p-4 dark:border-neutral-800">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPreview(storefront)}
          >
            <AtlasIcon name="eye" className="mr-1 h-4 w-4" />
            Preview
          </Button>
          {storefront.status === "live" ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                onToggleStatus(storefront.id);
              }}
            >
              Disable Storefront
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => {
                onToggleStatus(storefront.id);
              }}
            >
              Enable Storefront
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}