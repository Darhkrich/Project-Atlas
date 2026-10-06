/* eslint-disable react-hooks/set-state-in-effect */
// src/app/admin/ecommerce/support/page.tsx
"use client";

import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/admin/ui/button";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { Input } from "@/components/admin/ui/input";
import { AtlasIcon } from "@/components/atlas/icons";
import { Can, PERMISSIONS, useCurrentAdmin } from "@/lib/admin/rbac";
import { useUrlFilters } from "@/lib/admin/hooks/use-url-filters";
import { useDebouncedValue } from "@/lib/admin/hooks/use-debounced-value";
import { useInboxKeyboard } from "@/lib/admin/hooks/use-inbox-keyboard";
import { useNow } from "@/lib/admin/hooks/use-now";
import { useSupport } from "@/lib/admin/hooks/use-support";
import { SupportRow } from "@/components/admin/support/support-row";
import { SupportDetailDrawer } from "@/components/admin/support/support-detail-drawer";
import {
  SupportSummaryCards,
  type SupportSummaryFilterView,
} from "@/components/admin/support/support-summary-cards";
import {
  addInternalNote,
  assignTicket,
  changeTicketPriority,
  changeTicketStatus,
  sendTicketReply,
  unassignTicket,
  type SupportActor,
} from "@/lib/admin/support/support-mutations";
import { MIDDOT } from "@/lib/admin/support/constants";
import { findAdminById } from "@/lib/admin/mock/admin-users";
import {
  isLive,
  projectSupportDeltas,
  projectSupportSummaryData,
  slaState,
} from "@/lib/admin/support/support-projection";
import {
  SUPPORT_CATEGORIES,
  SUPPORT_PRIORITIES,
  SUPPORT_STATUSES,
  categoryLabel,
  priorityLabel,
  statusLabel,
} from "@/lib/admin/support/constants";
import type {
  SupportConversation,
  SupportPriority,
  SupportStatus,
} from "@/lib/admin/types/support";
import { cn } from "@/lib/utils";

type View = SupportSummaryFilterView;

interface Filters extends Record<string, string> {
  q: string;
  status: string;
  priority: string;
  category: string;
  assignee: string;
  view: string;
}

const FILTER_DEFAULTS: Filters = {
  q: "",
  status: "",
  priority: "",
  category: "",
  assignee: "",
  view: "all",
};

const SYSTEM_ACTOR: SupportActor = {
  id: "system",
  name: "System",
  email: "system@atlas.com",
};

function merchantPath(merchantId: string): string {
  return "/admin/ecommerce/merchants/" + merchantId;
}

interface Toast {
  kind: "success" | "error";
  text: string;
}

export default function EcommerceSupportPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <EcommerceSupportPageInner />
    </Suspense>
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-64 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"
          />
        ))}
      </div>
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"
          />
        ))}
      </div>
    </div>
  );
}

