"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

const variantStyles = {
  primary:
    "bg-brand-700 text-white hover:bg-brand-800 active:bg-brand-900 focus-visible:ring-2 focus-visible:ring-brand-500 disabled:bg-neutral-200 disabled:text-neutral-400 dark:disabled:bg-neutral-800 dark:disabled:text-neutral-500",
  secondary:
    "bg-neutral-100 text-neutral-900 hover:bg-neutral-200 active:bg-neutral-300 focus-visible:ring-2 focus-visible:ring-neutral-400 disabled:bg-neutral-100 disabled:text-neutral-400 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700 dark:active:bg-neutral-600 dark:disabled:bg-neutral-800 dark:disabled:text-neutral-500",
  outline:
    "border border-neutral-300 text-neutral-900 bg-transparent hover:bg-neutral-50 active:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-neutral-400 disabled:border-neutral-200 disabled:text-neutral-400 dark:border-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-800 dark:active:bg-neutral-700 dark:disabled:border-neutral-800 dark:disabled:text-neutral-500",
  danger:
    "bg-danger-600 text-white hover:bg-danger-700 active:bg-danger-800 focus-visible:ring-2 focus-visible:ring-danger-500 disabled:bg-neutral-200 disabled:text-neutral-400 dark:disabled:bg-neutral-800 dark:disabled:text-neutral-500",
  ghost:
    "text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200 focus-visible:ring-2 focus-visible:ring-neutral-400 disabled:text-neutral-400 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:active:bg-neutral-700 dark:disabled:text-neutral-500",
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-sm gap-1.5",
  md: "px-4 py-2 text-sm gap-2",
  lg: "px-6 py-3 text-base gap-2",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variantStyles;
  size?: keyof typeof sizeStyles;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      leftIcon,
      rightIcon,
      children,
      className,
      disabled,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors duration-100 select-none focus:outline-none",
          variantStyles[variant],
          sizeStyles[size],
          isDisabled && "cursor-not-allowed",
          className,
        )}
        {...props}
      >
        {loading ? (
          <Spinner className="h-4 w-4" />
        ) : (
          leftIcon
        )}
        {children}
        {!loading && rightIcon}
      </button>
    );
  },
);

Button.displayName = "Button";

/* Simple inline spinner */
function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("animate-spin", className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}