/* eslint-disable react-hooks/set-state-in-effect */
// app/admin/ecommerce/support/page.tsx
"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/admin/ui/button";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { Input } from "@/components/admin/ui/input";
import { AtlasIcon } from "@/components/atlas/icons";
import { SupportSummaryCards } from "@/components/admin/ecommerce/support-summary-cards";
import { SupportTicketRow } from "@/components/admin/ecommerce/support-ticket-row";
import { SupportTicketDetailDrawer } from "@/components/admin/ecommerce/support-ticket-detail-drawer";
import { Can, PERMISSIONS, useCurrentAdmin } from "@/lib/admin/rbac";
import { useUrlFilters } from "@/lib/admin/hooks/use-url-filters";
import { useDebouncedValue } from "@/lib/admin/hooks/use-debounced-value";
import { useInboxKeyboard } from "@/lib/admin/hooks/use-inbox-keyboard";
import { useEcommerceSupportTickets } from "@/lib/admin/hooks/use-ecommerce-support-tickets";
import {
  assignTicket,
  appendInternalNote,
  respondToTicket,
  setTicketPriority,
  setTicketStatus,
  unassignTicket,
} from "@/lib/admin/mock/ecommerce-support-mutations";
import {
  ECOMMERCE_SUPPORT_FILTER_DEFAULTS,
  merchantPath,
} from "@/lib/admin/ecommerce/support/support-constants.ts";
import {
  isLive,
  paginate,
  slaState,
  sortTickets,
} from "@/lib/admin/ecommerce/support/support-projection";
import {
  SUPPORT_CATEGORIES,
  SUPPORT_PRIORITIES,
  SUPPORT_STATUSES,
  categoryLabel,
  priorityLabel,
  statusLabel,
} from "@/lib/admin/support/constants";
import type { EcommerceSupportActor } from "@/lib/admin/types/ecommerce-support";
import type {
  SupportPriority,
  SupportStatus,
} from "@/lib/admin/types/support";
import { useNow } from "@/lib/shared/hooks/use-now";
import { cn } from "@/lib/utils";

type View = "all" | "open" | "pending" | "sla-risk";

interface Filters {
  q: string;
  status: string;
  priority: string;
  category: string;
  assignee: string;
  view: string;
  page: string;
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
  const { tickets, summary, deltas } = useEcommerceSupportTickets();

  const { filters, setFilters, clearFilters, hasActive } =
    useUrlFilters<Filters>(ECOMMERCE_SUPPORT_FILTER_DEFAULTS as Filters);

  const debouncedSearch = useDebouncedValue(filters.q, 300);

