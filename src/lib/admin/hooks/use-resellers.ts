"use client";

import { useEffect, useState } from "react";
import type { Reseller } from "@/lib/admin/types/reseller";
import {
  getResellers,
  subscribeToResellerStore,
} from "@/lib/admin/mock/reseller-store";

export interface UseResellersResult {
  resellers: Reseller[];
  loading: boolean;
  error: string | null;
}

/**
 * The one read hook for reseller data. Everything that lists, sums, or
 * filters resellers reads through here so it stays reactive to every
 * mutation.
 */
export function useResellers(): UseResellersResult {
  const [resellers, setResellers] = useState<Reseller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const pull = () => {
      if (cancelled) return;
      try {
        setResellers(getResellers());
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load resellers"
        );
      } finally {
        setLoading(false);
      }
    };

    pull();
    const unsub = subscribeToResellerStore(pull);

    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  return { resellers, loading, error };
}