// lib/admin/hooks/use-inbox-keyboard.ts
"use client";

import { useEffect } from "react";

interface UseInboxKeyboardOptions {
  itemIds: string[];
  focusedId: string | null;
  enabled: boolean;
  onFocusChange: (id: string | null) => void;
  onOpen: (id: string) => void;
  onFocusSearch: () => void;
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

export function useInboxKeyboard({
  itemIds,
  focusedId,
  enabled,
  onFocusChange,
  onOpen,
  onFocusSearch,
}: UseInboxKeyboardOptions) {
  useEffect(() => {
    if (!enabled) return;

    const handler = (event: KeyboardEvent) => {
      const typing = isTypingTarget(event.target);

      if (event.key === "/" && !typing && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        onFocusSearch();
        return;
      }

      if (typing) return;

      if (event.key === "j" || event.key === "ArrowDown") {
        event.preventDefault();
        const idx = focusedId ? itemIds.indexOf(focusedId) : -1;
        const next = itemIds[Math.min(idx + 1, itemIds.length - 1)] ?? null;
        onFocusChange(next);
        return;
      }

      if (event.key === "k" || event.key === "ArrowUp") {
        event.preventDefault();
        const idx = focusedId ? itemIds.indexOf(focusedId) : itemIds.length;
        const prev = itemIds[Math.max(idx - 1, 0)] ?? null;
        onFocusChange(prev);
        return;
      }

      if (event.key === "Enter" && focusedId) {
        event.preventDefault();
        onOpen(focusedId);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [enabled, itemIds, focusedId, onFocusChange, onOpen, onFocusSearch]);
}