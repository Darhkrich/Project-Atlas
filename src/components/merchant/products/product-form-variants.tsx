"use client";

import { useState } from "react";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import {
  regenerateVariants,
  renameGroupKey,
} from "@/lib/merchant/products/forms/variants";
import type {
  ProductFormErrors,
  ProductFormValues,
} from "@/lib/merchant/products/forms/types";
import type {
  ProductVariant,
  ProductVariantGroup,
} from "@/types/merchant-storefront";

interface ProductFormVariantsProps {
  values: ProductFormValues;
  errors: ProductFormErrors;
  updateField: <K extends keyof ProductFormValues>(
    key: K,
    value: ProductFormValues[K]
  ) => void;
}

const MAX_GROUPS = 2;

const inputClass =
  "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100";

function parseOptions(raw: string): string[] {
  const parts = raw.split(/[\n,]+/);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.length === 0) continue;
    if (seen.has(trimmed)) continue;
    seen.add(trimmed);
    out.push(trimmed);
  }
  return out;
}

function variantLabel(variant: ProductVariant): string {
  const values = Object.values(variant.options);
  return values.length === 0 ? "(empty)" : values.join(" / ");
}

export function ProductFormVariants({
  values,
  errors,
  updateField,
}: ProductFormVariantsProps) {
  const [rawOptions, setRawOptions] = useState<Record<string, string>>({});

  const groups = values.variantGroups;
  const variants = values.variants;

  function optionsRaw(group: ProductVariantGroup): string {
    return rawOptions[group.id] ?? group.options.join("\n");
  }

  function commitGroupsAndVariants(
    nextGroups: ProductVariantGroup[],
    preservedVariants: ProductVariant[]
  ) {
    const nextVariants = regenerateVariants(nextGroups, preservedVariants);
    updateField("variantGroups", nextGroups);
    updateField("variants", nextVariants);
  }

  function handleAddGroup() {
    if (groups.length >= MAX_GROUPS) return;
    const next: ProductVariantGroup = {
      id: crypto.randomUUID(),
      name: "",
      options: [],
    };
    commitGroupsAndVariants([...groups, next], variants);
  }

  function handleRemoveGroup(groupId: string) {
    const nextGroups = groups.filter((g) => g.id !== groupId);
    commitGroupsAndVariants(nextGroups, variants);
    setRawOptions((prev) => {
      const next = { ...prev };
      delete next[groupId];
      return next;
    });
  }

  function handleNameChange(groupId: string, newName: string) {
    const group = groups.find((g) => g.id === groupId);
    if (!group) return;
    const oldName = group.name;
    const nextGroups = groups.map((g) =>
      g.id === groupId ? { ...g, name: newName } : g
    );
    const renamed = renameGroupKey(variants, oldName, newName);
    commitGroupsAndVariants(nextGroups, renamed);
  }

  function handleOptionsChange(groupId: string, raw: string) {
    setRawOptions((prev) => ({ ...prev, [groupId]: raw }));
    const parsed = parseOptions(raw);
    const nextGroups = groups.map((g) =>
      g.id === groupId ? { ...g, options: parsed } : g
    );
    commitGroupsAndVariants(nextGroups, variants);
  }

  function handleVariantStock(index: number, raw: string) {
    const trimmed = raw.trim();
    if (trimmed.length === 0) {
      const next = variants.slice();
      next[index] = { ...next[index], stockLevel: 0 };
      updateField("variants", next);
      return;
    }
    const parsed = Number.parseInt(trimmed, 10);
    if (!Number.isFinite(parsed) || parsed < 0) return;
    const next = variants.slice();
    next[index] = { ...next[index], stockLevel: parsed };
    updateField("variants", next);
  }

  function handleVariantPrice(index: number, raw: string) {
    const trimmed = raw.trim();
    const next = variants.slice();
    if (trimmed.length === 0) {
      const cleared: ProductVariant = { ...next[index] };
      delete cleared.priceOverride;
      next[index] = cleared;
      updateField("variants", next);
      return;
    }
    const parsed = Number.parseFloat(trimmed);
    if (!Number.isFinite(parsed) || parsed < 0) return;
    next[index] = { ...next[index], priceOverride: parsed };
    updateField("variants", next);
  }

  function handleVariantSku(index: number, raw: string) {
    const next = variants.slice();
    const trimmed = raw.trim();
    if (trimmed.length === 0) {
      const cleared: ProductVariant = { ...next[index] };
      delete cleared.sku;
      next[index] = cleared;
    } else {
      next[index] = { ...next[index], sku: trimmed };
    }
    updateField("variants", next);
  }

  const atMax = groups.length >= MAX_GROUPS;

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Variants
          </h2>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Sell variations of this product. Add up to two groups like Size or
            Color.
          </p>
        </div>
      </div>

      {errors.variants && (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-danger-200 bg-danger-50 px-3 py-2 text-xs text-danger-700 dark:border-danger-900 dark:bg-danger-900/20 dark:text-danger-300"
        >
          {errors.variants}
        </div>
      )}

      {groups.length === 0 ? (
        <div className="mt-5 rounded-lg border border-dashed border-neutral-200 px-4 py-8 text-center dark:border-neutral-800">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Add a group to start. Common examples: Size, Color, Material.
          </p>
          <button
            type="button"
            onClick={handleAddGroup}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700"
          >
            {"+ Add group"}
          </button>
        </div>
      ) : (
        <>
          <ul role="list" className="mt-5 space-y-4">
            {groups.map((group, groupIndex) => (
              <li
                key={group.id}
                className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    {"Group " + (groupIndex + 1)}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleRemoveGroup(group.id)}
                    aria-label={"Remove group " + (groupIndex + 1)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-neutral-200 text-neutral-500 transition-colors hover:border-danger-500 hover:text-danger-600 dark:border-neutral-800 dark:text-neutral-400 dark:hover:border-danger-500 dark:hover:text-danger-400"
                  >
                    <AtlasIcon
                      name="x-circle"
                      className="h-3.5 w-3.5"
                      aria-hidden="true"
                    />
                  </button>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor={"group-name-" + group.id}
                      className="mb-1 block text-xs font-medium text-neutral-700 dark:text-neutral-300"
                    >
                      Group name
                    </label>
                    <input
                      id={"group-name-" + group.id}
                      type="text"
                      value={group.name}
                      onChange={(e) =>
                        handleNameChange(group.id, e.target.value)
                      }
                      placeholder="e.g. Size"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={"group-options-" + group.id}
                      className="mb-1 block text-xs font-medium text-neutral-700 dark:text-neutral-300"
                    >
                      Options
                    </label>
                    <textarea
                      id={"group-options-" + group.id}
                      value={optionsRaw(group)}
                      onChange={(e) =>
                        handleOptionsChange(group.id, e.target.value)
                      }
                      rows={3}
                      placeholder={"One per line, e.g.\nSmall\nMedium\nLarge"}
                      className={cn(inputClass, "resize-none font-mono text-xs")}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-3">
            <button
              type="button"
              onClick={handleAddGroup}
              disabled={atMax}
              className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 px-3 py-2 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              {"+ Add group"}
            </button>
          </div>

          {variants.length > 0 ? (
            <div className="mt-6">
              <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Variants
              </p>
              <p className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
                Stock is required. Price override and SKU are optional.
              </p>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[520px] border-separate border-spacing-0 text-sm">
                  <thead>
                    <tr className="text-left text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                      <th scope="col" className="px-2 py-2">
                        Combination
                      </th>
                      <th scope="col" className="px-2 py-2">
                        Stock
                      </th>
                      <th scope="col" className="px-2 py-2">
                        {"Price (GH\u20B5)"}
                      </th>
                      <th scope="col" className="px-2 py-2">
                        SKU
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {variants.map((variant, index) => (
                      <tr
                        key={variant.id}
                        className="border-t border-neutral-200 dark:border-neutral-800"
                      >
                        <td className="px-2 py-2 align-middle text-xs font-medium text-neutral-700 dark:text-neutral-300">
                          {variantLabel(variant)}
                        </td>
                        <td className="px-2 py-2 align-middle">
                          <input
                            type="number"
                            inputMode="numeric"
                            min={0}
                            step={1}
                            value={String(variant.stockLevel)}
                            onChange={(e) =>
                              handleVariantStock(index, e.target.value)
                            }
                            aria-label={
                              "Stock for " + variantLabel(variant)
                            }
                            className={cn(
                              inputClass,
                              "w-20 px-2 py-1.5 text-xs"
                            )}
                          />
                        </td>
                        <td className="px-2 py-2 align-middle">
                          <input
                            type="number"
                            inputMode="decimal"
                            min={0}
                            step="0.01"
                            value={
                              variant.priceOverride !== undefined
                                ? String(variant.priceOverride)
                                : ""
                            }
                            onChange={(e) =>
                              handleVariantPrice(index, e.target.value)
                            }
                            placeholder="Use base"
                            aria-label={
                              "Price override for " + variantLabel(variant)
                            }
                            className={cn(
                              inputClass,
                              "w-28 px-2 py-1.5 text-xs"
                            )}
                          />
                        </td>
                        <td className="px-2 py-2 align-middle">
                          <input
                            type="text"
                            value={variant.sku ?? ""}
                            onChange={(e) =>
                              handleVariantSku(index, e.target.value)
                            }
                            placeholder="Optional"
                            aria-label={"SKU for " + variantLabel(variant)}
                            className={cn(
                              inputClass,
                              "w-32 px-2 py-1.5 text-xs"
                            )}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="mt-6 text-xs text-neutral-500 dark:text-neutral-400">
              Add a name and at least one option to each group to generate
              variants.
            </p>
          )}
        </>
      )}
    </div>
  );
}