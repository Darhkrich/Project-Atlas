"use client";

import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type AtlasSelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export const AtlasSelect = forwardRef<HTMLSelectElement, AtlasSelectProps>(
  function AtlasSelect({ className, children, ...props }, ref) {
    return (
      <select
        ref={ref}
        {...props}
        className={cn(
          "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white",
          className
        )}
      >
        {children}
      </select>
    );
  }
);