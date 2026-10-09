/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  getMediaFor,
  getMediaVersion,
  subscribeToMedia,
} from "./store";
import {
  addMedia,
  removeMedia,
  updateMediaAlt,
  type AddMediaInput,
  type AddMediaResult,
} from "./mutations";
import type { MediaAsset } from "./types";

export function useMedia(storefrontId: string) {
  const snapshot = useSyncExternalStore(
    subscribeToMedia,
    getMediaVersion,
    () => 0
  );

  const library = useMemo(
    () => getMediaFor(storefrontId),
    [storefrontId, snapshot]
  );

  const uploads = useMemo(
    () => library.filter((a) => a.source === "upload"),
    [library]
  );

  return {
    library,
    uploads,
    add: (input: AddMediaInput): AddMediaResult =>
      addMedia(storefrontId, input),
    remove: (id: string) => removeMedia(storefrontId, id),
    setAlt: (id: string, alt: string) =>
      updateMediaAlt(storefrontId, id, alt),
  };
}

export type UseMediaResult = ReturnType<typeof useMedia>;
export type { MediaAsset };