"use client";

import { AtlasIcon } from "@/components/atlas/icons";

interface AtlasSuggestionListProps {
  suggestions: string[];
  onSelect: (text: string) => void;
  onShuffle?: () => void;
}

export function AtlasSuggestionList({
  suggestions,
  onSelect,
  onShuffle,
}: AtlasSuggestionListProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
        Suggestions
      </p>
      <div className="flex flex-wrap gap-1.5">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => onSelect(suggestion)}
            aria-label={"Use suggested text: " + suggestion}
            className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-700 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-brand-800 dark:hover:bg-brand-900/30 dark:hover:text-brand-200"
          >
            {suggestion}
          </button>
        ))}
        {onShuffle && (
          <button
            type="button"
            onClick={onShuffle}
            aria-label="Shuffle suggestions"
            className="inline-flex items-center gap-1 rounded-full border border-transparent px-2 py-1 text-xs font-medium text-neutral-500 hover:text-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-neutral-400 dark:hover:text-neutral-200"
          >
            <AtlasIcon name="refresh" className="h-3 w-3" />
            More
          </button>
        )}
      </div>
    </div>
  );
}