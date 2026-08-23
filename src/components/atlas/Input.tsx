"use client";

import { cn } from "@/lib/utils";
import {
  forwardRef,
  useState,
  type InputHTMLAttributes,
} from "react";

interface AtlasInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  disablePasswordToggle?: boolean;
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
      type = "text",
      disablePasswordToggle = false,
      ...props
    },
    ref,
  ) => {
    const inputId =
      id || label?.toLowerCase().replace(/\s+/g, "-") || `input-${Math.random()}`;
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === "password";
    const resolvedType = isPassword && showPassword ? "text" : type;

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
            type={resolvedType}
            className={cn(
              "w-full bg-transparent text-neutral-900 placeholder-neutral-400 dark:text-neutral-100 dark:placeholder-neutral-500",
              "border-0 outline-none focus:ring-0",
              sizeClasses[size],
              leftIcon ? "pl-2" : undefined,
              rightIcon || (isPassword && !disablePasswordToggle) ? "pr-2" : undefined,
              className,
            )}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            {...props}
          />

          {isPassword && !disablePasswordToggle ? (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="mr-2 rounded p-1 text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          ) : (
            rightIcon && (
              <span className="mr-2 text-neutral-500 dark:text-neutral-400">
                {rightIcon}
              </span>
            )
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