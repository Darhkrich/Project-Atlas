// lib/admin/hooks/use-ecommerce-support-tickets.ts
"use client";

import { useMemo, useSyncExternalStore } from "react";
import type {
  EcommerceSupportSummary,
  EcommerceSupportTicket,
} from "@/lib/admin/types/ecommerce-support";
import {
  getEcommerceSupportStore,
  subscribeEcommerceSupport,
} from "@/lib/admin/mock/ecommerce-support-store";
import {
  computeDeltas,
  computeSummary,
  type EcommerceSupportDeltas,
} from "@/lib/admin/ecommerce/support/support-projection";
import { useNow } from "@/lib/shared/hooks/use-now";

export interface UseEcommerceSupportTicketsResult {
  tickets: EcommerceSupportTicket[];
  summary: EcommerceSupportSummary;
  deltas: EcommerceSupportDeltas;
  loading: boolean;
  error: string | null;
}

export function useEcommerceSupportTickets(): UseEcommerceSupportTicketsResult {
  const tickets = useSyncExternalStore(
    subscribeEcommerceSupport,
    getEcommerceSupportStore,
    getEcommerceSupportStore
  );
  const now = useNow();

  const summary = useMemo(() => computeSummary(tickets, now), [tickets, now]);

  const deltas = useMemo(() => computeDeltas(tickets, now), [tickets, now]);

  return { tickets, summary, deltas, loading: false, error: null };
}