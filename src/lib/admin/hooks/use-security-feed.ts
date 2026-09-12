/* eslint-disable react-hooks/purity */
// lib/admin/hooks/use-security-feed.ts
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  ActiveSession,
  AllowlistedIP,
  BlockedIP,
  LockedAccount,
  SecurityAlert,
  SecurityEvent,
  SecurityPolicySummary,
  SecuritySummary,
  TwoFactorStatus,
} from "@/lib/admin/types/security";
import {
  mockActiveSessions,
  mockAllowlistedIPs,
  mockBlockedIPs,
  mockLockedAccounts,
  mockSecurityAlerts,
  mockSecurityEvents,
  mockSecurityPolicy,
  mockTwoFactorStatuses,
} from "@/lib/admin/mock/security";

const CURRENT_ADMIN = {
  id: "usr-001",
  name: "Yaw Mensah",
  email: "yaw.mensah@atlas.com",
};

export interface BlockIPInput {
  ip: string;
  reason: string;
  durationMs: number | null;
}

interface SecurityFeedState {
  events: SecurityEvent[];
  alerts: SecurityAlert[];
  sessions: ActiveSession[];
  blockedIPs: BlockedIP[];
  allowlistedIPs: AllowlistedIP[];
  twoFactor: TwoFactorStatus[];
  lockouts: LockedAccount[];
  policy: SecurityPolicySummary;
  loading: boolean;
}

interface SecurityFeedResult extends SecurityFeedState {
  summary: SecuritySummary;
  refresh: () => void;
  endSession: (id: string) => void;
  acknowledgeAlert: (id: string) => void;
  unacknowledgeAlert: (id: string) => void;
  blockIP: (input: BlockIPInput) => void;
  unblockIP: (id: string) => void;
  extendBlock: (id: string, additionalMs: number) => void;
  makeBlockPermanent: (id: string) => void;
  addAllowlistedIP: (input: { ip: string; label: string }) => void;
  removeAllowlistedIP: (id: string) => void;
  markEventHandled: (id: string, note?: string) => void;
  addEventNote: (id: string, note: string) => void;
}

function pushEvent(
  events: SecurityEvent[],
  event: SecurityEvent
): SecurityEvent[] {
  return [event, ...events];
}

const initial: SecurityFeedState = {
  events: [],
  alerts: [],
  sessions: [],
  blockedIPs: [],
  allowlistedIPs: [],
  twoFactor: [],
  lockouts: [],
  policy: mockSecurityPolicy,
  loading: true,
};

