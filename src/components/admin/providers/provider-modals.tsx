/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
// components/admin/providers/provider-modals.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  Provider,
  ProviderCapability,
  ProviderEnvironment,
  ProviderPaymentRail,
  ProviderType,
  RoutingPriority,
} from "@/lib/admin/types/provider";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Badge } from "@/components/admin/ui/badge";
import { ModalShell } from "@/components/admin/ui/model-shell";
import { SettingsField } from "@/components/admin/ui/settings-field";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import {
  ALL_PROVIDER_CAPABILITIES,
  ALL_PROVIDER_TYPES,
  MAINTENANCE_DURATION_OPTIONS,
  PROVIDER_CAPABILITY_LABEL,
  PROVIDER_PAYMENT_RAIL_LABEL,
  PROVIDER_TYPE_LABEL,
} from "@/lib/admin/providers/constants";
import { affectedPlans } from "@/lib/admin/providers/impact";
import { useCatalog } from "@/lib/admin/hooks/use-catalog";

/* ======================================================================
   Add provider
   ====================================================================== */

interface AddProviderDialogProps {
  open: boolean;
  existingCodes: string[];
  onClose: () => void;
  onSave: (draft: AddProviderDraft) => void;
}

export interface AddProviderDraft {
  name: string;
  code: string;
  type: ProviderType;
  environment: ProviderEnvironment;
  country: string;
  currency: string;
  baseUrl: string;
  apiVersion: string;
  priority: RoutingPriority;
  timeout: number;
  retryAttempts: number;
  healthCheckInterval: number;
  webhookEnabled: boolean;
  statusPollingEnabled: boolean;
  slaTargetUptime: number;
  slaTargetLatencyMs: number;
  slaTargetSuccessRate: number;
}

interface AddDraftState {
  step: number;
  name: string;
  code: string;
  type: ProviderType;
  environment: ProviderEnvironment;
  country: string;
  currency: string;
  baseUrl: string;
  apiVersion: string;
  priority: RoutingPriority;
  timeout: string;
  retryAttempts: string;
  healthCheckInterval: string;
  webhookEnabled: boolean;
  statusPollingEnabled: boolean;
  slaTargetUptime: string;
  slaTargetLatencyMs: string;
  slaTargetSuccessRate: string;
}

const INITIAL_ADD: AddDraftState = {
  step: 1,
  name: "",
  code: "",
  type: "api",
  environment: "production",
  country: "Ghana",
  currency: "GHS",
  baseUrl: "",
  apiVersion: "v1",
  priority: "secondary",
  timeout: "10",
  retryAttempts: "2",
  healthCheckInterval: "60",
  webhookEnabled: false,
  statusPollingEnabled: false,
  slaTargetUptime: "99.5",
  slaTargetLatencyMs: "1000",
  slaTargetSuccessRate: "99.0",
};

const STEPS = [
  "Identity",
  "Environment",
  "Routing and health",
  "SLA",
  "Review",
] as const;

