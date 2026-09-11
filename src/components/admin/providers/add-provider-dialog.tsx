"use client";

import { useState } from "react";
import { Provider, ProviderType, RoutingPriority } from "@/lib/admin/types/provider";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";

interface AddProviderDialogProps {
  onClose: () => void;
  onSave: (provider: Provider) => void;
}

export function AddProviderDialog({ onClose, onSave }: AddProviderDialogProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [type, setType] = useState<ProviderType>("api");
  const [country, setCountry] = useState("Ghana");
  const [currency, setCurrency] = useState("GHS");
  const [baseUrl, setBaseUrl] = useState("");
  const [apiVersion, setApiVersion] = useState("v1");
  const [environment, setEnvironment] = useState<"production" | "sandbox">("production");
  const [priority, setPriority] = useState<RoutingPriority>("secondary");
  const [timeout, setTimeout] = useState(10);
  const [retryAttempts, setRetryAttempts] = useState(2);
  const [healthCheckInterval, setHealthCheckInterval] = useState(60);
  const [apiKey, setApiKey] = useState("");
  const [secret, setSecret] = useState("");
  const [accountId, setAccountId] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const handleCreate = () => {
    const newProvider: Provider = {
      id: `prv-${Date.now()}`,
      name,
      code: code || `PRV-${Math.floor(Math.random() * 10000)}`,
      type,
      status: "active",
      country,
      currency,
      baseUrl,
      apiVersion,
      environment,
      priority,
      enabled: true,
      maintenanceMode: false,
      healthStatus: "healthy",
      lastHealthCheck: new Date().toISOString(),
      averageResponseTime: 500,
      successRate: 99,
      transactionCountToday: 0,
      services: [],
      credentials: { apiKey, secret, accountId },
      configuration: { timeout, retryAttempts, healthCheckInterval, webhookEnabled: false, statusPollingEnabled: false },
      failover: { enabled: false, triggerFailureRate: 10, triggerResponseTime: 3000, triggerConsecutiveFailures: 3 },
    };
    onSave(newProvider);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-white p-6 shadow-xl dark:bg-neutral-900">
        <h3 className="text-lg font-semibold mb-4">Add Provider</h3>

        {step === 1 && (
          <div className="space-y-3">
            <div className="text-sm font-medium">Provider Information</div>
            <Input placeholder="Provider Name" value={name} onChange={e => setName(e.target.value)} />
            <Input placeholder="Provider Code" value={code} onChange={e => setCode(e.target.value)} />
            <div className="flex gap-2">
              <select className="h-10 flex-1 rounded-md border border-neutral-300 bg-white px-3 text-sm" value={type} onChange={e => setType(e.target.value as ProviderType)}>
                <option value="api">API</option>
                <option value="aggregator">Aggregator</option>
                <option value="direct">Direct</option>
                <option value="payment">Payment</option>
                <option value="manual">Manual</option>
              </select>
              <select className="h-10 flex-1 rounded-md border border-neutral-300 bg-white px-3 text-sm" value={environment} onChange={e => setEnvironment(e.target.value as "production" | "sandbox")}>
                <option value="production">Production</option>
                <option value="sandbox">Sandbox</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Input placeholder="Country" value={country} onChange={e => setCountry(e.target.value)} />
              <Input placeholder="Currency" value={currency} onChange={e => setCurrency(e.target.value)} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <div className="text-sm font-medium">Connection</div>
            <Input placeholder="Base URL" value={baseUrl} onChange={e => setBaseUrl(e.target.value)} />
            <Input placeholder="API Version" value={apiVersion} onChange={e => setApiVersion(e.target.value)} />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <div className="text-sm font-medium">Routing & Health</div>
            <select className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm" value={priority} onChange={e => setPriority(e.target.value as RoutingPriority)}>
              <option value="primary">Primary</option>
              <option value="secondary">Secondary</option>
              <option value="fallback">Fallback</option>
            </select>
            <div className="grid grid-cols-3 gap-2">
              <Input type="number" placeholder="Timeout (s)" value={timeout} onChange={e => setTimeout(Number(e.target.value))} />
              <Input type="number" placeholder="Retries" value={retryAttempts} onChange={e => setRetryAttempts(Number(e.target.value))} />
              <Input type="number" placeholder="Health interval (s)" value={healthCheckInterval} onChange={e => setHealthCheckInterval(Number(e.target.value))} />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-3">
            <div className="text-sm font-medium">Credentials</div>
            <Input placeholder="API Key" value={apiKey} onChange={e => setApiKey(e.target.value)} />
            <Input type="password" placeholder="Secret" value={secret} onChange={e => setSecret(e.target.value)} />
            <Input placeholder="Account ID" value={accountId} onChange={e => setAccountId(e.target.value)} />
          </div>
        )}

        {step === 5 && (
          <div className="space-y-3">
            <div className="text-sm font-medium">Review</div>
            <div className="rounded-lg bg-neutral-50 p-4 text-sm dark:bg-neutral-800">
              <p><strong>Name:</strong> {name}</p>
              <p><strong>Type:</strong> {type}</p>
              <p><strong>Environment:</strong> {environment}</p>
              <p><strong>Base URL:</strong> {baseUrl || "—"}</p>
              <p><strong>Priority:</strong> {priority}</p>
              <p><strong>Timeout:</strong> {timeout}s</p>
              <p><strong>Retries:</strong> {retryAttempts}</p>
              <p><strong>Health Check Interval:</strong> {healthCheckInterval}s</p>
              <p><strong>API Key:</strong> {apiKey ? "••••" : "—"}</p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-6 flex justify-between">
          {step > 1 ? (
            <Button variant="outline" size="sm" onClick={() => setStep(step - 1)}>Back</Button>
          ) : (
            <div />
          )}
          {step < 5 ? (
            <Button size="sm" onClick={() => setStep(step + 1)}>Next</Button>
          ) : (
            <Button size="sm" onClick={() => setShowConfirm(true)}>Create Provider</Button>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={showConfirm}
        title="Confirm Create Provider"
        description="Are you sure you want to create this provider?"
        confirmLabel="Create"
        onConfirm={handleCreate}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}