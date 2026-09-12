// lib/admin/support/merge.ts

import type { SupportConversation } from "@/lib/admin/types/support";

export interface MergePlan {
  primaryId: string;
  sourceIds: string[];
}

export interface MergeResult {
  conversations: SupportConversation[];
  primaryId: string;
  mergedCount: number;
}

export function mergeConversations(
  all: SupportConversation[],
  plan: MergePlan,
  actor: { id: string; name: string }
): MergeResult {
  const primary = all.find((c) => c.id === plan.primaryId);
  if (!primary) {
    return { conversations: all, primaryId: plan.primaryId, mergedCount: 0 };
  }

  const sources = all.filter((c) => plan.sourceIds.includes(c.id));
  if (sources.length === 0) {
    return { conversations: all, primaryId: primary.id, mergedCount: 0 };
  }

  const nowIso = new Date().toISOString();

  const allMessages = [
    ...primary.messages,
    ...sources.flatMap((s) => s.messages),
  ].sort(
    (a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const allNotes = [
    ...(primary.internalNotes ?? []),
    ...sources.flatMap((s) => s.internalNotes ?? []),
    {
      id: crypto.randomUUID(),
      admin: actor.name,
      adminId: actor.id,
      content: `Merged ${sources.length} duplicate${
        sources.length === 1 ? "" : "s"
      }: ${sources.map((s) => s.id).join(", ")}.`,
      timestamp: nowIso,
    },
  ].sort(
    (a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const tagSet = new Set<string>(primary.tags);
  for (const s of sources) {
    for (const t of s.tags) tagSet.add(t);
  }

  const unreadSum =
    primary.unreadCount + sources.reduce((acc, s) => acc + s.unreadCount, 0);

  const mergedPrimary: SupportConversation = {
    ...primary,
    messages: allMessages,
    internalNotes: allNotes,
    tags: Array.from(tagSet),
    unreadCount: unreadSum,
    updatedAt: nowIso,
    lastMessageAt: allMessages[allMessages.length - 1]?.timestamp ?? primary.lastMessageAt,
  };

  const sourceIdSet = new Set(plan.sourceIds);
  const updatedSources: SupportConversation[] = sources.map((s) => {
    const timestamp = nowIso;
    return {
      ...s,
      status: "closed",
      updatedAt: timestamp,
      lastMessageAt: timestamp,
      unreadCount: 0,
      internalNotes: [
        ...(s.internalNotes ?? []),
        {
          id: crypto.randomUUID(),
          admin: actor.name,
          adminId: actor.id,
          content: `Merged into ${primary.id}.`,
          timestamp,
        },
      ],
      messages: [
        ...s.messages,
        {
          id: crypto.randomUUID(),
          sender: "system",
          content: `This conversation was merged into ${primary.id}.`,
          timestamp,
          readByAdmin: true,
        },
      ],
    };
  });

  const updatedById = new Map<string, SupportConversation>();
  updatedById.set(primary.id, mergedPrimary);
  for (const s of updatedSources) updatedById.set(s.id, s);

  const next = all.map((c) => updatedById.get(c.id) ?? c);

  return {
    conversations: next,
    primaryId: mergedPrimary.id,
    mergedCount: sources.length,
  };
}