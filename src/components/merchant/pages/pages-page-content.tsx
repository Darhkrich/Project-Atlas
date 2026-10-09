/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { AtlasIcon } from "@/components/atlas/icons";
import { useStorefrontConfig } from "@/contexts/storefront-config-context";
import { usePages } from "@/lib/merchant/storefront/pages/use-pages";
import type { CustomPage } from "@/types/merchant-storefront";
import { PageRow } from "./page-row";
import { PagesEmptyState } from "./pages-empty-state";
import { PageFormModal } from "./page-form-modal";
import { PageDeleteModal } from "./page-delete-modal";

export function PagesPageContent() {
  const { storefrontConfig } = useStorefrontConfig();
  const storefrontId = storefrontConfig.storefrontId;
  const { pages, create, update, remove, setPublished, setShowInFooter } =
    usePages(storefrontId);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CustomPage | null>(null);
  const [deleting, setDeleting] = useState<CustomPage | null>(null);

  const ordered = pages.slice().sort((a, b) => a.order - b.order);

  function handleOpenCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function handleOpenEdit(page: CustomPage) {
    setEditing(page);
    setFormOpen(true);
  }

  function handleSubmit(
    input: Omit<CustomPage, "id" | "order">,
    isNew: boolean
  ) {
    if (editing) {
      update(editing.id, input);
    } else {
      const nextOrder = ordered.length;
      create({ ...input, order: nextOrder });
    }
    setFormOpen(false);
    setEditing(null);
  }

  function handleConfirmDelete() {
    if (!deleting) return;
    remove(deleting.id);
    setDeleting(null);
  }

  function handleMove(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= ordered.length) return;
    const a = ordered[index];
    const b = ordered[target];
    update(a.id, { order: target });
    update(b.id, { order: index });
  }

  const existingSlugs = pages
    .filter((p) => !editing || p.id !== editing.id)
    .map((p) => p.slug);

  const publishedCount = pages.filter((p) => p.published).length;
  const draftCount = pages.length - publishedCount;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-3xl">
            Pages
          </h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Content pages for your storefront. {pages.length}{" "}
            {pages.length === 1 ? "page" : "pages"} total.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 self-start rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 sm:self-auto"
        >
          <AtlasIcon name="plus" className="h-4 w-4" aria-hidden="true" />
          New page
        </button>
      </div>

      {pages.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          <SummaryCard label="Published" value={publishedCount} tone="success" />
          <SummaryCard label="Drafts" value={draftCount} tone="neutral" />
        </div>
      )}

      {pages.length === 0 ? (
        <PagesEmptyState onCreate={handleOpenCreate} />
      ) : (
        <ul role="list" className="space-y-3">
          {ordered.map((page, index) => (
            <PageRow
              key={page.id}
              page={page}
              isFirst={index === 0}
              isLast={index === ordered.length - 1}
              onMoveUp={() => handleMove(index, -1)}
              onMoveDown={() => handleMove(index, 1)}
              onTogglePublished={(next) => setPublished(page.id, next)}
              onToggleFooter={(next) => setShowInFooter(page.id, next)}
              onEdit={() => handleOpenEdit(page)}
              onDelete={() => setDeleting(page)}
            />
          ))}
        </ul>
      )}

      <PageFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        existing={editing}
        existingSlugs={existingSlugs}
        onSubmit={handleSubmit}
      />

      <PageDeleteModal
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        title={deleting?.title ?? ""}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

interface SummaryCardProps {
  label: string;
  value: number;
  tone: "success" | "neutral";
}

const SUMMARY_TONE: Record<SummaryCardProps["tone"], string> = {
  success:
    "border-success-200 bg-success-50 dark:border-success-900 dark:bg-success-900/20",
  neutral:
    "border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900",
};

function SummaryCard({ label, value, tone }: SummaryCardProps) {
  return (
    <div className={SUMMARY_TONE[tone] + " rounded-xl border p-4"}>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
        {value}
      </p>
    </div>
  );
}