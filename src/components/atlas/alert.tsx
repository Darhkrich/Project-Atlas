import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

const variantStyles = {
  success: "border-success-300 bg-success-50 text-success-900 dark:border-success-800 dark:bg-success-950 dark:text-success-200",
  warning: "border-warning-300 bg-warning-50 text-warning-900 dark:border-warning-800 dark:bg-warning-950 dark:text-warning-200",
  danger: "border-danger-300 bg-danger-50 text-danger-900 dark:border-danger-800 dark:bg-danger-950 dark:text-danger-200",
  info: "border-info-300 bg-info-50 text-info-900 dark:border-info-800 dark:bg-info-950 dark:text-info-200",
};

const icons: Record<keyof typeof variantStyles, string> = {
  success: "✓",
  warning: "⚠",
  danger: "✕",
  info: "ℹ",
};

interface AtlasAlertProps {
  variant: keyof typeof variantStyles;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function AtlasAlert({
  variant,
  title,
  children,
  className,
}: AtlasAlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex gap-3 rounded-lg border px-4 py-3 text-sm",
        variantStyles[variant],
        className,
      )}
    >
      <span className="text-lg leading-none" aria-hidden="true">
        {icons[variant]}
      </span>
      <div className="flex-1">
        {title && <p className="mb-1 font-semibold">{title}</p>}
        <div className="text-sm">{children}</div>
      </div>
    </div>
  );
}