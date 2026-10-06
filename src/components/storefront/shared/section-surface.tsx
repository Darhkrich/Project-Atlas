import type { ReactNode } from "react";
import type { ThemeDefinition } from "@/lib/merchant/storefront/themes";

interface SectionSurfaceProps {
  theme: ThemeDefinition;
  ariaLabel: string;
  children: ReactNode;
  compact?: boolean;
  id?: string;
  className?: string;
}

export function SectionSurface({
  theme,
  ariaLabel,
  children,
  compact = false,
  id,
  className = "",
}: SectionSurfaceProps) {
  const spacing = compact
    ? theme.layout.sectionSpacingCompact
    : theme.layout.sectionSpacing;

  return (
    <section
      id={id}
      role="region"
      aria-label={ariaLabel}
      className={`${theme.color.sectionBg} ${theme.color.textPrimary} ${spacing} ${className}`.trim()}
    >
      <div
        className={`mx-auto ${theme.layout.containerWidth} px-4 sm:px-6 lg:px-8`}
      >
        {children}
      </div>
    </section>
  );
}