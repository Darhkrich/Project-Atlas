/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Button } from "./button";
import { Input } from "./input";

export interface SavedView {
  name: string;
  filters: any;
}

interface SavedViewsProps {
  views: SavedView[];
  onLoad: (view: SavedView) => void;
  onDelete: (name: string) => void;
  onSave: (name: string) => void;
  storageKey?: string;
}

export function SavedViews({ views, onLoad, onDelete, onSave }: SavedViewsProps) {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newName, setNewName] = useState("");

  const handleSave = () => {
    if (newName.trim()) {
      onSave(newName.trim());
      setNewName("");
      setShowSaveDialog(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-neutral-500">Saved Views:</span>
      {views.map((view) => (
        <div
          key={view.name}
          className="flex items-center gap-1 rounded-md bg-neutral-100 px-2 py-1 dark:bg-neutral-800"
        >
          <button
            className="text-xs font-medium text-neutral-700 dark:text-neutral-200"
            onClick={() => onLoad(view)}
          >
            {view.name}
          </button>
          <button
            className="text-xs text-neutral-400 hover:text-danger-600"
            onClick={() => onDelete(view.name)}
          >
            ×
          </button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => setShowSaveDialog(true)}>
        Save Current Filters
      </Button>

      {showSaveDialog && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowSaveDialog(false)} />
          <div className="relative w-full max-w-sm rounded-lg bg-white p-6 shadow-xl dark:bg-neutral-900">
            <h3 className="text-lg font-semibold">Save Current Filters</h3>
            <p className="mt-2 text-sm text-neutral-500">Give this view a name.</p>
            <Input
              className="mt-4"
              placeholder="e.g., Active Verified"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowSaveDialog(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}