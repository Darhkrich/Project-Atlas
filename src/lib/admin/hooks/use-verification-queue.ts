"use client";

import { useMemo } from "react";
import { useResellers } from "./use-resellers";
import { mockVerificationDocuments } from "@/lib/admin/mock/reseller-verification-documents";
import {
  projectQueueRows,
  projectQueueSummary,
  type QueueRow,
  type QueueSummary,
} from "@/lib/admin/resellers/verification-projection";
import type { VerificationDocument } from "@/lib/admin/types/verification-document";

export interface UseVerificationQueueResult {
  rows: QueueRow[];
  summary: QueueSummary;
  documents: Record<string, VerificationDocument[]>;
  loading: boolean;
}

export function useVerificationQueue(): UseVerificationQueueResult {
  const { resellers, loading } = useResellers();

  const value = useMemo(
    () => ({
      rows: projectQueueRows(resellers, mockVerificationDocuments),
      summary: projectQueueSummary(resellers),
      documents: mockVerificationDocuments,
    }),
    [resellers]
  );

  return { ...value, loading };
}