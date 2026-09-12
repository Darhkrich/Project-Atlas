// components/admin/ui/saved-views.tsx
"use client";

import { useId, useState, type KeyboardEvent } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { ConfirmDialog } from "./confirm-dialog";
import { useFocusTrap } from "@/lib/admin/hooks/use-focus-trap";

export type SavedViewFilters = Record<string, string>;

export interface SavedView {
  name: string;
  filters: SavedViewFilters;
}

interface SavedViewsProps {
  views: SavedView[];
  onLoad: (view: SavedView) => void;
  onDelete: (name: string) => void;
  onSave: (name: string) => void;
}

export function SavedViews({
  views,
  onLoad,
  onDelete,
  onSave,
}: SavedViewsProps) {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newName, setNewName] = useState("");
  const [duplicateError, setDuplicateError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SavedView | null>(null);

  const trapRef = useFocusTrap<HTMLDivElement>(showSaveDialog, () =>
    setShowSaveDialog(false)
  );
  const titleId = useId();

  const resetDialog = () => {
    setNewName("");
    setDuplicateError(null);
  };

  const closeDialog = () => {
    resetDialog();
    setShowSaveDialog(false);
  };

  const handleSave = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    if (views.some((v) => v.name === trimmed)) {
      setDuplicateError(`A view named "${trimmed}" already exists.`);
      return;
    }
    onSave(trimmed);
    closeDialog();
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    onDelete(deleteTarget.name);
    setDeleteTarget(null);
  };

  const onChipKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number
  ) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      const next = (index + 1) % views.length;
      (
        document.querySelector(
          `[data-saved-view-index="${next}"]`
        ) as HTMLElement | null
      )?.focus();
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      const prev = (index - 1 + views.length) % views.length;
      (
        document.querySelector(
          `[data-saved-view-index="${prev}"]`
        ) as HTMLElement | null
      )?.focus();
    }
  };

  return (
    <div
      role="toolbar"
      aria-label="Saved audit log views"
      className="flex flex-wrap items-center gap-2"
    >
      <span className="text-xs text-neutral-500 dark:text-neutral-400">
        Saved views:
      </span>

      {views.length === 0 && (
        <span className="text-xs text-neutral-400 dark:text-neutral-500">
          None yet
        </span>
      )}

      {views.map((view, index) => (
        <div
          key={view.name}
          className="flex items-center gap-1 rounded-md bg-neutral-100 px-2 py-1 dark:bg-neutral-800"
        >
          <button
            type="button"
            data-saved-view-index={index}
            className="text-xs font-medium text-neutral-700 hover:text-brand-600 dark:text-neutral-200 dark:hover:text-brand-300"
            onClick={() => onLoad(view)}
            onKeyDown={(e) => onChipKeyDown(e, index)}
          >
            {view.name}
          </button>
          <button
            type="button"
            aria-label={`Delete view ${view.name}`}
            className="px-1 text-xs text-neutral-400 hover:text-danger-600 dark:hover:text-danger-400"
            onClick={() => setDeleteTarget(view)}
          >
            ×
          </button>
        </div>
      ))}

      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowSaveDialog(true)}
      >
        Save current filters
      </Button>

      {showSaveDialog && (
        <div
          ref={trapRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeDialog}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-sm rounded-lg bg-white p-6 shadow-xl dark:bg-neutral-900">
            <h3 id={titleId} className="text-lg font-semibold">
              Save current filters
            </h3>
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
              Give this view a name so you can reload it later.
            </p>
            <Input
              className="mt-4"
              aria-label="View name"
              placeholder="e.g. Role changes by Yaw"
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value);
                setDuplicateError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") closeDialog();
              }}
              autoFocus
            />
            {duplicateError && (
              <p
                role="alert"
                className="mt-2 text-xs text-danger-600 dark:text-danger-400"
              >
                {duplicateError}
              </p>
            )}
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={closeDialog}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!newName.trim()}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete saved view?"
        description={
          deleteTarget
            ? `"${deleteTarget.name}" will be removed. This cannot be undone.`
            : ""
        }
        confirmLabel="Delete view"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}