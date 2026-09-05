"use client";

import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";

interface PictorialChartProps {
  data: { name: string; value: number; icon: AtlasIconName; color: string }[];
  maxIcons?: number; // maximum icons to display for the largest value
  className?: string;
}

export function PictorialChart({ data, maxIcons = 10, className }: PictorialChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className={className}>
      {data.map((item) => (
        <div key={item.name} className="mb-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-600 dark:text-neutral-300">{item.name}</span>
            <span className="font-medium">{item.value.toLocaleString()}</span>
          </div>
          <div className="mt-1 flex flex-wrap gap-1">
            {Array.from({
              length: Math.max(1, Math.round((item.value / maxValue) * maxIcons)),
            }).map((_, i) => (
              <span key={i} style={{ color: item.color }}>
                <AtlasIcon name={item.icon} className="h-4 w-4" />
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}