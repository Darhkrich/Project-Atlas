/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/admin/ui/button";
import { ModalShell } from "@/components/admin/ui/model-shell";
import { SettingsField } from "@/components/admin/ui/settings-field";
import { Input } from "@/components/admin/ui/input";
import type { SubscriptionPlan } from "@/lib/domains/subscriptions";

interface Props {
  open: boolean;
  plan: SubscriptionPlan | null;
  merchantCount: number;
  onClose: () => void;
  onConfirm: () => { ok: boolean; error?: string };
}

export function PlanDeleteModal({
  open,
  plan,
  merchantCount,
  onClose,
  onConfirm,
}: Props) {
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setTyped("");
      setError(null);
    }
  }, [open]);

  if (!open || !plan) return null;

  const blocked = merchantCount > 0;
  const matches = typed.trim() === plan.code;
  const canSubmit = !blocked && matches;

  const handleSubmit = () => {
    const result = onConfirm();
    if (!result.ok) {
      setError(result.error ?? "Could not delete plan.");
      return;
    }
    onClose();
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={"Delete " + plan.name + "?"}
      description={
        blocked
          ? "This plan has merchants on it and cannot be deleted."
          : "This removes the plan from the store. Merchants already assigned to it are unaffected only if none exist."
      }
      size="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            Delete plan
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {blocked ? (
          <div className="rounded-md border border-warning-200 bg-warning-50 p-3 text-xs dark:border-warning-800/60 dark:bg-warning-900/20">
            <p className="font-medium text-warning-900 dark:text-warning-100">
              {merchantCount} merchant{merchantCount === 1 ? "" : "s"} on this
              plan
            </p>
            <p className="mt-1 text-warning-800 dark:text-warning-200">
              Move them to another plan, or set this plan to Legacy from the
              editor. Legacy plans cannot be deleted while merchants remain.
            </p>
          </div>
        ) : (
          <div className="rounded-md border border-danger-200 bg-danger-50 p-3 text-xs dark:border-danger-800/60 dark:bg-danger-900/20">
            <p className="font-medium text-danger-900 dark:text-danger-100">
              This action cannot be undone
            </p>
            <p className="mt-1 text-danger-800 dark:text-danger-200">
              The plan is removed from the store. Any template or merchant
              still referencing it will show the raw code until reassigned.
            </p>
          </div>
        )}

        {!blocked && (
          <SettingsField
            label={"Type " + plan.code + " to confirm"}
            htmlFor="plan-delete-confirm"
            required
            error={error ?? undefined}
          >
            <Input
              id="plan-delete-confirm"
              value={typed}
              onChange={(e) => {
                setTyped(e.target.value);
                setError(null);
              }}
              placeholder={plan.code}
              autoComplete="off"
            />
          </SettingsField>
        )}
      </div>
    </ModalShell>
  );
}