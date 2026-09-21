/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import type { StorefrontDomain } from "@/lib/domains/types";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { ModalShell } from "@/components/admin/ui/model-shell";
import { SettingsField } from "@/components/admin/ui/settings-field";

interface DomainRemoveModalProps {
  open: boolean;
  domain: StorefrontDomain | null;
  storefrontName: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function DomainRemoveModal({
  open,
  domain,
  storefrontName,
  onClose,
  onConfirm,
}: DomainRemoveModalProps) {
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setTyped("");
    setError(null);
  }, [open]);

  if (!open || !domain || !domain.customDomain) return null;

  const hostname = domain.customDomain.hostname;
  const matches = typed.trim() === hostname;

  const handleSubmit = () => {
    if (!matches) {
      setError("Type " + hostname + " exactly to confirm.");
      return;
    }
    onConfirm();
    onClose();
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Remove custom domain"
      description={hostname + " will no longer serve " + storefrontName + "."}
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
            disabled={!matches}
          >
            Remove domain
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-md border border-warning-200 bg-warning-50 p-3 text-xs text-warning-900 dark:border-warning-800/60 dark:bg-warning-900/20 dark:text-warning-100">
          <p className="font-medium">What happens next</p>
          <p className="mt-1">
            The custom domain stops working immediately. The storefront
            continues serving from its subdomain. The owner can point the
            domain at Atlas again by re-adding it.
          </p>
        </div>

        <SettingsField
          label={"Type " + hostname + " to confirm"}
          htmlFor="domain-remove-confirm"
          required
          error={error ?? undefined}
        >
          <Input
            id="domain-remove-confirm"
            value={typed}
            onChange={(e) => {
              setTyped(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder={hostname}
            autoFocus
          />
        </SettingsField>
      </div>
    </ModalShell>
  );
}