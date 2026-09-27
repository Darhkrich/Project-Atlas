import type { RevenueRange, TrendGranularity } from "./revenue-constants";
import { WEEKDAY_ORDER } from "./revenue-labels";

export interface TimeWindow {
  from: string;
  to: string;
}

export function rangeToWindow(
  range: RevenueRange,
  nowMs: number
): TimeWindow {
  const to = new Date(nowMs).toISOString();
  const from = new Date(nowMs);
  switch (range) {
    case "today":
      from.setUTCHours(0, 0, 0, 0);
      break;
    case "7d":
      from.setUTCDate(from.getUTCDate() - 7);
      break;
    case "30d":
      from.setUTCDate(from.getUTCDate() - 30);
      break;
    case "90d":
      from.setUTCDate(from.getUTCDate() - 90);
      break;
    case "12m":
      from.setUTCMonth(from.getUTCMonth() - 12);
      break;
  }
  return { from: from.toISOString(), to };
}

export function priorWindow(window: TimeWindow): TimeWindow {
  const from = new Date(window.from).getTime();
  const to = new Date(window.to).getTime();
  const span = to - from;
  return {
    from: new Date(from - span).toISOString(),
    to: new Date(from).toISOString(),
  };
}

export function isInWindow(iso: string, window: TimeWindow): boolean {
  return iso >= window.from && iso <= window.to;
}

export function startOfUtcDay(iso: string): string {
  const d = new Date(iso);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

export function startOfUtcMonth(iso: string): string {
  const d = new Date(iso);
  d.setUTCDate(1);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

export function startOfUtcYear(iso: string): string {
  const d = new Date(iso);
  d.setUTCMonth(0);
  d.setUTCDate(1);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

export function daysBetween(from: string, to: string): number {
  const ms =
    new Date(to).getTime() - new Date(from).getTime();
  return Math.max(1, Math.round(ms / 86_400_000));
}

export function weekdayOf(iso: string): string {
  const d = new Date(iso);
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[d.getUTCDay()];
}

export function monthLabel(iso: string): string {
  const d = new Date(iso);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return months[d.getUTCMonth()];
}

export function weekLabel(iso: string): string {
  const d = new Date(iso);
  const first = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const dayOffset = Math.floor(
    (d.getTime() - first.getTime()) / 86_400_000
  );
  const week = Math.floor(dayOffset / 7) + 1;
  return "W" + week;
}

export function bucketKey(
  iso: string,
  granularity: TrendGranularity
): string {
  return granularity === "month" ? monthLabel(iso) : weekLabel(iso);
}

export function orderedWeekdays(): readonly string[] {
  return WEEKDAY_ORDER;
}

export function percentChange(
  current: number,
  prior: number
): number | null {
  if (prior <= 0) return null;
  return ((current - prior) / prior) * 100;
}