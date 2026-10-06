/* eslint-disable react-hooks/purity */
"use client";

import { useMemo } from "react";
import { useStorefrontConfig } from "@/contexts/storefront-config-context";
import { useOrders } from "@/contexts/orders-context";
import { useStoreProducts } from "@/contexts/store-products-context";
import { useMerchantNotifications } from "@/lib/merchant/notifications/use-merchant-notifications";
import { useCurrentMerchantWallet } from "@/lib/merchant/hooks/use-current-merchant-wallet";
import { useNow } from "@/lib/shared/hooks/use-now";
import { storefrontDisplayUrl } from "@/lib/merchant/storefront-url";
import { projectMerchantDashboard } from "./projection";
import type { MerchantDashboardSnapshot } from "./types";

export function useMerchantDashboard(): MerchantDashboardSnapshot {
  const { storefrontConfig } = useStorefrontConfig();
  const { getOrdersForStore } = useOrders();
  const { getProductsForStore } = useStoreProducts();
  const notifications = useMerchantNotifications();
  const walletResult = useCurrentMerchantWallet();
  const nowMs = useNow();
  const now = nowMs ?? Date.now();

  return useMemo(() => {
    const slug = storefrontConfig.slug;
    const orders = getOrdersForStore(slug);
    const products = getProductsForStore(slug);
    const storeDisplayUrl = storefrontDisplayUrl(storefrontConfig);

    return projectMerchantDashboard({
      store: storefrontConfig,
      products,
      orders,
      notifications: notifications.notifications,
      wallet: walletResult.wallet,
      billingSummary: walletResult.billingSummary,
      pendingWithdrawals: walletResult.pendingWithdrawals,
      storeDisplayUrl,
      nowMs: now,
    });
  }, [
    storefrontConfig,
    getOrdersForStore,
    getProductsForStore,
    notifications.notifications,
    walletResult.wallet,
    walletResult.billingSummary,
    walletResult.pendingWithdrawals,
    now,
  ]);
}