export function AddProviderDialog({
  open,
  existingCodes,
  onClose,
  onSave,
}: AddProviderDialogProps) {
  const [draft, setDraft] = useState<AddDraftState>(INITIAL_ADD);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setDraft(INITIAL_ADD);
    setErrors({});
  }, [open]);

  if (!open) return null;

  const validateStep = (step: number): boolean => {
    const next: Record<string, string> = {};
    if (step === 1) {
      if (!draft.name.trim()) next.name = "Enter a provider name.";
      if (!draft.code.trim()) next.code = "Enter a provider code.";
      else if (
        existingCodes.some(
          (c) => c.toLowerCase() === draft.code.trim().toLowerCase()
        )
      ) {
        next.code = "That code is already in use.";
      }
    }
    if (step === 2) {
      if (draft.baseUrl.trim()) {
        try {
          const u = new URL(draft.baseUrl.trim());
          if (
            draft.environment === "production" &&
            u.protocol !== "https:"
          ) {
            next.baseUrl = "Production providers must use https.";
          }
        } catch {
          next.baseUrl = "Enter a valid URL or leave blank for manual providers.";
        }
      }
    }
    if (step === 3) {
      const t = Number(draft.timeout);
      const r = Number(draft.retryAttempts);
      const h = Number(draft.healthCheckInterval);
      if (!Number.isFinite(t) || t < 1 || t > 120) {
        next.timeout = "Between 1 and 120 seconds.";
      }
      if (!Number.isFinite(r) || r < 0 || r > 10) {
        next.retryAttempts = "Between 0 and 10.";
      }
      if (!Number.isFinite(h) || h < 30 || h > 600) {
        next.healthCheckInterval = "Between 30 and 600 seconds.";
      }
    }
    if (step === 4) {
      const u = Number(draft.slaTargetUptime);
      const l = Number(draft.slaTargetLatencyMs);
      const s = Number(draft.slaTargetSuccessRate);
      if (!Number.isFinite(u) || u < 50 || u > 100) {
        next.slaTargetUptime = "Between 50 and 100.";
      }
      if (!Number.isFinite(l) || l < 50 || l > 60000) {
        next.slaTargetLatencyMs = "Between 50 and 60000 ms.";
      }
      if (!Number.isFinite(s) || s < 50 || s > 100) {
        next.slaTargetSuccessRate = "Between 50 and 100.";
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(draft.step)) return;
    setDraft({ ...draft, step: Math.min(STEPS.length, draft.step + 1) });
  };

  const handleBack = () => {
    setErrors({});
    setDraft({ ...draft, step: Math.max(1, draft.step - 1) });
  };

  const handleSubmit = () => {
    for (let s = 1; s <= 4; s += 1) {
      if (!validateStep(s)) {
        setDraft({ ...draft, step: s });
        return;
      }
    }
    onSave({
      name: draft.name.trim(),
      code: draft.code.trim().toUpperCase(),
      type: draft.type,
      environment: draft.environment,
      country: draft.country.trim() || "Ghana",
      currency: draft.currency.trim() || "GHS",
      baseUrl: draft.baseUrl.trim(),
      apiVersion: draft.apiVersion.trim(),
      priority: draft.priority,
      timeout: Number(draft.timeout),
      retryAttempts: Number(draft.retryAttempts),
      healthCheckInterval: Number(draft.healthCheckInterval),
      webhookEnabled: draft.webhookEnabled,
      statusPollingEnabled: draft.statusPollingEnabled,
      slaTargetUptime: Number(draft.slaTargetUptime),
      slaTargetLatencyMs: Number(draft.slaTargetLatencyMs),
      slaTargetSuccessRate: Number(draft.slaTargetSuccessRate),
    });
    onClose();
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Add provider"
      description={"Step " + draft.step + " of " + STEPS.length + " \u00B7 " + STEPS[draft.step - 1]}
      size="lg"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={handleBack} disabled={draft.step === 1}>
            Back
          </Button>
          {draft.step < STEPS.length ? (
            <Button size="sm" onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button size="sm" onClick={handleSubmit}>
              Create provider
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-4">
        {draft.step === 1 && (
          <>
            <SettingsField
              label="Provider name"
              htmlFor="add-name"
              required
              error={errors.name}
            >
              <Input
                id="add-name"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="e.g. DataHub"
                autoFocus
              />
            </SettingsField>
            <SettingsField
              label="Provider code"
              htmlFor="add-code"
              required
              hint="Short identifier. Must be unique across the platform."
              error={errors.code}
            >
              <Input
                id="add-code"
                value={draft.code}
                onChange={(e) => setDraft({ ...draft, code: e.target.value })}
                placeholder="e.g. PRV-0123"
              />
            </SettingsField>
            <div className="grid gap-3 sm:grid-cols-2">
              <SettingsField label="Type" htmlFor="add-type" required>
                <select
                  id="add-type"
                  className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                  value={draft.type}
                  onChange={(e) =>
                    setDraft({ ...draft, type: e.target.value as ProviderType })
                  }
                >
                  {ALL_PROVIDER_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {PROVIDER_TYPE_LABEL[t]}
                    </option>
                  ))}
                </select>
              </SettingsField>
              <SettingsField label="Priority" htmlFor="add-priority" required>
                <select
                  id="add-priority"
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
            </div>
          </>
        )}

        {draft.step === 2 && (
          <>
            <SettingsField
              label="Environment"
              htmlFor="add-env"
              required
              hint="Sandbox providers are excluded from routing by default."
            >
              <select
                id="add-env"
                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                value={draft.environment}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    environment: e.target.value as ProviderEnvironment,
                  })
                }
              >
                <option value="production">Production</option>
                <option value="sandbox">Sandbox</option>
              </select>
            </SettingsField>
            <div className="grid gap-3 sm:grid-cols-2">
              <SettingsField label="Country" htmlFor="add-country">
                <Input
                  id="add-country"
                  value={draft.country}
                  onChange={(e) =>
                    setDraft({ ...draft, country: e.target.value })
                  }
                />
              </SettingsField>
              <SettingsField label="Currency" htmlFor="add-currency">
                <Input
                  id="add-currency"
                  value={draft.currency}
                  onChange={(e) =>
                    setDraft({ ...draft, currency: e.target.value })
                  }
                />
              </SettingsField>
            </div>
            <SettingsField
              label="Base URL"
              htmlFor="add-url"
              hint="Leave blank for manual providers with no API."
              error={errors.baseUrl}
            >
              <Input
                id="add-url"
                value={draft.baseUrl}
                onChange={(e) =>
                  setDraft({ ...draft, baseUrl: e.target.value })
                }
                placeholder="https://api.example.com"
              />
            </SettingsField>
            <SettingsField label="API version" htmlFor="add-api-version">
              <Input
                id="add-api-version"
                value={draft.apiVersion}
                onChange={(e) =>
                  setDraft({ ...draft, apiVersion: e.target.value })
                }
              />
            </SettingsField>
          </>
        )}

        {draft.step === 3 && (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              <SettingsField
                label="Timeout (s)"
                htmlFor="add-timeout"
                error={errors.timeout}
              >
                <Input
                  id="add-timeout"
                  type="number"
                  value={draft.timeout}
                  onChange={(e) =>
                    setDraft({ ...draft, timeout: e.target.value })
                  }
                />
              </SettingsField>
              <SettingsField
                label="Retry attempts"
                htmlFor="add-retries"
                error={errors.retryAttempts}
              >
                <Input
                  id="add-retries"
                  type="number"
                  value={draft.retryAttempts}
                  onChange={(e) =>
                    setDraft({ ...draft, retryAttempts: e.target.value })
                  }
                />
              </SettingsField>
              <SettingsField
                label="Health interval (s)"
                htmlFor="add-health"
                error={errors.healthCheckInterval}
              >
                <Input
                  id="add-health"
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
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={draft.webhookEnabled}
                  onChange={(e) =>
                    setDraft({ ...draft, webhookEnabled: e.target.checked })
                  }
                  className="h-4 w-4"
                />
                Enable webhook
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
                  className="h-4 w-4"
                />
                Enable status polling
              </label>
            </div>
          </>
        )}

        {draft.step === 4 && (
          <div className="grid gap-3 sm:grid-cols-3">
            <SettingsField
              label="Target uptime (%)"
              htmlFor="add-sla-up"
              error={errors.slaTargetUptime}
            >
              <Input
                id="add-sla-up"
                type="number"
                step="0.1"
                value={draft.slaTargetUptime}
                onChange={(e) =>
                  setDraft({ ...draft, slaTargetUptime: e.target.value })
                }
              />
            </SettingsField>
            <SettingsField
              label="Target latency (ms)"
              htmlFor="add-sla-lat"
              error={errors.slaTargetLatencyMs}
            >
              <Input
                id="add-sla-lat"
                type="number"
                value={draft.slaTargetLatencyMs}
                onChange={(e) =>
                  setDraft({ ...draft, slaTargetLatencyMs: e.target.value })
                }
              />
            </SettingsField>
            <SettingsField
              label="Target success rate (%)"
              htmlFor="add-sla-sr"
              error={errors.slaTargetSuccessRate}
            >
              <Input
                id="add-sla-sr"
                type="number"
                step="0.1"
                value={draft.slaTargetSuccessRate}
                onChange={(e) =>
                  setDraft({ ...draft, slaTargetSuccessRate: e.target.value })
                }
              />
            </SettingsField>
          </div>
        )}

        {draft.step === 5 && (
          <div className="space-y-2 rounded-md border border-neutral-200 p-4 text-sm dark:border-neutral-800">
            <Review label="Name" value={draft.name} />
            <Review label="Code" value={draft.code} />
            <Review label="Type" value={PROVIDER_TYPE_LABEL[draft.type]} />
            <Review
              label="Environment"
              value={draft.environment === "production" ? "Production" : "Sandbox"}
            />
            <Review label="Country" value={draft.country} />
            <Review label="Currency" value={draft.currency} />
            <Review label="Base URL" value={draft.baseUrl || "\u2014"} />
            <Review label="API version" value={draft.apiVersion || "\u2014"} />
            <Review label="Priority" value={draft.priority} />
            <Review label="Timeout" value={draft.timeout + "s"} />
            <Review label="Retries" value={draft.retryAttempts} />
            <Review
              label="Health interval"
              value={draft.healthCheckInterval + "s"}
            />
            <Review
              label="Webhook"
              value={draft.webhookEnabled ? "Enabled" : "Disabled"}
            />
            <Review
              label="Status polling"
              value={draft.statusPollingEnabled ? "Enabled" : "Disabled"}
            />
            <Review
              label="SLA uptime"
              value={draft.slaTargetUptime + "%"}
            />
            <Review
              label="SLA latency"
              value={draft.slaTargetLatencyMs + "ms"}
            />
            <Review
              label="SLA success rate"
              value={draft.slaTargetSuccessRate + "%"}
            />
            <div className="mt-2 rounded-md bg-info-50 p-2 text-xs text-info-800 dark:bg-info-900/20 dark:text-info-200">
              New providers start disabled. Test the connection and enable them
              from the details page when ready.
            </div>
          </div>
        )}
      </div>
    </ModalShell>
  );
}

