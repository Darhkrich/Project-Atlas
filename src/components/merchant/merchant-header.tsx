/* eslint-disable react-hooks/purity */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { AtlasIcon } from "@/components/atlas/icons";
import { useStorefrontConfig } from "@/contexts/storefront-config-context";
import { useOrders } from "@/contexts/orders-context";
import { useStoreProducts } from "@/contexts/store-products-context";
import { getMockMerchantOrders } from "@/lib/mock-merchant-orders";

function parseTotal(total: string | number): number {
  if (typeof total === "number") return total;
  const numericString = total.replace(/[^0-9.]/g, "");
  return parseFloat(numericString) || 0;
}

interface MerchantHeaderProps {
  onMenuToggle: () => void;
  storeName?: string;
  storeUrl?: string;
}

export function MerchantHeader({ onMenuToggle, storeName, storeUrl }: MerchantHeaderProps) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { storefrontConfig } = useStorefrontConfig();
  const { orders: realOrders } = useOrders();
  const { getProductsForStore } = useStoreProducts();
  const storeSlug = storefrontConfig.slug;

  const notifications = useMemo(() => {
    const mock = getMockMerchantOrders(storeSlug);
    const allOrders = [...realOrders, ...mock];

    const orderNotifs = allOrders
      .filter((order) => order.status === "New")
      .map((order) => ({
        id: `notif-${order.id}`,
        title: "New order received",
        description: `Order ${order.orderNumber} for GH₵ ${parseTotal(order.total).toFixed(2)}.`,
        time: order.date,
        read: false,
        actionHref: `/merchant/orders/${order.id}`,
        timestamp: (order as any).createdAt || (order as any).updatedAt || Date.now(),
      }));

    const products = getProductsForStore(storeSlug);
    const lowStockNotifs = products
      .filter((p) => p.inStock && p.price && p.price < 70)
      .map((p) => ({
        id: `notif-low-${p.id}`,
        title: "Low stock alert",
        description: `${p.name} has low stock.`,
        time: "Just now",
        read: false,
        actionHref: `/merchant/products/${p.id}`,
        timestamp: Date.now(),
      }));

    return [...orderNotifs, ...lowStockNotifs]
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
      .slice(0, 10);
  }, [realOrders, storeSlug, getProductsForStore]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-4 sm:px-6 dark:border-neutral-800 dark:bg-neutral-900">
      {/* Left: mobile menu and search */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 lg:hidden dark:hover:bg-neutral-800"
          aria-label="Open menu"
        >
          <AtlasIcon name="menu" className="h-6 w-6" />
        </button>
        <div className="hidden sm:block relative">
          <input
            type="search"
            placeholder="Search..."
            className="w-64 rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-2 pl-9 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-500"
          />
          <AtlasIcon name="search" className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
        </div>
      </div>

      {/* Right: store info, notifications, profile */}
      <div className="flex items-center gap-2">
        {storeName && storeUrl && (
          <Link
            href={storeUrl}
            target="_blank"
            className="hidden md:flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            <span className="h-2 w-2 rounded-full bg-success-500" />
            <span className="font-semibold">{storeName}</span>
            <AtlasIcon name="eye" className="h-4 w-4 text-neutral-400" />
          </Link>
        )}

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative rounded-md p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800"
          >
            <AtlasIcon name="bell" className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-neutral-200 bg-white shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
              <div className="border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
                <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  Notifications
                </p>
              </div>
              {/* Scrollable area with hidden scrollbar */}
              <div className="max-h-80 overflow-y-auto p-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {notifications.length === 0 ? (
                  <p className="p-4 text-sm text-neutral-500">No new notifications.</p>
                ) : (
                  notifications.map((notif) => (
                    <Link
                      key={notif.id}
                      href={notif.actionHref}
                      className="flex items-start gap-3 rounded-lg p-2 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                        <AtlasIcon name="cart" className="h-5 w-5 text-neutral-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          {notif.title}
                        </p>
                        <p className="text-xs text-neutral-500">{notif.description}</p>
                        <p className="mt-1 text-xs text-neutral-400">{notif.time}</p>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 rounded-md p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
              JM
            </div>
            <span className="hidden md:block text-sm font-medium text-neutral-800 dark:text-neutral-200">
              John Mensah
            </span>
            <AtlasIcon name="arrow-down" className="h-4 w-4 text-neutral-400" />
          </button>
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-neutral-200 bg-white shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
              <Link href="/merchant/settings" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800">
                Settings
              </Link>
              <Link href="/merchant/billing" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800">
                Billing
              </Link>
              <button className="w-full px-4 py-2 text-left text-sm text-danger-600 hover:bg-neutral-50 dark:hover:bg-neutral-800">
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}