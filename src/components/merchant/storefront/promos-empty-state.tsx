"use client";

interface PromosEmptyStateProps {
  onCreate: () => void;
}

export function PromosEmptyState({ onCreate }: PromosEmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-neutral-200 px-6 py-12 text-center dark:border-neutral-800">
      <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
        No banners yet
      </h3>
      <p className="mx-auto mt-1 max-w-md text-xs text-neutral-500 dark:text-neutral-400">
        Add a banner with a headline, an image, or both. Banners rotate on
        their own when there is more than one.
      </p>
      <button
        type="button"
        onClick={onCreate}
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
      >
        {"+ Add banner"}
      </button>
    </div>
  );
}