"use client";

import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef, useState } from "react";

interface AtlasInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

export const AtlasInput = forwardRef<HTMLInputElement, AtlasInputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      className,
      size = "md",
      id,
      ...props
    },
    ref,
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    const [focused, setFocused] = useState(false);

    const sizeClasses = {
      sm: "py-1.5 px-3 text-sm",
      md: "py-2 px-3 text-sm",
      lg: "py-3 px-4 text-base",
    };

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-neutral-800 dark:text-neutral-200"
          >
            {label}
          </label>
        )}
        <div
          className={cn(
            "relative flex items-center rounded-md border transition-colors duration-100",
            error
              ? "border-danger-500 dark:border-danger-400"
              : focused
                ? "border-brand-600 dark:border-brand-500"
                : "border-neutral-300 dark:border-neutral-700",
            "bg-white dark:bg-neutral-900",
            "focus-within:ring-1 focus-within:ring-brand-600 dark:focus-within:ring-brand-500",
          )}
        >
          {leftIcon && (
            <span className="pointer-events-none pl-3 text-neutral-500 dark:text-neutral-400">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full bg-transparent text-neutral-900 placeholder-neutral-400 dark:text-neutral-100 dark:placeholder-neutral-500",
              "border-0 outline-none focus:ring-0",
              sizeClasses[size],
              leftIcon ? "pl-2" : undefined,
              rightIcon ? "pr-2" : undefined,
              className,
            )}
            onFocus={(e) => {
              setFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              props.onBlur?.(e);
            }}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            {...props}
          />
          {rightIcon && (
            <span className="pointer-events-none pr-3 text-neutral-500 dark:text-neutral-400">
              {rightIcon}
            </span>
          )}
        </div>
        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-1.5 text-sm text-danger-600 dark:text-danger-400"
            role="alert"
          >
            {error}
          </p>
        )}
        {helperText && !error && (
          <p
            id={`${inputId}-helper`}
            className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

AtlasInput.displayName = "AtlasInput";