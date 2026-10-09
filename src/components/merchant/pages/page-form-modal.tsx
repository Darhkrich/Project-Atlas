/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { AtlasModalShell } from "@/components/atlas/modal-shell";
import { cn } from "@/lib/utils";
import type { CustomPage } from "@/types/merchant-storefront";

interface PageFormModalProps {
  open: boolean;
  onClose: () => void;
  existing: CustomPage | null;
  existingSlugs: string[];
  onSubmit: (
    input: Omit<CustomPage, "id" | "order">,
    isNew: boolean
  ) => void;
}

interface FormState {
  title: string;
  slug: string;
  body: string;
  published: boolean;
  showInFooter: boolean;
}

const EMPTY_FORM: FormState = {
  title: "",
  slug: "",
  body: "",
  published: true,
  showInFooter: false,
};

const SLUG_MAX = 40;
const TITLE_MAX = 80;
const BODY_MAX = 8000;

const inputClass =
  "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100";

function slugify(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, SLUG_MAX);
}

function formFromExisting(page: CustomPage): FormState {
  return {
    title: page.title,
    slug: page.slug,
    body: page.body,
    published: page.published,
    showInFooter: page.showInFooter,
  };
}

export function PageFormModal({
  open,
  onClose,
  existing,
  existingSlugs,
  onSubmit,
}: PageFormModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [slugTouched, setSlugTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setForm(existing ? formFromExisting(existing) : EMPTY_FORM);
    setSlugTouched(existing !== null);
    setError(null);
  }, [open, existing]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  }

  function handleTitleChange(raw: string) {
    const next = raw.slice(0, TITLE_MAX);
    setForm((prev) => {
      const updated = { ...prev, title: next };
      if (!slugTouched) {
        updated.slug = slugify(next);
      }
      return updated;
    });
    setError(null);
  }

  function handleSlugChange(raw: string) {
    setSlugTouched(true);
    setField("slug", slugify(raw));
  }

  function handleSubmit() {
    const title = form.title.trim();
    if (title.length === 0) {
      setError("Give the page a title.");
      return;
    }
    const slug = form.slug.trim();
    if (slug.length < 2) {
      setError("Slug must be at least 2 characters.");
      return;
    }
    const candidate = slug.toLowerCase();
    const clash = existingSlugs.some((s) => s.toLowerCase() === candidate);
    if (clash) {
      setError("A page with that slug already exists.");
      return;
    }
    if (form.body.length > BODY_MAX) {
      setError("Body is too long.");
      return;
    }

    onSubmit(
      {
        title,
        slug,
        body: form.body,
        published: form.published,
        showInFooter: form.showInFooter,
      },
      existing === null
    );
  }

  return (
    <AtlasModalShell
      open={open}
      onClose={onClose}
      title={existing ? "Edit page" : "New page"}
      description={
        existing ? existing.title : "Add a page customers can read."
      }
      size="lg"
    >
      <div className="space-y-4">
        <div>
          <label
            htmlFor="page-title"
            className="mb-1.5 block text-xs font-medium text-neutral-700 dark:text-neutral-300"
          >
            Title
          </label>
          <input
            id="page-title"
            type="text"
            value={form.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="e.g. About our ingredients"
            maxLength={TITLE_MAX}
            className={inputClass}
          />
        </div>

        <div>
          <label
            htmlFor="page-slug"
            className="mb-1.5 block text-xs font-medium text-neutral-700 dark:text-neutral-300"
          >
            URL
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              /pages/
            </span>
            <input
              id="page-slug"
              type="text"
              value={form.slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="about-our-ingredients"
              maxLength={SLUG_MAX}
              autoComplete="off"
              spellCheck={false}
              className={cn(inputClass, "font-mono text-xs")}
            />
          </div>
          <p className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
            Auto-generated from the title. Edit if you want a shorter URL.
          </p>
        </div>

        <div>
          <label
            htmlFor="page-body"
            className="mb-1.5 block text-xs font-medium text-neutral-700 dark:text-neutral-300"
          >
            Body
          </label>
          <textarea
            id="page-body"
            value={form.body}
            onChange={(e) => setField("body", e.target.value)}
            rows={12}
            maxLength={BODY_MAX}
            placeholder={"Write the page content here.\n\nSeparate paragraphs with a blank line."}
            className={cn(inputClass, "resize-none leading-6")}
          />
          <p className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
            Plain text. Blank lines become separate paragraphs on the page.
          </p>
        </div>

        <div className="space-y-2">
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setField("published", e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-500 dark:border-neutral-600"
            />
            <span>
              <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
                Published
              </span>
              <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                Unpublished pages are saved but not visible to customers.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
            <input
              type="checkbox"
              checked={form.showInFooter}
              onChange={(e) => setField("showInFooter", e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-500 dark:border-neutral-600"
            />
            <span>
              <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
                Show in footer
              </span>
              <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                Adds a link to this page in your storefront footer.
              </span>
            </span>
          </label>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-danger-200 bg-danger-50 px-3 py-2 text-xs text-danger-700 dark:border-danger-900 dark:bg-danger-900/20 dark:text-danger-300"
          >
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            {existing ? "Save changes" : "Create page"}
          </button>
        </div>
      </div>
    </AtlasModalShell>
  );
}