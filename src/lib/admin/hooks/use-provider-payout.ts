"use client";

import { useEffect, useState } from "react";
import {
  getProviderPayoutBatches,
  subscribeToProviderPayoutStore,
} from "@/lib/domains/treasury/provider-payout-store";
import { subscribeToTreasuryStore } from "@/lib/domains/treasury/store";
import { startProviderResponseTick } from "@/lib/domains/treasury/provider-response-tick";
import type { ProviderPayoutBatch } from "@/lib/domains/treasury/provider-payout-types";

export interface UseProviderPayoutsResult {
  batches: ProviderPayoutBatch[];
  isLoading: boolean;
  error: Error | null;
}

const EMPTY: ProviderPayoutBatch[] = [];

export function useProviderPayouts(): UseProviderPayoutsResult {
  const [batches, setBatches] = useState<ProviderPayoutBatch[]>(() =>
    getProviderPayoutBatches()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const sync = () => {
      try {
        setBatches(getProviderPayoutBatches());
        setIsLoading(false);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e : new Error(String(e)));
      }
    };
    const unsubPayouts = subscribeToProviderPayoutStore(sync);
    const unsubTreasury = subscribeToTreasuryStore(sync);
    const stopTick = startProviderResponseTick();
    sync();
    return () => {
      unsubPayouts();
      unsubTreasury();
      stopTick();
    };
  }, []);

  return {
    batches: batches ?? EMPTY,
    isLoading,
    error,
  };
}