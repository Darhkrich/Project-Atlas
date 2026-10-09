"use client";

interface PagesEmptyStateProps {
  onCreate: () => void;
}

export function PagesEmptyState({ onCreate }: PagesEmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-neutral-200 px-6 py-16 text-center dark:border-neutral-800">
      <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
        No custom pages yet
      </h2>
      <p className="mx-auto mt-1 max-w-md text-xs text-neutral-500 dark:text-neutral-400">
        Add a page for content that does not fit on your storefront home.
        Common examples: About our process, Delivery information, or
        Frequently asked questions.
      </p>
      <button
        type="button"
        onClick={onCreate}
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
      >
        {"+ Create page"}
      </button>
    </div>
  );
}