import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CustomerContentProps {
  children: ReactNode;
  className?: string;
  as?: "main" | "div";
  id?: string;
}

/**
 * CustomerContent — main application content region.
 * Provides responsive spacing, mobile bottom-nav clearance,
 * and the structural area where customer pages render.
 */
export function CustomerContent({
  children,
  className,
  as: Component = "main",
  id = "customer-content",
}: CustomerContentProps) {
  return (
    <Component
      id={id}
      className={cn(
        // Layout behaviour
        "min-w-0 flex-1",

        // Responsive horizontal padding
        "px-4 sm:px-6 lg:px-8",

        // Comfortable vertical spacing below header
        "pt-6 md:pt-8 lg:pt-10",

        // Bottom padding clears fixed mobile navigation.
        // At desktop, normal content spacing is restored.
        "pb-[calc(7rem+env(safe-area-inset-bottom))] lg:pb-10",

        className,
      )}
    >
      {children}
    </Component>
  );
}