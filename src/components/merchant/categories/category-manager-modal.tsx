/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useRef, useState } from "react";
import { AtlasIcon } from "@/components/atlas/icons";
import { AtlasModalShell } from "@/components/atlas/modal-shell";
import { cn } from "@/lib/utils";
import type { MerchantCategory } from "@/lib/merchant/categories/types";
import { isSystemCategory } from "@/lib/merchant/categories/types";
import {
  CATEGORY_DELETE_BLOCKED_BY_PRODUCTS,
  CATEGORY_MANAGER_DESCRIPTION,
  CATEGORY_MANAGER_TITLE,
} from "@/lib/merchant/categories/labels";
import { useCategories } from "@/contexts/categories-context";

interface CategoryManagerModalProps {
  open: boolean;
  onClose: () => void;
  storeSlug: string;
  productCounts: Record<string, number>;
}

export function CategoryManagerModal({
  open,
  onClose,
  storeSlug,
  productCounts,
}: CategoryManagerModalProps) {
  const {
    getCategoriesForStore,
    createCategory,
    renameCategory,
    deleteCategory,
    moveCategory,
  } = useCategories();

  const [newName, setNewName] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [rowError, setRowError] = useState<{ id: string; message: string } | null>(
    null
  );
  const editInputRef = useRef<HTMLInputElement | null>(null);
  const newInputRef = useRef<HTMLInputElement | null>(null);

  const categories = getCategoriesForStore(storeSlug);

  useEffect(() => {
    if (!open) {
      setEditingId(null);
      setNewName("");
      setCreateError(null);
      setRowError(null);
    }
  }, [open]);

  useEffect(() => {
    if (editingId) {
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }
  }, [editingId]);

  const startEdit = (category: MerchantCategory) => {
    setEditingId(category.id);
    setEditValue(category.name);
    setRowError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
    setRowError(null);
  };

  const commitEdit = (categoryId: string) => {
    const result = renameCategory(storeSlug, categoryId, editValue);
    if (!result.ok) {
      setRowError({ id: categoryId, message: result.error ?? "" });
      return;
    }
    cancelEdit();
  };

  const handleDelete = (category: MerchantCategory) => {
    if (isSystemCategory(category)) {
      setRowError({ id: category.id, message: CATEGORY_DELETE_BLOCKED_BY_PRODUCTS });
      return;
    }
    const used = productCounts[category.id] ?? 0;
    if (used > 0) {
      setRowError({
        id: category.id,
        message:
          used === 1
            ? "1 product uses this category. Move it first."
            : used + " products use this category. Move them first.",
      });
      return;
    }
    const result = deleteCategory(storeSlug, category.id);
    if (!result.ok) {
      setRowError({ id: category.id, message: result.error ?? "" });
    }
  };

  const handleCreate = () => {
    const result = createCategory(storeSlug, newName);
    if (!result.ok) {
      setCreateError(result.error ?? "");
      return;
    }
    setNewName("");
    setCreateError(null);
    window.setTimeout(() => newInputRef.current?.focus(), 0);
  };

  return (
    <AtlasModalShell
      open={open}
      onClose={onClose}
      title={CATEGORY_MANAGER_TITLE}
      description={CATEGORY_MANAGER_DESCRIPTION}
      size="md"
    >
      <div className="space-y-4">
        <ul
          role="list"
          className="divide-y divide-neutral-200 dark:divide-neutral-800"
        >
          {categories.map((category, index) => {
            const isEditing = editingId === category.id;
            const used = productCounts[category.id] ?? 0;
            const system = isSystemCategory(category);
            const rowErr = rowError?.id === category.id ? rowError.message : null;
            return (
              <li key={category.id} className="py-3">
                <div className="flex items-center gap-2">
                  <div className="flex flex-col">
                    <button
                      type="button"
                      onClick={() => moveCategory(storeSlug, category.id, "up")}
                      disabled={index === 0}
                      className="rounded p-0.5 text-neutral-400 hover:text-neutral-700 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:text-neutral-200"
                      aria-label={"Move " + category.name + " up"}
                    >
                      <AtlasIcon
                        name="triangle-up"
                        className="h-3 w-3"
                        aria-hidden="true"
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveCategory(storeSlug, category.id, "down")}
                      disabled={index === categories.length - 1}
                      className="rounded p-0.5 text-neutral-400 hover:text-neutral-700 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:text-neutral-200"
                      aria-label={"Move " + category.name + " down"}
                    >
                      <AtlasIcon
                        name="triangle-down"
                        className="h-3 w-3"
                        aria-hidden="true"
                      />
                    </button>
                  </div>

                  {isEditing ? (
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <input
                        ref={editInputRef}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            commitEdit(category.id);
                          } else if (e.key === "Escape") {
                            e.preventDefault();
                            cancelEdit();
                          }
                        }}
                        className="min-w-0 flex-1 rounded-md border border-neutral-300 bg-white px-2 py-1 text-sm text-neutral-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                        aria-label={"Rename " + category.name}
                      />
                      <button
                        type="button"
                        onClick={() => commitEdit(category.id)}
                        className="rounded-md px-2 py-1 text-xs font-medium text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/30"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="rounded-md px-2 py-1 text-xs font-medium text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => startEdit(category)}
                      className="flex min-w-0 flex-1 items-baseline gap-2 text-left"
                    >
                      <span className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {category.name}
                      </span>
                      {system && (
                        <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                          Required
                        </span>
                      )}
                      {!system && used > 0 && (
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                          {used === 1 ? "1 product" : used + " products"}
                        </span>
                      )}
                    </button>
                  )}

                  {!isEditing && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => startEdit(category)}
                        className="rounded p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
                        aria-label={"Rename " + category.name}
                      >
                        <AtlasIcon
                          name="edit"
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(category)}
                        disabled={system || used > 0}
                        className={cn(
                          "rounded p-1.5",
                          system || used > 0
                            ? "cursor-not-allowed text-neutral-300 dark:text-neutral-700"
                            : "text-neutral-500 hover:bg-danger-50 hover:text-danger-600 dark:hover:bg-danger-900/30 dark:hover:text-danger-300"
                        )}
                        aria-label={"Delete " + category.name}
                      >
                        <AtlasIcon
                          name="trash"
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  )}
                </div>

                {rowErr && (
                  <p className="mt-1.5 text-xs text-danger-600 dark:text-danger-400">
                    {rowErr}
                  </p>
                )}
              </li>
            );
          })}
        </ul>

        <div className="border-t border-neutral-200 pt-4 dark:border-neutral-800">
          <label
            htmlFor="category-manager-new"
            className="block text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400"
          >
            Add new category
          </label>
          <div className="mt-2 flex items-center gap-2">
            <input
              id="category-manager-new"
              ref={newInputRef}
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value);
                if (createError) setCreateError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleCreate();
                }
              }}
              placeholder="e.g., Accessories"
              className="min-w-0 flex-1 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
            />
            <button
              type="button"
              onClick={handleCreate}
              disabled={newName.trim().length === 0}
              className="inline-flex items-center gap-1.5 rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <AtlasIcon name="add" className="h-3.5 w-3.5" aria-hidden="true" />
              Add
            </button>
          </div>
          {createError && (
            <p className="mt-1.5 text-xs text-danger-600 dark:text-danger-400">
              {createError}
            </p>
          )}
        </div>
      </div>
    </AtlasModalShell>
  );
}