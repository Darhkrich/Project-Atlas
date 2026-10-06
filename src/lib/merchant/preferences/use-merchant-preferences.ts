"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  getPreferencesForStore,
  getPreferencesVersion,
  subscribeToPreferences,
} from "./store";
import type { MerchantPreferences } from "./types";

export function useMerchantPreferences(
  storeSlug: string
): MerchantPreferences {
  const version = useSyncExternalStore(
    subscribeToPreferences,
    getPreferencesVersion,
    () => 0
  );

  return useMemo(() => {
    void version;
    return getPreferencesForStore(storeSlug);
  }, [storeSlug, version]);
}