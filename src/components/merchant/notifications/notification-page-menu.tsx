"use client";

import { useEffect, useRef, useState } from "react";
import { AtlasIcon } from "@/components/atlas/icons";

interface NotificationPageMenuProps {
  canMarkAllRead: boolean;
  canDismissAllRead: boolean;
  canExport: boolean;
  onMarkAllRead: () => void;
  onDismissAllRead: () => void;
  onExportCsv: () => void;
}

export function NotificationPageMenu({
  canMarkAllRead,
  canDismissAllRead,
  canExport,
  onMarkAllRead,
  onDismissAllRead,
  onExportCsv,
}: NotificationPageMenuProps) {
  const [open, setOpen] = useState(false);
  const [confirmDismiss, setConfirmDismiss] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (wrapperRef.current && !wrapperRef.current.contains(target)) {
        setOpen(false);
        setConfirmDismiss(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setConfirmDismiss(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        aria-label="Page actions"
        aria-haspopup="menu"
        aria-expanded={open}
        className="rounded-md p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
      >
        <AtlasIcon name="more" className="h-5 w-5" />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Page actions"
          className="absolute right-0 top-full z-20 mt-2 w-56 rounded-xl border border-neutral-200 bg-white py-1 shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
        >
          <button
            type="button"
            role="menuitem"
            disabled={!canMarkAllRead}
            onClick={() => {
              setOpen(false);
              onMarkAllRead();
            }}
            className="block w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            Mark all as read
          </button>

          {!confirmDismiss ? (
            <button
              type="button"
              role="menuitem"
              disabled={!canDismissAllRead}
              onClick={() => setConfirmDismiss(true)}
              className="block w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-neutral-200 dark:hover:bg-neutral-800"
            >
              Dismiss all read
            </button>
          ) : (
            <div className="flex items-center justify-between gap-2 px-4 py-2 text-xs">
              <span className="text-neutral-600 dark:text-neutral-300">
                Remove all read?
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setConfirmDismiss(false);
                    onDismissAllRead();
                  }}
                  className="font-semibold text-danger-600 hover:underline dark:text-danger-400"
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDismiss(false)}
                  className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                >
                  No
                </button>
              </div>
            </div>
          )}

          <div className="my-1 border-t border-neutral-200 dark:border-neutral-800" />

          <button
            type="button"
            role="menuitem"
            disabled={!canExport}
            onClick={() => {
              setOpen(false);
              onExportCsv();
            }}
            className="block w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            Download CSV
          </button>
        </div>
      )}
    </div>
  );
}