function EcommerceSupportPageInner() {
  const router = useRouter();
  const admin = useCurrentAdmin();
  const now = useNow();
  const { conversations } = useSupport();

  const actor: SupportActor = useMemo(() => {
    if (!admin) return SYSTEM_ACTOR;
    return {
      id: admin.id ?? admin.email,
      name: admin.name,
      email: admin.email,
    };
  }, [admin]);

  const merchantConversations = useMemo(
    () => conversations.filter((c) => c.userType === "merchant"),
    [conversations]
  );

  const { filters, setFilters, clearFilters, hasActive } =
    useUrlFilters<Filters>(FILTER_DEFAULTS);

  const debouncedSearch = useDebouncedValue(filters.q, 300);

  const [openTicketId, setOpenTicketId] = useState<string | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 6000);
    return () => window.clearTimeout(t);
  }, [toast]);

  const showToast = (kind: Toast["kind"], text: string) => {
    setToast({ kind, text });
  };

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return merchantConversations.filter((t) => {
      if (q) {
        const hay = t.subject + " " + t.userName + " " + t.id;
        if (!hay.toLowerCase().includes(q)) return false;
      }
      if (filters.status && t.status !== filters.status) return false;
      if (filters.priority && t.priority !== filters.priority) return false;
      if (filters.category && t.category !== filters.category) return false;
      if (filters.assignee === "unassigned" && t.assigneeId) return false;
      if (filters.assignee === "me" && (!admin || t.assigneeId !== admin.id))
        return false;
      if (filters.view === "open" && t.status !== "open") return false;
      if (filters.view === "pending" && t.status !== "pending") return false;
      if (filters.view === "sla-risk") {
        if (!isLive(t.status)) return false;
        if (now === null) return false;
        const state = slaState(t.slaDueAt, now);
        if (state !== "at_risk" && state !== "breached") return false;
      }
      return true;
    });
  }, [merchantConversations, debouncedSearch, filters, admin, now]);

  const sorted = useMemo(
    () =>
      [...filtered].sort((a, b) => {
        const aT = new Date(a.updatedAt ?? a.lastMessageAt).getTime();
        const bT = new Date(b.updatedAt ?? b.lastMessageAt).getTime();
        if (aT !== bT) return bT - aT;
        return a.id.localeCompare(b.id);
      }),
    [filtered]
  );

  const visibleIds = useMemo(() => sorted.map((t) => t.id), [sorted]);

  const summary = useMemo(
    () => projectSupportSummaryData(merchantConversations, now),
    [merchantConversations, now]
  );

  const deltas = useMemo(
    () => projectSupportDeltas(merchantConversations, now, 1),
    [merchantConversations, now]
  );

  useEffect(() => {
    if (focusedId && !visibleIds.includes(focusedId)) {
      setFocusedId(visibleIds[0] ?? null);
    }
  }, [visibleIds, focusedId]);

  useInboxKeyboard({
    itemIds: visibleIds,
    focusedId,
    enabled: openTicketId === null,
    onFocusChange: setFocusedId,
    onOpen: setOpenTicketId,
    onFocusSearch: () => searchInputRef.current?.focus(),
  });

  const openTicket = useMemo(
    () =>
      merchantConversations.find((t) => t.id === openTicketId) ?? null,
    [merchantConversations, openTicketId]
  );

  const relatedTicketCount = useMemo(() => {
    if (!openTicket) return undefined;
    return merchantConversations.filter(
      (t) =>
        t.id !== openTicket.id &&
        t.userId === openTicket.userId &&
        isLive(t.status)
    ).length;
  }, [merchantConversations, openTicket]);

  const requireActor = (): SupportActor | null => {
    if (!admin) {
      showToast("error", "No admin session. Sign in to make changes.");
      return null;
    }
    return actor;
  };

  const handleSendReply = (ticketId: string, message: string) => {
    if (!requireActor()) return;
    const result = sendTicketReply(ticketId, message, actor);
    if (result.ok) showToast("success", "Reply sent.");
    else showToast("error", result.error ?? "Could not send reply.");
  };

  const handleAddInternalNote = (ticketId: string, note: string) => {
    if (!requireActor()) return;
    const result = addInternalNote(ticketId, note, actor);
    if (result.ok) showToast("success", "Internal note added.");
    else showToast("error", result.error ?? "Could not add note.");
  };

  const handleStatusChange = (ticketId: string, status: SupportStatus) => {
    if (!requireActor()) return;
    const result = changeTicketStatus(ticketId, status, actor);
    if (result.ok)
      showToast("success", "Status set to " + statusLabel[status] + ".");
    else showToast("error", result.error ?? "Could not change status.");
  };

  const handlePriorityChange = (
    ticketId: string,
    priority: SupportPriority
  ) => {
    if (!requireActor()) return;
    const result = changeTicketPriority(ticketId, priority, actor);
    if (result.ok)
      showToast("success", "Priority set to " + priorityLabel[priority] + ".");
    else showToast("error", result.error ?? "Could not change priority.");
  };

  const handleAssign = (ticketId: string, adminId: string) => {
    if (!requireActor()) return;
    const adminUser = findAdminById(adminId);
    if (!adminUser) return;
    const result = assignTicket(
      ticketId,
      adminUser.id,
      adminUser.name,
      adminUser.email,
      actor
    );
    if (result.ok) showToast("success", "Ticket assigned.");
    else showToast("error", result.error ?? "Could not assign.");
  };

  const handleUnassign = (ticketId: string) => {
    if (!requireActor()) return;
    const result = unassignTicket(ticketId, actor);
    if (result.ok) showToast("success", "Ticket unassigned.");
    else showToast("error", result.error ?? "Could not unassign.");
  };

  const handleViewUser = (conversation: SupportConversation) => {
    if (conversation.userType !== "merchant") return;
    router.push(merchantPath(conversation.userId));
  };

  const activeView: View =
    filters.view === "open"
      ? "open"
      : filters.view === "pending"
      ? "pending"
      : filters.view === "sla-risk"
      ? "sla-risk"
      : "all";

  const headerMeta = (
    <>
      <span>{summary.total} tickets</span>
      <span aria-hidden="true"> {MIDDOT} </span>
      <span>{summary.open} open</span>
      <span aria-hidden="true"> {MIDDOT} </span>
      <span>{summary.pending} pending</span>
      {summary.slaAtRisk > 0 ? (
        <>
          <span aria-hidden="true"> {MIDDOT} </span>
          <span className="text-danger-700 dark:text-danger-300">
            {summary.slaAtRisk} SLA at risk
          </span>
        </>
      ) : null}
    </>
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="E-commerce support"
        description="Support tickets opened by merchants across Atlas Ecommerce."
        meta={headerMeta}
      />

      <Can
        permission={PERMISSIONS.SUPPORT_VIEW}
        fallback={
          <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <EmptyState
              variant="no_data"
              title="You do not have access to ecommerce support"
              description="Ask a super admin or support admin to grant you the support:view permission."
            />
          </div>
        }
      >
        <SupportSummaryCards
          summary={summary}
          deltas={deltas}
          loading={false}
          activeFilter={activeView}
          onFilterAll={() => setFilters({ view: "all" })}
          onFilterOpen={() =>
            setFilters({ view: filters.view === "open" ? "all" : "open" })
          }
          onFilterPending={() =>
            setFilters({
              view: filters.view === "pending" ? "all" : "pending",
            })
          }
          onFilterSlaRisk={() =>
            setFilters({
              view: filters.view === "sla-risk" ? "all" : "sla-risk",
            })
          }
        />

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[240px] flex-1">
            <AtlasIcon
              name="search"
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
            />
            <Input
              ref={searchInputRef}
              aria-label="Search ecommerce tickets"
              placeholder="Search by subject, merchant, or ticket ID"
              className="pl-9"
              value={filters.q}
              onChange={(e) => setFilters({ q: e.target.value })}
            />
          </div>

          <select
            aria-label="Filter by status"
            className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            value={filters.status}
            onChange={(e) => setFilters({ status: e.target.value })}
          >
            <option value="">All statuses</option>
            {SUPPORT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {statusLabel[s]}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by priority"
            className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            value={filters.priority}
            onChange={(e) => setFilters({ priority: e.target.value })}
          >
            <option value="">All priorities</option>
            {SUPPORT_PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {priorityLabel[p]}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by category"
            className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            value={filters.category}
            onChange={(e) => setFilters({ category: e.target.value })}
          >
            <option value="">All categories</option>
            {SUPPORT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {categoryLabel[c]}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by assignee"
            className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            value={filters.assignee}
            onChange={(e) => setFilters({ assignee: e.target.value })}
          >
            <option value="">Anyone</option>
            <option value="me">Assigned to me</option>
            <option value="unassigned">Unassigned</option>
          </select>

          {hasActive ? (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          ) : null}
        </div>

        {merchantConversations.length === 0 ? (
          <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <EmptyState
              variant="no_data"
              title="No ecommerce support tickets"
              description="Tickets opened by merchants will appear here."
            />
          </div>
        ) : sorted.length === 0 ? (
          <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <EmptyState
              variant="no_results"
              title="No tickets match these filters"
              description="Try a different search or clear the filters."
              action={
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              }
            />
          </div>
        ) : (
          <ul role="list" className="space-y-3">
            {sorted.map((ticket) => (
              <SupportRow
                key={ticket.id}
                conversation={ticket}
                selected={false}
                focused={focusedId === ticket.id}
                now={now}
                selectable={false}
                onToggleSelect={() => {
                  /* selection disabled on scoped view */
                }}
                onOpen={setOpenTicketId}
                onFocus={setFocusedId}
              />
            ))}
          </ul>
        )}

        {openTicket ? (
          <SupportDetailDrawer
            conversation={openTicket}
            currentAdminId={actor.id}
            currentAdminName={actor.name}
            relatedTicketCount={relatedTicketCount}
            onClose={() => setOpenTicketId(null)}
            onSendReply={handleSendReply}
            onStatusChange={handleStatusChange}
            onPriorityChange={handlePriorityChange}
            onAssign={handleAssign}
            onUnassign={handleUnassign}
            onViewUser={handleViewUser}
            onAddInternalNote={handleAddInternalNote}
            onRetryFulfillment={() => {
              /* cross-domain action not wired on scoped view */
            }}
            onEscalateToProvider={() => {
              /* cross-domain action not wired on scoped view */
            }}
            onViewProvider={() => {
              /* cross-domain action not wired on scoped view */
            }}
            onCreditCommission={() => {
              /* cross-domain action not wired on scoped view */
            }}
            onHoldPayout={() => {
              /* cross-domain action not wired on scoped view */
            }}
            onChangePlan={() => {
              /* cross-domain action not wired on scoped view */
            }}
            onExtendTrial={() => {
              /* cross-domain action not wired on scoped view */
            }}
            onResetTemplate={() => {
              /* cross-domain action not wired on scoped view */
            }}
            onApplyCompensation={() => {
              /* cross-domain action not wired on scoped view */
            }}
          />
        ) : null}

        {toast ? (
          <div
            role="status"
            aria-live="polite"
            className={cn(
              "rounded-md border p-3 text-sm",
              toast.kind === "success"
                ? "border-success-200 bg-success-50 text-success-800 dark:border-success-800/60 dark:bg-success-900/20 dark:text-success-200"
                : "border-danger-200 bg-danger-50 text-danger-800 dark:border-danger-800/60 dark:bg-danger-900/20 dark:text-danger-200"
            )}
          >
            {toast.text}
          </div>
        ) : null}
      </Can>
    </div>
  );
}