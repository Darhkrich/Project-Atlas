"use client";

import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { Button } from "./button";

interface ErrorStateProps {
  title?: string;
  description?: string;
  icon?: AtlasIconName;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  description,
  icon = "alert",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <AtlasIcon name={icon} className="h-12 w-12 text-danger-500" />
      <h3 className="mt-4 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
        {title}
      </h3>
      {description && (
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          {description}
        </p>
      )}
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}