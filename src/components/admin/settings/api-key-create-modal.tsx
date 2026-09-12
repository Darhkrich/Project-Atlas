// components/admin/settings/api-key-create-modal.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { ModalShell } from "@/components/admin/ui/model-shell";
import { SettingsField } from "@/components/admin/ui/settings-field";
import type { ApiKey } from "@/lib/admin/types/settings";

interface ApiKeyCreateModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (key: ApiKey) => void;
}

function generateKeyPreview(): string {
  const suffix = Math.random().toString(36).slice(2, 6);
  return `ak_live_•••••••${suffix}`;
}

function generateFullKey(): string {
  const body = Array.from({ length: 24 }, () =>
    Math.random().toString(36).charAt(2)
  ).join("");
  return `ak_live_${body}`;
}

export function ApiKeyCreateModal({
  open,
  onClose,
  onCreate,
}: ApiKeyCreateModalProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ key: ApiKey; full: string } | null>(
    null
  );
  const [copied, setCopied] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  const reset = () => {
    setName("");
    setError(null);
    setCreated(null);
    setCopied(false);
    setAcknowledged(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleGenerate = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Enter a name for this key.");
      return;
    }
    const id = crypto.randomUUID();
    const full = generateFullKey();
    const apiKey: ApiKey = {
      id,
      name: trimmed,
      keyPreview: generateKeyPreview(),
      createdAt: new Date().toISOString(),
      status: "active",
    };
    onCreate(apiKey);
    setCreated({ key: apiKey, full });
    setError(null);
  };

  const handleCopy = async () => {
    if (!created) return;
    try {
      await navigator.clipboard.writeText(created.full);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <ModalShell
      open={open}
      onClose={handleClose}
      title={created ? "Copy your new API key" : "Generate new API key"}
      description={
        created
          ? "This is the only time you will see the full key. Store it somewhere safe before closing."
          : "Keys identify your integrations to Atlas. Use a name that tells you where this key is used."
      }
      size="md"
      footer={
        created ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={!acknowledged}
            >
              Close
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" size="sm" onClick={handleClose}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleGenerate}>
              Generate key
            </Button>
          </>
        )
      }
    >
      {created ? (
        <div className="space-y-4">
          <SettingsField label="Key name" htmlFor="api-key-name-readonly">
            <Input id="api-key-name-readonly" value={created.key.name} readOnly />
          </SettingsField>

          <SettingsField
            label="Full key"
            htmlFor="api-key-value"
            hint="Copy this value now. Atlas cannot show it again."
          >
            <div className="flex items-center gap-2">
              <Input
                id="api-key-value"
                value={created.full}
                readOnly
                className="font-mono text-xs"
                onFocus={(e) => e.currentTarget.select()}
              />
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </SettingsField>

          <label className="flex items-start gap-2 rounded-md border border-warning-200 bg-warning-50 p-3 text-xs text-warning-900 dark:border-warning-800/60 dark:bg-warning-900/25 dark:text-warning-100">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="mt-0.5 h-4 w-4"
            />
            <span>
              I have saved this key. I understand it cannot be shown again.
            </span>
          </label>
        </div>
      ) : (
        <div className="space-y-4">
          <SettingsField
            label="Key name"
            htmlFor="api-key-name"
            error={error ?? undefined}
            required
          >
            <Input
              id="api-key-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Production integration"
              autoFocus
            />
          </SettingsField>

          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            The key will be scoped to this environment and can be revoked at
            any time from this page.
          </p>
        </div>
      )}
    </ModalShell>
  );
}