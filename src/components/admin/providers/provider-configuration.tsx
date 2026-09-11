"use client";

import { useState } from "react";
import { Provider } from "@/lib/admin/types/provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Badge } from "@/components/admin/ui/badge";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";

interface ProviderConfigurationProps {
  provider: Provider;
  onSave?: (config: Provider["configuration"]) => void;
}

export function ProviderConfiguration({ provider, onSave }: ProviderConfigurationProps) {
  const [editing, setEditing] = useState(false);
  const [timeout, setTimeout] = useState(provider.configuration.timeout);
  const [retryAttempts, setRetryAttempts] = useState(provider.configuration.retryAttempts);
  const [healthInterval, setHealthInterval] = useState(provider.configuration.healthCheckInterval);
  const [webhookEnabled, setWebhookEnabled] = useState(provider.configuration.webhookEnabled);
  const [pollingEnabled, setPollingEnabled] = useState(provider.configuration.statusPollingEnabled);
  const [confirmSave, setConfirmSave] = useState(false);

  const handleSave = () => {
    if (onSave) {
      onSave({
        timeout,
        retryAttempts,
        healthCheckInterval: healthInterval,
        webhookEnabled,
        statusPollingEnabled: pollingEnabled,
      });
    }
    setConfirmSave(false);
    setEditing(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Provider Configuration</CardTitle>
        {!editing && (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            Edit
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {!editing ? (
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: "Timeout", value: `${provider.configuration.timeout}s` },
              { label: "Retry Attempts", value: provider.configuration.retryAttempts },
              { label: "Health Check Interval", value: `${provider.configuration.healthCheckInterval}s` },
              {
                label: "Webhook",
                value: (
                  <Badge
                    variant={provider.configuration.webhookEnabled ? "success" : "neutral"}
                  >
                    {provider.configuration.webhookEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                ),
              },
              {
                label: "Status Polling",
                value: (
                  <Badge
                    variant={provider.configuration.statusPollingEnabled ? "success" : "neutral"}
                  >
                    {provider.configuration.statusPollingEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                ),
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-md border border-neutral-100 p-3 dark:border-neutral-800"
              >
                <dt className="text-xs text-neutral-500">{item.label}</dt>
                <dd className="mt-1 text-sm font-medium">{item.value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="text-xs font-medium text-neutral-500">
                  Timeout (seconds)
                </label>
                <Input
                  type="number"
                  value={timeout}
                  onChange={(e) => setTimeout(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-500">
                  Retry Attempts
                </label>
                <Input
                  type="number"
                  value={retryAttempts}
                  onChange={(e) => setRetryAttempts(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-500">
                  Health Check Interval (s)
                </label>
                <Input
                  type="number"
                  value={healthInterval}
                  onChange={(e) => setHealthInterval(Number(e.target.value))}
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={webhookEnabled}
                  onChange={(e) => setWebhookEnabled(e.target.checked)}
                  className="h-4 w-4"
                />
                Webhook Enabled
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={pollingEnabled}
                  onChange={(e) => setPollingEnabled(e.target.checked)}
                  className="h-4 w-4"
                />
                Status Polling Enabled
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditing(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={() => setConfirmSave(true)}>
                Save
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      <ConfirmDialog
        open={confirmSave}
        title="Confirm Configuration"
        description="Save these configuration changes?"
        confirmLabel="Save"
        onConfirm={handleSave}
        onCancel={() => setConfirmSave(false)}
      />
    </Card>
  );
}