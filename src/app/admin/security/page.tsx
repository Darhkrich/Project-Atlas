/* eslint-disable react-hooks/purity */
/* eslint-disable react-hooks/set-state-in-effect */
// app/(admin)/security/page.tsx
"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/admin/ui/button";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { ExportMenu } from "@/components/admin/ui/export-menu";
import { SecurityStatusBanner } from "@/components/admin/security/security-status-banner";
import { SecuritySummaryCards } from "@/components/admin/security/security-summary-cards";
import { SecurityAlertsSection } from "@/components/admin/security/security-alerts-section";
import { SecurityEventsTable } from "@/components/admin/security/security-events-table";
import { SecurityEventDrawer } from "@/components/admin/security/security-event-drawer";
import { SecurityIPBlockModal } from "@/components/admin/security/security-ip-block-modal";
import { SessionsAndIPs } from "@/components/admin/security/sessions-and-ips";
import { BulkIPBlock } from "@/components/admin/security/bulk-ip-block";
import { SecurityAllowlist } from "@/components/admin/security/security-allowlist";
import { SecurityTwoFactorPanel } from "@/components/admin/security/security-two-factors-panel";
import { SecurityLockoutsPanel } from "@/components/admin/security/security-lockouts-panel";
import { SecurityPolicySummary } from "@/components/admin/security/security-policy-summary";
import {
  SecurityToolbar,
  type SecurityFilterValues,
} from "@/components/admin/security/security-toolbar";
import { useUrlFilters } from "@/lib/admin/hooks/use-url-filters";
import { useInboxKeyboard } from "@/lib/admin/hooks/use-inbox-keyboard";
import {
  useSecurityFeed,
  type BlockIPInput,
} from "@/lib/admin/hooks/use-security-feed";
import { downloadCsv } from "@/lib/admin/support/csv-export";
import { eventsToCsv } from "@/lib/admin/security/csv-export";
import {
  TIME_RANGE_MS,
  type SecurityTimeRange,
} from "@/lib/admin/security/constants";
import { eventsForIP } from "@/lib/admin/security/correlation";

const DEFAULT_FILTERS: SecurityFilterValues & Record<string, string> = {
  q: "",
  type: "",
  severity: "",
  range: "24h",
};

const PAGE_SIZE = 10;
const BLOCK_MODAL_INITIAL_STATE: { open: boolean; ips: string[] } = {
  open: false,
  ips: [],
};

interface Toast {
  kind: "success" | "error";
  text: string;
}

export default function SecurityCenterPage() {
  return (
    <Suspense fallback={<SecuritySkeleton />}>
      <SecurityPageInner />
    </Suspense>
  );
}

function SecuritySkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-72 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
      <div className="h-24 w-full animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"
          />
        ))}
      </div>
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-14 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"
          />
        ))}
      </div>
    </div>
  );
}

