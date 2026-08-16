import Link from "next/link";
import { cn } from "@/lib/utils";

export type CustomerBreadcrumbItem = {
  label: string;
  href?: string;
  current?: boolean;
};

interface CustomerBreadcrumbsProps {
  items: CustomerBreadcrumbItem[];
  className?: string;
}

export function CustomerBreadcrumbs({
  items,
  className,
}: CustomerBreadcrumbsProps) {
  if (!items || items.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("text-sm", className)}
    >
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, index) => {
          const isCurrent = item.current ?? index === items.length - 1;
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {index > 0 && (
                <span
                  className="text-neutral-400 dark:text-neutral-500"
                  aria-hidden="true"
                >
                  /
                </span>
              )}

              {isCurrent ? (
                <span
                  aria-current="page"
                  className="font-medium text-neutral-600 dark:text-neutral-300"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href ?? "#"}
                  className="text-neutral-500 transition-colors hover:text-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-neutral-400 dark:hover:text-neutral-200"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}