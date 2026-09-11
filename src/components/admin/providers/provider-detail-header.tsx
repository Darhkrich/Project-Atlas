"use client";

import { Provider } from "@/lib/admin/types/provider";
import { ProviderStatusBadge } from "./provider-status-badge";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ProviderDetailHeaderProps {
  provider: Provider;
  onTest: () => void;
  onEdit: () => void;
  onDisable: () => void;
  onRotateCredentials: () => void;
  onUpdateCredentials: () => void;
}

const providerTypeIconMap: Record<string, AtlasIconName> = {
  api: "server",
  aggregator: "grid",
  direct: "link",
  payment: "credit-card",
  internal: "shield",
  manual: "edit",
};

export function ProviderDetailHeader({
  provider,
  onTest,
  onEdit,
  onDisable,
  onRotateCredentials,
  onUpdateCredentials,
}: ProviderDetailHeaderProps) {
  const [copied, setCopied] = useState(false);

  const healthDotColor =
    provider.healthStatus === "healthy"
      ? "bg-success-500"
      : provider.healthStatus === "warning"
      ? "bg-warning-500"
      : "bg-danger-500";

  const handleCopy = () => {
    navigator.clipboard.writeText(provider.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-4">
      <Link
        href="/admin/providers"
        className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700"
      >
        <AtlasIcon name="arrow-left" className="h-3.5 w-3.5" />
        Back to Providers
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-neutral-200 pb-4 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <span className="relative flex h-12 w-12 items-center justify-center rounded-lg bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
            <AtlasIcon
              name={providerTypeIconMap[provider.type] || "server"}
              className="h-6 w-6"
            />
            <span
              className={cn(
                "absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-neutral-900",
                healthDotColor
              )}
            />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold">{provider.name}</h1>
              <ProviderStatusBadge status={provider.status} />
            </div>
            <div className="mt-1 flex items-center gap-2 text-sm text-neutral-500">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 font-mono hover:text-neutral-700"
              >
                {provider.code}
                <AtlasIcon name="link" className="h-3 w-3" />
              </button>
              {copied && (
                <span className="text-xs text-success-600">Copied!</span>
              )}
              <span>·</span>
              <span className="capitalize">{provider.type}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={onTest}>
            <AtlasIcon name="activity" className="mr-1 h-4 w-4" />
            Test Connection
          </Button>
          <Button variant="outline" size="sm" onClick={onEdit}>
            <AtlasIcon name="edit" className="mr-1 h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" size="sm" onClick={onRotateCredentials}>
            <AtlasIcon name="shield" className="mr-1 h-4 w-4" />
            Rotate Credentials
          </Button>
          <Button variant="outline" size="sm" onClick={onUpdateCredentials}>
            <AtlasIcon name="lock" className="mr-1 h-4 w-4" />
            Update Credentials
          </Button>
          {provider.status !== "disabled" && (
            <Button variant="destructive" size="sm" onClick={onDisable}>
              Disable
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}