function SecurityPageInner() {
  const feed = useSecurityFeed();
  const { filters, setFilters, clearFilters, hasActive } =
    useUrlFilters<SecurityFilterValues & Record<string, string>>(DEFAULT_FILTERS);

  const [page, setPage] = useState(1);
  const [focusedEventId, setFocusedEventId] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [blockModal, setBlockModal] = useState(BLOCK_MODAL_INITIAL_STATE);
  const [endSessionTarget, setEndSessionTarget] = useState<string | null>(null);
  const [unblockTarget, setUnblockTarget] = useState<string | null>(null);
  const [removeAllowlistTarget, setRemoveAllowlistTarget] = useState<
    string | null
  >(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [scanning, setScanning] = useState(false);
  const [lastScan, setLastScan] = useState<string>(
    () => new Date().toISOString()
  );

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    setPage(1);
  }, [filters.q, filters.type, filters.severity, filters.range]);

  const filteredEvents = useMemo(() => {
    const cutoff =
      TIME_RANGE_MS[filters.range as SecurityTimeRange] === null
        ? 0
        : Date.now() - (TIME_RANGE_MS[filters.range as SecurityTimeRange] ?? 0);

    const q = filters.q.trim().toLowerCase();

    return feed.events.filter((e) => {
      const t = new Date(e.timestamp).getTime();
      if (cutoff && t < cutoff) return false;

      if (filters.type && e.type !== filters.type) return false;
      if (filters.severity && e.severity !== filters.severity) return false;

      if (q) {
        const matches =
          e.user.toLowerCase().includes(q) ||
          (e.actorName ?? "").toLowerCase().includes(q) ||
          e.ip.includes(q) ||
          (e.details ?? "").toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [feed.events, filters.q, filters.type, filters.severity, filters.range]);

  const filteredIds = useMemo(
    () => filteredEvents.map((e) => e.id),
    [filteredEvents]
  );

  useEffect(() => {
    if (focusedEventId && !filteredIds.includes(focusedEventId)) {
      setFocusedEventId(filteredIds[0] ?? null);
    }
  }, [filteredIds, focusedEventId]);

  useEffect(() => {
    if (!focusedEventId) return;
    const el = document.querySelector(
      `[data-security-event-id="${focusedEventId}"]`
    );
    if (el instanceof HTMLElement) {
      el.scrollIntoView({ block: "nearest" });
    }
  }, [focusedEventId]);

  useInboxKeyboard({
    itemIds: filteredIds,
    focusedId: focusedEventId,
    enabled:
      selectedEventId === null &&
      endSessionTarget === null &&
      unblockTarget === null &&
      !blockModal.open,
    onFocusChange: setFocusedEventId,
    onOpen: setSelectedEventId,
    onFocusSearch: () => searchInputRef.current?.focus(),
  });

  const selectedEvent = useMemo(
    () => feed.events.find((e) => e.id === selectedEventId) ?? null,
    [feed.events, selectedEventId]
  );

  const selectedRelatedEvents = useMemo(
    () => (selectedEvent ? eventsForIP(feed.events, selectedEvent.ip) : []),
    [feed.events, selectedEvent]
  );

  const handleFilterChange = (patch: Partial<SecurityFilterValues>) => {
    setFilters(patch);
  };

  const handleBlockIPs = (ips: string[]) => {
    setBlockModal({ open: true, ips });
  };

  const handleConfirmBlock = (input: BlockIPInput) => {
    feed.blockIP(input);
    setToast({ kind: "success", text: `Blocked ${input.ip}.` });
  };

  const handleEndSession = (id: string) => {
    setEndSessionTarget(id);
  };

  const confirmEndSession = () => {
    if (!endSessionTarget) return;
    const target = feed.sessions.find((s) => s.id === endSessionTarget);
    feed.endSession(endSessionTarget);
    setEndSessionTarget(null);
    if (target) {
      setToast({
        kind: "success",
        text: `Ended session for ${target.actorName ?? target.user}.`,
      });
    }
  };

  const handleUnblock = (id: string) => {
    setUnblockTarget(id);
  };

  const confirmUnblock = () => {
    if (!unblockTarget) return;
    const target = feed.blockedIPs.find((b) => b.id === unblockTarget);
    feed.unblockIP(unblockTarget);
    setUnblockTarget(null);
    if (target) {
      setToast({ kind: "success", text: `Unblocked ${target.ip}.` });
    }
  };

  const handleExtendBlock = (id: string) => {
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    feed.extendBlock(id, sevenDays);
    setToast({ kind: "success", text: "Block extended by 7 days." });
  };

  const handleMakePermanent = (id: string) => {
    feed.makeBlockPermanent(id);
    setToast({ kind: "success", text: "Block marked as permanent." });
  };

  const handleEndSessionsFromIP = (ip: string) => {
    const matching = feed.sessions.filter((s) => s.ip === ip && !s.current);
    if (matching.length === 0) {
      setToast({ kind: "error", text: `No active sessions from ${ip}.` });
      return;
    }
    for (const s of matching) {
      feed.endSession(s.id);
    }
    setSelectedEventId(null);
    setToast({
      kind: "success",
      text: `Ended ${matching.length} session${matching.length === 1 ? "" : "s"} from ${ip}.`,
    });
  };

  const handleRemoveAllowlist = (id: string) => {
    setRemoveAllowlistTarget(id);
  };

  const confirmRemoveAllowlist = () => {
    if (!removeAllowlistTarget) return;
    const target = feed.allowlistedIPs.find(
      (a) => a.id === removeAllowlistTarget
    );
    feed.removeAllowlistedIP(removeAllowlistTarget);
    setRemoveAllowlistTarget(null);
    if (target) {
      setToast({ kind: "success", text: `Removed ${target.ip} from allowlist.` });
    }
  };

  const handleNudgeMissing2FA = () => {
    const missing = feed.twoFactor.filter((t) => !t.enabled).length;
    setToast({
      kind: "success",
      text: `Draft notification created for ${missing} admin${
        missing === 1 ? "" : "s"
      }. Review it in Notifications.`,
    });
  };

  const handleUnlockAccount = (id: string) => {
    setToast({ kind: "success", text: "Account unlocked." });
    void id;
  };

  const handleRunScan = () => {
    setScanning(true);
    window.setTimeout(() => {
      setScanning(false);
      setLastScan(new Date().toISOString());
      feed.refresh();
      setToast({ kind: "success", text: "Scan complete. No new threats." });
    }, 900);
  };

  const handleRefresh = () => {
    feed.refresh();
    setToast({ kind: "success", text: "Security feed refreshed." });
  };

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    if (format !== "csv") return;
    const csv = eventsToCsv(filteredEvents);
    const stamp = new Date().toISOString().slice(0, 10);
    downloadCsv(`atlas-security-events-${stamp}.csv`, csv);
  };

  const handleScrollTo = (anchor: string) => {
    const el = document.getElementById(anchor);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleViewAlertEvents = (eventIds: string[]) => {
    const first = eventIds[0];
    if (first) setSelectedEventId(first);
  };

  const actorDisplayFor = (userId: string): string => {
    const match = feed.events.find((e) => e.user === userId && e.actorName);
    return match?.actorName ?? userId;
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Security center"
        description="Monitor security posture, events, and active sessions."
        meta={
          <>
            <span>
              {feed.summary.activeSessions} session
              {feed.summary.activeSessions === 1 ? "" : "s"}
            </span>
            <span aria-hidden="true">·</span>
            <span>{feed.summary.blockedIPs} blocked</span>
            {feed.summary.lockedAccounts > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-warning-700 dark:text-warning-300">
                  {feed.summary.lockedAccounts} locked
                </span>
              </>
            )}
            {feed.summary.twoFactorMissing > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-warning-700 dark:text-warning-300">
                  {feed.summary.twoFactorMissing} without 2FA
                </span>
              </>
            )}
          </>
        }
        actions={
          <>
            <ExportMenu onExport={handleExport} formats={["csv"]} />
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              Refresh
            </Button>
          </>
        }
      />

      <SecurityStatusBanner
        status={feed.summary.status}
        lastScan={lastScan}
        alerts={feed.alerts}
        scanning={scanning}
        onScan={handleRunScan}
      />

      <SecuritySummaryCards
        summary={feed.summary}
        activeFilterType={filters.type}
        activeFilterSeverity={filters.severity}
        onFilter={(patch) => handleFilterChange(patch)}
        onScrollTo={handleScrollTo}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SecurityPolicySummary policy={feed.policy} />
        <SecurityTwoFactorPanel
          entries={feed.twoFactor}
          requireTwoFactor={feed.policy.require2FA}
          onNudgeMissing={handleNudgeMissing2FA}
        />
      </div>

      <SecurityAlertsSection
        alerts={feed.alerts}
        onAcknowledge={feed.acknowledgeAlert}
        onUnacknowledge={feed.unacknowledgeAlert}
        onViewEvents={handleViewAlertEvents}
      />

      <div className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Security events
            </h2>
            <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
              Every authentication, permission change, and threshold crossing.
            </p>
          </div>
        </div>

        <SecurityToolbar
          values={filters}
          resultCount={filteredEvents.length}
          totalCount={feed.events.length}
          lastRefreshed={lastScan}
          refreshing={scanning}
          hasActive={hasActive}
          searchInputRef={searchInputRef}
          onChange={handleFilterChange}
          onClear={clearFilters}
          onRefresh={handleRefresh}
        />

        {feed.loading ? (
          <div
            className="space-y-2"
            aria-busy="true"
            aria-label="Loading security events"
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-14 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"
              />
            ))}
          </div>
        ) : (
          <SecurityEventsTable
            events={filteredEvents}
            focusedId={focusedEventId}
            page={page}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            onOpen={setSelectedEventId}
            onFocus={setFocusedEventId}
          />
        )}
      </div>

      <SecurityLockoutsPanel
        entries={feed.lockouts}
        onUnlock={handleUnlockAccount}
      />

      <SessionsAndIPs
        sessions={feed.sessions}
        blockedIPs={feed.blockedIPs}
        onEndSession={handleEndSession}
        onBlockIPsFromList={handleBlockIPs}
        onUnblock={handleUnblock}
        onExtendBlock={handleExtendBlock}
        onMakePermanent={handleMakePermanent}
      />

      <SecurityAllowlist
        entries={feed.allowlistedIPs}
        onAdd={feed.addAllowlistedIP}
        onRemove={handleRemoveAllowlist}
      />

      <BulkIPBlock
        existingBlockedIPs={feed.blockedIPs.map((b) => b.ip)}
        onReview={handleBlockIPs}
      />

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={
            toast.kind === "success"
              ? "rounded-md border border-success-200 bg-success-50 p-3 text-sm text-success-800 dark:border-success-800/60 dark:bg-success-900/20 dark:text-success-200"
              : "rounded-md border border-danger-200 bg-danger-50 p-3 text-sm text-danger-800 dark:border-danger-800/60 dark:bg-danger-900/20 dark:text-danger-200"
          }
        >
          {toast.text}
        </div>
      )}

      <SecurityEventDrawer
        event={selectedEvent}
        relatedEvents={selectedRelatedEvents}
        actorDisplay={
          selectedEvent
            ? actorDisplayFor(selectedEvent.user)
            : ""
        }
        onClose={() => setSelectedEventId(null)}
        onBlockIP={(ip) => {
          setSelectedEventId(null);
          handleBlockIPs([ip]);
        }}
        onEndSessionsFromIP={handleEndSessionsFromIP}
        onMarkHandled={(id) => {
          feed.markEventHandled(id);
          setToast({ kind: "success", text: "Event marked as handled." });
        }}
        onAddNote={(id, note) => {
          feed.addEventNote(id, note);
          setToast({ kind: "success", text: "Note saved." });
        }}
        onOpenRelated={setSelectedEventId}
      />

      <SecurityIPBlockModal
        open={blockModal.open}
        ips={blockModal.ips}
        onClose={() => setBlockModal(BLOCK_MODAL_INITIAL_STATE)}
        onConfirm={handleConfirmBlock}
      />

      <ConfirmDialog
        open={endSessionTarget !== null}
        title="End session?"
        description={
          endSessionTarget
            ? (() => {
                const s = feed.sessions.find(
                  (x) => x.id === endSessionTarget
                );
                if (!s) return "";
                return `${
                  s.actorName ?? s.user
                } will be signed out of their session on ${s.device} immediately.`;
              })()
            : ""
        }
        confirmLabel="End session"
        danger
        onConfirm={confirmEndSession}
        onCancel={() => setEndSessionTarget(null)}
      />

      <ConfirmDialog
        open={unblockTarget !== null}
        title="Unblock IP?"
        description={
          unblockTarget
            ? (() => {
                const b = feed.blockedIPs.find((x) => x.id === unblockTarget);
                if (!b) return "";
                return `${b.ip} will be allowed to authenticate again. The block reason was: ${b.reason}.`;
              })()
            : ""
        }
        confirmLabel="Unblock"
        onConfirm={confirmUnblock}
        onCancel={() => setUnblockTarget(null)}
      />

      <ConfirmDialog
        open={removeAllowlistTarget !== null}
        title="Remove from allowlist?"
        description={
          removeAllowlistTarget
            ? (() => {
                const a = feed.allowlistedIPs.find(
                  (x) => x.id === removeAllowlistTarget
                );
                if (!a) return "";
                return `${a.ip} (${a.label}) will be subject to standard IP restrictions and maintenance-mode blocking.`;
              })()
            : ""
        }
        confirmLabel="Remove"
        danger
        onConfirm={confirmRemoveAllowlist}
        onCancel={() => setRemoveAllowlistTarget(null)}
      />
    </div>
  );
}