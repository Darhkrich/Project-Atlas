// components/admin/settings/webhook-create-modal.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { ModalShell } from "@/components/admin/ui/model-shell";
import { SettingsField } from "@/components/admin/ui/settings-field";
import type { Webhook } from "@/lib/admin/types/settings";

interface WebhookCreateModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (webhook: Webhook) => void;
  existingEvents: string[];
}

const KNOWN_EVENTS = [
  "order.placed",
  "order.fulfilled",
  "order.failed",
  "payment.received",
  "payment.failed",
  "wallet.credited",
  "wallet.debited",
  "reseller.commission.credited",
  "merchant.subscription.renewed",
  "merchant.subscription.past_due",
];

export function WebhookCreateModal({
  open,
  onClose,
  onCreate,
  existingEvents,
}: WebhookCreateModalProps) {
  const [event, setEvent] = useState("");
  const [url, setUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setEvent("");
    setUrl("");
    setSecret("");
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleCreate = () => {
    const trimmedEvent = event.trim();
    const trimmedUrl = url.trim();

    if (!trimmedEvent) {
      setError("Choose an event to subscribe to.");
      return;
    }
    if (existingEvents.includes(trimmedEvent)) {
      setError("A webhook is already subscribed to this event.");
      return;
    }
    if (!trimmedUrl) {
      setError("Enter the URL that should receive the event.");
      return;
    }
    try {
      new URL(trimmedUrl);
    } catch {
      setError("The URL is not valid. Include https:// or http://.");
      return;
    }

    onCreate({
      id: crypto.randomUUID(),
      event: trimmedEvent,
      url: trimmedUrl,
      enabled: true,
      secretSet: Boolean(secret.trim()),
    });
    reset();
    onClose();
  };

  return (
    <ModalShell
      open={open}
      onClose={handleClose}
      title="Add webhook"
      description="Atlas will POST a signed JSON payload to your URL whenever the chosen event fires."
      size="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={handleClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleCreate}>
            Add webhook
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <SettingsField
          label="Event"
          htmlFor="webhook-event"
          required
          hint="Only one event per webhook."
        >
          <select
            id="webhook-event"
            className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            value={event}
            onChange={(e) => {
              setEvent(e.target.value);
              setError(null);
            }}
          >
            <option value="">Choose an event…</option>
            {KNOWN_EVENTS.map((evt) => (
              <option key={evt} value={evt} disabled={existingEvents.includes(evt)}>
                {evt}
                {existingEvents.includes(evt) ? " (already subscribed)" : ""}
              </option>
            ))}
          </select>
        </SettingsField>

        <SettingsField
          label="URL"
          htmlFor="webhook-url"
          required
          hint="Must include the scheme. Atlas will retry on 5xx responses."
        >
          <Input
            id="webhook-url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError(null);
            }}
            placeholder="https://integrations.example.com/atlas"
          />
        </SettingsField>

        <SettingsField
          label="Signing secret"
          htmlFor="webhook-secret"
          hint="Optional. Used to sign payloads. Stored server-side and not shown again."
        >
          <Input
            id="webhook-secret"
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="At least 16 characters"
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