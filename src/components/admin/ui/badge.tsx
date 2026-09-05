import { type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  [
    "inline-flex items-center justify-center",
    "whitespace-nowrap",
    "rounded-full",
    "font-medium",
    "leading-none",
    "tracking-[-0.01em]",
    "transition-colors duration-150",
    "select-none",
  ].join(" "),
  {
    variants: {
      variant: {
        success: [
          "bg-success-50",
          "text-success-700",
          "ring-1 ring-inset ring-success-200",
          "dark:bg-success-900/25",
          "dark:text-success-300",
          "dark:ring-success-800/60",
        ].join(" "),

        warning: [
          "bg-warning-50",
          "text-warning-700",
          "ring-1 ring-inset ring-warning-200",
          "dark:bg-warning-900/25",
          "dark:text-warning-300",
          "dark:ring-warning-800/60",
        ].join(" "),

        danger: [
          "bg-danger-50",
          "text-danger-700",
          "ring-1 ring-inset ring-danger-200",
          "dark:bg-danger-900/25",
          "dark:text-danger-300",
          "dark:ring-danger-800/60",
        ].join(" "),

        info: [
          "bg-info-50",
          "text-info-700",
          "ring-1 ring-inset ring-info-200",
          "dark:bg-info-900/25",
          "dark:text-info-300",
          "dark:ring-info-800/60",
        ].join(" "),

        neutral: [
          "bg-neutral-100",
          "text-neutral-700",
          "ring-1 ring-inset ring-neutral-200",
          "dark:bg-neutral-800/80",
          "dark:text-neutral-300",
          "dark:ring-neutral-700",
        ].join(" "),

        brand: [
          "bg-brand-50",
          "text-brand-700",
          "ring-1 ring-inset ring-brand-200",
          "dark:bg-brand-900/25",
          "dark:text-brand-300",
          "dark:ring-brand-800/60",
        ].join(" "),
      },

      size: {
        sm: "min-h-5 px-2 text-[11px]",
        md: "min-h-6 px-2.5 text-xs",
        lg: "min-h-7 px-3 text-sm",
      },
    },

    defaultVariants: {
      variant: "neutral",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({
  className,
  variant,
  size,
  ...props
}: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}