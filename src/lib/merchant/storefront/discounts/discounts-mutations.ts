import type { Discount } from "@/types/merchant-storefront";
import { getDiscountsFor, setDiscountsFor } from "./discounts-store";

export function createDiscount(
  storefrontId: string,
  input: Omit<Discount, "id" | "usedCount">
): Discount {
  const discount: Discount = {
    ...input,
    id: crypto.randomUUID(),
    usedCount: 0,
  };
  const current = getDiscountsFor(storefrontId);
  setDiscountsFor(storefrontId, [...current, discount]);
  return discount;
}

export function updateDiscount(
  storefrontId: string,
  id: string,
  patch: Partial<Omit<Discount, "id">>
): void {
  const current = getDiscountsFor(storefrontId);
  const next = current.map((d) => (d.id === id ? { ...d, ...patch } : d));
  setDiscountsFor(storefrontId, next);
}

export function deleteDiscount(storefrontId: string, id: string): void {
  const current = getDiscountsFor(storefrontId);
  setDiscountsFor(
    storefrontId,
    current.filter((d) => d.id !== id)
  );
}

export function setDiscountEnabled(
  storefrontId: string,
  id: string,
  enabled: boolean
): void {
  updateDiscount(storefrontId, id, { enabled });
}

// Not authoritative until backend validates.
export function incrementDiscountUse(
  storefrontId: string,
  id: string
): void {
  const current = getDiscountsFor(storefrontId);
  const next = current.map((d) =>
    d.id === id ? { ...d, usedCount: d.usedCount + 1 } : d
  );
  setDiscountsFor(storefrontId, next);
}