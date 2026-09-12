// components/admin/ui/modal-shell.tsx
"use client";

import { useId, type ReactNode } from "react";
import { Button } from "./button";
import { useFocusTrap } from "@/lib/admin/hooks/use-focus-trap";
import { cn } from "@/lib/utils";

interface ModalShellProps {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClass: Record<NonNullable<ModalShellProps["size"]>, string> = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export function ModalShell({
  open,
  title,
  description,
  children,
  footer,
  onClose,
  size = "md",
  className,
}: ModalShellProps) {
  const trapRef = useFocusTrap<HTMLDivElement>(open, onClose);
  const titleId = useId();
  const descriptionId = useId();

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={trapRef}
        className={cn(
          "relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-lg bg-white shadow-xl dark:bg-neutral-900",
          sizeClass[size],
          className
        )}
      >
        <div className="flex items-start justify-between gap-3 border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
          <div className="min-w-0">
            <h3 id={titleId} className="text-base font-semibold">
              {title}
            </h3>
            {description && (
              <p
                id={descriptionId}
                className="mt-1 text-xs text-neutral-500 dark:text-neutral-400"
              >
                {description}
              </p>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-neutral-200 px-5 py-3 dark:border-neutral-800">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}