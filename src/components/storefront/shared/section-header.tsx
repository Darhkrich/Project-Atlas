import Link from "next/link";
import { AtlasIcon } from "@/components/atlas/icons";
import type { ThemeDefinition } from "@/lib/merchant/storefront/themes";

interface SectionHeaderProps {
  theme: ThemeDefinition;
  title: string;
  description?: string;
  linkHref?: string;
  linkLabel?: string;
}

export function SectionHeader({
  theme,
  title,
  description,
  linkHref,
  linkLabel = "View all",
}: SectionHeaderProps) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h2 className={theme.typography.sectionTitle}>{title}</h2>
        {description && (
          <p
            className={`mt-2 ${theme.typography.body} ${theme.color.textMuted}`}
          >
            {description}
          </p>
        )}
      </div>
      {linkHref && (
        <Link
          href={linkHref}
          className="hidden items-center gap-1 text-sm font-semibold underline-offset-4 hover:underline sm:inline-flex"
        >
          {linkLabel}
          <AtlasIcon
            name="arrow-right"
            className="h-4 w-4"
            aria-hidden="true"
          />
        </Link>
      )}
    </div>
  );
}