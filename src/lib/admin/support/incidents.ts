// lib/admin/support/incidents.ts

import type {
  DigitalServiceCategory,
  SupportConversation,
} from "@/lib/admin/types/support";

const MIN_CLUSTER_SIZE = 3;
const WINDOW_MS = 24 * 60 * 60 * 1000;

export interface IncidentCluster {
  id: string;
  providerId: string;
  providerName: string;
  serviceCategory: DigitalServiceCategory;
  conversationIds: string[];
  count: number;
  oldestAt: string;
  unreadCount: number;
}

export function buildIncidentClusters(
  conversations: SupportConversation[],
  now: number | null
): IncidentCluster[] {
  if (now === null) return [];

  const windowStart = now - WINDOW_MS;
  const buckets = new Map<string, IncidentCluster>();

  for (const c of conversations) {
    if (c.status !== "open" && c.status !== "pending") continue;
    if (!c.linkedEntity) continue;
    if (c.linkedEntity.kind !== "digital_transaction") continue;

    const last = new Date(c.lastMessageAt).getTime();
    if (Number.isNaN(last) || last < windowStart) continue;

    const key = `${c.linkedEntity.providerId}:${c.linkedEntity.serviceCategory}`;
    const existing = buckets.get(key);

    if (!existing) {
      buckets.set(key, {
        id: key,
        providerId: c.linkedEntity.providerId,
        providerName: c.linkedEntity.providerName,
        serviceCategory: c.linkedEntity.serviceCategory,
        conversationIds: [c.id],
        count: 1,
        oldestAt: c.createdAt,
        unreadCount: c.unreadCount,
      });
      continue;
    }

    existing.conversationIds.push(c.id);
    existing.count += 1;
    existing.unreadCount += c.unreadCount;
    if (new Date(c.createdAt).getTime() < new Date(existing.oldestAt).getTime()) {
      existing.oldestAt = c.createdAt;
    }
  }

  return Array.from(buckets.values())
    .filter((cluster) => cluster.count >= MIN_CLUSTER_SIZE)
    .sort((a, b) => b.count - a.count);
}