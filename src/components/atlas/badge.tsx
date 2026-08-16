import { cn } from "@/lib/utils";

const variantStyles = {
  neutral: "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200",
  success: "bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200",
  warning: "bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200",
  danger: "bg-danger-100 text-danger-800 dark:bg-danger-900 dark:text-danger-200",
  info: "bg-info-100 text-info-800 dark:bg-info-900 dark:text-info-200",
  brand: "bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-200",
};

interface AtlasBadgeProps {
  children: React.ReactNode;
  variant?: keyof typeof variantStyles;
  className?: string;
}

export function AtlasBadge({
  children,
  variant = "neutral",
  className,
}: AtlasBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}