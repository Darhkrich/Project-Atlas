/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export function useProductSelection(resetKey: string) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setSelectedIds(new Set());
  }, [resetKey]);

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

  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds]
  );

  const allSelected = useCallback(
    (ids: string[]) =>
      ids.length > 0 && ids.every((id) => selectedIds.has(id)),
    [selectedIds]
  );

  const someSelected = useCallback(
    (ids: string[]) => {
      if (ids.length === 0) return false;
      const selectedCount = ids.filter((id) => selectedIds.has(id)).length;
      return selectedCount > 0 && selectedCount < ids.length;
    },
    [selectedIds]
  );

  const count = selectedIds.size;

  const ids = useMemo(() => Array.from(selectedIds), [selectedIds]);

  return {
    ids,
    count,
    isSelected,
    toggle,
    selectAll,
    clear,
    allSelected,
    someSelected,
  };
}