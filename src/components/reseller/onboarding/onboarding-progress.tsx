"use client";

import { STEP_TITLES } from "@/lib/reseller/onboarding/constants";
import type { OnboardingStep } from "@/lib/reseller/onboarding/types";

interface OnboardingProgressProps {
  steps: OnboardingStep[];
  currentIndex: number;
}

export function OnboardingProgress({
  steps,
  currentIndex,
}: OnboardingProgressProps) {
  const total = steps.length;
  const current = steps[currentIndex];
  return (
    <div>
      <div className="flex items-center gap-2 sm:gap-3">
        {steps.map((step, i) => {
          const isDone = i < currentIndex;
          const isCurrent = i === currentIndex;
          return (
            <div
              key={step}
              className="flex flex-1 items-center gap-2 sm:gap-3"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span
                  aria-hidden="true"
                  className={
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold " +
                    (isDone || isCurrent
                      ? "bg-brand-600 text-white"
                      : "bg-neutral-200 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-500")
                  }
                >
                  {isDone ? "\u2713" : String(i + 1)}
                </span>
                <span
                  className={
                    "hidden truncate text-xs font-medium uppercase tracking-wide sm:inline " +
                    (isCurrent
                      ? "text-neutral-900 dark:text-neutral-100"
                      : "text-neutral-500 dark:text-neutral-500")
                  }
                >
                  {STEP_TITLES[step]}
                </span>
              </div>
              {i < total - 1 ? (
                <span
                  aria-hidden="true"
                  className={
                    "h-px flex-1 " +
                    (isDone
                      ? "bg-brand-600"
                      : "bg-neutral-200 dark:bg-neutral-800")
                  }
                />
              ) : null}
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-neutral-500 sm:hidden" aria-live="polite">
        {STEP_TITLES[current]}{" "}
        <span aria-hidden="true">{"\u00B7"}</span>{" "}
        {"Step " + String(currentIndex + 1) + " of " + String(total)}
      </p>
      <ol className="sr-only">
        {steps.map((step, i) => (
          <li
            key={step}
            aria-current={i === currentIndex ? "step" : undefined}
          >
            {STEP_TITLES[step]}
          </li>
        ))}
      </ol>
    </div>
  );
}