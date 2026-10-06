/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
// components/admin/providers/provider-configuration.tsx
"use client";

import { useEffect, useState } from "react";
import type {
  Provider,
  ProviderConfiguration as ProviderConfig,
} from "@/lib/admin/types/provider";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/admin/ui/card";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Badge } from "@/components/admin/ui/badge";
import { SettingsField } from "@/components/admin/ui/settings-field";
import { Can, PERMISSIONS, useCurrentAdmin } from "@/lib/admin/rbac";
import { useUnsavedChanges } from "@/lib/admin/hooks/use-unsaved-changes";
import { updateProviderConfiguration } from "@/lib/admin/mock/providers-store";

interface ProviderConfigurationProps {
  provider: Provider;
}

interface Draft {
  timeoutSeconds: string;
  retryAttempts: string;
  healthCheckInterval: string;
  webhookEnabled: boolean;
  statusPollingEnabled: boolean;
}

function draftFrom(provider: Provider): Draft {
  return {
    timeoutSeconds: String(provider.configuration.timeout),
    retryAttempts: String(provider.configuration.retryAttempts),
    healthCheckInterval: String(provider.configuration.healthCheckInterval),
    webhookEnabled: provider.configuration.webhookEnabled,
    statusPollingEnabled: provider.configuration.statusPollingEnabled,
  };
}

export function ProviderConfiguration({ provider }: ProviderConfigurationProps) {
  const admin = useCurrentAdmin();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Draft>(() => draftFrom(provider));
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setDraft(draftFrom(provider));
    setErrors({});
    setEditing(false);
  }, [provider.id]);

  const dirty =
    editing &&
    JSON.stringify(draft) !== JSON.stringify(draftFrom(provider));

  useUnsavedChanges({ hasChanges: dirty });

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    const t = Number(draft.timeoutSeconds);
    const r = Number(draft.retryAttempts);
    const h = Number(draft.healthCheckInterval);

    if (!Number.isFinite(t) || t < 1 || t > 120) {
      next.timeoutSeconds = "Must be between 1 and 120 seconds.";
    }
    if (!Number.isFinite(r) || r < 0 || r > 10) {
      next.retryAttempts = "Must be between 0 and 10.";
    }
    if (!Number.isFinite(h) || h < 30 || h > 600) {
      next.healthCheckInterval = "Must be between 30 and 600 seconds.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const patch: Partial<ProviderConfig> = {
      timeout: Number(draft.timeoutSeconds),
      retryAttempts: Number(draft.retryAttempts),
      healthCheckInterval: Number(draft.healthCheckInterval),
      webhookEnabled: draft.webhookEnabled,
      statusPollingEnabled: draft.statusPollingEnabled,
    };
    updateProviderConfiguration(provider.id, patch, {
      actor: admin
        ? { name: admin.name, email: admin.email }
        : { name: "System", email: "system@atlas.com" },
    });
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
        <CardTitle>Provider configuration</CardTitle>
        {!editing ? (
          <Can permission={PERMISSIONS.PROVIDERS_MANAGE}>
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
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
      <CardContent>
        {!editing ? (
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Cell
              label="Timeout"
              value={`${provider.configuration.timeout}s`}
            />
            <Cell
              label="Retry attempts"
              value={provider.configuration.retryAttempts}
            />
            <Cell
              label="Health check interval"
              value={`${provider.configuration.healthCheckInterval}s`}
            />
            <Cell
              label="Webhook"
              value={
                <Badge
                  variant={
                    provider.configuration.webhookEnabled ? "success" : "neutral"
                  }
                >
                  {provider.configuration.webhookEnabled ? "Enabled" : "Disabled"}
                </Badge>
              }
            />
            <Cell
              label="Status polling"
              value={
                <Badge
                  variant={
                    provider.configuration.statusPollingEnabled
                      ? "success"
                      : "neutral"
                  }
                >
                  {provider.configuration.statusPollingEnabled
                    ? "Enabled"
                    : "Disabled"}
                </Badge>
              }
            />
          </dl>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <SettingsField
                label="Timeout (seconds)"
                htmlFor="provider-config-timeout"
                error={errors.timeoutSeconds}
              >
                <Input
                  id="provider-config-timeout"
                  type="number"
                  value={draft.timeoutSeconds}
                  onChange={(e) =>
                    setDraft({ ...draft, timeoutSeconds: e.target.value })
                  }
                />
              </SettingsField>
              <SettingsField
                label="Retry attempts"
                htmlFor="provider-config-retries"
                error={errors.retryAttempts}
              >
                <Input
                  id="provider-config-retries"
                  type="number"
                  value={draft.retryAttempts}
                  onChange={(e) =>
                    setDraft({ ...draft, retryAttempts: e.target.value })
                  }
                />
              </SettingsField>
              <SettingsField
                label="Health check interval (s)"
                htmlFor="provider-config-health"
                error={errors.healthCheckInterval}
              >
                <Input
                  id="provider-config-health"
                  type="number"
                  value={draft.healthCheckInterval}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      healthCheckInterval: e.target.value,
                    })
                  }
                />
              </SettingsField>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={draft.webhookEnabled}
                  onChange={(e) =>
                    setDraft({ ...draft, webhookEnabled: e.target.checked })
                  }
                  className="h-4 w-4 focus-visible:ring-2 focus-visible:ring-brand-500"
                />
                Webhook enabled
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={draft.statusPollingEnabled}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      statusPollingEnabled: e.target.checked,
                    })
                  }
                  className="h-4 w-4 focus-visible:ring-2 focus-visible:ring-brand-500"
                />
                Status polling enabled
              </label>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Cell({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md border border-neutral-100 p-3 dark:border-neutral-800">
      <dt className="text-xs text-neutral-500 dark:text-neutral-400">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium">{value}</dd>
    </div>
  );
}