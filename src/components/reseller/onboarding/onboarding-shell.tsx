"use client";

import type { ReactNode } from "react";

interface OnboardingShellProps {
  stepTitle: string;
  stepSubtitle: string;
  progress: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}

export function OnboardingShell({
  stepTitle,
  stepSubtitle,
  progress,
  footer,
  children,
}: OnboardingShellProps) {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <header className="border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto flex max-w-2xl items-center px-4 py-3 sm:px-6">
          <span className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            Atlas
          </span>
        </div>
      </header>

      <div className="mx-auto w-full max-w-2xl px-4 pb-28 pt-6 sm:px-6 sm:pb-10 sm:pt-10">
        <div className="mb-6">{progress}</div>

        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-3xl">
            {stepTitle}
          </h1>
          <p className="mt-1.5 text-sm text-neutral-600 dark:text-neutral-400">
            {stepSubtitle}
          </p>
        </div>

        <div
          role="region"
          aria-label={stepTitle}
          className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 sm:p-6"
        >
          {children}
        </div>

        <div className="sticky bottom-0 z-10 mt-6 -mx-4 border-t border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/95 sm:static sm:mx-0 sm:mt-6 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none">
          {footer}
        </div>
      </div>
    </div>
  );
}