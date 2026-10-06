"use client";

import type { ProductVariant, ProductVariantGroup } from "@/types/merchant-storefront";

interface GeneralStoreVariantSelectorProps {
  groups: ProductVariantGroup[];
  variants: ProductVariant[];
  selected: Record<string, string>;
  onChange: (next: Record<string, string>) => void;
}

function isOptionAvailable(
  groups: ProductVariantGroup[],
  variants: ProductVariant[],
  selected: Record<string, string>,
  groupName: string,
  option: string
): boolean {
  const candidate = { ...selected, [groupName]: option };
  return variants.some((variant) => {
    if (variant.stockLevel <= 0) return false;
    return groups.every((group) => {
      const required = candidate[group.name];
      if (!required) return true;
      return variant.options[group.name] === required;
    });
  });
}

export function GeneralStoreVariantSelector({
  groups,
  variants,
  selected,
  onChange,
}: GeneralStoreVariantSelectorProps) {
  if (groups.length === 0) return null;

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group.id}>
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            {group.name}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {group.options.map((option) => {
              const isSelected = selected[group.name] === option;
              const available = isOptionAvailable(
                groups,
                variants,
                selected,
                group.name,
                option
              );
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => onChange({ ...selected, [group.name]: option })}
                  aria-pressed={isSelected}
                  aria-label={`${group.name}: ${option}`}
                  disabled={!available}
                  className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                    isSelected
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : available
                        ? "border-neutral-300 bg-white text-neutral-900 hover:border-neutral-900"
                        : "cursor-not-allowed border-neutral-200 bg-neutral-50 text-neutral-300 line-through"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}