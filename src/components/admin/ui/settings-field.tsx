// components/admin/ui/settings-field.tsx
"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SettingsFieldProps {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

export function SettingsField({
  label,
  htmlFor,
  hint,
  error,
  required,
  className,
  children,
}: SettingsFieldProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-neutral-800 dark:text-neutral-200"
      >
        {label}
        {required && (
          <span className="ml-1 text-danger-600 dark:text-danger-400" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400">{hint}</p>
      )}
      {error && (
        <p
          role="alert"
          className="text-xs text-danger-600 dark:text-danger-400"
        >
          {error}
        </p>
      )}
    </div>
  );
}