  const [openTicketId, setOpenTicketId] = useState<string | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 6000);
    return () => window.clearTimeout(t);
  }, [toast]);

  const showToast = (kind: Toast["kind"], text: string) => {
    setToast({ kind, text });
  };

  const adminActor: EcommerceSupportActor | null = useMemo(() => {
    if (!admin) return null;
    return { id: admin.id, name: admin.name, email: admin.email };
  }, [admin]);

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return tickets.filter((t) => {
      if (q) {
        const hay = t.subject + " " + t.merchantName + " " + t.id;
        if (!hay.toLowerCase().includes(q)) return false;
      }
      if (filters.status && t.status !== filters.status) return false;
      if (filters.priority && t.priority !== filters.priority) return false;
      if (filters.category && t.category !== filters.category) return false;
      if (filters.assignee === "unassigned" && t.assignedToId) return false;
      if (filters.assignee === "me" && (!admin || t.assignedToId !== admin.id))
        return false;
      if (filters.view === "open" && t.status !== "open") return false;
      if (filters.view === "pending" && t.status !== "pending") return false;
      if (filters.view === "sla-risk") {
        if (!isLive(t.status)) return false;
        const state = slaState(t.slaDueAt, now);
        if (state !== "at_risk" && state !== "breached") return false;
      }
      return true;
    });
  }, [tickets, debouncedSearch, filters, admin, now]);

  const sorted = useMemo(
    () => sortTickets(filtered, "updatedAt", "desc"),
    [filtered]
  );

  const pageNumber = Number.parseInt(filters.page, 10) || 1;
  const pagination = useMemo(
    () => paginate(sorted, pageNumber),
    [sorted, pageNumber]
  );

  const visibleIds = useMemo(
    () => pagination.slice.map((t) => t.id),
    [pagination.slice]
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
    onFocusSearch: () => {
      const el = document.querySelector<HTMLInputElement>(
        "input[aria-label='Search ecommerce tickets']"
      );
      el?.focus();
    },
  });

  const openTicket = useMemo(
    () => tickets.find((t) => t.id === openTicketId) ?? null,
    [tickets, openTicketId]
  );

  const relatedTicketCount = useMemo(() => {
    if (!openTicket) return undefined;
    return tickets.filter(
      (t) =>
        t.id !== openTicket.id &&
        t.merchantId === openTicket.merchantId &&
        isLive(t.status)
    ).length;
  }, [tickets, openTicket]);

  const requireActor = (): EcommerceSupportActor | null => {
    if (!adminActor) {
      showToast("error", "No admin session. Sign in to make changes.");
      return null;
    }
    return adminActor;
  };

  const handleSendReply = (ticketId: string, message: string) => {
    const actor = requireActor();
    if (!actor) return;
    const result = respondToTicket(ticketId, message, actor);
    if (result.ok) showToast("success", "Reply sent.");
    else showToast("error", result.error ?? "Could not send reply.");
  };

  const handleAddInternalNote = (ticketId: string, note: string) => {
    const actor = requireActor();
    if (!actor) return;
    const result = appendInternalNote(ticketId, note, actor);
    if (result.ok) showToast("success", "Internal note added.");
    else showToast("error", result.error ?? "Could not add note.");
  };

  const handleStatusChange = (ticketId: string, status: SupportStatus) => {
    const actor = requireActor();
    if (!actor) return;
    const result = setTicketStatus(ticketId, status, actor);
    if (result.ok)
      showToast("success", "Status set to " + statusLabel[status] + ".");
    else showToast("error", result.error ?? "Could not change status.");
  };

  const handlePriorityChange = (
    ticketId: string,
    priority: SupportPriority
  ) => {
    const actor = requireActor();
    if (!actor) return;
    const result = setTicketPriority(ticketId, priority, actor);
    if (result.ok)
      showToast("success", "Priority set to " + priorityLabel[priority] + ".");
    else showToast("error", result.error ?? "Could not change priority.");
  };

  const handleAssign = (
    ticketId: string,
    adminId: string,
    adminName: string
  ) => {
    const actor = requireActor();
    if (!actor) return;
    const result = assignTicket(ticketId, adminId, adminName, actor);
    if (result.ok) showToast("success", "Ticket assigned.");
    else showToast("error", result.error ?? "Could not assign.");
  };

  const handleUnassign = (ticketId: string) => {
    const actor = requireActor();
    if (!actor) return;
    const result = unassignTicket(ticketId, actor);
    if (result.ok) showToast("success", "Ticket unassigned.");
    else showToast("error", result.error ?? "Could not unassign.");
  };

  const handleViewMerchant = (merchantId: string) => {
    router.push(merchantPath(merchantId));
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
      <span aria-hidden="true"> · </span>
      <span>{summary.open} open</span>
      <span aria-hidden="true"> · </span>
      <span>{summary.pending} pending</span>
      {summary.slaAtRisk > 0 ? (
        <>
          <span aria-hidden="true"> · </span>
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
          onFilterAll={() => setFilters({ view: "all", page: "1" })}
          onFilterOpen={() =>
            setFilters({
              view: filters.view === "open" ? "all" : "open",
              page: "1",
            })
          }
          onFilterPending={() =>
            setFilters({
              view: filters.view === "pending" ? "all" : "pending",
              page: "1",
            })
          }
          onFilterSlaRisk={() =>
            setFilters({
              view: filters.view === "sla-risk" ? "all" : "sla-risk",
              page: "1",
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
              aria-label="Search ecommerce tickets"
              placeholder="Search by subject, merchant, or ticket ID"
              className="pl-9"
              value={filters.q}
              onChange={(e) => setFilters({ q: e.target.value, page: "1" })}
            />
          </div>

          <select
            aria-label="Filter by status"
            className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            value={filters.status}
            onChange={(e) => setFilters({ status: e.target.value, page: "1" })}
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
            onChange={(e) => setFilters({ priority: e.target.value, page: "1" })}
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
            onChange={(e) => setFilters({ category: e.target.value, page: "1" })}
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
            onChange={(e) => setFilters({ assignee: e.target.value, page: "1" })}
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

        {tickets.length === 0 ? (
          <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <EmptyState
              variant="no_data"
              title="No ecommerce support tickets"
              description="Tickets opened by merchants will appear here."
            />
          </div>
        ) : filtered.length === 0 ? (
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
          <>
            <ul role="list" className="space-y-3">
              {pagination.slice.map((ticket) => (
                <li key={ticket.id}>
                  <SupportTicketRow
                    ticket={ticket}
                    isFocused={focusedId === ticket.id}
                    now={now}
                    onOpen={() => setOpenTicketId(ticket.id)}
                    onFocus={() => setFocusedId(ticket.id)}
                  />
                </li>
              ))}
            </ul>

            {pagination.totalPages > 1 ? (
              <div className="flex items-center justify-between">
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Page {pagination.page} of {pagination.totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page <= 1}
                    onClick={() =>
                      setFilters({
                        page: String(Math.max(1, pagination.page - 1)),
                      })
                    }
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() =>
                      setFilters({
                        page: String(
                          Math.min(
                            pagination.totalPages,
                            pagination.page + 1
                          )
                        ),
                      })
                    }
                  >
                    Next
                  </Button>
                </div>
              </div>
            ) : null}
          </>
        )}

        {openTicket ? (
          <SupportTicketDetailDrawer
            ticket={openTicket}
            relatedTicketCount={relatedTicketCount}
            onClose={() => setOpenTicketId(null)}
            onSendReply={handleSendReply}
            onAddInternalNote={handleAddInternalNote}
            onStatusChange={handleStatusChange}
            onPriorityChange={handlePriorityChange}
            onAssign={handleAssign}
            onUnassign={handleUnassign}
            onViewMerchant={handleViewMerchant}
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