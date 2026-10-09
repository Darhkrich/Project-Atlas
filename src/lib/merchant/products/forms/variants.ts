import type {
  ProductVariant,
  ProductVariantGroup,
} from "@/types/merchant-storefront";

// Produces every combination of options across the given groups.
// Each variant gets a new id and starts with stockLevel 0.
// Incomplete groups (no name, no options) produce zero variants.
export function cartesianVariants(
  groups: ProductVariantGroup[]
): ProductVariant[] {
  if (groups.length === 0) return [];

  for (const group of groups) {
    if (group.name.trim().length === 0) return [];
    if (group.options.length === 0) return [];
  }

  let combos: Record<string, string>[] = [{}];
  for (const group of groups) {
    const next: Record<string, string>[] = [];
    for (const combo of combos) {
      for (const option of group.options) {
        next.push({ ...combo, [group.name]: option });
      }
    }
    combos = next;
  }

  return combos.map((options) => ({
    id: crypto.randomUUID(),
    options,
    stockLevel: 0,
  }));
}

function variantSignature(
  variant: ProductVariant,
  groups: ProductVariantGroup[]
): string {
  const parts: string[] = [];
  for (const group of groups) {
    parts.push(group.name + "=" + (variant.options[group.name] ?? ""));
  }
  return parts.join("|");
}

// Rebuilds the variant set after the merchant edits groups.
// A variant whose option combination still exists keeps its id, stock,
// price override, and sku. New combinations appear with stock 0.
// Removed combinations are dropped.
export function regenerateVariants(
  groups: ProductVariantGroup[],
  existing: ProductVariant[]
): ProductVariant[] {
  const fresh = cartesianVariants(groups);
  if (existing.length === 0) return fresh;

  const bySignature = new Map<string, ProductVariant>();
  for (const v of existing) {
    bySignature.set(variantSignature(v, groups), v);
  }

  return fresh.map((n) => {
    const match = bySignature.get(variantSignature(n, groups));
    if (!match) return n;
    return {
      id: match.id,
      options: n.options,
      name: match.name,
      priceOverride: match.priceOverride,
      stockLevel: match.stockLevel,
      sku: match.sku,
    };
  });
}

// Rewrites the options map on every variant so a group's name change
// carries its option values forward. Call this before regenerateVariants
// when the merchant renames a group.
export function renameGroupKey(
  variants: ProductVariant[],
  oldName: string,
  newName: string
): ProductVariant[] {
  if (oldName === newName) return variants;
  return variants.map((variant) => {
    const next: Record<string, string> = {};
    for (const [key, value] of Object.entries(variant.options)) {
      next[key === oldName ? newName : key] = value;
    }
    return { ...variant, options: next };
  });
}