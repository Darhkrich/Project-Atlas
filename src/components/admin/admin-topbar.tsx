"use client";

import { useState } from "react";
import { AtlasIcon } from "@/components/atlas/icons";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { AdminThemeToggle } from "./admin-theme-toggle";

interface AdminTopbarProps {
  onMenuClick: () => void;
  pageTitle?: string;
}

export function AdminTopbar({ onMenuClick, pageTitle }: AdminTopbarProps) {
  const [search, setSearch] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-neutral-200 bg-white px-4 dark:border-neutral-800 dark:bg-neutral-900">
      {/* Mobile menu button */}
      <Button variant="ghost" size="sm" className="lg:hidden" onClick={onMenuClick}>
        <AtlasIcon name="menu" className="h-5 w-5" />
      </Button>

      {/* Page title / breadcrumb */}
      <div className="hidden sm:block">
        {pageTitle && <h1 className="text-sm font-semibold">{pageTitle}</h1>}
      </div>

      <div className="flex-1" />

      {/* Search */}
      <div className="relative hidden w-64 md:block">
        <AtlasIcon
          name="search"
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
        />
        <Input
          type="search"
          placeholder="Search..."
          className="h-9 pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Theme toggle */}
      <AdminThemeToggle />

      {/* Notifications */}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowNotifications(!showNotifications)}
        >
          <AtlasIcon name="bell" className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-danger-500" />
        </Button>
        {showNotifications && (
          <div className="absolute right-0 mt-2 w-80 rounded-lg border border-neutral-200 bg-white p-4 shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
            <p className="text-sm font-medium">Notifications</p>
            <p className="mt-2 text-xs text-neutral-500">
              You have 3 unread notifications.
            </p>
          </div>
        )}
      </div>

      {/* Profile */}
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
          AD
        </div>
        <div className="hidden md:block">
          <p className="text-sm font-medium">Admin User</p>
          <p className="text-xs text-neutral-500">Super Admin</p>
        </div>
      </div>
    </header>
  );
}