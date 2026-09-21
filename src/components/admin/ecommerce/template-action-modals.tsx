"use client";

import { useEffect, useState } from "react";
import type { EcommerceTemplate } from "@/lib/admin/types/ecommerce-template";
import { Button } from "@/components/admin/ui/button";
import { ModalShell } from "@/components/admin/ui/model-shell";
import { SettingsField } from "@/components/admin/ui/settings-field";
import { Input } from "@/components/admin/ui/input";
import { cn } from "@/lib/utils";

/* ======================================================================
   Deactivate
   ====================================================================== */

interface DeactivateTemplateModalProps {
  open: boolean;
  template: EcommerceTemplate | null;
  usageCount: number;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeactivateTemplateModal({
  open,
  template,
  usageCount,
  onClose,
  onConfirm,
}: DeactivateTemplateModalProps) {
  if (!open || !template) return null;

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={"Deactivate " + template.name}
      description="New merchants will no longer see this template when choosing one."
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
            Deactivate
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        {usageCount > 0 && (
          <div
            role="alert"
            className="rounded-md border border-warning-200 bg-warning-50 p-3 text-xs text-warning-900 dark:border-warning-800/60 dark:bg-warning-900/20 dark:text-warning-100"
          >
            <p className="font-medium">
              {usageCount} merchant{usageCount === 1 ? "" : "s"} currently use
              this template.
            </p>
            <p className="mt-1">
              Their storefronts keep working. They just can&apos;t be switched
              to this template by anyone else. You can reactivate it at any
              time.
            </p>
          </div>
        )}
        {usageCount === 0 && (
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            No merchants use this template. Deactivating hides it from new
            merchant onboarding.
          </p>
        )}
      </div>
    </ModalShell>
  );
}

/* ======================================================================
   Duplicate
   ====================================================================== */

interface DuplicateTemplateModalProps {
  open: boolean;
  template: EcommerceTemplate | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function DuplicateTemplateModal({
  open,
  template,
  onClose,
  onConfirm,
}: DuplicateTemplateModalProps) {
  if (!open || !template) return null;

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={"Duplicate " + template.name}
      description="Creates an inactive copy that you can rename and configure."
      size="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Duplicate
          </Button>
        </>
      }
    >
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        The copy starts inactive. Nothing changes for merchants using the
        original template.
      </p>
    </ModalShell>
  );
}