function Review({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-neutral-500 dark:text-neutral-400">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

/* ======================================================================
   Edit provider
   ====================================================================== */

interface EditProviderDialogProps {
  open: boolean;
  provider: Provider;
  onClose: () => void;
  onSave: (
    patch: Partial<
      Pick<
        Provider,
        | "name"
        | "code"
        | "type"
        | "country"
        | "currency"
        | "baseUrl"
        | "apiVersion"
        | "environment"
        | "priority"
      >
    >
  ) => void;
}

export function EditProviderDialog({
  open,
  provider,
  onClose,
  onSave,
}: EditProviderDialogProps) {
  const [name, setName] = useState(provider.name);
  const [code, setCode] = useState(provider.code);
  const [type, setType] = useState<ProviderType>(provider.type);
  const [country, setCountry] = useState(provider.country);
  const [currency, setCurrency] = useState(provider.currency);
  const [baseUrl, setBaseUrl] = useState(provider.baseUrl ?? "");
  const [apiVersion, setApiVersion] = useState(provider.apiVersion ?? "");
  const [environment, setEnvironment] = useState<ProviderEnvironment>(
    provider.environment
  );
  const [priority, setPriority] = useState<RoutingPriority>(provider.priority);
  const [confirmEnv, setConfirmEnv] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setName(provider.name);
    setCode(provider.code);
    setType(provider.type);
    setCountry(provider.country);
    setCurrency(provider.currency);
    setBaseUrl(provider.baseUrl ?? "");
    setApiVersion(provider.apiVersion ?? "");
    setEnvironment(provider.environment);
    setPriority(provider.priority);
    setConfirmEnv("");
    setErrors({});
  }, [open, provider]);

  const envChanged = environment !== provider.environment;
  const codeChanged = code.trim() !== provider.code;

  if (!open) return null;

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Enter a provider name.";
    if (!code.trim()) next.code = "Enter a provider code.";
    if (baseUrl.trim()) {
      try {
        const u = new URL(baseUrl.trim());
        if (environment === "production" && u.protocol !== "https:") {
          next.baseUrl = "Production providers must use https.";
        }
      } catch {
        next.baseUrl = "Enter a valid URL or leave blank.";
      }
    }
    if (envChanged && confirmEnv !== environment) {
      next.confirmEnv = "Type " + environment + " to confirm the environment change.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      type,
      country: country.trim(),
      currency: currency.trim(),
      baseUrl: baseUrl.trim(),
      apiVersion: apiVersion.trim(),
      environment,
      priority,
    });
    onClose();
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Edit provider"
      description={provider.name + " \u00B7 " + provider.code}
      size="lg"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave}>
            Save changes
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <SettingsField
            label="Provider name"
            htmlFor="edit-name"
            required
            error={errors.name}
          >
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </SettingsField>
          <SettingsField
            label="Provider code"
            htmlFor="edit-code"
            required
            hint={codeChanged ? "External systems reference this code." : undefined}
            error={errors.code}
          >
            <Input
              id="edit-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </SettingsField>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <SettingsField label="Type" htmlFor="edit-type">
            <select
              id="edit-type"
              className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              value={type}
              onChange={(e) => setType(e.target.value as ProviderType)}
            >
              {ALL_PROVIDER_TYPES.map((t) => (
                <option key={t} value={t}>
                  {PROVIDER_TYPE_LABEL[t]}
                </option>
              ))}
            </select>
          </SettingsField>
          <SettingsField label="Priority" htmlFor="edit-priority">
            <select
              id="edit-priority"
              className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              value={priority}
              onChange={(e) =>
                setPriority(e.target.value as RoutingPriority)
              }
            >
              <option value="primary">Primary</option>
              <option value="secondary">Secondary</option>
              <option value="fallback">Fallback</option>
            </select>
          </SettingsField>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <SettingsField label="Country" htmlFor="edit-country">
            <Input
              id="edit-country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
          </SettingsField>
          <SettingsField label="Currency" htmlFor="edit-currency">
            <Input
              id="edit-currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            />
          </SettingsField>
        </div>

        <SettingsField
          label="Base URL"
          htmlFor="edit-url"
          error={errors.baseUrl}
        >
          <Input
            id="edit-url"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
          />
        </SettingsField>
        <SettingsField label="API version" htmlFor="edit-api-version">
          <Input
            id="edit-api-version"
            value={apiVersion}
            onChange={(e) => setApiVersion(e.target.value)}
          />
        </SettingsField>

        <SettingsField
          label="Environment"
          htmlFor="edit-env"
          hint="Switching environment repoints live traffic. Confirm below."
        >
          <select
            id="edit-env"
            className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            value={environment}
            onChange={(e) =>
              setEnvironment(e.target.value as ProviderEnvironment)
            }
          >
            <option value="production">Production</option>
            <option value="sandbox">Sandbox</option>
          </select>
        </SettingsField>

        {envChanged && (
          <SettingsField
            label={"Type " + environment + " to confirm"}
            htmlFor="edit-env-confirm"
            required
            error={errors.confirmEnv}
          >
            <Input
              id="edit-env-confirm"
              value={confirmEnv}
              onChange={(e) => setConfirmEnv(e.target.value)}
              placeholder={environment}
            />
          </SettingsField>
        )}
      </div>
    </ModalShell>
  );
}

