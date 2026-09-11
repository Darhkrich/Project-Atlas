"use client";

import { useState } from "react";
import { ResellerStorefront } from "@/lib/admin/types/reseller-storefront";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { formatCurrency } from "@/lib/admin/formatters";
import { cn } from "@/lib/utils";
import { StorefrontUsersList } from "@/components/admin/shared/storefront-users-list";

interface ResellerStorefrontDetailDrawerProps {
  storefront: ResellerStorefront | null;
  onClose: () => void;
  onToggleStatus: (id: string) => void;
}

type Tab = "overview" | "users" | "configuration";

const tabs: { key: Tab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "users", label: "Storefront Users" },
  { key: "configuration", label: "Configuration" },
];

export function ResellerStorefrontDetailDrawer({
  storefront,
  onClose,
  onToggleStatus,
}: ResellerStorefrontDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  if (!storefront) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-xl dark:bg-neutral-900 flex flex-col">
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <h2 className="text-lg font-semibold">{storefront.storeName}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </div>

        {/* Header */}
        <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-lg font-bold text-brand-600">
              {storefront.storeName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-lg">{storefront.storeName}</p>
              <p className="text-sm text-neutral-500">{storefront.slug}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Badge variant={storefront.status === "live" ? "success" : storefront.status === "pending" ? "warning" : "danger"}>
              {storefront.status}
            </Badge>
            <span className="text-sm text-neutral-500">Owner: {storefront.resellerName}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-200 dark:border-neutral-800">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex-1 px-3 py-2 text-xs font-medium",
                activeTab === tab.key
                  ? "border-b-2 border-brand-600 text-brand-600"
                  : "text-neutral-500 hover:text-neutral-700"
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-neutral-500">Users Count</p>
                  <p className="font-semibold">{storefront.usersCount}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Orders (30d)</p>
                  <p className="font-semibold">{storefront.orders30d}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Revenue (30d)</p>
                  <p className="font-semibold">{formatCurrency(storefront.revenue30d)}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Created</p>
                  <p className="font-semibold">{new Date(storefront.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Last Active</p>
                  <p className="font-semibold">{new Date(storefront.lastActive).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Template</p>
                  <p className="font-semibold">{storefront.template}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div>
              <p className="text-sm font-medium mb-2">Customers tied to this storefront</p>
              <StorefrontUsersList storefrontId={storefront.resellerId} storefrontType="reseller" />
            </div>
          )}

          {activeTab === "configuration" && (
            <div className="space-y-4">
              <p className="text-sm text-neutral-500">Storefront configuration details (mock)</p>
              <div className="rounded-lg bg-neutral-50 p-4 dark:bg-neutral-900">
                <p className="text-sm font-medium">Appearance</p>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>Template: {storefront.template}</li>
                  <li>Theme: Modern</li>
                  <li>Primary Color: #166e59</li>
                  <li>Accent Color: #ffa000</li>
                </ul>
              </div>
              <div className="rounded-lg bg-neutral-50 p-4 dark:bg-neutral-900">
                <p className="text-sm font-medium">Pricing Markup</p>
                <p className="mt-1 text-sm">Markup Percentage: 5%</p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="border-t border-neutral-200 p-4 dark:border-neutral-800 flex gap-2">
          {storefront.status === "live" ? (
            <Button variant="outline" size="sm" onClick={() => onToggleStatus(storefront.id)}>Disable Storefront</Button>
          ) : storefront.status === "disabled" ? (
            <Button variant="outline" size="sm" onClick={() => onToggleStatus(storefront.id)}>Enable Storefront</Button>
          ) : (
            <Button variant="outline" size="sm" onClick={() => onToggleStatus(storefront.id)}>Approve Storefront</Button>
          )}
          <Button variant="outline" size="sm" onClick={() => console.log("Preview storefront", storefront.slug)}>Preview</Button>
        </div>
      </div>
    </div>
  );
}