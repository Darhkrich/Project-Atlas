/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { SLUG_DEBOUNCE_MS } from "@/lib/reseller/onboarding/constants";
import {
  checkSlug,
  normalizeSlug,
  type SlugCheckOutcome,
} from "@/lib/reseller/onboarding/slug";

interface SlugFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const IDLE: SlugCheckOutcome = {
  status: "idle",
  message: "",
  suggestion: null,
};

export function SlugField({ value, onChange, error }: SlugFieldProps) {
  const [outcome, setOutcome] = useState<SlugCheckOutcome>(IDLE);

  useEffect(() => {
    if (!value) {
      setOutcome(IDLE);
      return;
    }
    const handle = window.setTimeout(() => {
      setOutcome(checkSlug(value));
    }, SLUG_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [value]);

  const describedBy = error
    ? "slug-error"
    : outcome.status === "available" || outcome.status === "taken"
      ? "slug-status"
      : undefined;

  return (
    <div>
      <label
        htmlFor="slug"
        className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300"
      >
        Store link
      </label>
      <div className="mt-1.5 flex items-stretch overflow-hidden rounded-lg border border-neutral-200 bg-white focus-within:border-brand-500 dark:border-neutral-800 dark:bg-neutral-900">
        <span className="flex items-center border-r border-neutral-200 bg-neutral-50 px-3 text-xs text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900/60">
          atlas.store/
        </span>
        <input
          id="slug"
          name="slug"
          value={value}
          onChange={(e) => onChange(normalizeSlug(e.target.value))}
          placeholder="your-shop"
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className="flex-1 bg-transparent px-3 py-2.5 text-sm text-neutral-900 outline-none dark:text-neutral-100"
        />
      </div>
      {outcome.status === "available" || outcome.status === "taken" ? (
        <p
          id="slug-status"
          role="status"
          className={
            "mt-1.5 text-xs " +
            (outcome.status === "available"
              ? "text-emerald-700 dark:text-emerald-400"
              : "text-rose-700 dark:text-rose-400")
          }
        >
          {outcome.message}
          {outcome.suggestion ? (
            <>
              {" "}
              Try{" "}
              <button
                type="button"
                onClick={() => onChange(outcome.suggestion ?? "")}
                className="font-medium underline"
              >
                {outcome.suggestion}
              </button>
            </>
          ) : null}
        </p>
      ) : null}
      {error ? (
        <p
          id="slug-error"
          className="mt-1.5 text-xs text-rose-700 dark:text-rose-400"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}