/* ======================================================================
   Test connection
   ====================================================================== */

interface TestProviderDialogProps {
  open: boolean;
  provider: Provider;
  onClose: () => void;
}

interface TestResult {
  api: "pass" | "warn" | "fail" | "skip";
  auth: "pass" | "warn" | "fail" | "skip";
  latency: "pass" | "warn" | "fail" | "skip";
  routing: "pass" | "warn" | "fail" | "skip";
  responseTime: number;
  timestamp: string;
}

export function TestProviderDialog({
  open,
  provider,
  onClose,
}: TestProviderDialogProps) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);

  useEffect(() => {
    if (!open) return;
    setResult(null);
    setRunning(true);
    const t = window.setTimeout(async () => {
      const { runProviderHealthCheck } = await import(
        "@/lib/admin/providers/health"
      );
      const run = await runProviderHealthCheck(provider);
      setResult({
        api: run.details.api,
        auth: run.details.auth,
        latency: run.details.latency,
        routing: run.details.routing,
        responseTime: run.responseTime,
        timestamp: run.timestamp,
      });
      setRunning(false);
    }, 900);
    return () => window.clearTimeout(t);
  }, [open, provider]);

  if (!open) return null;

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Test connection"
      description={provider.name + " \u00B7 " + provider.code}
      size="md"
      footer={
        <Button size="sm" onClick={onClose}>
          Close
        </Button>
      }
    >
      {running ? (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400"
        >
          <span className="h-3 w-3 animate-pulse rounded-full bg-brand-500" />
          Testing connection to {provider.name}...
        </div>
      ) : result ? (
        <div className="space-y-3" role="status" aria-live="polite">
          <ul role="list" className="space-y-2 text-sm">
            <TestRow label="API reachable" outcome={result.api} />
            <TestRow label="Authentication" outcome={result.auth} />
            <TestRow label="Latency within SLA" outcome={result.latency} />
            <TestRow label="Routing configured" outcome={result.routing} />
          </ul>
          {result.responseTime > 0 && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Measured response time {result.responseTime}ms
            </p>
          )}
        </div>
      ) : null}
    </ModalShell>
  );
}

