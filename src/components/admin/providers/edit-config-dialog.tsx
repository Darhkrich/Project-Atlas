"use client";

import { useState } from "react";
import { Provider } from "@/lib/admin/types/provider";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";

interface EditConfigDialogProps {
  provider: Provider;
  onClose: () => void;
  onSave: (config: Provider["configuration"]) => void;
}

export function EditConfigDialog({ provider, onClose, onSave }: EditConfigDialogProps) {
  const [timeoutSec, setTimeoutSec] = useState(provider.configuration.timeout);
  const [retryAttempts, setRetryAttempts] = useState(provider.configuration.retryAttempts);
  const [healthCheckInterval, setHealthCheckInterval] = useState(provider.configuration.healthCheckInterval);
  const [webhookEnabled, setWebhookEnabled] = useState(provider.configuration.webhookEnabled);
  const [statusPollingEnabled, setStatusPollingEnabled] = useState(provider.configuration.statusPollingEnabled);

  const handleSave = () => {
    onSave({
      timeout: timeoutSec,
      retryAttempts,
      healthCheckInterval,
      webhookEnabled,
      statusPollingEnabled,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-neutral-900">
        <h3 className="text-lg font-semibold">Edit Configuration</h3>
        <div className="mt-4 space-y-3">
          <label className="text-sm">Timeout (seconds)</label>
          <Input type="number" value={timeoutSec} onChange={e => setTimeoutSec(Number(e.target.value))} />
          <label className="text-sm">Retry Attempts</label>
          <Input type="number" value={retryAttempts} onChange={e => setRetryAttempts(Number(e.target.value))} />
          <label className="text-sm">Health Check Interval (seconds)</label>
          <Input type="number" value={healthCheckInterval} onChange={e => setHealthCheckInterval(Number(e.target.value))} />
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={webhookEnabled} onChange={e => setWebhookEnabled(e.target.checked)} />
              Webhook Enabled
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={statusPollingEnabled} onChange={e => setStatusPollingEnabled(e.target.checked)} />
              Status Polling
            </label>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={handleSave}>Save</Button>
        </div>
      </div>
    </div>
  );
}