"use client";

import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type AtlasTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const AtlasTextarea = forwardRef<
  HTMLTextAreaElement,
  AtlasTextareaProps
>(function AtlasTextarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      {...props}
      className={cn(
        "w-full resize-none rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500",
        className
      )}
    />
  );
});