export function useSecurityFeed(): SecurityFeedResult {
  const [state, setState] = useState<SecurityFeedState>(initial);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setState({
        events: mockSecurityEvents,
        alerts: mockSecurityAlerts,
        sessions: mockActiveSessions,
        blockedIPs: mockBlockedIPs,
        allowlistedIPs: mockAllowlistedIPs,
        twoFactor: mockTwoFactorStatuses,
        lockouts: mockLockedAccounts,
        policy: mockSecurityPolicy,
        loading: false,
      });
    }, 400);
    return () => window.clearTimeout(t);
  }, []);

  const refresh = useCallback(() => {
    setState((prev) => ({ ...prev }));
  }, []);

  const endSession = useCallback((id: string) => {
    setState((prev) => {
      const session = prev.sessions.find((s) => s.id === id);
      if (!session) return prev;
      return {
        ...prev,
        sessions: prev.sessions.filter((s) => s.id !== id),
        events: pushEvent(prev.events, {
          id: crypto.randomUUID(),
          type: "logout",
          severity: "info",
          user: session.user,
          actorId: session.actorId,
          actorName: session.actorName,
          ip: session.ip,
          countryCode: session.countryCode,
          timestamp: new Date().toISOString(),
          details: `Session ended by ${CURRENT_ADMIN.name}`,
          resourceKind: "session",
          resourceId: session.id,
        }),
      };
    });
  }, []);

  const acknowledgeAlert = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      alerts: prev.alerts.map((a) =>
        a.id === id
          ? {
              ...a,
              acknowledged: true,
              acknowledgedAt: new Date().toISOString(),
              acknowledgedById: CURRENT_ADMIN.id,
              acknowledgedByName: CURRENT_ADMIN.name,
            }
          : a
      ),
    }));
  }, []);

  const unacknowledgeAlert = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      alerts: prev.alerts.map((a) =>
        a.id === id
          ? {
              ...a,
              acknowledged: false,
              acknowledgedAt: undefined,
              acknowledgedById: undefined,
              acknowledgedByName: undefined,
            }
          : a
      ),
    }));
  }, []);

  const blockIP = useCallback((input: BlockIPInput) => {
    setState((prev) => {
      if (prev.blockedIPs.some((b) => b.ip === input.ip)) return prev;

      const now = new Date().toISOString();
      const permanent = input.durationMs === null;
      const expiresAt = permanent
        ? undefined
        : new Date(Date.now() + (input.durationMs as number)).toISOString();

      const blocked: BlockedIP = {
        id: crypto.randomUUID(),
        ip: input.ip,
        reason: input.reason,
        blockedAt: now,
        blockedBy: CURRENT_ADMIN.email,
        blockedById: CURRENT_ADMIN.id,
        expiresAt,
        permanent,
      };

      return {
        ...prev,
        blockedIPs: [blocked, ...prev.blockedIPs],
        events: pushEvent(prev.events, {
          id: crypto.randomUUID(),
          type: "ip_blocked",
          severity: "warning",
          user: "system",
          ip: input.ip,
          timestamp: now,
          details: `Blocked by ${CURRENT_ADMIN.name}: ${input.reason}`,
        }),
      };
    });
  }, []);

  const unblockIP = useCallback((id: string) => {
    setState((prev) => {
      const target = prev.blockedIPs.find((b) => b.id === id);
      if (!target) return prev;
      const now = new Date().toISOString();
      return {
        ...prev,
        blockedIPs: prev.blockedIPs.filter((b) => b.id !== id),
        events: pushEvent(prev.events, {
          id: crypto.randomUUID(),
          type: "ip_unblocked",
          severity: "info",
          user: "system",
          ip: target.ip,
          timestamp: now,
          details: `Unblocked by ${CURRENT_ADMIN.name}`,
        }),
      };
    });
  }, []);

  const extendBlock = useCallback((id: string, additionalMs: number) => {
    setState((prev) => ({
      ...prev,
      blockedIPs: prev.blockedIPs.map((b) => {
        if (b.id !== id) return b;
        const base = b.expiresAt
          ? new Date(b.expiresAt).getTime()
          : Date.now();
        return {
          ...b,
          expiresAt: new Date(base + additionalMs).toISOString(),
          permanent: false,
        };
      }),
    }));
  }, []);

  const makeBlockPermanent = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      blockedIPs: prev.blockedIPs.map((b) =>
        b.id === id ? { ...b, expiresAt: undefined, permanent: true } : b
      ),
    }));
  }, []);

  const addAllowlistedIP = useCallback(
    (input: { ip: string; label: string }) => {
      setState((prev) => {
        if (prev.allowlistedIPs.some((a) => a.ip === input.ip)) return prev;
        return {
          ...prev,
          allowlistedIPs: [
            {
              id: crypto.randomUUID(),
              ip: input.ip,
              label: input.label,
              addedBy: CURRENT_ADMIN.name,
              addedAt: new Date().toISOString(),
            },
            ...prev.allowlistedIPs,
          ],
        };
      });
    },
    []
  );

  const removeAllowlistedIP = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      allowlistedIPs: prev.allowlistedIPs.filter((a) => a.id !== id),
    }));
  }, []);

  const markEventHandled = useCallback((id: string, note?: string) => {
    setState((prev) => ({
      ...prev,
      events: prev.events.map((e) =>
        e.id === id ? { ...e, handled: true, note: note ?? e.note } : e
      ),
    }));
  }, []);

  const addEventNote = useCallback((id: string, note: string) => {
    setState((prev) => ({
      ...prev,
      events: prev.events.map((e) => (e.id === id ? { ...e, note } : e)),
    }));
  }, []);

  const summary = useMemo<SecuritySummary>(() => {
    const day = 24 * 60 * 60 * 1000;
    const cutoff = Date.now() - day;

    const failedLogins24h = state.events.filter(
      (e) => e.type === "login_failure" && new Date(e.timestamp).getTime() >= cutoff
    ).length;

    const suspiciousActivities24h = state.events.filter(
      (e) =>
        e.type === "suspicious_activity" &&
        new Date(e.timestamp).getTime() >= cutoff
    ).length;

    const twoFactorEnabled = state.twoFactor.filter((t) => t.enabled).length;
    const twoFactorMissing = state.twoFactor.filter((t) => !t.enabled).length;

    const suspiciousCountries = new Set(
      state.sessions
        .filter((s) => s.countryCode && s.countryCode !== "GH")
        .map((s) => s.countryCode as string)
    ).size;

    const unackCritical = state.alerts.filter(
      (a) => !a.acknowledged && a.severity === "critical"
    ).length;

    const status: SecuritySummary["status"] =
      unackCritical > 0
        ? "critical"
        : state.alerts.some((a) => !a.acknowledged)
        ? "warning"
        : "normal";

    const lastSecurityScan =
      state.events[0]?.timestamp ?? new Date().toISOString();

    return {
      activeSessions: state.sessions.length,
      failedLogins24h,
      suspiciousActivities24h,
      blockedIPs: state.blockedIPs.length,
      allowlistedIPs: state.allowlistedIPs.length,
      twoFactorEnabled,
      twoFactorMissing,
      lockedAccounts: state.lockouts.length,
      suspiciousCountries,
      lastSecurityScan,
      status,
    };
  }, [
    state.events,
    state.sessions,
    state.alerts,
    state.blockedIPs,
    state.allowlistedIPs,
    state.twoFactor,
    state.lockouts,
  ]);

  return {
    ...state,
    summary,
    refresh,
    endSession,
    acknowledgeAlert,
    unacknowledgeAlert,
    blockIP,
    unblockIP,
    extendBlock,
    makeBlockPermanent,
    addAllowlistedIP,
    removeAllowlistedIP,
    markEventHandled,
    addEventNote,
  };
}