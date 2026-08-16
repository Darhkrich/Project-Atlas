import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type AtlasServiceStatus =
  | "available"
  | "temporarily_unavailable"
  | "coming_soon";

interface ServiceCardProps {
  name: string;
  description: string;
  href?: string;
  icon: ReactNode;
  actionLabel?: string;
  status?: AtlasServiceStatus;
  available?: boolean;
  className?: string;
}

const statusStyles: Record<AtlasServiceStatus, string> = {
  available: "text-success-600 dark:text-success-400",
  temporarily_unavailable: "text-warning-600 dark:text-warning-400",
  coming_soon: "text-neutral-500 dark:text-neutral-400",
};

const statusLabels: Record<AtlasServiceStatus, string> = {
  available: "Available",
  temporarily_unavailable: "Temporarily unavailable",
  coming_soon: "Coming soon",
};

export function ServiceCard({
  name,
  description,
  href,
  icon,
  actionLabel = "Learn more",
  status = "available",
  available = true,
  className,
}: ServiceCardProps) {
  const content = (
    <>
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50 text-brand-800 dark:bg-brand-900 dark:text-brand-300">
        {icon}
      </div>

      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          {name}
        </h3>
        {status !== "available" && (
          <span className={cn("text-xs font-medium", statusStyles[status])}>
            {statusLabels[status]}
          </span>
        )}
      </div>

      <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
        {description}
      </p>

      <span className="mt-4 inline-flex items-center text-sm font-medium text-brand-700 transition-colors dark:text-brand-400">
        {actionLabel}
        <svg
          className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </span>
    </>
  );

  if (!available || !href) {
    return (
      <div
        className={cn(
          "rounded-lg border border-neutral-200 bg-white p-6 opacity-70 dark:border-neutral-800 dark:bg-neutral-950",
          className,
        )}
        aria-disabled="true"
      >
        {content}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "group block rounded-lg border border-neutral-200 bg-white p-6 transition-all duration-150",
        "hover:border-brand-300 hover:bg-neutral-50 hover:shadow-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
        "dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-brand-700 dark:hover:bg-neutral-900",
        className,
      )}
    >
      {content}
    </Link>
  );
}