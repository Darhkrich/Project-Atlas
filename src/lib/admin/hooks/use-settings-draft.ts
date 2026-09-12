// lib/admin/hooks/use-settings-draft.ts
"use client";

import { useCallback, useMemo, useState } from "react";
import type { SettingsTab } from "@/lib/admin/types/settings";

export interface SettingsDraftState {
  general: Record<string, unknown>;
  notifications: Record<string, unknown>;
  security: Record<string, unknown>;
  maintenance: Record<string, unknown>;
  api: Record<string, unknown>;
  payments: Record<string, unknown>;
  wallet: Record<string, unknown>;
  support: Record<string, unknown>;
  localization: Record<string, unknown>;
  compliance: Record<string, unknown>;
  webhooks: Record<string, unknown>;
}

export type SettingsSnapshot = SettingsDraftState;

interface UseSettingsDraftResult {
  draft: SettingsDraftState;
  saved: SettingsDraftState;
  patch: <K extends keyof SettingsDraftState>(
    tab: K,
    patch: Partial<SettingsDraftState[K]>
  ) => void;
  reset: (tab: keyof SettingsDraftState) => void;
  discardAll: () => void;
  markSaved: () => void;
  isTabDirty: (tab: keyof SettingsDraftState) => boolean;
  dirtyTabs: SettingsTab[];
  hasChanges: boolean;
}

function shallowEqual(
  a: Record<string, unknown>,
  b: Record<string, unknown>
): boolean {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of keys) {
    if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) return false;
  }
  return true;
}

export function useSettingsDraft(
  initial: SettingsDraftState
): UseSettingsDraftResult {
  const [draft, setDraft] = useState<SettingsDraftState>(initial);
  const [saved, setSaved] = useState<SettingsDraftState>(initial);

  const patch = useCallback(
    <K extends keyof SettingsDraftState>(
      tab: K,
      partial: Partial<SettingsDraftState[K]>
    ) => {
      setDraft((prev) => ({
        ...prev,
        [tab]: { ...prev[tab], ...partial },
      }));
    },
    []
  );

  const reset = useCallback(
    (tab: keyof SettingsDraftState) => {
      setDraft((prev) => ({ ...prev, [tab]: { ...saved[tab] } }));
    },
    [saved]
  );

  const discardAll = useCallback(() => {
    setDraft({ ...saved });
  }, [saved]);

  const markSaved = useCallback(() => {
    setSaved({ ...draft });
  }, [draft]);

  const isTabDirty = useCallback(
    (tab: keyof SettingsDraftState) => !shallowEqual(draft[tab], saved[tab]),
    [draft, saved]
  );

  const dirtyTabs = useMemo(() => {
    const keys = Object.keys(draft) as (keyof SettingsDraftState)[];
    return keys.filter((k) => isTabDirty(k)) as SettingsTab[];
  }, [draft, isTabDirty]);

  const hasChanges = dirtyTabs.length > 0;

  return {
    draft,
    saved,
    patch,
    reset,
    discardAll,
    markSaved,
    isTabDirty,
    dirtyTabs,
    hasChanges,
  };
}