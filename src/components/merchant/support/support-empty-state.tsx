"use client";

import { AtlasIcon } from "@/components/atlas/icons";
import type { AtlasIconName } from "@/components/atlas/icons";
import {
  SEED_HINT,
  SEED_THREADS_CTA,
  SEED_TICKETS_CTA,
  THREADS_EMPTY_BODY,
  THREADS_EMPTY_TITLE,
  TICKETS_EMPTY_BODY,
  TICKETS_EMPTY_CTA,
  TICKETS_EMPTY_TITLE,
} from "@/lib/merchant/support/labels";

interface SupportEmptyStateProps {
  variant: "tickets" | "threads";
  onPrimaryAction?: () => void;
  onSeed?: () => void;
}

interface VariantCopy {
  icon: AtlasIconName;
  title: string;
  body: string;
  primaryLabel: string | null;
}

function copyFor(variant: SupportEmptyStateProps["variant"]): VariantCopy {
  if (variant === "tickets") {
    return {
      icon: "send",
      title: TICKETS_EMPTY_TITLE,
      body: TICKETS_EMPTY_BODY,
      primaryLabel: TICKETS_EMPTY_CTA,
    };
  }
  return {
    icon: "message-square",
    title: THREADS_EMPTY_TITLE,
    body: THREADS_EMPTY_BODY,
    primaryLabel: null,
  };
}

export function SupportEmptyState({
  variant,
  onPrimaryAction,
  onSeed,
}: SupportEmptyStateProps) {
  const copy = copyFor(variant);
  const seedLabel =
    variant === "tickets" ? SEED_TICKETS_CTA : SEED_THREADS_CTA;

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-10 text-center dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-900/30">
        <AtlasIcon
          name={copy.icon}
          className="h-6 w-6 text-brand-600 dark:text-brand-300"
          aria-hidden="true"
        />
      </div>
      <h2 className="mt-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
        {copy.title}
      </h2>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
        {copy.body}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        {copy.primaryLabel && onPrimaryAction && (
          <button
            type="button"
            onClick={onPrimaryAction}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            <AtlasIcon name="add" className="h-4 w-4" aria-hidden="true" />
            {copy.primaryLabel}
          </button>
        )}
        {onSeed && (
          <button
            type="button"
            onClick={onSeed}
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            <AtlasIcon name="store" className="h-4 w-4" aria-hidden="true" />
            {seedLabel}
          </button>
        )}
      </div>

      {onSeed && (
        <p className="mt-4 text-xs text-neutral-500 dark:text-neutral-500">
          {SEED_HINT}
        </p>
      )}
    </div>
  );
}