/* eslint-disable react-hooks/purity */
/* eslint-disable react-hooks/exhaustive-deps */
// lib/admin/hooks/use-reseller-support-tickets.ts
//
// Reseller-scoped support read. Joins the shared support store to the
// reseller store so live business names resolve.

"use client";

import { useEffect, useMemo, useState } from "react";
import { useResellers } from "./use-resellers";
import { mockSupportConversations } from "@/lib/admin/mock/support-base";
import {
  getSupportOverlays,
  subscribeToSupportStore,
} from "@/lib/admin/mock/support-store";
import {
  projectResellerTickets,
  projectSupportSummary,
  type SupportSummary,
} from "@/lib/admin/resellers/support-projection";
import type { SupportConversation } from "@/lib/admin/types/support";
import { useNow } from "@/lib/admin/hooks/use-now";

export interface UseResellerSupportTicketsResult {
  tickets: SupportConversation[];
  summary: SupportSummary;
  loading: boolean;
}

export function useResellerSupportTickets(): UseResellerSupportTicketsResult {
  const { resellers, loading: resellersLoading } = useResellers();
  const [tick, setTick] = useState(0);
  const now = useNow();

  useEffect(() => {
    const unsub = subscribeToSupportStore(() => setTick((x) => x + 1));
    return () => unsub();
  }, []);

  const value = useMemo(() => {
    const overlays = getSupportOverlays();
    const tickets = projectResellerTickets(
      mockSupportConversations,
      overlays,
      resellers
    );
    const summaryNow = now ?? Date.now();
    return {
      tickets,
      summary: projectSupportSummary(tickets, summaryNow),
    };
  }, [tick, resellers, now]);

  return { ...value, loading: resellersLoading };
}