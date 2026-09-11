/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { Provider } from "@/lib/admin/types/provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { cn } from "@/lib/utils";

interface ProviderRoutingProps {
  provider: Provider;
  onSave?: (priority: Provider["priority"], failover: Provider["failover"]) => void;
}

export function ProviderRouting({ provider, onSave }: ProviderRoutingProps) {
  const [editing, setEditing] = useState(false);
  const [priority, setPriority] = useState(provider.priority);
  const [failoverEnabled, setFailoverEnabled] = useState(provider.failover.enabled);
  const [failureRate, setFailureRate] = useState(provider.failover.triggerFailureRate);
  const [responseTime, setResponseTime] = useState(provider.failover.triggerResponseTime);
  const [consecutive, setConsecutive] = useState(provider.failover.triggerConsecutiveFailures);
  const [confirmSave, setConfirmSave] = useState(false);

  const handleSave = () => {
    if (onSave) {
      onSave(priority, {
        ...provider.failover,
        enabled: failoverEnabled,
        triggerFailureRate: failureRate,
        triggerResponseTime: responseTime,
        triggerConsecutiveFailures: consecutive,
      });
    }
    setConfirmSave(false);
    setEditing(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Service Routing</CardTitle>
        {!editing && (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            Edit
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {!editing ? (
          <>
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-500">Priority</span>
              <Badge variant="info" className="capitalize">
                {provider.priority}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-500">Automatic Failover</span>
              <Badge variant={provider.failover.enabled ? "success" : "neutral"}>
                {provider.failover.enabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            {provider.failover.enabled && (
              <div className="space-y-1 rounded-md bg-neutral-50 p-3 text-sm dark:bg-neutral-900">
                <p className="text-xs font-medium text-neutral-500">
                  Failover triggers
                </p>
                <p>Failure rate &gt; {provider.failover.triggerFailureRate}%</p>
                <p>
                  Response time &gt; {provider.failover.triggerResponseTime}ms
                </p>
                <p>
                  {provider.failover.triggerConsecutiveFailures} consecutive
                  failures
                </p>
                <p className="mt-2 text-xs text-neutral-500">
                  Destination: {provider.failover.destinationProviderId || "Not specified"}
                </p>
              </div>
            )}
          </>
        ) : (
          <>
            <div>
              <label className="text-xs font-medium text-neutral-500">Priority</label>
              <select
                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value as Provider["priority"])
                }
              >
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="fallback">Fallback</option>
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={failoverEnabled}
                onChange={(e) => setFailoverEnabled(e.target.checked)}
                className="h-4 w-4"
              />
              Automatic Failover
            </label>
            {failoverEnabled && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="text-xs font-medium text-neutral-500">
                    Failure Rate &gt; (%)
                  </label>
                  <Input
                    type="number"
                    value={failureRate}
                    onChange={(e) => setFailureRate(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-500">
                    Response &gt; (ms)
                  </label>
                  <Input
                    type="number"
                    value={responseTime}
                    onChange={(e) => setResponseTime(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-500">
                    Consecutive Failures
                  </label>
                  <Input
                    type="number"
                    value={consecutive}
                    onChange={(e) => setConsecutive(Number(e.target.value))}
                  />
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setEditing(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={() => setConfirmSave(true)}>
                Save
              </Button>
            </div>
          </>
        )}
      </CardContent>

      <ConfirmDialog
        open={confirmSave}
        title="Confirm Routing Change"
        description="Save routing priority and failover configuration?"
        confirmLabel="Save"
        onConfirm={handleSave}
        onCancel={() => setConfirmSave(false)}
      />
    </Card>
  );
}