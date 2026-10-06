// lib/admin/mock/data-plans.ts

import { getCatalog, type ServiceCategory } from "@/lib/domains/catalog";

/**
 * Returns a fresh, deep-cloned copy of the live service catalog. Called at
 * consumer mount time, this reflects the current catalog state, including
 * mutations performed during the session.
 *
 * The Data Plans admin holds this array as its only state and derives the
 * network/category/plan view from it via projectNetworksFromCatalog. Every
 * mutation goes through applyNetworkMutation, which returns a new array.
 *
 * Not a mock. Despite the folder name, the source is the live catalog.
 */
export function getFreshCatalog(): ServiceCategory[] {
  return structuredClone(getCatalog());
}