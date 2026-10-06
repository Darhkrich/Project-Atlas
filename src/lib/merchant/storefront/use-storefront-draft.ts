"use client";

import { useCallback, useMemo, useState } from "react";
import {
  defaultMerchantStorefront,
  type MerchantStorefrontConfig,
} from "@/types/merchant-storefront";

export interface UseStorefrontDraftResult {
  draft: MerchantStorefrontConfig;
  setField: <K extends keyof MerchantStorefrontConfig>(
    key: K,
    value: MerchantStorefrontConfig[K]
  ) => void;
  patch: (updates: Partial<MerchantStorefrontConfig>) => void;
  replace: (next: MerchantStorefrontConfig) => void;
  isDirty: (key: keyof MerchantStorefrontConfig) => boolean;
  revertField: (key: keyof MerchantStorefrontConfig) => void;
  revertAll: () => void;
  anyDirty: boolean;
  isDefault: (key: keyof MerchantStorefrontConfig) => boolean;
  resetToDefault: (key: keyof MerchantStorefrontConfig) => void;
  markCommitted: () => void;
}

export function useStorefrontDraft(
  initial: MerchantStorefrontConfig
): UseStorefrontDraftResult {
  const [draft, setDraft] = useState<MerchantStorefrontConfig>(initial);
  const [committed, setCommitted] = useState<MerchantStorefrontConfig>(initial);

  const setField = useCallback(
    <K extends keyof MerchantStorefrontConfig>(
      key: K,
      value: MerchantStorefrontConfig[K]
    ) => {
      setDraft((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const patch = useCallback((updates: Partial<MerchantStorefrontConfig>) => {
    setDraft((prev) => ({ ...prev, ...updates }));
  }, []);

  const replace = useCallback((next: MerchantStorefrontConfig) => {
    setDraft(next);
    setCommitted(next);
  }, []);

  const isDirty = useCallback(
    (key: keyof MerchantStorefrontConfig) => draft[key] !== committed[key],
    [draft, committed]
  );

  const revertField = useCallback(
    (key: keyof MerchantStorefrontConfig) => {
      setDraft((prev) => ({ ...prev, [key]: committed[key] }));
    },
    [committed]
  );

  const revertAll = useCallback(() => {
    setDraft(committed);
  }, [committed]);

  const anyDirty = useMemo(() => {
    return JSON.stringify(draft) !== JSON.stringify(committed);
  }, [draft, committed]);

  const isDefault = useCallback(
    (key: keyof MerchantStorefrontConfig) =>
      draft[key] === defaultMerchantStorefront[key],
    [draft]
  );

  const resetToDefault = useCallback(
    (key: keyof MerchantStorefrontConfig) => {
      setDraft((prev) => ({
        ...prev,
        [key]: defaultMerchantStorefront[key],
      }));
    },
    []
  );

  const markCommitted = useCallback(() => {
    setCommitted(draft);
  }, [draft]);

  return {
    draft,
    setField,
    patch,
    replace,
    isDirty,
    revertField,
    revertAll,
    anyDirty,
    isDefault,
    resetToDefault,
    markCommitted,
  };
}