function TestRow({
  label,
  outcome,
}: {
  label: string;
  outcome: "pass" | "warn" | "fail" | "skip";
}) {
  const variant: "success" | "warning" | "danger" | "neutral" =
    outcome === "pass"
      ? "success"
      : outcome === "warn"
      ? "warning"
      : outcome === "fail"
      ? "danger"
      : "neutral";
  return (
    <li className="flex items-center justify-between gap-2">
      <span>{label}</span>
      <Badge variant={variant} size="sm">
        {outcome === "pass"
          ? "Pass"
          : outcome === "warn"
          ? "Warn"
          : outcome === "fail"
          ? "Fail"
          : "Skipped"}
      </Badge>
    </li>
  );
}

/* ======================================================================
   Maintenance
   ====================================================================== */

interface MaintenanceDialogProps {
  open: boolean;
  provider: Provider;
  onClose: () => void;
  onConfirm: (input: { until: string; reason: string }) => void;
}

export function MaintenanceDialog({
  open,
  provider,
  onClose,
  onConfirm,
}: MaintenanceDialogProps) {
  const { categories: catalog } = useCatalog();
  const [reason, setReason] = useState("");
  const [duration, setDuration] = useState<number>(
    MAINTENANCE_DURATION_OPTIONS[1].value
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setReason("");
    setDuration(MAINTENANCE_DURATION_OPTIONS[1].value);
    setError(null);
  }, [open]);

  const affected = useMemo(
    () => affectedPlans(provider, catalog),
    [provider, catalog]
  );

  if (!open) return null;

  const handleSubmit = () => {
    const trimmed = reason.trim();
    if (!trimmed) {
      setError("Enter a reason for maintenance.");
      return;
    }
    const until = new Date(Date.now() + duration * 60_000).toISOString();
    onConfirm({ until, reason: trimmed });
    onClose();
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Set maintenance mode"
      description={provider.name + " will be excluded from routing for the window below."}
      size="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit}>
            Start maintenance
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <SettingsField
          label="Duration"
          htmlFor="maint-duration"
          required
        >
          <select
            id="maint-duration"
            className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
          >
            {MAINTENANCE_DURATION_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </SettingsField>

        <SettingsField
          label="Reason"
          htmlFor="maint-reason"
          required
          error={error ?? undefined}
        >
          <Input
            id="maint-reason"
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setError(null);
            }}
            placeholder="e.g. Vendor integration upgrade"
            autoFocus
          />
        </SettingsField>

        {affected.length > 0 && (
          <div className="rounded-md border border-warning-200 bg-warning-50 p-3 text-xs dark:border-warning-800 dark:bg-warning-900/20">
            <p className="font-medium text-warning-900 dark:text-warning-100">
              {affected.length} plan{affected.length === 1 ? "" : "s"} will
              route away from this provider
            </p>
            <p className="mt-1 text-warning-800 dark:text-warning-200">
              {provider.failover.destinationProviderId
                ? "Traffic fails over to the configured destination."
                : "No failover destination configured."}
            </p>
          </div>
        )}
      </div>
    </ModalShell>
  );
}

