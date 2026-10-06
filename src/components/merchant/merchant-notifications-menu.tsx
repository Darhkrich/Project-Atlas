"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AtlasIcon } from "@/components/atlas/icons";
import { useMerchantNotifications } from "@/lib/merchant/notifications/use-merchant-notifications";
import {
  NOTIFICATION_KIND_ICON,
  NOTIFICATION_KIND_LABEL,
} from "@/lib/merchant/notifications/labels";
import { projectRelativeTime } from "@/lib/merchant/notifications/notifications-projection";
import { markAllNotificationsRead } from "@/lib/merchant/notifications/notifications-mutations";
import { useCurrentMerchant } from "@/lib/merchant/hooks/use-current-merchant";
import type { MerchantNotificationLink } from "@/lib/merchant/notifications/types";

function hrefForLink(link: MerchantNotificationLink): string {
  switch (link.kind) {
    case "order":
      return "/merchant/orders/" + link.orderId;
    case "product":
      return "/merchant/products/" + link.productId;
    case "wallet":
      return "/merchant/wallet";
    case "billing":
      return "/merchant/billing";
    case "none":
    default:
      return "/merchant/notifications";
  }
}

export function MerchantNotificationsMenu() {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const merchant = useCurrentMerchant();
  const { headerFeed, unreadCount, now } = useMerchantNotifications();

  useEffect(() => {
    if (!open) return;
    const onDocClick = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (wrapperRef.current && !wrapperRef.current.contains(target)) {
        setOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleMarkAll = () => {
    if (!merchant) return;
    markAllNotificationsRead(merchant.id);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={
          unreadCount > 0
            ? unreadCount + " unread notifications"
            : "Notifications"
        }
        aria-haspopup="menu"
        aria-expanded={open}
        className="relative rounded-md p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
      >
        <AtlasIcon name="bell" className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Notifications"
          className="absolute right-0 mt-2 w-80 rounded-xl border border-neutral-200 bg-white shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Notifications
            </p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAll}
                className="text-xs font-medium text-brand-700 hover:underline dark:text-brand-300"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto p-2">
            {headerFeed.length === 0 ? (
              <p className="p-4 text-sm text-neutral-500">
                No notifications yet.
              </p>
            ) : (
              headerFeed.map((notif) => (
                <Link
                  key={notif.id}
                  href={hrefForLink(notif.link)}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="flex items-start gap-3 rounded-lg p-2 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                    <AtlasIcon
                      name={NOTIFICATION_KIND_ICON[notif.kind]}
                      className="h-5 w-5 text-neutral-500"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {notif.title}
                    </p>
                    <p className="text-xs text-neutral-500">{notif.body}</p>
                    <p className="mt-1 text-xs text-neutral-400">
                      {NOTIFICATION_KIND_LABEL[notif.kind]}{" "}
                      {"\u2022"}{" "}
                      {projectRelativeTime(notif.createdAt, now)}
                    </p>
                  </div>
                  {notif.readAt === null && (
                    <span
                      aria-hidden="true"
                      className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand-600"
                    />
                  )}
                </Link>
              ))
            )}
          </div>

          <div className="border-t border-neutral-200 p-2 dark:border-neutral-800">
            <Link
              href="/merchant/notifications"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-center text-sm font-medium text-brand-700 hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-brand-900/20"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}