/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  getPagesFor,
  getPagesVersion,
  subscribeToPages,
} from "./pages-store";
import {
  createPage,
  deletePage,
  setPagePublished,
  setPageShowInFooter,
  updatePage,
} from "./pages-mutations";
import type { CustomPage } from "@/types/merchant-storefront";

export function usePages(storefrontId: string) {
  const snapshot = useSyncExternalStore(
    subscribeToPages,
    getPagesVersion,
    () => 0
  );

  const pages = useMemo(
    () => getPagesFor(storefrontId),
    [storefrontId, snapshot]
  );

  return {
    pages,
    create: (input: Omit<CustomPage, "id">) => createPage(storefrontId, input),
    update: (id: string, patch: Partial<Omit<CustomPage, "id">>) =>
      updatePage(storefrontId, id, patch),
    remove: (id: string) => deletePage(storefrontId, id),
    setPublished: (id: string, published: boolean) =>
      setPagePublished(storefrontId, id, published),
    setShowInFooter: (id: string, showInFooter: boolean) =>
      setPageShowInFooter(storefrontId, id, showInFooter),
  };
}