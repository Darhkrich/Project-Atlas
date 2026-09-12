// components/admin/settings/tabs/integration-tabs.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Badge } from "@/components/admin/ui/badge";
import { SettingsField } from "@/components/admin/ui/settings-field";
import { useNow } from "@/lib/admin/hooks/use-now";
import { formatAbsolute, formatRelative } from "@/lib/admin/support/format";
import {
  ALL_SECTIONS,
  PROCESSING_TIME_OPTIONS,
  SECTION_LABEL,
} from "@/lib/admin/settings/constant";
import type {
  ApiKey,
  AtlasSection,
  PaymentMethodConfig,
  PaymentGatewaySettings,
  WalletWithdrawalSettings,
  Webhook,
  WebhookSettings,
} from "@/lib/admin/types/settings";

const selectClass =
  "h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100";

/* ------------------------------ API keys -------------------------------- */

interface ApiTabProps {
  keys: ApiKey[];
  onGenerate: () => void;
  onRevoke: (id: string) => void;
}

export function ApiTab({ keys, onGenerate, onRevoke }: ApiTabProps) {
  const now = useNow();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <div>
          <CardTitle>API keys</CardTitle>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Keys identify integrations to Atlas. Treat them like passwords.
          </p>
        </div>
        <Button size="sm" onClick={onGenerate}>
          Generate new key
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {keys.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No keys yet. Generate one to get started.
          </p>
        ) : (
          keys.map((key) => (
            <div
              key={key.id}
              className="flex flex-wrap items-start justify-between gap-3 rounded-md border border-neutral-200 p-3 dark:border-neutral-700"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {key.name}
                </p>
                <p className="mt-0.5 font-mono text-xs text-neutral-500 dark:text-neutral-400">
                  {key.keyPreview}
                </p>
                <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
                  Created{" "}
                  <time dateTime={key.createdAt} title={formatAbsolute(key.createdAt)}>
                    {formatRelative(key.createdAt, now)}
                  </time>
                  {key.lastUsedAt && (
                    <>
                      {" · Last used "}
                      <time
                        dateTime={key.lastUsedAt}
                        title={formatAbsolute(key.lastUsedAt)}
                      >
                        {formatRelative(key.lastUsedAt, now)}
                      </time>
                    </>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={key.status === "active" ? "success" : "neutral"}>
                  {key.status === "active" ? "Active" : "Revoked"}
                </Badge>
                {key.status === "active" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRevoke(key.id)}
                  >
                    Revoke
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

/* ------------------------------ Payments -------------------------------- */

interface PaymentsTabProps {
  value: PaymentGatewaySettings;
  onToggleMethod: (id: string, enabled: boolean) => void;
  onConfigureMethod: (method: PaymentMethodConfig) => void;
}

export function PaymentsTab({
  value,
  onToggleMethod,
  onConfigureMethod,
}: PaymentsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment gateway</CardTitle>
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          Fees are applied at checkout. Per-section visibility controls where
          each method is offered.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {value.methods.map((method) => (
          <div
            key={method.id}
            className="rounded-md border border-neutral-200 p-3 dark:border-neutral-700"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {method.name}
                </p>
                <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                  Fee: {method.feePercent}% + {method.fixedFee} GHS
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {method.sections.map((section) => (
                    <Badge key={section} variant="brand" size="sm">
                      {SECTION_LABEL[section]}
                    </Badge>
                  ))}
                </div>
                <p className="mt-2 text-xs text-neutral-400 dark:text-neutral-500">
                  {method.secretSet
                    ? `Credentials stored server-side${
                        method.secretLastUpdatedAt
                          ? ` · updated ${new Date(
                              method.secretLastUpdatedAt
                            ).toLocaleDateString("en-GH")}`
                          : ""
                      }`
                    : "No credentials configured"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-sm">
                  <input
                    type="checkbox"
                    checked={method.enabled}
                    onChange={(e) =>
                      onToggleMethod(method.id, e.target.checked)
                    }
                    className="h-4 w-4"
                  />
                  Enabled
                </label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onConfigureMethod(method)}
                >
                  Configure
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

interface PaymentMethodConfigModalProps {
  method: PaymentMethodConfig | null;
  onClose: () => void;
  onSave: (method: PaymentMethodConfig) => void;
}

export function PaymentMethodConfigModal({
  method,
  onClose,
  onSave,
}: PaymentMethodConfigModalProps) {
  const [local, setLocal] = useState<PaymentMethodConfig | null>(method);
  const [secretInput, setSecretInput] = useState("");
  const [apiKeyInput, setApiKeyInput] = useState("");

  if (!method || !local) return null;

  const toggleSection = (section: AtlasSection) => {
    const next = local.sections.includes(section)
      ? local.sections.filter((s) => s !== section)
      : [...local.sections, section];
    setLocal({ ...local, sections: next });
  };

  const handleSave = () => {
    const merged: PaymentMethodConfig = {
      ...local,
      apiKeyPreview: apiKeyInput
        ? `${apiKeyInput.slice(0, 4)}••••••${apiKeyInput.slice(-4)}`
        : local.apiKeyPreview,
      secretSet: secretInput ? true : local.secretSet,
      secretLastUpdatedAt: secretInput
        ? new Date().toISOString()
        : local.secretLastUpdatedAt,
    };
    onSave(merged);
    setSecretInput("");
    setApiKeyInput("");
  };

  const handleClose = () => {
    setSecretInput("");
    setApiKeyInput("");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-config-title"
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-lg overflow-hidden rounded-lg bg-white shadow-xl dark:bg-neutral-900">
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
          <h3
            id="payment-config-title"
            className="text-base font-semibold"
          >
            Configure {method.name}
          </h3>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            Close
          </Button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <SettingsField label="Fee (%)" htmlFor="payment-fee-percent">
                <Input
                  id="payment-fee-percent"
                  type="number"
                  min={0}
                  step={0.1}
                  value={local.feePercent}
                  onChange={(e) =>
                    setLocal({
                      ...local,
                      feePercent: Number(e.target.value),
                    })
                  }
                />
              </SettingsField>
              <SettingsField label="Fixed fee (GHS)" htmlFor="payment-fee-fixed">
                <Input
                  id="payment-fee-fixed"
                  type="number"
                  min={0}
                  step={0.01}
                  value={local.fixedFee}
                  onChange={(e) =>
                    setLocal({
                      ...local,
                      fixedFee: Number(e.target.value),
                    })
                  }
                />
              </SettingsField>
            </div>

            <div>
              <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                Offered in sections
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {ALL_SECTIONS.map((section) => (
                  <label
                    key={section}
                    className="flex items-center gap-2 rounded-md border border-neutral-200 p-2 text-xs dark:border-neutral-700"
                  >
                    <input
                      type="checkbox"
                      checked={local.sections.includes(section)}
                      onChange={() => toggleSection(section)}
                      className="h-4 w-4"
                    />
                    {SECTION_LABEL[section]}
                  </label>
                ))}
              </div>
            </div>

            <SettingsField
              label="API key"
              htmlFor="payment-api-key"
              hint={
                method.apiKeyPreview
                  ? `Stored: ${method.apiKeyPreview}. Enter a new value to replace it.`
                  : "Not set."
              }
            >
              <Input
                id="payment-api-key"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="Leave blank to keep the current key"
                autoComplete="off"
              />
            </SettingsField>

            <SettingsField
              label="Secret"
              htmlFor="payment-secret"
              hint={
                method.secretSet
                  ? "A secret is already set. Enter a new value to replace it."
                  : "Not set."
              }
            >
              <Input
                id="payment-secret"
                type="password"
                value={secretInput}
                onChange={(e) => setSecretInput(e.target.value)}
                placeholder="Leave blank to keep the current secret"
                autoComplete="new-password"
              />
            </SettingsField>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-neutral-200 px-5 py-3 dark:border-neutral-800">
          <Button variant="outline" size="sm" onClick={handleClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}



interface WalletTabProps {
  value: WalletWithdrawalSettings;
  onChange: (patch: Partial<WalletWithdrawalSettings>) => void;
}

export function WalletTab({ value, onChange }: WalletTabProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Withdrawal rules</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SettingsField
            label="Auto-approve threshold (GHS)"
            htmlFor="wallet-auto-approve"
            hint="Withdrawals below this amount skip manual review."
          >
            <Input
              id="wallet-auto-approve"
              type="number"
              min={0}
              value={value.autoApproveThreshold}
              onChange={(e) =>
                onChange({ autoApproveThreshold: Number(e.target.value) })
              }
            />
          </SettingsField>

          <SettingsField
            label="Minimum balance to withdraw (GHS)"
            htmlFor="wallet-min-balance"
          >
            <Input
              id="wallet-min-balance"
              type="number"
              min={0}
              value={value.minBalanceToWithdraw}
              onChange={(e) =>
                onChange({ minBalanceToWithdraw: Number(e.target.value) })
              }
            />
          </SettingsField>

          <SettingsField
            label="Daily limit (GHS)"
            htmlFor="wallet-daily"
          >
            <Input
              id="wallet-daily"
              type="number"
              min={0}
              value={value.dailyWithdrawalLimit}
              onChange={(e) =>
                onChange({ dailyWithdrawalLimit: Number(e.target.value) })
              }
            />
          </SettingsField>

          <SettingsField
            label="Monthly limit (GHS)"
            htmlFor="wallet-monthly"
          >
            <Input
              id="wallet-monthly"
              type="number"
              min={0}
              value={value.monthlyWithdrawalLimit}
              onChange={(e) =>
                onChange({ monthlyWithdrawalLimit: Number(e.target.value) })
              }
            />
          </SettingsField>

          <SettingsField
            label="Processing time"
            htmlFor="wallet-processing"
            hint="Instant sends within minutes; T+1 settles the next business day."
          >
            <select
              id="wallet-processing"
              className={selectClass}
              value={value.processingTime}
              onChange={(e) =>
                onChange({
                  processingTime: e.target
                    .value as WalletWithdrawalSettings["processingTime"],
                })
              }
            >
              {PROCESSING_TIME_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </SettingsField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Per-section overrides</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Atlas sections can have stricter or looser thresholds than the
            platform default.
          </p>

          {(["resellers", "ecommerce"] as const).map((section) => {
            const override = value.perSectionOverrides?.[section] ?? {};
            return (
              <div
                key={section}
                className="rounded-md border border-neutral-200 p-3 dark:border-neutral-700"
              >
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {SECTION_LABEL[section]}
                </p>
                <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <SettingsField
                    label="Auto-approve threshold (GHS)"
                    htmlFor={`wallet-${section}-auto`}
                  >
                    <Input
                      id={`wallet-${section}-auto`}
                      type="number"
                      min={0}
                      value={override.autoApproveThreshold ?? ""}
                      onChange={(e) =>
                        onChange({
                          perSectionOverrides: {
                            ...value.perSectionOverrides,
                            [section]: {
                              ...override,
                              autoApproveThreshold: e.target.value
                                ? Number(e.target.value)
                                : undefined,
                            },
                          },
                        })
                      }
                    />
                  </SettingsField>
                  <SettingsField
                    label="Daily limit (GHS)"
                    htmlFor={`wallet-${section}-daily`}
                  >
                    <Input
                      id={`wallet-${section}-daily`}
                      type="number"
                      min={0}
                      value={override.dailyLimit ?? ""}
                      onChange={(e) =>
                        onChange({
                          perSectionOverrides: {
                            ...value.perSectionOverrides,
                            [section]: {
                              ...override,
                              dailyLimit: e.target.value
                                ? Number(e.target.value)
                                : undefined,
                            },
                          },
                        })
                      }
                    />
                  </SettingsField>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}



interface WebhooksTabProps {
  value: WebhookSettings;
  onAdd: () => void;
  onToggle: (id: string, enabled: boolean) => void;
  onRemove: (id: string) => void;
  testResult: { id: string; status: "success" | "failed" } | null;
  onTest: (webhook: Webhook) => void;
}

export function WebhooksTab({
  value,
  onAdd,
  onToggle,
  onRemove,
  testResult,
  onTest,
}: WebhooksTabProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <div>
          <CardTitle>Webhooks</CardTitle>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Atlas POSTs signed JSON to these URLs when the subscribed events
            fire.
          </p>
        </div>
        <Button size="sm" onClick={onAdd}>
          Add webhook
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {value.webhooks.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No webhooks configured.
          </p>
        ) : (
          value.webhooks.map((webhook) => {
            const isTesting = testResult?.id === webhook.id;
            return (
              <div
                key={webhook.id}
                className="flex flex-wrap items-start justify-between gap-3 rounded-md border border-neutral-200 p-3 dark:border-neutral-700"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {webhook.event}
                    </p>
                    <Badge
                      variant={webhook.enabled ? "success" : "neutral"}
                      size="sm"
                    >
                      {webhook.enabled ? "Enabled" : "Disabled"}
                    </Badge>
                    {webhook.secretSet && (
                      <Badge variant="brand" size="sm">
                        Signed
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 truncate font-mono text-xs text-neutral-500 dark:text-neutral-400">
                    {webhook.url}
                  </p>
                  {isTesting && testResult && (
                    <p
                      role="status"
                      aria-live="polite"
                      className={`mt-1 text-xs ${
                        testResult.status === "success"
                          ? "text-success-700 dark:text-success-300"
                          : "text-danger-700 dark:text-danger-300"
                      }`}
                    >
                      Test {testResult.status === "success" ? "succeeded" : "failed"}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <label className="flex items-center gap-1.5 text-xs">
                    <input
                      type="checkbox"
                      checked={webhook.enabled}
                      onChange={(e) => onToggle(webhook.id, e.target.checked)}
                      className="h-4 w-4"
                    />
                    Enabled
                  </label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onTest(webhook)}
                  >
                    Test
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(webhook.id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}