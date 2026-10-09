"use client";

import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import type { TrustItem } from "@/types/merchant-storefront";

const TRUST_ICON_OPTIONS: {
  value: string;
  label: string;
  icon: AtlasIconName;
}[] = [
  { value: "shield", label: "Secure payments", icon: "shield" },
  { value: "package", label: "Delivery", icon: "package" },
  { value: "headphones", label: "Support", icon: "headphones" },
  { value: "lock", label: "Privacy", icon: "lock" },
  { value: "check-circle", label: "Guarantee", icon: "check-circle" },
  { value: "star", label: "Quality", icon: "star" },
];

const MAX_ITEMS = 6;
const MAX_LABEL_LENGTH = 60;

const inputClass =
  "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500";

interface TrustItemsEditorProps {
  value: TrustItem[] | undefined;
  onChange: (next: TrustItem[] | undefined) => void;
}

export function TrustItemsEditor({ value, onChange }: TrustItemsEditorProps) {
  const items = value ?? [];
  const atMax = items.length >= MAX_ITEMS;

  const updateItem = (index: number, patch: Partial<TrustItem>) => {
    const next = items.slice();
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  const removeItem = (index: number) => {
    const next = items.filter((_, i) => i !== index);
    onChange(next.length === 0 ? undefined : next);
  };

  const addItem = () => {
    if (atMax) return;
    onChange([...items, { icon: "shield", label: "" }]);
  };

  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-neutral-200 px-4 py-6 text-center text-[11px] text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
          No items yet. Add up to {MAX_ITEMS} commitments to display on your
          storefront.
        </p>
      ) : (
        <ul role="list" className="space-y-2">
          {items.map((item, index) => (
            <li
              key={index}
              className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800"
            >
              <div className="flex flex-wrap gap-1.5">
                {TRUST_ICON_OPTIONS.map((option) => {
                  const selected = item.icon === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        updateItem(index, { icon: option.value })
                      }
                      aria-label={option.label}
                      aria-pressed={selected}
                      title={option.label}
                      className={
                        selected
                          ? "inline-flex h-8 w-8 items-center justify-center rounded-md border-2 border-brand-600 bg-brand-50 text-brand-700 dark:border-brand-500 dark:bg-brand-900/30 dark:text-brand-300"
                          : "inline-flex h-8 w-8 items-center justify-center rounded-md border border-neutral-200 text-neutral-600 transition-colors hover:border-neutral-400 dark:border-neutral-800 dark:text-neutral-400 dark:hover:border-neutral-600"
                      }
                    >
                      <AtlasIcon
                        name={option.icon}
                        className="h-4 w-4"
                        aria-hidden="true"
                      />
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="text"
                  value={item.label}
                  onChange={(e) =>
                    updateItem(index, { label: e.target.value })
                  }
                  placeholder="e.g. Fast delivery in Accra"
                  maxLength={MAX_LABEL_LENGTH}
                  aria-label={"Item " + (index + 1) + " label"}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  aria-label={"Remove item " + (index + 1)}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-neutral-200 text-neutral-500 transition-colors hover:border-danger-500 hover:text-danger-600 dark:border-neutral-800 dark:text-neutral-400 dark:hover:border-danger-500 dark:hover:text-danger-400"
                >
                  <AtlasIcon
                    name="x-circle"
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={addItem}
          disabled={atMax}
          className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 px-3 py-2 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          {"+ Add item"}
        </button>
        <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
          {items.length} of {MAX_ITEMS}
        </span>
      </div>
    </div>
  );
}