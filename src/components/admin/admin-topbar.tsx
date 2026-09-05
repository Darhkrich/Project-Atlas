"use client";

import { useEffect, useRef, useState } from "react";
import { AtlasIcon } from "@/components/atlas/icons";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface AdminTopbarProps {
  onMenuClick: () => void;
  pageTitle?: string;
}

export function AdminTopbar({
  onMenuClick,
  pageTitle,
}: AdminTopbarProps) {
  const [search, setSearch] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);

  const notificationRef = useRef<HTMLDivElement>(null);

  /**
   * Close the notification popover when the user clicks outside it.
   */
  useEffect(() => {
    if (!showNotifications) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (
        target instanceof Node &&
        !notificationRef.current?.contains(target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [showNotifications]);

  /**
   * Close the notification popover when Escape is pressed.
   */
  useEffect(() => {
    if (!showNotifications) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowNotifications(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showNotifications]);

  return (
    <header className="sticky top-0 z-30 flex h-[68px] shrink-0 items-center border-b border-neutral-200/80 bg-white/95 px-4 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/95 sm:px-5 lg:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {/* Mobile menu */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="size-9 shrink-0 rounded-lg p-0 lg:hidden"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
        >
          <AtlasIcon
            name="menu"
            className="size-[19px]"
            aria-hidden="true"
          />
        </Button>

        {/* Page heading */}
        <div className="min-w-0">
          {pageTitle ? (
            <div className="flex min-w-0 items-center gap-2">
              <h1 className="truncate text-[15px] font-semibold tracking-[-0.015em] text-neutral-950 dark:text-white">
                {pageTitle}
              </h1>
            </div>
          ) : (
            <h1 className="text-[15px] font-semibold tracking-[-0.015em] text-neutral-950 dark:text-white">
              Admin Controls
            </h1>
          )}
        </div>
      </div>

      {/* Right-side controls */}
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        {/* Search */}
        <div className="relative hidden w-52 md:block lg:w-64">
          <AtlasIcon
            name="search"
            className="pointer-events-none absolute left-3 top-1/2 size-[16px] -translate-y-1/2 text-neutral-400"
            aria-hidden="true"
          />

          <Input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search..."
            aria-label="Search admin center"
            className="h-9 rounded-lg border-neutral-200 bg-neutral-50 pl-9 pr-3 text-[13px] placeholder:text-neutral-400 focus:bg-white dark:border-neutral-800 dark:bg-neutral-900 dark:focus:bg-neutral-900"
          />
        </div>

        {/* Notifications */}
        <div ref={notificationRef} className="relative">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="relative size-9 rounded-lg p-0"
            onClick={() => setShowNotifications((current) => !current)}
            aria-label="Notifications"
            aria-expanded={showNotifications}
            aria-haspopup="dialog"
          >
            <AtlasIcon
              name="bell"
              className="size-[18px]"
              aria-hidden="true"
            />

            {/* Unread indicator */}
            <span
              aria-hidden="true"
              className="absolute right-[8px] top-[7px] size-1.5 rounded-full bg-danger-500 ring-2 ring-white dark:ring-neutral-950"
            />
          </Button>

          {/* Notification popover */}
          {showNotifications && (
            <div
              role="dialog"
              aria-label="Notifications"
              className="absolute right-0 top-[calc(100%+10px)] w-[min(360px,calc(100vw-24px))] overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-[0_16px_40px_-16px_rgba(0,0,0,0.2)] dark:border-neutral-800 dark:bg-neutral-950"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3.5 dark:border-neutral-800">
                <div>
                  <h2 className="text-sm font-semibold text-neutral-950 dark:text-white">
                    Notifications
                  </h2>

                  <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-500">
                    Recent activity requiring your attention
                  </p>
                </div>

                <span className="rounded-full bg-brand-50 px-2 py-1 text-[10px] font-semibold text-brand-700 dark:bg-brand-900/25 dark:text-brand-300">
                  3 unread
                </span>
              </div>

              {/* Notifications */}
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                <NotificationItem
                  title="Payment requires review"
                  description="A payment transaction has been flagged for review."
                  time="5 min ago"
                  variant="warning"
                />

                <NotificationItem
                  title="New reseller registered"
                  description="A new reseller account has been created."
                  time="18 min ago"
                  variant="info"
                />

                <NotificationItem
                  title="Provider connection restored"
                  description="The service provider is operational again."
                  time="42 min ago"
                  variant="success"
                />
              </div>

              {/* Footer */}
              <div className="border-t border-neutral-100 p-2.5 dark:border-neutral-800">
                <button
                  type="button"
                  className="flex h-9 w-full items-center justify-center rounded-lg text-xs font-medium text-brand-700 transition-colors hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-brand-900/20"
                >
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div
          aria-hidden="true"
          className="mx-1 hidden h-7 w-px bg-neutral-200 dark:bg-neutral-800 sm:block"
        />

        {/* Admin profile */}
        <button
          type="button"
          className="group flex items-center gap-2 rounded-lg p-1.5 text-left outline-none transition-colors hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1 dark:hover:bg-neutral-900 dark:focus-visible:ring-offset-neutral-950"
          aria-label="Open admin account menu"
        >
          <span
            aria-hidden="true"
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[11px] font-semibold text-brand-700 ring-1 ring-inset ring-brand-200 dark:bg-brand-900/30 dark:text-brand-300 dark:ring-brand-800/50"
          >
            AD
          </span>

          <span className="hidden min-w-0 md:block">
            <span className="block max-w-[120px] truncate text-[13px] font-medium leading-4 text-neutral-900 dark:text-neutral-100">
              Admin User
            </span>

            <span className="mt-0.5 block text-[10px] font-medium leading-3 text-neutral-500 dark:text-neutral-500">
              Super Admin
            </span>
          </span>
        </button>
      </div>
    </header>
  );
}

interface NotificationItemProps {
  title: string;
  description: string;
  time: string;
  variant: "success" | "warning" | "info";
}

function NotificationItem({
  title,
  description,
  time,
  variant,
}: NotificationItemProps) {
  const indicatorClasses = {
    success: "bg-success-500",
    warning: "bg-warning-500",
    info: "bg-info-500",
  };

  return (
    <button
      type="button"
      className="flex w-full gap-3 px-4 py-3.5 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900"
    >
      <span className="mt-1.5 flex size-2 shrink-0 items-center justify-center">
        <span
          aria-hidden="true"
          className={`size-1.5 rounded-full ${indicatorClasses[variant]}`}
        />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
          {title}
        </span>

        <span className="mt-0.5 block text-xs leading-5 text-neutral-500 dark:text-neutral-500">
          {description}
        </span>

        <span className="mt-1.5 block text-[10px] font-medium text-neutral-400 dark:text-neutral-600">
          {time}
        </span>
      </span>
    </button>
  );
}