// components/admin/security/sessions-and-ips.tsx
"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { useNow } from "@/lib/admin/hooks/use-now";
import { formatAbsolute, formatRelative } from "@/lib/admin/support/format";
import { SESSION_USER_TYPE_LABEL } from "@/lib/admin/security/constants";
import type {
  ActiveSession,
  BlockedIP,
} from "@/lib/admin/types/security";

const PAGE_SIZE = 5;

interface SessionsAndIPsProps {
  sessions: ActiveSession[];
  blockedIPs: BlockedIP[];
  onEndSession: (id: string) => void;
  onBlockIPsFromList: (ips: string[]) => void;
  onUnblock: (id: string) => void;
  onExtendBlock: (id: string) => void;
  onMakePermanent: (id: string) => void;
}

export function SessionsAndIPs({
  sessions,
  blockedIPs,
  onEndSession,
  onBlockIPsFromList,
  onUnblock,
  onExtendBlock,
  onMakePermanent,
}: SessionsAndIPsProps) {
  const [sessionSearch, setSessionSearch] = useState("");
  const [sessionPage, setSessionPage] = useState(1);
  const [ipSearch, setIpSearch] = useState("");
  const [ipPage, setIpPage] = useState(1);
  const now = useNow();

  const filteredSessions = useMemo(() => {
    const q = sessionSearch.trim().toLowerCase();
    if (!q) return sessions;
    return sessions.filter(
      (s) =>
        (s.actorName ?? s.user).toLowerCase().includes(q) ||
        s.user.toLowerCase().includes(q) ||
        s.ip.includes(q) ||
        s.device.toLowerCase().includes(q) ||
        (s.countryCode ?? "").toLowerCase().includes(q)
    );
  }, [sessions, sessionSearch]);

  const filteredIPs = useMemo(() => {
    const q = ipSearch.trim().toLowerCase();
    if (!q) return blockedIPs;
    return blockedIPs.filter(
      (b) =>
        b.ip.includes(q) ||
        b.reason.toLowerCase().includes(q) ||
        (b.countryCode ?? "").toLowerCase().includes(q)
    );
  }, [blockedIPs, ipSearch]);

  const sessionPages = Math.max(1, Math.ceil(filteredSessions.length / PAGE_SIZE));
  const ipPages = Math.max(1, Math.ceil(filteredIPs.length / PAGE_SIZE));

  const sessionSlice = filteredSessions.slice(
    (sessionPage - 1) * PAGE_SIZE,
    sessionPage * PAGE_SIZE
  );
  const ipSlice = filteredIPs.slice(
    (ipPage - 1) * PAGE_SIZE,
    ipPage * PAGE_SIZE
  );

  return (
    <div id="sessions" className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Active Sessions */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div>
            <CardTitle>
              Active sessions{" "}
              <span className="ml-1 text-sm font-normal text-neutral-500 dark:text-neutral-400">
                ({sessions.length})
              </span>
            </CardTitle>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              Signed-in sessions across the admin centre.
            </p>
          </div>
          <Input
            aria-label="Search sessions"
            placeholder="Search…"
            className="h-8 max-w-[160px]"
            value={sessionSearch}
            onChange={(e) => {
              setSessionSearch(e.target.value);
              setSessionPage(1);
            }}
          />
        </CardHeader>

        <CardContent className="space-y-2">
          {sessionSlice.length === 0 ? (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              No sessions match.
            </p>
          ) : (
            sessionSlice.map((session) => (
              <div
                key={session.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-neutral-200 p-3 dark:border-neutral-700"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {session.actorName ?? session.user}
                    </p>
                    {session.userType && (
                      <Badge variant="brand" size="sm">
                        {SESSION_USER_TYPE_LABEL[session.userType]}
                      </Badge>
                    )}
                    {session.current && (
                      <Badge variant="success" size="sm">
                        This device
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                    {session.user}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                    {session.device} ·{" "}
                    <span className="font-mono">{session.ip}</span>
                    {session.countryCode && ` · ${session.countryCode}`}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-400 dark:text-neutral-500">
                    Last active{" "}
                    <time
                      dateTime={session.lastActive}
                      title={formatAbsolute(session.lastActive)}
                    >
                      {formatRelative(session.lastActive, now)}
                    </time>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {!session.current && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onBlockIPsFromList([session.ip])}
                      >
                        Block IP
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEndSession(session.id)}
                      >
                        End session
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}

          {sessionPages > 1 && (
            <div className="flex items-center justify-between pt-2 text-xs text-neutral-500 dark:text-neutral-400">
              <span>
                Page {sessionPage} of {sessionPages}
              </span>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={sessionPage <= 1}
                  onClick={() => setSessionPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={sessionPage >= sessionPages}
                  onClick={() => setSessionPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Blocked IPs */}
      <Card id="blocked-ips">
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div>
            <CardTitle>
              Blocked IPs{" "}
              <span className="ml-1 text-sm font-normal text-neutral-500 dark:text-neutral-400">
                ({blockedIPs.length})
              </span>
            </CardTitle>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              Addresses that cannot authenticate or place orders.
            </p>
          </div>
          <Input
            aria-label="Search blocked IPs"
            placeholder="Search…"
            className="h-8 max-w-[140px]"
            value={ipSearch}
            onChange={(e) => {
              setIpSearch(e.target.value);
              setIpPage(1);
            }}
          />
        </CardHeader>

        <CardContent className="space-y-2">
          {ipSlice.length === 0 ? (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {blockedIPs.length === 0
                ? "Nothing is blocked."
                : "No blocked IPs match."}
            </p>
          ) : (
            ipSlice.map((entry) => (
              <div
                key={entry.id}
                className="flex flex-wrap items-start justify-between gap-3 rounded-md border border-neutral-200 p-3 dark:border-neutral-700"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm text-neutral-900 dark:text-neutral-100">
                      {entry.ip}
                    </span>
                    {entry.countryCode && (
                      <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                        {entry.countryCode}
                      </span>
                    )}
                    <Badge
                      variant={entry.permanent ? "danger" : "warning"}
                      size="sm"
                    >
                      {entry.permanent ? "Permanent" : "Temporary"}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-neutral-600 dark:text-neutral-400">
                    {entry.reason}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                    {typeof entry.attemptCount === "number" && (
                      <>
                        {entry.attemptCount} attempt
                        {entry.attemptCount === 1 ? "" : "s"} ·{" "}
                      </>
                    )}
                    Blocked by {entry.blockedBy}{" "}
                    <time
                      dateTime={entry.blockedAt}
                      title={formatAbsolute(entry.blockedAt)}
                    >
                      {formatRelative(entry.blockedAt, now)}
                    </time>
                  </p>
                  {entry.expiresAt && (
                    <p className="mt-0.5 text-xs text-neutral-400 dark:text-neutral-500">
                      Expires{" "}
                      <time
                        dateTime={entry.expiresAt}
                        title={formatAbsolute(entry.expiresAt)}
                      >
                        {formatRelative(entry.expiresAt, now)}
                      </time>
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {!entry.permanent && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onExtendBlock(entry.id)}
                      >
                        Extend 7d
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onMakePermanent(entry.id)}
                      >
                        Make permanent
                      </Button>
                    </>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUnblock(entry.id)}
                  >
                    Unblock
                  </Button>
                </div>
              </div>
            ))
          )}

          {ipPages > 1 && (
            <div className="flex items-center justify-between pt-2 text-xs text-neutral-500 dark:text-neutral-400">
              <span>
                Page {ipPage} of {ipPages}
              </span>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={ipPage <= 1}
                  onClick={() => setIpPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={ipPage >= ipPages}
                  onClick={() => setIpPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}