"use client";

import { useEffect, useState } from "react";
import { getAuditEntries, subscribeToAuditStore } from "@/lib/domains/audit";
import type { AuditEntry } from "@/lib/domains/audit";

export function useAuditEntries(): AuditEntry[] {
  const [entries, setEntries] = useState<AuditEntry[]>(() =>
    getAuditEntries()
  );

  useEffect(() => {
    return subscribeToAuditStore(() => {
      setEntries(getAuditEntries());
    });
  }, []);

  return entries;
}