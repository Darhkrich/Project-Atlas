/* eslint-disable react-hooks/purity */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useResellers } from "./use-resellers";
import { mockSupportConversations } from "@/lib/admin/mock/support";
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

export interface UseResellerSupportTicketsResult {
  tickets: SupportConversation[];
  summary: SupportSummary;
  loading: boolean;
}

export function useResellerSupportTickets(): UseResellerSupportTicketsResult {
  const { resellers, loading: resellersLoading } = useResellers();
  const [tick, setTick] = useState(0);

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
    return {
      tickets,
      summary: projectSupportSummary(tickets, Date.now()),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, resellers]);

  return { ...value, loading: resellersLoading };
}