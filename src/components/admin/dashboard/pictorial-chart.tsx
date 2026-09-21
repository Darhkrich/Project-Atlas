// components/admin/dashboard/pictorial-chart.tsx
"use client";

import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import {
  CHART_COLORS,
  type ChartColorName,
} from "@/lib/admin/dashboard/chart-palette";

interface PictorialChartDatum {
  name: string;
  value: number;
  icon: AtlasIconName;
  color: ChartColorName;
}

interface PictorialChartProps {
  data: PictorialChartDatum[];
  maxIcons?: number;
  className?: string;
}

export function PictorialChart({
  data,
  maxIcons = 10,
  className,
}: PictorialChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className={className}>
      <ul role="list" className="space-y-2">
        {data.map((item) => {
          const iconCount = Math.max(
            1,
            Math.round((item.value / maxValue) * maxIcons)
          );
          const color = CHART_COLORS[item.color];
          return (
            <li key={item.name}>
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-600 dark:text-neutral-300">
                  {item.name}
                </span>
                <span className="font-medium tabular-nums">
                  {item.value.toLocaleString()}
                </span>
              </div>
              <div
                className="mt-1 flex flex-wrap gap-1"
                aria-hidden="true"
              >
                {Array.from({ length: iconCount }).map((_, i) => (
                  <span key={i} style={{ color }}>
                    <AtlasIcon name={item.icon} className="h-4 w-4" />
                  </span>
                ))}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}