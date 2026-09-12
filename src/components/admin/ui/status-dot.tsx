// components/admin/ui/status-dot.tsx

import { cn } from "@/lib/utils";
import {
  dotClassByTone,
  type StatusTone,
} from "@/lib/admin/support/status-styles";

const sizeClass = {
  sm: "h-1.5 w-1.5",
  md: "h-2 w-2",
  lg: "h-2.5 w-2.5",
} as const;

interface StatusDotProps {
  tone: StatusTone;
  size?: keyof typeof sizeClass;
  className?: string;
  /**
   * When set, the dot gets a screen-reader label and stops being purely
   * decorative. Use when no adjacent text already announces the state.
   */
  label?: string;
}

export function StatusDot({
  tone,
  size = "md",
  className,
  label,
}: StatusDotProps) {
  return (
    <span
      className={cn(
        "inline-block shrink-0 rounded-full",
        sizeClass[size],
        dotClassByTone[tone],
        className
      )}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
    />
  );
}