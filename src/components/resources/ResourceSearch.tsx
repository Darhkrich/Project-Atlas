"use client";

import { useState } from "react";

export type ResourceItem = {
  id: string;
  title: string;
  category: string;
  icon: string;
  content: string;
};

interface ResourceSearchProps {
  items: ResourceItem[];
  onSelect: (item: ResourceItem) => void;
}

export function ResourceSearch({ items, onSelect }: ResourceSearchProps) {
  const [query, setQuery] = useState("");

  const filtered = items.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <div className="mx-auto max-w-xl">
        <div className="relative">
          <svg
            className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles, guides, and documentation..."
            className="w-full rounded-full border border-neutral-300 bg-white py-3 pl-12 pr-4 text-base text-neutral-900 placeholder-neutral-500 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder-neutral-400"
          />
        </div>
      </div>

      {query && (
        <div className="mx-auto mt-8 max-w-2xl space-y-2">
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelect(item)}
                className="flex w-full items-center justify-between rounded-lg border border-neutral-200 bg-white p-4 text-left transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-900"
              >
                <div>
                  <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {item.title}
                  </span>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    {item.category}
                  </span>
                </div>
                <svg
                  className="h-4 w-4 text-neutral-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            ))
          ) : (
            <p className="text-center text-neutral-500 dark:text-neutral-400">
              No results found for &quot;{query}&quot;.
            </p>
          )}
        </div>
      )}
    </div>
  );
}