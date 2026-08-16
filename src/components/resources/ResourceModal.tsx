"use client";

import type { ResourceItem } from "./ResourceSearch";

interface ResourceModalProps {
  item: ResourceItem | null;
  onClose: () => void;
}

export function ResourceModal({ item, onClose }: ResourceModalProps) {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-neutral-950/50 dark:bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg rounded-xl bg-white shadow-xl dark:bg-neutral-900"
        role="dialog"
        aria-modal="true"
        aria-labelledby="resource-modal-title"
      >
        <div className="flex items-start justify-between border-b border-neutral-200 p-4 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{item.icon}</span>
            <div>
              <h2
                id="resource-modal-title"
                className="text-lg font-semibold text-neutral-900 dark:text-neutral-100"
              >
                {item.title}
              </h2>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                {item.category}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-neutral-600 hover:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-neutral-400 dark:hover:text-neutral-100"
            aria-label="Close"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="p-4">
          <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
            {item.content}
          </p>
        </div>
      </div>
    </div>
  );
}