/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  getDiscountsFor,
  getDiscountsVersion,
  subscribeToDiscounts,
} from "./discounts-store";
import {
  createDiscount,
  deleteDiscount,
  setDiscountEnabled,
  updateDiscount,
} from "./discounts-mutations";
import type { Discount } from "@/types/merchant-storefront";

export function useDiscounts(storefrontId: string) {
  const snapshot = useSyncExternalStore(
    subscribeToDiscounts,
    getDiscountsVersion,
    () => 0
  );

  const discounts = useMemo(
    () => getDiscountsFor(storefrontId),
    [storefrontId, snapshot]
  );

  return {
    discounts,
    create: (input: Omit<Discount, "id" | "usedCount">) =>
      createDiscount(storefrontId, input),
    update: (id: string, patch: Partial<Omit<Discount, "id">>) =>
      updateDiscount(storefrontId, id, patch),
    remove: (id: string) => deleteDiscount(storefrontId, id),
    setEnabled: (id: string, enabled: boolean) =>
      setDiscountEnabled(storefrontId, id, enabled),
  };
}