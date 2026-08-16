import { cn } from "@/lib/utils";

interface AtlasEmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function AtlasEmptyState({
  icon,
  title,
  description,
  action,
  className,
}: AtlasEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 text-center",
        className,
      )}
    >
      {icon && (
        <div className="mb-4 text-neutral-400 dark:text-neutral-500">{icon}</div>
      )}
      <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
        {title}
      </h3>
      {description && (
        <p className="mt-1 max-w-md text-sm text-neutral-600 dark:text-neutral-400">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}