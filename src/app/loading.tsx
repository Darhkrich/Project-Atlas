import { AtlasContainer } from "@/components/atlas/atlas-container";

export default function Loading() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Top shimmer bar */}
      <div className="h-1 w-full animate-pulse bg-brand-800" />

      <AtlasContainer className="py-16">
        {/* Atlas logo mark */}
        <div className="mb-10 flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/40">
            <svg
              className="h-6 w-6 animate-pulse text-brand-800 dark:text-brand-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 3L21 20H3L12 3Z" strokeLinejoin="round" />
              <path d="M8 16H16" strokeLinecap="round" />
            </svg>
          </div>
          <div className="h-6 w-40 animate-pulse rounded bg-brand-100 dark:bg-brand-900/40" />
        </div>

        {/* Content skeletons with green tint */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="rounded-xl border border-neutral-100 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="mb-4 h-12 w-12 animate-pulse rounded-full bg-brand-100 dark:bg-brand-900/40" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-brand-100 dark:bg-brand-900/40" />
              <div className="mt-2 h-4 w-full animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
              <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
            </div>
          ))}
        </div>
      </AtlasContainer>
    </div>
  );
}