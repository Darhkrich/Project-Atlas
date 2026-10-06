/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";

interface NotificationUndoToastProps {
  visible: boolean;
  onUndo: () => void;
  durationMs?: number;
}

export function NotificationUndoToast({
  visible,
  onUndo,
  durationMs = 5000,
}: NotificationUndoToastProps) {
  const [startedAt, setStartedAt] = useState<number | null>(null);

  useEffect(() => {
    if (visible) {
      setStartedAt(Date.now());
    } else {
      setStartedAt(null);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-6 z-50 w-72 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-900 text-sm text-white shadow-2xl dark:border-neutral-700"
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <span>Notification dismissed.</span>
        <button
          type="button"
          onClick={onUndo}
          className="font-semibold text-brand-300 underline-offset-2 hover:underline"
        >
          Undo
        </button>
      </div>
      <div
        key={startedAt ?? 0}
        className="h-0.5 w-full origin-left bg-brand-500"
        style={{
          animation: "atlas-undo-drain " + durationMs + "ms linear forwards",
        }}
      />
    </div>
  );
}


