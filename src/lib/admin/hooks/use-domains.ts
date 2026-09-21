"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getDomains,
  subscribeToDomainStore,
} from "@/lib/domains/store";
import { mockStorefronts } from "@/lib/admin/mock/storefronts";
import {
  projectDomainSummary,
  projectDomains,
  type DomainRow,
  type DomainSummary,
} from "@/lib/domains/projection";

export interface UseDomainsResult {
  rows: DomainRow[];
  summary: DomainSummary;
  loading: boolean;
}

export function useDomains(): UseDomainsResult {
  const [tick, setTick] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 250);
    const unsub = subscribeToDomainStore(() => setTick((x) => x + 1));
    return () => {
      window.clearTimeout(t);
      unsub();
    };
  }, []);

  const value = useMemo(() => {
    const rows = projectDomains(getDomains(), mockStorefronts);
    return {
      rows,
      summary: projectDomainSummary(rows),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  return { ...value, loading };
}