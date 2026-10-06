/* eslint-disable react-hooks/purity */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useCurrentMerchant } from "@/lib/merchant/hooks/use-current-merchant";
import { useNow } from "@/lib/shared/hooks/use-now";
import {
  getNotificationsForMerchant,
  getNotificationsVersion,
  subscribeToNotifications,
} from "./notifications-store";
import { ensureSeeded } from "./notifications-mutations";
import {
  projectHeaderFeed,
  projectSnoozedNotifications,
  projectUnreadCount,
  projectVisibleNotifications,
} from "./notifications-projection";
import type { MerchantNotification } from "./types";

export interface UseMerchantNotificationsResult {
  notifications: MerchantNotification[];
  visibleNotifications: MerchantNotification[];
  snoozedNotifications: MerchantNotification[];
  headerFeed: MerchantNotification[];
  unreadCount: number;
  snoozedCount: number;
  loading: boolean;
  now: number;
}

export function useMerchantNotifications(): UseMerchantNotificationsResult {
  const merchant = useCurrentMerchant();
  const nowMs = useNow();
  const now = nowMs ?? Date.now();
  const [hydrated, setHydrated] = useState(false);

  const version = useSyncExternalStore(
    subscribeToNotifications,
    getNotificationsVersion,
    () => 0
  );

  useEffect(() => {
    if (!merchant) {
      setHydrated(false);
      return;
    }
    ensureSeeded(merchant.id);
    setHydrated(true);
  }, [merchant]);

  const notifications = useMemo(() => {
    if (!merchant) return [];
    void version;
    return getNotificationsForMerchant(merchant.id);
  }, [merchant, version]);

  const visibleNotifications = useMemo(
    () => projectVisibleNotifications(notifications, now),
    [notifications, now]
  );

  const snoozedNotifications = useMemo(
    () => projectSnoozedNotifications(notifications, now),
    [notifications, now]
  );

  const headerFeed = useMemo(
    () => projectHeaderFeed(notifications, now),
    [notifications, now]
  );

  const unreadCount = useMemo(
    () => projectUnreadCount(notifications, now),
    [notifications, now]
  );

  return {
    notifications,
    visibleNotifications,
    snoozedNotifications,
    headerFeed,
    unreadCount,
    snoozedCount: snoozedNotifications.length,
    loading: !merchant || !hydrated,
    now,
  };
}