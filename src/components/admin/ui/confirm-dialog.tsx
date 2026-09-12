// components/admin/ui/confirm-dialog.tsx
"use client";

import { type ReactNode, useId } from "react";
import { Button } from "./button";
import { useFocusTrap } from "@/lib/admin/hooks/use-focus-trap";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
  confirmDisabled?: boolean;
  children?: ReactNode;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  danger = false,
  confirmDisabled = false,
  children,
}: ConfirmDialogProps) {
  const trapRef = useFocusTrap<HTMLDivElement>(open, onCancel);
  const titleId = useId();
  const descriptionId = useId();

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onCancel}
        aria-hidden="true"
      />

      <div
        ref={trapRef}
        className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-neutral-900"
      >
        <h3 id={titleId} className="text-lg font-semibold">
          {title}
        </h3>

        <p
          id={descriptionId}
          className="mt-2 text-sm text-neutral-600 dark:text-neutral-300"
        >
          {description}
        </p>

        {children && <div className="mt-4">{children}</div>}

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            variant={danger ? "destructive" : "primary"}
            size="sm"
            onClick={onConfirm}
            disabled={confirmDisabled}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}