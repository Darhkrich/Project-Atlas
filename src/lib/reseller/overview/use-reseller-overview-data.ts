/* eslint-disable react-hooks/purity */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useMemo } from "react";
import { useNow } from "@/lib/shared/hooks/use-now";
import { useCurrentReseller } from "@/lib/reseller/hooks/use-current-reseller";
import { useCurrentResellerWallet } from "@/lib/reseller/hooks/use-current-reseller-wallet";
import { useResellerOrders } from "@/lib/domains/orders/use-reseller-orders";
import { useResellerCustomers } from "@/lib/domains/storefront/use-reseller-customers";
import { useResellerStorefront } from "@/contexts/reseller-storefront-context";
import {
  projectActionQueue,
  projectRecentOrders,
  projectStorefrontHealth,
  projectToday,
  projectTopServices,
} from "./projection";
import type { ResellerOverviewData } from "./types";

export interface UseResellerOverviewDataResult {
  data: ResellerOverviewData | null;
  loading: boolean;
  error: Error | null;
  isEmpty: boolean;
}

export function useResellerOverviewData(): UseResellerOverviewDataResult {
  const reseller = useCurrentReseller();
  const nowMs = useNow();
  const wallet = useCurrentResellerWallet();
  const orders = useResellerOrders(reseller?.id ?? "");
  const customers = useResellerCustomers(reseller?.id ?? "", orders);
  const { config: resellerConfig, isLoading: configLoading } =
    useResellerStorefront();

  const effectiveNowMs = nowMs ?? Date.now();

  const data = useMemo<ResellerOverviewData | null>(() => {
    if (!reseller) return null;

    const commissionsThisMonth =
      wallet.commissionsSummary?.thisMonthTotal ?? null;
    const walletBalance = wallet.wallet?.record.balance ?? null;

    const today = projectToday(
      orders,
      effectiveNowMs,
      commissionsThisMonth,
      walletBalance
    );
    const actionQueue = projectActionQueue({
      reseller,
      orders,
      pendingWithdrawalsCount: wallet.pendingWithdrawals.length,
      resellerConfig,
      nowMs: effectiveNowMs,
    });
    const storefrontHealth = projectStorefrontHealth(resellerConfig, orders);
    const recentOrders = projectRecentOrders(orders);
    const topServices = projectTopServices(orders);

    void customers;

    return {
      reseller,
      today,
      actionQueue,
      storefrontHealth,
      recentOrders,
      topServices,
      hasOrders: orders.length > 0,
    };
  }, [reseller, orders, wallet, resellerConfig, effectiveNowMs]);

  const loading = wallet.loading || configLoading;
  const error =
    wallet.error ??
    (reseller === null && !loading
      ? new Error("No reseller session.")
      : null);
  const isEmpty = data !== null && !data.hasOrders;

  return { data, loading, error, isEmpty };
}