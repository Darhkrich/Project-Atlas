// lib/admin/security/correlation.ts

import type { SecurityEvent, SecuritySeverity } from "@/lib/admin/types/security";

export interface IPCluster {
  ip: string;
  countryCode?: string;
  eventIds: string[];
  count: number;
  severity: SecuritySeverity;
  firstAt: string;
  lastAt: string;
  types: string[];
}

const SEVERITY_RANK: Record<SecuritySeverity, number> = {
  info: 0,
  warning: 1,
  critical: 2,
};

export function clusterEventsByIP(events: SecurityEvent[]): IPCluster[] {
  const byIP = new Map<string, SecurityEvent[]>();

  for (const e of events) {
    if (!e.ip || e.ip === "system") continue;
    const list = byIP.get(e.ip) ?? [];
    list.push(e);
    byIP.set(e.ip, list);
  }

  const clusters: IPCluster[] = [];

  for (const [ip, list] of byIP.entries()) {
    if (list.length < 2) continue;

    const sorted = [...list].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const severity = sorted.reduce<SecuritySeverity>(
      (acc, e) => (SEVERITY_RANK[e.severity] > SEVERITY_RANK[acc] ? e.severity : acc),
      "info"
    );

    const types = Array.from(new Set(sorted.map((s) => s.type)));

    clusters.push({
      ip,
      countryCode: sorted[0].countryCode,
      eventIds: sorted.map((s) => s.id),
      count: sorted.length,
      severity,
      firstAt: sorted[0].timestamp,
      lastAt: sorted[sorted.length - 1].timestamp,
      types,
    });
  }

  return clusters.sort((a, b) => b.count - a.count);
}

export function eventsForIP(events: SecurityEvent[], ip: string): SecurityEvent[] {
  return events.filter((e) => e.ip === ip);
}

export function relatedEventsForAlert(
  events: SecurityEvent[],
  eventIds: string[] | undefined
): SecurityEvent[] {
  if (!eventIds || eventIds.length === 0) return [];
  const set = new Set(eventIds);
  return events.filter((e) => set.has(e.id));
}