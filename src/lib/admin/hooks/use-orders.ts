"use client";

import { useEffect, useState } from "react";
import type { Order } from "@/lib/admin/types/orders";
import {
  getOrders,
  subscribeToOrdersStore,
  isOrdersStoreLoaded,
} from "@/lib/admin/mock/orders-store";
import { startRetryTick } from "@/lib/admin/mock/orders-mutations";

interface UseOrdersResult {
  orders: Order[];
  isLoading: boolean;
  error: Error | null;
}

export function useOrders(): UseOrdersResult {
  const [orders, setOrders] = useState<Order[]>(() =>
    isOrdersStoreLoaded() ? getOrders() : []
  );
  const [isLoading, setIsLoading] = useState(!isOrdersStoreLoaded());
  const [error] = useState<Error | null>(null);

  useEffect(() => {
    startRetryTick();

    const sync = () => {
      setOrders(getOrders());
      setIsLoading(false);
    };

    const unsubscribe = subscribeToOrdersStore(sync);
    sync();

    return () => {
      unsubscribe();
    };
  }, []);

  return { orders, isLoading, error };
}