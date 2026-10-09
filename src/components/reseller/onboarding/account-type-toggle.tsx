"use client";

import type { AccountKind } from "@/lib/reseller/onboarding/types";

interface AccountTypeToggleProps {
  value: AccountKind;
  onChange: (value: AccountKind) => void;
}

export function AccountTypeToggle({
  value,
  onChange,
}: AccountTypeToggleProps) {
  const options: Array<{ id: AccountKind; label: string }> = [
    { id: "new", label: "Create account" },
    { id: "existing", label: "Log in" },
  ];
  return (
    <div
      role="tablist"
      aria-label="Account"
      className="flex rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800"
    >
      {options.map((opt) => {
        const selected = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="tab"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(opt.id)}
            className={
              "flex-1 rounded-md py-2 text-sm font-medium transition-colors " +
              (selected
                ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-900 dark:text-neutral-100"
                : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300")
            }
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}