"use client";

import { useEffect, useRef, useState } from "react";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import type { MerchantCategory } from "@/lib/merchant/categories/types";
import {
  CATEGORY_PICKER_ADD_NEW,
  CATEGORY_PICKER_EDIT,
  CATEGORY_PICKER_PLACEHOLDER,
} from "@/lib/merchant/categories/labels";
import { useCategories } from "@/contexts/categories-context";
import { CategoryManagerModal } from "./category-manager-modal";

interface CategoryPickerProps {
  storeSlug: string;
  value: string | null;
  onChange: (categoryId: string) => void;
  categories: MerchantCategory[];
  productCounts: Record<string, number>;
  error?: string | null;
  disabled?: boolean;
}

export function CategoryPicker({
  storeSlug,
  value,
  onChange,
  categories,
  productCounts,
  error,
  disabled,
}: CategoryPickerProps) {
  const { createCategory } = useCategories();
  const [open, setOpen] = useState(false);
  const [managerOpen, setManagerOpen] = useState(false);
  const [addMode, setAddMode] = useState(false);
  const [newName, setNewName] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const newInputRef = useRef<HTMLInputElement | null>(null);

  const selected = categories.find((c) => c.id === value) ?? null;
  const label = selected ? selected.name : CATEGORY_PICKER_PLACEHOLDER;

  useEffect(() => {
    if (!open) return;
    const onDocMouseDown = (event: MouseEvent) => {
      if (!rootRef.current) return;
      if (rootRef.current.contains(event.target as Node)) return;
      setOpen(false);
      setAddMode(false);
      setNewName("");
      setAddError(null);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        setOpen(false);
        setAddMode(false);
        setNewName("");
        setAddError(null);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (addMode) {
      newInputRef.current?.focus();
    }
  }, [addMode]);

  const choose = (id: string) => {
    onChange(id);
    setOpen(false);
    setAddMode(false);
    setNewName("");
    setAddError(null);
  };

  const openManager = () => {
    setOpen(false);
    setManagerOpen(true);
  };

  const submitNew = () => {
    const result = createCategory(storeSlug, newName);
    if (!result.ok || !result.category) {
      setAddError(result.error ?? "");
      return;
    }
    choose(result.category.id);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-md border bg-white px-3 py-2 text-left text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:bg-neutral-950",
          error
            ? "border-danger-500"
            : "border-neutral-300 dark:border-neutral-700",
          disabled && "cursor-not-allowed opacity-60",
          selected
            ? "text-neutral-900 dark:text-neutral-100"
            : "text-neutral-400 dark:text-neutral-500"
        )}
      >
        <span className="min-w-0 truncate">{label}</span>
        <AtlasIcon
          name="chevron-down"
          className="h-4 w-4 shrink-0 text-neutral-400"
          aria-hidden="true"
        />
      </button>

      {error && (
        <p className="mt-1 text-xs text-danger-600 dark:text-danger-400">
          {error}
        </p>
      )}

      {open && (
        <div
          role="listbox"
          aria-label="Select category"
          className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
        >
          <ul role="list" className="max-h-60 overflow-y-auto py-1">
            {categories.map((category) => {
              const isSelected = category.id === value;
              return (
                <li key={category.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => choose(category.id)}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm",
                      isSelected
                        ? "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-200"
                        : "text-neutral-800 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
                    )}
                  >
                    <span className="truncate">{category.name}</span>
                    {isSelected && (
                      <AtlasIcon
                        name="check-circle"
                        className="h-4 w-4 shrink-0"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          {addMode ? (
            <div className="border-t border-neutral-200 p-2 dark:border-neutral-800">
              <input
                ref={newInputRef}
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                  if (addError) setAddError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    submitNew();
                  }
                }}
                placeholder="Category name"
                className="w-full rounded-md border border-neutral-300 bg-white px-2 py-1.5 text-sm text-neutral-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
              />
              <div className="mt-1.5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAddMode(false);
                    setNewName("");
                    setAddError(null);
                  }}
                  className="rounded-md px-2 py-1 text-xs font-medium text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitNew}
                  disabled={newName.trim().length === 0}
                  className="rounded-md bg-brand-600 px-2 py-1 text-xs font-medium text-white hover:bg-brand-700 disabled:opacity-50"
                >
                  Add
                </button>
              </div>
              {addError && (
                <p className="mt-1 text-xs text-danger-600 dark:text-danger-400">
                  {addError}
                </p>
              )}
            </div>
          ) : (
            <div className="border-t border-neutral-200 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setAddMode(true)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-brand-600 hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-brand-900/20"
              >
                <AtlasIcon name="add" className="h-4 w-4" aria-hidden="true" />
                {CATEGORY_PICKER_ADD_NEW}
              </button>
              <button
                type="button"
                onClick={openManager}
                className="flex w-full items-center gap-2 border-t border-neutral-100 px-3 py-2 text-left text-sm text-neutral-600 hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                <AtlasIcon name="edit" className="h-4 w-4" aria-hidden="true" />
                {CATEGORY_PICKER_EDIT}
              </button>
            </div>
          )}
        </div>
      )}

      <CategoryManagerModal
        open={managerOpen}
        onClose={() => setManagerOpen(false)}
        storeSlug={storeSlug}
        productCounts={productCounts}
      />
    </div>
  );
}