/* ======================================================================
   Disable
   ====================================================================== */

interface DisableProviderDialogProps {
  open: boolean;
  provider: Provider;
  onClose: () => void;
  onConfirm: () => void;
}

export function DisableProviderDialog({
  open,
  provider,
  onClose,
  onConfirm,
}: DisableProviderDialogProps) {
  const { categories: catalog } = useCatalog();

  const affected = useMemo(
    () => affectedPlans(provider, catalog),
    [provider, catalog]
  );

  if (!open) return null;

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Disable provider"
      description={provider.name + " will stop receiving traffic immediately."}
      size="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Disable provider
          </Button>
        </>
      }
    >
      <div className="space-y-3 text-sm">
        <div className="rounded-md border border-neutral-200 p-3 dark:border-neutral-800">
          <Row label="Transactions today" value={String(provider.transactionCountToday)} />
          <Row label="Services" value={String(provider.services.length)} />
          <Row label="Plans affected" value={String(affected.length)} />
          <Row
            label="Failover destination"
            value={
              provider.failover.destinationProviderId ?? "None configured"
            }
          />
        </div>
        {!provider.failover.destinationProviderId && affected.length > 0 && (
          <div className="rounded-md border border-danger-200 bg-danger-50 p-3 text-xs text-danger-800 dark:border-danger-800 dark:bg-danger-900/20 dark:text-danger-200">
            No failover destination is set. Affected plans will fail until the
            provider is re-enabled.
          </div>
        )}
      </div>
    </ModalShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-neutral-500 dark:text-neutral-400">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

