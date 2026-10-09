"use client";

import { useState } from "react";
import { evaluatePassword } from "@/lib/reseller/onboarding/password";

interface PasswordFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  showGuidelines?: boolean;
}

export function PasswordField({
  value,
  onChange,
  error,
  showGuidelines = true,
}: PasswordFieldProps) {
  const [revealed, setRevealed] = useState(false);
  const evaluation = evaluatePassword(value);

  return (
    <div>
      <label
        htmlFor="password"
        className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300"
      >
        Password
      </label>
      <div className="mt-1.5 flex items-stretch overflow-hidden rounded-lg border border-neutral-200 bg-white focus-within:border-brand-500 dark:border-neutral-800 dark:bg-neutral-900">
        <input
          id="password"
          name="password"
          type={revealed ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={showGuidelines ? "new-password" : "current-password"}
          aria-invalid={Boolean(error)}
          aria-describedby={showGuidelines ? "password-rules" : undefined}
          className="flex-1 bg-transparent px-3 py-2.5 text-sm text-neutral-900 outline-none dark:text-neutral-100"
        />
        <button
          type="button"
          onClick={() => setRevealed((r) => !r)}
          aria-label={revealed ? "Hide password" : "Show password"}
          aria-pressed={revealed}
          className="border-l border-neutral-200 px-3 text-xs font-medium text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800"
        >
          {revealed ? "Hide" : "Show"}
        </button>
      </div>
      {showGuidelines ? (
        <ul id="password-rules" className="mt-2 space-y-1">
          {evaluation.rules.map((rule) => (
            <li key={rule.id} className="flex items-center gap-1.5 text-xs">
              <span
                aria-hidden="true"
                className={
                  "inline-flex h-3.5 w-3.5 items-center justify-center rounded-full text-[9px] font-bold " +
                  (rule.satisfied
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                    : "bg-neutral-200 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-500")
                }
              >
                {rule.satisfied ? "\u2713" : ""}
              </span>
              <span
                className={
                  rule.satisfied
                    ? "text-neutral-700 dark:text-neutral-300"
                    : "text-neutral-500"
                }
              >
                {rule.label}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
      {error ? (
        <p className="mt-1.5 text-xs text-rose-700 dark:text-rose-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}