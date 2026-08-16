import { cn } from "@/lib/utils";

type AtlasContainerProps = {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "main" | "header" | "footer" | "nav";
};

/**
 * AtlasContainer — the invisible horizontal boundary.
 * Centers content and enforces comfortable, responsive width.
 * No visual decoration of any kind.
 */
export function AtlasContainer({
  children,
  className,
  as: Component = "div",
}: AtlasContainerProps) {
  return (
    <Component
      className={cn( 
        // Core container behavior
        "mx-auto w-full max-w-7xl",
        // Responsive side padding
        "px-4 sm:px-6 lg:px-8",
        // No background, border, shadow — ever
        className,
      )}
    >
      {children}
    </Component>
  );
}