import { cn } from "@/lib/utils";

interface ResellerPageHeaderProps {
  title: string;
  description?: string;
  className?: string;
}

export function ResellerPageHeader({
  title,
  description,
  className,
}: ResellerPageHeaderProps) {
  return (
    <div className={cn("mb-6", className)}>
      <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
        {title}
      </h1>
      {description && (
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          {description}
        </p>
      )}
    </div>
  );
}