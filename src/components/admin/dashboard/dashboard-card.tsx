// components/admin/dashboard/dashboard-card.tsx
"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/admin/ui/card";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { Can } from "@/lib/admin/rbac";
import type { Permission } from "@/lib/admin/rbac";
import { DeltaChip } from "./delta-chip";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon?: AtlasIconName;
  delta?: number | null;
  deltaLabel?: string;
  mainChart: ReactNode;
  subCards?: ReactNode;
  className?: string;
  href?: string;
  permission?: Permission;
}

export function DashboardCard({
  title,
  value,
  icon,
  delta,
  deltaLabel,
  mainChart,
  subCards,
  className,
  href,
  permission,
}: DashboardCardProps) {
  const body = (
    <Card
      className={cn(
        "flex h-full flex-col",
        href && "transition-shadow hover:shadow-md",
        className
      )}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              {title}
            </p>
            <p className="mt-0.5 text-xl font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">
              {value}
            </p>
          </div>
          {icon ? (
            <div className="shrink-0 rounded-md bg-brand-50 p-1.5 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
              <AtlasIcon name={icon} aria-hidden="true" className="h-4 w-4" />
            </div>
          ) : null}
        </div>

        <div className="mt-1 flex items-center gap-2">
          <DeltaChip delta={delta} label={deltaLabel} />
        </div>

        <div className="mt-2">{mainChart}</div>
      </CardContent>

      {subCards ? (
        <div className="mt-auto px-3 pb-3">
          <div className="grid grid-cols-3 gap-2">{subCards}</div>
        </div>
      ) : null}
    </Card>
  );

  if (href) {
    return (
      <div className="relative h-full">
        {body}
        <Link
          href={href}
          className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
          aria-label={"Open " + title}
        >
          <AtlasIcon name="chevron-down" aria-hidden="true" className="h-3.5 w-3.5 -rotate-90" />
        </Link>
      </div>
    );
  }

  if (permission) {
    return <Can permission={permission}>{body}</Can>;
  }

  return body;
}