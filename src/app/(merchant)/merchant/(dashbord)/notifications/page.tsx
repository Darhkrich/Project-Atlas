/* eslint-disable react-hooks/purity */
/* eslint-disable react-hooks/set-state-in-render */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import { AtlasIcon } from "@/components/atlas/icons";
import { useStorefrontConfig } from "@/contexts/storefront-config-context";
import { useOrders } from "@/contexts/orders-context";
import { getMockMerchantOrders } from "@/lib/mock-merchant-orders";
import { cn } from "@/lib/utils";

function parseTotal(total: string | number): number {
  if (typeof total === "number") return total;
  const numericString = total.replace(/[^0-9.]/g, "");
  return parseFloat(numericString) || 0;
}

export default function MerchantNotificationsPage() {
  const { storefrontConfig } = useStorefrontConfig();
  const { orders: realOrders } = useOrders();
  const storeSlug = storefrontConfig.slug;

  const [notifications, setNotifications] = useState<any[]>([]);
  const [filter, setFilter] = useState<"All" | "Unread" | "Read">("All");

  useMemo(() => {
    const mock = getMockMerchantOrders(storeSlug);
    const allOrders = [...realOrders, ...mock];

    // Generate notifications from orders
    const notifs = allOrders.map((order) => ({
      id: `notif-${order.id}`,
      title: "New order received",
      description: `Order ${order.orderNumber} for GH₵ ${parseTotal(order.total).toFixed(2)}.`,
      time: order.date,
      read: false,
      icon: "cart",
      actionHref: `/merchant/orders/${order.id}`,
      actionLabel: "View Order",
      timestamp: (order as any).createdAt || (order as any).updatedAt || Date.now(),
    }));

    // Sort by timestamp descending (latest first)
    notifs.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    setNotifications(notifs);
  }, [realOrders, storeSlug]);

  const filtered = notifications.filter((n) => {
    if (filter === "Unread") return !n.read;
    if (filter === "Read") return n.read;
    return true;
  });

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
            Notifications
          </h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Stay updated with your store activity.
          </p>
        </div>
        <button onClick={markAllAsRead} className="text-sm font-medium text-brand-600 hover:text-brand-700">
          Mark all as read
        </button>
      </div>

      <div className="flex gap-2">
        {(["All", "Unread", "Read"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              filter === tab
                ? "bg-brand-600 text-white"
                : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900">
            No notifications found.
          </div>
        ) : (
          filtered.map((notification) => (
            <div
              key={notification.id}
              className={cn(
                "flex items-start gap-4 rounded-xl border bg-white p-4 transition dark:bg-neutral-900",
                notification.read
                  ? "border-neutral-200 dark:border-neutral-800"
                  : "border-brand-200 bg-brand-50/50 dark:border-brand-800 dark:bg-brand-900/20"
              )}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                <AtlasIcon name={notification.icon} className="h-5 w-5 text-neutral-500" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    {notification.title}
                  </p>
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="text-xs font-medium text-brand-600 hover:text-brand-700"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                  {notification.description}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-neutral-500">{notification.time}</span>
                  {notification.actionHref && (
                    <a
                      href={notification.actionHref}
                      className="text-xs font-medium text-brand-600 hover:text-brand-700"
                    >
                      {notification.actionLabel}
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}