import { cn } from "@/lib/utils";

type AtlasSectionSize = "sm" | "md" | "lg";

interface AtlasSectionProps {
  children: React.ReactNode;
  className?: string;
  size?: AtlasSectionSize;
  as?: "section" | "div";
  id?: string;
}

const sectionSpacing: Record<AtlasSectionSize, string> = {
  sm: "py-8 sm:py-10 lg:py-12",
  md: "py-12 sm:py-16 lg:py-20",
  lg: "py-16 sm:py-20 lg:py-24",
};

/**
 * AtlasSection — the invisible vertical boundary.
 * Creates consistent, generous separation between major page areas.
 * Full-width by default and carries no visual decoration of its own.
 */
export function AtlasSection({
  children,
  className,
  size = "lg",
  as: Component = "section",
  id,
}: AtlasSectionProps) {
  return (
    <Component
      id={id}
      className={cn(
        "w-full",
        sectionSpacing[size],
        className,
      )}
    >
      {children}
    </Component>
  );
} 