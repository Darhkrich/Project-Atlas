"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Provider } from "@/lib/admin/types/provider";
import { ProviderStatusBadge } from "./provider-status-badge";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { Can, PERMISSIONS } from "@/lib/admin/rbac";
import {
  ENVIRONMENT_LABEL,
  ENVIRONMENT_VARIANT,
  PROVIDER_TYPE_LABEL,
} from "@/lib/admin/providers/constants";
import {
  providerOperationalState,
  isProviderPaused,
} from "@/lib/admin/providers/state";

interface ProviderDetailHeaderProps {
  provider: Provider;
  onTest: () => void;
  onEdit: () => void;
  onDisable: () => void;
  onEnable: () => void;
  onSetMaintenance: () => void;
  onEndMaintenance: () => void;
  onRotateCredentials: () => void;
  onUpdateCredentials: () => void;
}

const typeIcon: Record<string, AtlasIconName> = {
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
  onEnable,
  onSetMaintenance,
  onEndMaintenance,
  onRotateCredentials,
  onUpdateCredentials,
}: ProviderDetailHeaderProps) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const copyTimerRef = useRef<number | null>(null);
  const manageRef = useRef<HTMLDivElement | null>(null);

  const state = providerOperationalState(provider);
  const paused = isProviderPaused(state);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!manageOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (
        manageRef.current &&
        !manageRef.current.contains(e.target as Node)
      ) {
        setManageOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [manageOpen]);

  const handleCopy = async () => {
    setCopyError(false);
    try {
      await navigator.clipboard.writeText(provider.code);
      setCopied(true);
      if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current);
      copyTimerRef.current = window.setTimeout(
        () => setCopied(false),
        1500
      );
    } catch {
      setCopyError(true);
      if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current);
      copyTimerRef.current = window.setTimeout(
        () => setCopyError(false),
        2000
      );
    }
  };

  return (
    <div className="space-y-4">
      <Link
        href="/admin/providers"
        className="inline-flex items-center gap-1 rounded-sm text-sm text-neutral-500 hover:text-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-neutral-400 dark:hover:text-neutral-200"
      >
        <AtlasIcon name="arrow-left" aria-hidden="true" className="h-3.5 w-3.5" />
        Back to Providers
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-neutral-200 pb-4 dark:border-neutral-800">
        <div className="flex items-start gap-3">
          <span className="relative flex h-12 w-12 items-center justify-center rounded-lg bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
            <AtlasIcon
              name={typeIcon[provider.type] || "server"}
              aria-hidden="true"
              className="h-6 w-6"
            />
            <span
              aria-label={`Health: ${state.label}`}
              title={state.headline}
              className={cn(
                "absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-neutral-900",
                state.dotClass
              )}
            />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold">{provider.name}</h1>
              <ProviderStatusBadge provider={provider} size="sm" />
              <Badge variant={ENVIRONMENT_VARIANT[provider.environment]} size="sm">
                {ENVIRONMENT_LABEL[provider.environment]}
              </Badge>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
              <button
                type="button"
                onClick={handleCopy}
                aria-label={`Copy provider code ${provider.code}`}
                className="flex items-center gap-1 rounded-sm font-mono hover:text-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:hover:text-neutral-200"
              >
                {provider.code}
                <AtlasIcon
                  name="copy"
                  aria-hidden="true"
                  className="h-3 w-3"
                />
              </button>
              <span aria-hidden="true">·</span>
              <span>{PROVIDER_TYPE_LABEL[provider.type]}</span>
            </div>
            <div
              role="status"
              aria-live="polite"
              className="mt-0.5 text-xs"
            >
              {copied && (
                <span className="text-success-600">Code copied</span>
              )}
              {copyError && (
                <span className="text-danger-600">
                  Could not copy. Clipboard access denied.
                </span>
              )}
            </div>
          </div>
        </div>

        <Can permission={PERMISSIONS.PROVIDERS_MANAGE}>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={onTest}>
              <AtlasIcon
                name="activity"
                aria-hidden="true"
                className="mr-1 h-4 w-4"
              />
              Test connection
            </Button>
            <div className="relative" ref={manageRef}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setManageOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={manageOpen}
              >
                Manage
                <AtlasIcon
                  name="chevron-down"
                  aria-hidden="true"
                  className="ml-1 h-3.5 w-3.5"
                />
              </Button>
              {manageOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full z-40 mt-1 w-56 rounded-md border border-neutral-200 bg-white py-1 shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setManageOpen(false);
                      onEdit();
                    }}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    <AtlasIcon
                      name="edit"
                      aria-hidden="true"
                      className="h-3.5 w-3.5"
                    />
                    Edit provider
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setManageOpen(false);
                      onUpdateCredentials();
                    }}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    <AtlasIcon
                      name="lock"
                      aria-hidden="true"
                      className="h-3.5 w-3.5"
                    />
                    Update credentials
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setManageOpen(false);
                      onRotateCredentials();
                    }}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-danger-600 hover:bg-danger-50 dark:text-danger-400 dark:hover:bg-danger-900/30"
                  >
                    <AtlasIcon
                      name="shield"
                      aria-hidden="true"
                      className="h-3.5 w-3.5"
                    />
                    Rotate credentials
                  </button>
                  <div
                    role="separator"
                    className="my-1 border-t border-neutral-200 dark:border-neutral-800"
                  />
                  {paused ? (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setManageOpen(false);
                        if (state.kind === "maintenance") {
                          onEndMaintenance();
                        } else {
                          onEnable();
                        }
                      }}
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      <AtlasIcon
                        name="check"
                        aria-hidden="true"
                        className="h-3.5 w-3.5"
                      />
                      {state.kind === "maintenance"
                        ? "End maintenance"
                        : "Enable"}
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setManageOpen(false);
                          onSetMaintenance();
                        }}
                        className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      >
                        <AtlasIcon
                          name="clock"
                          aria-hidden="true"
                          className="h-3.5 w-3.5"
                        />
                        Set maintenance
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setManageOpen(false);
                          onDisable();
                        }}
                        className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-danger-600 hover:bg-danger-50 dark:text-danger-400 dark:hover:bg-danger-900/30"
                      >
                        <AtlasIcon
                          name="x-circle"
                          aria-hidden="true"
                          className="h-3.5 w-3.5"
                        />
                        Disable provider
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </Can>
      </div>
    </div>
  );
}