/* ======================================================================
   Rotate credentials
   ====================================================================== */

interface RotateCredentialsDialogProps {
  open: boolean;
  provider: Provider;
  onClose: () => void;
  onConfirm: () => void;
}

export function RotateCredentialsDialog({
  open,
  provider,
  onClose,
  onConfirm,
}: RotateCredentialsDialogProps) {
  const [typed, setTyped] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setTyped("");
    setAcknowledged(false);
    setError(null);
  }, [open]);

  if (!open) return null;

  const matches = typed.trim() === provider.code;

  const handleSubmit = () => {
    if (!matches) {
      setError("Type " + provider.code + " to confirm.");
      return;
    }
    if (!acknowledged) {
      setError("Confirm that downstream systems are ready for the new keys.");
      return;
    }
    onConfirm();
    onClose();
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Rotate credentials"
      description={provider.name + " will receive new API keys immediately."}
      size="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleSubmit}
            disabled={!matches || !acknowledged}
          >
            Rotate now
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-md border border-danger-200 bg-danger-50 p-3 text-xs text-danger-800 dark:border-danger-800 dark:bg-danger-900/20 dark:text-danger-200">
          The current API key and secret stop working the moment you confirm.
          Any live integrations using them will fail until updated.
        </div>

        <SettingsField
          label={"Type " + provider.code + " to confirm"}
          htmlFor="rotate-confirm"
          required
          error={error ?? undefined}
        >
          <Input
            id="rotate-confirm"
            value={typed}
            onChange={(e) => {
              setTyped(e.target.value);
              setError(null);
            }}
            placeholder={provider.code}
            autoFocus
          />
        </SettingsField>

        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(e) => {
              setAcknowledged(e.target.checked);
              setError(null);
            }}
            className="mt-0.5 h-4 w-4"
          />
          <span>
            I have coordinated with downstream teams. The receiving systems are
            ready to accept the new keys.
          </span>
        </label>
      </div>
    </ModalShell>
  );
}

