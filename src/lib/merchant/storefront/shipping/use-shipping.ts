/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  getShippingFor,
  getShippingVersion,
  subscribeToShipping,
} from "./shipping-store";
import { ensureShippingSeeded } from "./shipping-mutations";
import type { ShippingConfig } from "./types";

export interface UseShippingResult {
  config: ShippingConfig;
  loading: boolean;
}

const EMPTY: ShippingConfig = {
  storefrontId: "",
  zones: [],
  pickupEnabled: false,
  pickupAddress: "",
  pickupInstructions: "",
};

export function useShipping(storefrontId: string): UseShippingResult {
  const [hydrated, setHydrated] = useState(false);

  const version = useSyncExternalStore(
    subscribeToShipping,
    getShippingVersion,
    () => 0
  );

  useEffect(() => {
    if (!storefrontId) {
      setHydrated(false);
      return;
    }
    ensureShippingSeeded(storefrontId);
    setHydrated(true);
  }, [storefrontId]);

  const config = useMemo(() => {
    if (!storefrontId) return EMPTY;
    void version;
    return getShippingFor(storefrontId) ?? EMPTY;
  }, [storefrontId, version]);

  return {
    config,
    loading: !storefrontId || !hydrated,
  };
}