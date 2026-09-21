"use client";

import { useEffect, useState } from "react";
import type { Merchant } from "@/lib/admin/types/merchant";
import {
  getMerchants,
  subscribeToMerchantStore,
} from "@/lib/admin/mock/merchant-store";

export interface UseMerchantsResult {
  merchants: Merchant[];
  loading: boolean;
}

export function useMerchants(): UseMerchantsResult {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const pull = () => {
      if (cancelled) return;
      setMerchants(getMerchants());
      setLoading(false);
    };

    const t = window.setTimeout(pull, 250);
    const unsub = subscribeToMerchantStore(pull);

    return () => {
      cancelled = true;
      window.clearTimeout(t);
      unsub();
    };
  }, []);

  return { merchants, loading };
}