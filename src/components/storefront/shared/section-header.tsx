import Link from "next/link";
import { AtlasIcon } from "@/components/atlas/icons";

interface SectionHeaderProps {
  title: string;
  description?: string;
  linkHref?: string;
  linkLabel?: string;
}

export function SectionHeader({
  title,
  description,
  linkHref,
  linkLabel = "View all",
}: SectionHeaderProps) {
  return (
    <div className="flex items-end justify-between">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl">
          {title}
        </h2>
        {description && (
          <p className="mt-2 text-sm text-neutral-500">{description}</p>
        )}
      </div>
      {linkHref && (
        <Link
          href={linkHref}
          className="hidden text-sm font-semibold text-brand-600 hover:text-brand-700 sm:flex items-center gap-1"
        >
          {linkLabel}
          <AtlasIcon name="arrow-right" className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}