/* ======================================================================
   Update credentials
   ====================================================================== */

interface UpdateCredentialsDialogProps {
  open: boolean;
  provider: Provider;
  onClose: () => void;
  onSave: (input: {
    hasApiKey: boolean;
    hasSecret: boolean;
    accountId: string;
  }) => void;
}

export function UpdateCredentialsDialog({
  open,
  provider,
  onClose,
  onSave,
}: UpdateCredentialsDialogProps) {
  const [apiKey, setApiKey] = useState("");
  const [secret, setSecret] = useState("");
  const [accountId, setAccountId] = useState(provider.credentials.accountId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setApiKey("");
    setSecret("");
    setAccountId(provider.credentials.accountId);
    setError(null);
  }, [open, provider]);

  if (!open) return null;

  const hasApiKey = apiKey.trim().length > 0 || provider.credentials.hasApiKey;
  const hasSecret = secret.trim().length > 0 || provider.credentials.hasSecret;
  const accountIdChanged = accountId.trim() !== provider.credentials.accountId;
  const anyChange =
    apiKey.trim().length > 0 ||
    secret.trim().length > 0 ||
    accountIdChanged;

  const handleSubmit = () => {
    if (!anyChange) {
      setError("Enter a new value for at least one field.");
      return;
    }
    if (!hasApiKey || !hasSecret) {
      setError("Both API key and secret must be present after saving.");
      return;
    }
    onSave({
      hasApiKey,
      hasSecret,
      accountId: accountId.trim(),
    });
    onClose();
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Update credentials"
      description={provider.name + " \u00B7 existing values are never displayed."}
      size="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={!anyChange}>
            Save changes
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Leave a field blank to keep the existing value. Enter a new value to
          replace it.
        </p>

        <SettingsField
          label="API key"
          htmlFor="creds-apikey"
          hint={
            provider.credentials.hasApiKey
              ? "Currently set. Enter a new key to replace it."
              : "Not set. Required."
          }
        >
          <Input
            id="creds-apikey"
            type="password"
            autoComplete="new-password"
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value);
              setError(null);
            }}
            placeholder={provider.credentials.hasApiKey ? "Leave blank to keep" : "Enter key"}
          />
        </SettingsField>

        <SettingsField
          label="Secret"
          htmlFor="creds-secret"
          hint={
            provider.credentials.hasSecret
              ? "Currently set. Enter a new secret to replace it."
              : "Not set. Required."
          }
        >
          <Input
            id="creds-secret"
            type="password"
            autoComplete="new-password"
            value={secret}
            onChange={(e) => {
              setSecret(e.target.value);
              setError(null);
            }}
            placeholder={provider.credentials.hasSecret ? "Leave blank to keep" : "Enter secret"}
          />
        </SettingsField>

        <SettingsField label="Account ID" htmlFor="creds-accountid">
          <Input
            id="creds-accountid"
            value={accountId}
            onChange={(e) => {
              setAccountId(e.target.value);
              setError(null);
            }}
          />
        </SettingsField>

        {error && (
          <p
            role="alert"
            className="rounded-md border border-danger-200 bg-danger-50 p-2 text-xs text-danger-800 dark:border-danger-800/60 dark:bg-danger-900/25 dark:text-danger-200"
          >
            {error}
          </p>
        )}
      </div>
    </ModalShell>
  );
}

