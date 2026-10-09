"use client";

import { AccountTypeToggle } from "./account-type-toggle";
import { PasswordField } from "./password-field";
import { FIELD_LABELS } from "@/lib/reseller/onboarding/labels";
import type { OnboardingDraft } from "@/lib/reseller/onboarding/types";

interface StepAccountProps {
  draft: OnboardingDraft;
  errors: Record<string, string>;
  onChange: (patch: Partial<OnboardingDraft>) => void;
}

export function StepAccount({
  draft,
  errors,
  onChange,
}: StepAccountProps) {
  const isExisting = draft.accountKind === "existing";

  return (
    <div className="space-y-5">
      <AccountTypeToggle
        value={draft.accountKind}
        onChange={(kind) => onChange({ accountKind: kind })}
      />

      {!isExisting ? (
        <div>
          <label
            htmlFor="fullName"
            className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300"
          >
            {FIELD_LABELS.fullName}
          </label>
          <input
            id="fullName"
            name="fullName"
            value={draft.fullName}
            onChange={(e) => onChange({ fullName: e.target.value })}
            autoComplete="name"
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={errors.fullName ? "fullName-error" : undefined}
            className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
          />
          {errors.fullName ? (
            <p
              id="fullName-error"
              className="mt-1.5 text-xs text-rose-700 dark:text-rose-400"
            >
              {errors.fullName}
            </p>
          ) : null}
        </div>
      ) : null}

      <div>
        <label
          htmlFor="email"
          className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300"
        >
          {FIELD_LABELS.email}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={draft.email}
          onChange={(e) => onChange({ email: e.target.value })}
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "email-error" : undefined}
          className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
        />
        {errors.email ? (
          <p
            id="email-error"
            className="mt-1.5 text-xs text-rose-700 dark:text-rose-400"
          >
            {errors.email}
          </p>
        ) : null}
      </div>

      {!isExisting ? (
        <div>
          <label
            htmlFor="phone"
            className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300"
          >
            {FIELD_LABELS.phone}
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={draft.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            autoComplete="tel"
            className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
          />
        </div>
      ) : null}

      <PasswordField
        value={draft.password}
        onChange={(value) => onChange({ password: value })}
        error={errors.password}
        showGuidelines={!isExisting}
      />
    </div>
  );
}