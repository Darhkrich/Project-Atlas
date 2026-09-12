// lib/admin/analytics/date-range.ts

import type { DateRangeKey } from "@/lib/admin/types/analytics";

const DAY = 86_400_000;

export function rangeToDays(range: DateRangeKey): number | null {
  switch (range) {
    case "today":
      return 1;
    case "7d":
      return 7;
    case "30d":
      return 30;
    case "90d":
      return 90;
    case "12m":
      return 365;
    case "custom":
      return null;
  }
}

export function filterPointsByRange<T extends { date: string }>(
  points: T[],
  range: DateRangeKey,
  nowMs: number
): T[] {
  const days = rangeToDays(range);
  if (days === null) return points;
  const cutoff = nowMs - days * DAY;
  return points.filter((p) => new Date(p.date).getTime() >= cutoff);
}

export function filterPointsForPreviousRange<T extends { date: string }>(
  points: T[],
  range: DateRangeKey,
  nowMs: number
): T[] {
  const days = rangeToDays(range);
  if (days === null) return [];

  const cutoffEnd = nowMs - days * DAY;
  const cutoffStart = nowMs - days * 2 * DAY;

  return points.filter((p) => {
    const t = new Date(p.date).getTime();
    return t >= cutoffStart && t < cutoffEnd;
  });
}

export interface TrendComputation {
  current: number;
  previous: number;
  percentageChange: number;
}

export function computeTrend(
  current: number,
  previous: number
): TrendComputation {
  if (previous === 0) {
    return {
      current,
      previous,
      percentageChange: current > 0 ? 100 : 0,
    };
  }
  return {
    current,
    previous,
    percentageChange: ((current - previous) / previous) * 100,
  };
}

export function scaleSeries<T extends Record<string, unknown>>(
  points: T[],
  scale: number,
  field: keyof T
): T[] {
  return points.map((p) => ({
    ...p,
    [field]: Math.round(Number(p[field]) * scale),
  }));
}

export function aggregateSeries<
  T extends { date: string },
  K extends keyof T
>(points: T[], granularity: "day" | "week" | "month", field: K): T[] {
  if (granularity === "day") return points;

  const buckets = new Map<string, { sum: number; sample: T }>();

  for (const point of points) {
    const d = new Date(point.date);
    let key: string;
    if (granularity === "week") {
      const start = new Date(d);
      start.setDate(d.getDate() - d.getDay());
      key = start.toISOString().slice(0, 10);
    } else {
      key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    }

    const existing = buckets.get(key);
    const value = Number(point[field]);
    if (existing) {
      existing.sum += value;
    } else {
      buckets.set(key, { sum: value, sample: point });
    }
  }

  return Array.from(buckets.entries())
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([key, { sum, sample }]) => ({
      ...sample,
      date: key,
      [field]: sum,
    }));
}