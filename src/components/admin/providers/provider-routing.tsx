/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type {
  Provider,
  RoutingPriority,
} from "@/lib/admin/types/provider";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { SettingsField } from "@/components/admin/ui/settings-field";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { Can, PERMISSIONS, useCurrentAdmin } from "@/lib/admin/rbac";
import { useUnsavedChanges } from "@/lib/admin/hooks/use-unsaved-changes";
import {
  ROUTING_PRIORITY_LABEL,
  ROUTING_PRIORITY_VARIANT,
} from "@/lib/admin/providers/constants";
import {
  providerOperationalState,
} from "@/lib/admin/providers/state";
import { failoverChain } from "@/lib/admin/providers/impact";
import { updateProviderRouting } from "@/lib/admin/mock/providers-store";

interface ProviderRoutingProps {
  provider: Provider;
  allProviders: Provider[];
}

interface Draft {
  priority: RoutingPriority;
  failoverEnabled: boolean;
  failureRate: string;
  responseTime: string;
  consecutive: string;
  destinationProviderId: string;
}

function draftFrom(provider: Provider): Draft {
  return {
    priority: provider.priority,
    failoverEnabled: provider.failover.enabled,
    failureRate: String(provider.failover.triggerFailureRate),
    responseTime: String(provider.failover.triggerResponseTime),
    consecutive: String(provider.failover.triggerConsecutiveFailures),
    destinationProviderId: provider.failover.destinationProviderId ?? "",
  };
}

