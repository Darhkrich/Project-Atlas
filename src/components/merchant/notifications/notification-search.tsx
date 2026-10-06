/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { AtlasIcon } from "@/components/atlas/icons";

interface NotificationSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function NotificationSearch({
  value,
  onChange,
}: NotificationSearchProps) {
  const [local, setLocal] = useState(value);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      if (local !== value) onChange(local);
    }, 150);
    return () => window.clearTimeout(id);
  }, [local, value, onChange]);

  return (
    <div className="relative">
      <label htmlFor="notification-search" className="sr-only">
        Search notifications
      </label>
      <input
        id="notification-search"
        type="search"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder="Search by title or message"
        className="w-full rounded-lg border border-neutral-300 bg-white py-2 pl-9 pr-3 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder-neutral-500"
      />
      <AtlasIcon
        name="search"
        className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-neutral-400"
      />
    </div>
  );
}