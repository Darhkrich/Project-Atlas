"use client";

import { StepHeader } from "./StepHeader";
import type { MerchantOnboardingDraft } from "@/lib/merchant/onboarding/types";

interface StepAccountProps {
  draft: MerchantOnboardingDraft;
  password: string;
  errors: string[];
  onChange: <K extends keyof MerchantOnboardingDraft>(
    key: K,
    value: MerchantOnboardingDraft[K]
  ) => void;
  onPasswordChange: (value: string) => void;
}

const inputClass =
  "w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder-neutral-500 dark:focus:ring-brand-900";

const labelClass =
  "mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300";

export default function StepAccount({
  draft,
  password,
  errors,
  onChange,
  onPasswordChange,
}: StepAccountProps) {
  return (
    <div className="space-y-7">
      <StepHeader
        title="Create your account"
        description="Your store and dashboard are free to set up. You choose a plan on step 4."
      />

      {errors.length > 0 && (
        <ul
          role="alert"
          className="space-y-1 rounded-lg border border-danger-200 bg-danger-50 p-3 text-sm text-danger-700 dark:border-danger-900/40 dark:bg-danger-900/20 dark:text-danger-300"
        >
          {errors.map((err) => (
            <li key={err}>{err}</li>
          ))}
        </ul>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="fullName" className={labelClass}>
            Full name
          </label>
          <input
            id="fullName"
            type="text"
            value={draft.fullName}
            onChange={(e) => onChange("fullName", e.target.value)}
            placeholder="e.g., Nana Adjei"
            autoComplete="name"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={draft.email}
            onChange={(e) => onChange("email", e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="phone" className={labelClass}>
            Phone number
          </label>
          <input
            id="phone"
            type="tel"
            value={draft.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            placeholder="e.g., 024 123 4567"
            autoComplete="tel"
            className={inputClass}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="password" className={labelClass}>
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            minLength={8}
            className={inputClass}
          />
          <p className="mt-1.5 text-xs text-neutral-500">
            Stored in your browser only while you set up your account. Not saved
            anywhere on this device.
          </p>
        </div>
      </div>
    </div>
  );
}