export function ProviderRouting({
  provider,
  allProviders,
}: ProviderRoutingProps) {
  const admin = useCurrentAdmin();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Draft>(() => draftFrom(provider));
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setDraft(draftFrom(provider));
    setErrors({});
  }, [provider.id]);

  const dirty =
    editing &&
    JSON.stringify(draft) !== JSON.stringify(draftFrom(provider));

  useUnsavedChanges({ hasChanges: dirty });

  const chain = failoverChain(provider, allProviders);

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    const fr = Number(draft.failureRate);
    const rt = Number(draft.responseTime);
    const cf = Number(draft.consecutive);
    if (!draft.failoverEnabled) {
      setErrors({});
      return true;
    }
    if (!Number.isFinite(fr) || fr < 0 || fr > 100) {
      next.failureRate = "Must be between 0 and 100.";
    }
    if (!Number.isFinite(rt) || rt < 0 || rt > 60000) {
      next.responseTime = "Must be between 0 and 60000 ms.";
    }
    if (!Number.isFinite(cf) || cf < 1 || cf > 20) {
      next.consecutive = "Must be between 1 and 20.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    updateProviderRouting(
      provider.id,
      {
        priority: draft.priority,
        enabled: draft.failoverEnabled,
        triggerFailureRate: Number(draft.failureRate),
        triggerResponseTime: Number(draft.responseTime),
        triggerConsecutiveFailures: Number(draft.consecutive),
        destinationProviderId: draft.destinationProviderId || undefined,
      },
      {
        actor: admin
          ? { name: admin.name, email: admin.email }
          : { name: "System", email: "system@atlas.com" },
        reason: "Routing and failover updated",
      }
    );
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft(draftFrom(provider));
    setErrors({});
    setEditing(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Service routing</CardTitle>
        {!editing ? (
          <Can permission={PERMISSIONS.PROVIDERS_MANAGE}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditing(true)}
            >
              Edit
            </Button>
          </Can>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave}>
              Save changes
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {!editing ? (
          <>
            <Field label="Priority">
              <Badge variant={ROUTING_PRIORITY_VARIANT[provider.priority]}>
                {ROUTING_PRIORITY_LABEL[provider.priority]}
              </Badge>
            </Field>

            <Field label="Automatic failover">
              <Badge variant={provider.failover.enabled ? "success" : "neutral"}>
                {provider.failover.enabled ? "Enabled" : "Disabled"}
              </Badge>
            </Field>

            {provider.failover.enabled && (
              <div className="space-y-2 rounded-md bg-neutral-50 p-3 text-sm dark:bg-neutral-900">
                <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  Failover triggers
                </p>
                <ul className="space-y-1">
                  <li>Failure rate above {provider.failover.triggerFailureRate}%</li>
                  <li>
                    Response time above {provider.failover.triggerResponseTime}ms
                  </li>
                  <li>
                    {provider.failover.triggerConsecutiveFailures} consecutive
                    failures
                  </li>
                </ul>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                Failover chain
              </p>
              {chain.length > 1 ? (
                <ol role="list" className="flex flex-wrap items-center gap-2">
                  {chain.map((step, index) => (
                    <li
                      key={step.providerId}
                      className="flex items-center gap-2"
                    >
                      <Link
                        href={`/admin/providers/${step.providerId}`}
                        className={cn(
                          "inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                          step.isDead
                            ? "border-danger-200 bg-danger-50 text-danger-700 dark:border-danger-800 dark:bg-danger-900/20 dark:text-danger-300"
                            : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
                        )}
                      >
                        {step.providerName}
                        <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                          {step.status}
                        </span>
                      </Link>
                      {index < chain.length - 1 && (
                        <AtlasIcon
                          name="arrow-right"
                          aria-hidden="true"
                          className="h-3.5 w-3.5 text-neutral-400"
                        />
                      )}
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  No failover destination configured.
                </p>
              )}
            </div>
          </>
        ) : (
          <>
            <SettingsField
              label="Priority"
              htmlFor="provider-routing-priority"
            >
              <select
                id="provider-routing-priority"
                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                value={draft.priority}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    priority: e.target.value as RoutingPriority,
                  })
                }
              >
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="fallback">Fallback</option>
              </select>
            </SettingsField>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={draft.failoverEnabled}
                onChange={(e) =>
                  setDraft({ ...draft, failoverEnabled: e.target.checked })
                }
                className="h-4 w-4 focus-visible:ring-2 focus-visible:ring-brand-500"
              />
              Enable automatic failover
            </label>

            {draft.failoverEnabled && (
              <>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <SettingsField
                    label="Failure rate above (%)"
                    htmlFor="provider-routing-fr"
                    error={errors.failureRate}
                  >
                    <Input
                      id="provider-routing-fr"
                      type="number"
                      value={draft.failureRate}
                      onChange={(e) =>
                        setDraft({ ...draft, failureRate: e.target.value })
                      }
                    />
                  </SettingsField>
                  <SettingsField
                    label="Response above (ms)"
                    htmlFor="provider-routing-rt"
                    error={errors.responseTime}
                  >
                    <Input
                      id="provider-routing-rt"
                      type="number"
                      value={draft.responseTime}
                      onChange={(e) =>
                        setDraft({ ...draft, responseTime: e.target.value })
                      }
                    />
                  </SettingsField>
                  <SettingsField
                    label="Consecutive failures"
                    htmlFor="provider-routing-cf"
                    error={errors.consecutive}
                  >
                    <Input
                      id="provider-routing-cf"
                      type="number"
                      value={draft.consecutive}
                      onChange={(e) =>
                        setDraft({ ...draft, consecutive: e.target.value })
                      }
                    />
                  </SettingsField>
                </div>

                <SettingsField
                  label="Failover destination"
                  htmlFor="provider-routing-dest"
                  hint="Provider that receives traffic when failover triggers."
                >
                  <select
                    id="provider-routing-dest"
                    className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                    value={draft.destinationProviderId}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        destinationProviderId: e.target.value,
                      })
                    }
                  >
                    <option value="">None</option>
                    {allProviders
                      .filter((p) => p.id !== provider.id)
                      .map((p) => {
                        const s = providerOperationalState(p);
                        return (
                          <option key={p.id} value={p.id}>
                            {p.name} ({s.label})
                          </option>
                        );
                      })}
                  </select>
                </SettingsField>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-neutral-500 dark:text-neutral-400">{label}</span>
      {children}
    </div>
  );
}