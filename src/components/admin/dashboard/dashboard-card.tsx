import Link from "next/link";
import { Card, CardContent } from "@/components/admin/ui/card";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon?: AtlasIconName;
  trend?: number;
  trendLabel?: string;
  mainChart: ReactNode;
  subCards?: ReactNode;
  className?: string;
  href?: string; // optional navigation target
}

export function DashboardCard({
  title,
  value,
  icon,
  trend,
  trendLabel,
  mainChart,
  subCards,
  className,
  href,
}: DashboardCardProps) {
  const content = (
    <Card className={cn("flex flex-col transition-shadow hover:shadow-md", className)}>
      <CardContent className="p-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{title}</p>
            <p className="mt-0.5 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              {value}
            </p>
          </div>
          {icon && (
            <div className="rounded-md bg-brand-50 p-1.5 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
              <AtlasIcon name={icon} className="h-4 w-4" />
            </div>
          )}
        </div>
        {trend !== undefined && (
          <div className="mt-1 flex items-center gap-1 text-xs">
            <span
              className={cn(
                "font-medium",
                trend > 0
                  ? "text-success-600 dark:text-success-400"
                  : trend < 0
                  ? "text-danger-600 dark:text-danger-400"
                  : "text-neutral-500"
              )}
            >
              {trend > 0 ? "+" : ""}
              {trend}%
            </span>
            <span className="text-neutral-500 dark:text-neutral-400">{trendLabel ?? "vs last period"}</span>
          </div>
        )}
        <div className="mt-2">{mainChart}</div>
      </CardContent>
      {subCards && (
        <div className="mt-auto px-3 pb-3">
          <div className="grid grid-cols-3 gap-2">{subCards}</div>
        </div>
      )}
    </Card>
  );

  if (href) {
    return <Link href={href} className="block">{content}</Link>;
  }
  return content;
}