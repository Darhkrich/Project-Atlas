"use client";

interface DiscountsEmptyStateProps {
  onCreate: () => void;
}

export function DiscountsEmptyState({ onCreate }: DiscountsEmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-neutral-200 px-6 py-16 text-center dark:border-neutral-800">
      <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
        No discount codes yet
      </h2>
      <p className="mx-auto mt-1 max-w-md text-xs text-neutral-500 dark:text-neutral-400">
        Create a code customers can enter at checkout. Common examples:
        WELCOME10, FREESHIP, or a code for a specific campaign.
      </p>
      <button
        type="button"
        onClick={onCreate}
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
      >
        {"+ Create discount"}
      </button>
    </div>
  );
}