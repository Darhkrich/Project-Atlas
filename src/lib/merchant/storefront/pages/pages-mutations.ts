import type { CustomPage } from "@/types/merchant-storefront";
import { getPagesFor, setPagesFor } from "./pages-store";

export function createPage(
  storefrontId: string,
  input: Omit<CustomPage, "id">
): CustomPage {
  const page: CustomPage = {
    ...input,
    id: crypto.randomUUID(),
  };
  const current = getPagesFor(storefrontId);
  setPagesFor(storefrontId, [...current, page]);
  return page;
}

export function updatePage(
  storefrontId: string,
  id: string,
  patch: Partial<Omit<CustomPage, "id">>
): void {
  const current = getPagesFor(storefrontId);
  const next = current.map((p) => (p.id === id ? { ...p, ...patch } : p));
  setPagesFor(storefrontId, next);
}

export function deletePage(storefrontId: string, id: string): void {
  const current = getPagesFor(storefrontId);
  setPagesFor(
    storefrontId,
    current.filter((p) => p.id !== id)
  );
}

export function setPagePublished(
  storefrontId: string,
  id: string,
  published: boolean
): void {
  updatePage(storefrontId, id, { published });
}

export function setPageShowInFooter(
  storefrontId: string,
  id: string,
  showInFooter: boolean
): void {
  updatePage(storefrontId, id, { showInFooter });
}