/* eslint-disable react-hooks/set-state-in-effect */
// components/admin/services/service-action-modals.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { ModalShell } from "@/components/admin/ui/model-shell";
import { SettingsField } from "@/components/admin/ui/settings-field";
import type { ServiceCategory } from "@/lib/services-page-data";
import {
  buildPlanId,
  isUniqueId,
  slugify,
} from "@/lib/admin/services/helpers";

/* ------------------------ Delete --------------------------------------- */

interface ServiceDeleteModalProps {
  open: boolean;
  service: ServiceCategory | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function ServiceDeleteModal({
  open,
  service,
  onClose,
  onConfirm,
}: ServiceDeleteModalProps) {
  const [typed, setTyped] = useState("");

  useEffect(() => {
    if (!open) setTyped("");
  }, [open]);

  if (!open || !service) return null;

  const matches = typed.trim() === service.name;

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={`Delete "${service.name}"?`}
      description="This removes the service and its form configuration from the admin catalog. Customer-facing pages that reference this service will break until the catalog is republished."
      size="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            disabled={!matches}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Delete service
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-md border border-danger-200 bg-danger-50 p-3 text-xs dark:border-danger-800/60 dark:bg-danger-900/25">
          <p className="font-medium text-danger-800 dark:text-danger-200">
            This action cannot be undone.
          </p>
          <p className="mt-1 text-danger-700 dark:text-danger-300">
            The service will be removed from the admin catalog immediately.
          </p>
        </div>

        <SettingsField
          label={`Type "${service.name}" to confirm`}
          htmlFor="service-delete-confirm"
          required
        >
          <Input
            id="service-delete-confirm"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={service.name}
            autoComplete="off"
          />
        </SettingsField>
      </div>
    </ModalShell>
  );
}

/* ------------------------ Duplicate ------------------------------------ */

export interface DuplicateResult {
  newName: string;
  newId: string;
}

interface ServiceDuplicateModalProps {
  open: boolean;
  service: ServiceCategory | null;
  existingIds: string[];
  onClose: () => void;
  onConfirm: (result: DuplicateResult) => void;
}

export function ServiceDuplicateModal({
  open,
  service,
  existingIds,
  onClose,
  onConfirm,
}: ServiceDuplicateModalProps) {
  const [name, setName] = useState("");
  const [id, setId] = useState("");
  const [idTouched, setIdTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !service) return;
    const defaultName = `${service.name} Copy`;
    setName(defaultName);
    setId(slugify(defaultName));
    setIdTouched(false);
    setError(null);
  }, [open, service]);

  if (!open || !service) return null;

  const handleNameChange = (value: string) => {
    setName(value);
    if (!idTouched) {
      setId(slugify(value));
    }
  };

  const handleSubmit = () => {
    const trimmedName = name.trim();
    const trimmedId = id.trim();

    if (!trimmedName) {
      setError("Enter a name for the duplicate.");
      return;
    }
    if (!trimmedId) {
      setError("Enter an ID for the duplicate.");
      return;
    }
    if (!isUniqueId(existingIds.map((existingId) => ({ id: existingId }) as ServiceCategory), trimmedId)) {
      setError("That ID is already in use.");
      return;
    }

    onConfirm({ newName: trimmedName, newId: trimmedId });
    onClose();
  };

  const previewPlans = (service.formConfig?.plans ?? []).map((p) => ({
    id: buildPlanId(p.name),
    name: p.name,
    price: p.price,
  }));

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={`Duplicate "${service.name}"`}
      description="A copy of the service is created with a new ID. It starts inactive so you can review before publishing."
      size="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit}>
            Create duplicate
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <SettingsField label="Name" htmlFor="service-dup-name" required>
          <Input
            id="service-dup-name"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
          />
        </SettingsField>

        <SettingsField
          label="ID"
          htmlFor="service-dup-id"
          required
          hint="Used by the storefront to reference this service. Lowercase letters, numbers, and hyphens only."
        >
          <Input
            id="service-dup-id"
            value={id}
            onChange={(e) => {
              setId(slugify(e.target.value));
              setIdTouched(true);
              setError(null);
            }}
          />
        </SettingsField>

        {previewPlans.length > 0 && (
          <div className="rounded-md border border-neutral-200 p-3 text-xs dark:border-neutral-700">
            <p className="font-medium text-neutral-700 dark:text-neutral-300">
              {previewPlans.length} plan
              {previewPlans.length === 1 ? "" : "s"} will be copied
            </p>
            <p className="mt-1 text-neutral-500 dark:text-neutral-400">
              Plan IDs are regenerated to avoid collisions with the original.
            </p>
          </div>
        )}

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

/* ------------------------ Bulk toggle ---------------------------------- */

interface ServiceBulkToggleModalProps {
  open: boolean;
  mode: "enable" | "disable";
  serviceNames: string[];
  onClose: () => void;
  onConfirm: () => void;
}

export function ServiceBulkToggleModal({
  open,
  mode,
  serviceNames,
  onClose,
  onConfirm,
}: ServiceBulkToggleModalProps) {
  if (!open) return null;

  const count = serviceNames.length;
  const noun = count === 1 ? "service" : "services";
  const isEnable = mode === "enable";

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={isEnable ? `Enable ${count} ${noun}?` : `Disable ${count} ${noun}?`}
      description={
        isEnable
          ? "Enabled services appear on the storefront immediately after the catalog is republished."
          : "Disabled services are hidden from the storefront. Existing orders and transaction history are unaffected."
      }
      size="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={isEnable ? "primary" : "destructive"}
            size="sm"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {isEnable ? "Enable" : "Disable"} {count}
          </Button>
        </>
      }
    >
      <ul className="space-y-1 text-sm text-neutral-700 dark:text-neutral-300">
        {serviceNames.map((name) => (
          <li key={name} className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" aria-hidden="true" />
            {name}
          </li>
        ))}
      </ul>
    </ModalShell>
  );
}