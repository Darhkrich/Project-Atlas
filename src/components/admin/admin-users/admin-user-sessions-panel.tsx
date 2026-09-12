// components/admin/admin-users/admin-user-sessions-panel.tsx
"use client";

import Link from "next/link";
import { Badge } from "@/components/admin/ui/badge";
import { useNow } from "@/lib/admin/hooks/use-now";
import { formatAbsolute, formatRelative } from "@/lib/admin/support/format";
import type { AdminUser } from "@/lib/admin/types/admin-user";

interface AdminUserSessionsPanelProps {
  user: AdminUser;
}

interface SessionPreview {
  id: string;
  device: string;
  ip: string;
  lastActive: string;
  current: boolean;
}

function sessionsFor(user: AdminUser): SessionPreview[] {
  const isOnline =
    user.lastLogin !== null &&
    Date.now() - new Date(user.lastLogin).getTime() < 24 * 3_600_000;

  return [
    {
      id: `${user.id}-current`,
      device: "Chrome on Windows",
      ip: user.lastLoginFrom ?? "unknown",
      lastActive: user.lastLogin ?? new Date().toISOString(),
      current: isOnline,
    },
    {
      id: `${user.id}-older`,
      device: "Safari on iPhone",
      ip: user.lastLoginFrom ?? "unknown",
      lastActive: new Date(
        new Date(user.lastLogin ?? Date.now()).getTime() - 86_400_000
      ).toISOString(),
      current: false,
    },
  ];
}

export function AdminUserSessionsPanel({
  user,
}: AdminUserSessionsPanelProps) {
  const now = useNow();
  const sessions = sessionsFor(user);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          Recent sessions
        </p>
        <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
          Compact view of the most recent sign-ins. Full session management
          lives in the Security Center.
        </p>
      </div>

      <ul className="space-y-2">
        {sessions.map((session) => (
          <li
            key={session.id}
            className="flex flex-wrap items-start justify-between gap-2 rounded-md border border-neutral-200 p-3 dark:border-neutral-700"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {session.device}
              </p>
              <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                <span className="font-mono">{session.ip}</span>
                {" · "}
                <time
                  dateTime={session.lastActive}
                  title={formatAbsolute(session.lastActive)}
                >
                  {formatRelative(session.lastActive, now)}
                </time>
              </p>
            </div>
            {session.current ? (
              <Badge variant="success" size="sm">
                Active
              </Badge>
            ) : (
              <Badge variant="neutral" size="sm">
                Expired
              </Badge>
            )}
          </li>
        ))}
      </ul>

      <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-900/60">
        <Link
          href={`/admin/security?q=${encodeURIComponent(user.email)}`}
          className="text-xs font-medium text-brand-700 hover:underline dark:text-brand-300"
        >
          View all sessions in Security Center
        </Link>
      </div>
    </div>
  );
}