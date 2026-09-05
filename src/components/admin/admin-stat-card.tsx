import { Card, CardContent } from "./ui/card";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";

interface AdminStatCardProps {
  label: string;
  value: string | number;
  icon?: AtlasIconName;
  trend?: number;
  trendLabel?: string;
  children?: React.ReactNode;
  className?: string;
}

export function AdminStatCard({
  label,
  value,
  icon,
  trend,
  trendLabel,
  children,
  className,
}: AdminStatCardProps) {
  return (
    <Card className={cn("flex flex-col", className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{label}</p>
            <p className="mt-1 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
              {value}
            </p>
          </div>
          {icon && (
            <div className="rounded-md bg-brand-50 p-2 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
              <AtlasIcon name={icon} className="h-5 w-5" />
            </div>
          )}
        </div>
        {trend !== undefined && (
          <div className="mt-2 flex items-center gap-1 text-xs">
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
      </CardContent>
      {children && (
        <div className="mt-auto px-4 pb-4 pt-0">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
        </div>
      )}
    </Card>
  );
}