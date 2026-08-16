import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  CustomerBreadcrumbs,
  type CustomerBreadcrumbItem,
} from "./customer-breadcrumbs";

interface CustomerPageHeaderProps {
  title: string; 
  description?: string;
  breadcrumbs?: CustomerBreadcrumbItem[];
  actions?: ReactNode;
  className?: string;
}

export function CustomerPageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  className,
}: CustomerPageHeaderProps) {
  return (
    <header className={cn("mb-8", className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="mb-3">
          <CustomerBreadcrumbs items={breadcrumbs} />
        </div>
      )}

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-3xl">
            {title}
          </h1>

          {description && (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex flex-col gap-3 sm:flex-row md:shrink-0">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}