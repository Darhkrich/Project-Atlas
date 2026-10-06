"use client";

import type { ReactNode } from "react";
import { AtlasIcon } from "@/components/atlas/icons";

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  headerActions?: ReactNode;
  successMessage?: string | null;
  errorMessage?: string | null;
}

export function SettingsSection({
  title,
  description,
  children,
  headerActions,
  successMessage,
  errorMessage,
}: SettingsSectionProps) {
  return (
    <section className="rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex flex-col gap-3 border-b border-neutral-200 px-4 py-4 dark:border-neutral-800 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            {title}
          </h2>
          {description && (
            <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
              {description}
            </p>
          )}
        </div>
        {headerActions && <div className="shrink-0">{headerActions}</div>}
      </div>

      <div className="px-4 py-5 sm:px-6">{children}</div>

      {successMessage && (
        <div
          role="status"
          className="flex items-center gap-2 border-t border-success-200 bg-success-50 px-4 py-3 text-sm text-success-800 dark:border-success-900 dark:bg-success-900/30 dark:text-success-200 sm:px-6"
        >
          <AtlasIcon
            name="check-circle"
            className="h-4 w-4 shrink-0"
            aria-hidden="true"
          />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="flex items-center gap-2 border-t border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-800 dark:border-danger-900 dark:bg-danger-900/30 dark:text-danger-200 sm:px-6"
        >
          <AtlasIcon
            name="alert"
            className="h-4 w-4 shrink-0"
            aria-hidden="true"
          />
          <span>{errorMessage}</span>
        </div>
      )}
    </section>
  );
}