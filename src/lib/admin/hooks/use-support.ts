/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */
// lib/admin/hooks/use-support.ts
//
// Read hook over the support store. Subscribes to the store and
// re-projects on every notification and on every useNow tick so SLA
// breach counts stay fresh without user interaction.

"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getBaseConversations,
  getSupportOverlays,
  isSupportStoreLoaded,
  subscribeToSupportStore,
} from "@/lib/admin/mock/support-store";
import {
  projectConversations,
  projectSupportAggregates,
  type SupportAggregates,
} from "@/lib/admin/support/support-projection";
import type { SupportConversation } from "@/lib/admin/types/support";
import { useNow } from "@/lib/admin/hooks/use-now";

export interface UseSupportResult {
  conversations: SupportConversation[];
  aggregates: SupportAggregates;
  loading: boolean;
  error: Error | null;
}

export function useSupport(): UseSupportResult {
  const [tick, setTick] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [error] = useState<Error | null>(null);
  const now = useNow();

  useEffect(() => {
    setLoaded(isSupportStoreLoaded());
    const unsub = subscribeToSupportStore(() => setTick((x) => x + 1));
    return () => unsub();
  }, []);

  const value = useMemo(() => {
    if (!loaded) {
      return {
        conversations: [] as SupportConversation[],
        aggregates: { unread: 0, active: 0, breached: 0 } as SupportAggregates,
      };
    }
    const base = getBaseConversations();
    const overlays = getSupportOverlays();
    const conversations = projectConversations(base, overlays);
    const aggregates = projectSupportAggregates(conversations, now);
    return { conversations, aggregates };
  }, [tick, loaded, now]);

  return {
    conversations: value.conversations,
    aggregates: value.aggregates,
    loading: !loaded,
    error,
  };
}