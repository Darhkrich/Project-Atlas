// lib/admin/settings/audit.ts

import type {
  SettingsAuditEntry,
  SettingsTab,
} from "@/lib/admin/types/settings";
import { diffObjects, type RawDiff } from "./diff";
import { formatSettingValue } from "@/lib/admin/settings/constant";

export interface AuditActor {
  id: string;
  name: string;
}

export function createAuditEntries(
  tab: SettingsTab,
  previous: Record<string, unknown>,
  next: Record<string, unknown>,
  actor: AuditActor
): SettingsAuditEntry[] {
  const diffs = diffObjects(previous, next);
  const nowIso = new Date().toISOString();

  return diffs.map((d: RawDiff) => ({
    id: crypto.randomUUID(),
    tab,
    field: d.path,
    previousValue: formatSettingValue(d.previous),
    newValue: formatSettingValue(d.next),
    actorId: actor.id,
    actorName: actor.name,
    at: nowIso,
  }));
}

export function groupAuditByDay(
  entries: SettingsAuditEntry[]
): { day: string; entries: SettingsAuditEntry[] }[] {
  const groups = new Map<string, SettingsAuditEntry[]>();

  for (const e of entries) {
    const day = e.at.slice(0, 10);
    const list = groups.get(day) ?? [];
    list.push(e);
    groups.set(day, list);
  }

  return Array.from(groups.entries())
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([day, list]) => ({
      day,
      entries: list.sort((a, b) => (a.at < b.at ? 1 : -1)),
    }));
}