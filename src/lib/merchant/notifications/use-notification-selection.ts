"use client";

import { useCallback, useState } from "react";

export interface UseNotificationSelectionResult {
  selectionMode: boolean;
  selectedIds: Set<string>;
  selectedCount: number;
  enterSelection: (firstId?: string) => void;
  exitSelection: () => void;
  toggle: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clear: () => void;
}

export function useNotificationSelection(): UseNotificationSelectionResult {
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const enterSelection = useCallback((firstId?: string) => {
    setSelectionMode(true);
    setSelectedIds(firstId ? new Set([firstId]) : new Set());
  }, []);

  const exitSelection = useCallback(() => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  }, []);

  const toggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback((ids: string[]) => {
    setSelectedIds(new Set(ids));
  }, []);

  const clear = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  return {
    selectionMode,
    selectedIds,
    selectedCount: selectedIds.size,
    enterSelection,
    exitSelection,
    toggle,
    selectAll,
    clear,
  };
}