/* eslint-disable react-hooks/set-state-in-effect */
// src/app/admin/support/page.tsx
"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/admin/ui/button";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { SupportDetailDrawer } from "@/components/admin/support/support-detail-drawer";
import {
  SupportFilters,
  type SupportFilterValues,
} from "@/components/admin/support/support-filters";
import { SupportRow } from "@/components/admin/support/support-row";
import { BulkActionsBar } from "@/components/admin/support/bulk-actions-bar";
import { IncidentsPanel } from "@/components/admin/support/incidents-panel";
import { MergeDialog } from "@/components/admin/support/merge-dialog";
import type { SavedView } from "@/components/admin/support/saved-views-bar";
import type { CompensationPayload } from "@/components/admin/support/compensation-dialog";
import { mockAdminUsers, findAdminById } from "@/lib/admin/mock/admin-users";
import { useSupport } from "@/lib/admin/hooks/use-support";
import { useCurrentAdmin } from "@/lib/admin/rbac";
import { useUrlFilters } from "@/lib/admin/hooks/use-url-filters";
import { useNow } from "@/lib/admin/hooks/use-now";
import { useInboxKeyboard } from "@/lib/admin/hooks/use-inbox-keyboard";
import {
  conversationsToCsv,
  downloadCsv,
} from "@/lib/admin/support/csv-export";
import { countRelatedTickets } from "@/lib/admin/support/provider-health";
import {
  buildIncidentClusters,
  type IncidentCluster,
} from "@/lib/admin/support/incidents";
import { interpolateCannedResponse } from "@/lib/admin/support/interpolate";
import {
  addInternalNote,
  applyCompensation,
  assignTicket,
  bulkAddTag,
  bulkPatchTickets,
  changePlan,
  changeTicketPriority,
  changeTicketStatus,
  creditCommission,
  escalateToProvider,
  extendTrial,
  holdPayout,
  mergeTickets,
  resetTemplate,
  retryFulfillment,
  sendTicketReply,
  setTicketIncident,
  snoozeTicket,
  type SupportActor,
  type SupportMutationResult,
} from "@/lib/admin/support/support-mutations";
import { MIDDOT } from "@/lib/admin/support/constants";
import type {
  SupportConversation,
  SupportPriority,
  SupportStatus,
} from "@/lib/admin/types/support";

type UrlFilterValues = SupportFilterValues & Record<string, string>;

const DEFAULT_FILTERS: UrlFilterValues = {
  q: "",
  status: "",
  category: "",
  channel: "",
  userType: "",
  assignee: "",
  view: "",
};

const SYSTEM_ACTOR: SupportActor = {
  id: "system",
  name: "System",
  email: "system@atlas.com",
};

type SavedViewPredicate = (
  c: SupportConversation,
  now: number | null
) => boolean;

const savedViewPredicates: Record<string, SavedViewPredicate> = {
  "ds-failures": (c) =>
    c.linkedEntity?.kind === "digital_transaction" &&
    c.linkedEntity.status === "failed",
  "reseller-commissions": (c) =>
    c.userType === "reseller" && c.category === "billing",
  "merchant-subs": (c) =>
    c.userType === "merchant" &&
    (c.topic === "subscription" ||
      c.topic === "merchant_storefront" ||
      c.topic === "merchant_billing"),
  "sla-breach": (c, now) => {
    if (!now || !c.slaDueAt) return false;
    return new Date(c.slaDueAt).getTime() < now;
  },
};

function findRowElement(id: string): HTMLElement | null {
  const selector = '[data-conversation-id="' + id + '"]';
  const el = document.querySelector(selector);
  if (el instanceof HTMLElement) return el;
  return null;
}

function buildConfirmTitle(
  pendingBulk: BulkActionKind | null,
  count: number
): string {
  if (pendingBulk === null) return "";
  const noun = count === 1 ? "conversation" : "conversations";
  if (pendingBulk === "resolve") {
    return "Resolve " + count + " " + noun + "?";
  }
  return "Close " + count + " " + noun + "?";
}

function buildConfirmDescription(
  pendingBulk: BulkActionKind | null
): string {
  if (pendingBulk === "resolve") {
    return "The selected conversations will be marked as resolved. You can undo this for a few seconds after.";
  }
  if (pendingBulk === "close") {
    return "The selected conversations will be closed. You can undo this for a few seconds after.";
  }
  return "";
}

type BulkActionKind = "resolve" | "close";

interface UndoSnapshot {
  ids: string[];
  previous: {
    status: SupportStatus;
    priority: SupportPriority;
    assigneeId?: string;
    assigneeName?: string;
    assignee?: string;
    tags: string[];
    snoozedUntil?: string;
  }[];
  label: string;
}

export default function SupportPage() {
  return (
    <Suspense fallback={<SupportSkeleton />}>
      <SupportPageInner />
    </Suspense>
  );
}

function SupportSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-72 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
      <div className="h-10 w-full animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"
          />
        ))}
      </div>
    </div>
  );
}

function SupportPageInner() {
  const router = useRouter();
  const admin = useCurrentAdmin();
  const { conversations, aggregates, loading } = useSupport();

  const actor: SupportActor = useMemo(() => {
    if (!admin) return SYSTEM_ACTOR;
    return {
      id: admin.id ?? admin.email,
      name: admin.name,
      email: admin.email,
    };
  }, [admin]);

  const { filters, setFilters, clearFilters, hasActive } =
    useUrlFilters<UrlFilterValues>(DEFAULT_FILTERS);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [pendingBulk, setPendingBulk] = useState<BulkActionKind | null>(null);
  const [undoState, setUndoState] = useState<UndoSnapshot | null>(null);
  const [clusterReply, setClusterReply] = useState<{
    clusterId: string;
    text: string;
  } | null>(null);
  const [mergeOpen, setMergeOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const now = useNow();

  const currentAdmin = admin ? findAdminById(admin.id ?? "") : undefined;
  const currentAdminName = currentAdmin?.name ?? actor.name;

  const selected = useMemo(
    () => conversations.find((c) => c.id === selectedId) ?? null,
    [conversations, selectedId]
  );

  const incidents = useMemo(
    () => buildIncidentClusters(conversations, now),
    [conversations, now]
  );

  const filtered = useMemo(() => {
    let list = conversations;

    if (filters.view) {
      const predicate = savedViewPredicates[filters.view];
      if (predicate) list = list.filter((c) => predicate(c, now));
    }

    if (filters.q) {
      const q = filters.q.toLowerCase();
      list = list.filter((c) => matchesSearch(c, q));
    }

    if (filters.status) {
      list = list.filter((c) => c.status === filters.status);
    }
    if (filters.category) {
      list = list.filter((c) => c.category === filters.category);
    }
    if (filters.channel) {
      list = list.filter((c) => c.channel === filters.channel);
    }
    if (filters.userType) {
      list = list.filter((c) => c.userType === filters.userType);
    }
    if (filters.assignee === "unassigned") {
      list = list.filter((c) => !c.assigneeId);
    } else if (filters.assignee) {
      list = list.filter((c) => c.assigneeId === filters.assignee);
    }

    return list;
  }, [conversations, filters, now]);

  const filteredIds = useMemo(() => filtered.map((c) => c.id), [filtered]);

  const savedViews = useMemo<SavedView[]>(() => {
    const count = (pred: (c: SupportConversation) => boolean) =>
      conversations.filter(pred).length;

    return [
      {
        id: "all-open",
        label: "All open",
        filters: { status: "open" },
        count: count((c) => c.status === "open" || c.status === "pending"),
      },
      {
        id: "my-queue",
        label: "My queue",
        filters: { assignee: actor.id },
        count: count((c) => c.assigneeId === actor.id),
      },
      {
        id: "unassigned",
        label: "Unassigned",
        filters: { assignee: "unassigned" },
        count: count((c) => !c.assigneeId),
      },
      {
        id: "ds-failures",
        label: "DS failures",
        filters: { view: "ds-failures" },
        count: count(
          savedViewPredicates["ds-failures"] as (
            c: SupportConversation
          ) => boolean
        ),
        tone: "danger",
      },
      {
        id: "reseller-commissions",
        label: "Reseller commissions",
        filters: { view: "reseller-commissions" },
        count: count(
          (c) => c.userType === "reseller" && c.category === "billing"
        ),
      },
      {
        id: "merchant-subs",
        label: "Merchant subscriptions",
        filters: { view: "merchant-subs" },
        count: count((c) => c.userType === "merchant"),
      },
    ] as SavedView[];
  }, [conversations, actor.id]);

  const relatedTicketCount = useMemo(() => {
    if (
      !selected?.linkedEntity ||
      selected.linkedEntity.kind !== "digital_transaction"
    ) {
      return undefined;
    }
    return countRelatedTickets(conversations, selected.linkedEntity);
  }, [selected, conversations]);

  const selectedConversations = useMemo(
    () => conversations.filter((c) => selectedIds.includes(c.id)),
    [conversations, selectedIds]
  );

  const assignees = useMemo(
    () =>
      mockAdminUsers.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
      })),
    []
  );

  const bulkSummary = useMemo(() => {
    const selectedSet = new Set(selectedIds);
    const list = conversations.filter((c) => selectedSet.has(c.id));
    return {
      count: list.length,
      unreadCount: list.reduce((acc, c) => acc + c.unreadCount, 0),
    };
  }, [conversations, selectedIds]);

  useEffect(() => {
    if (!undoState) return;
    const t = window.setTimeout(() => setUndoState(null), 8000);
    return () => window.clearTimeout(t);
  }, [undoState]);

  useEffect(() => {
    if (focusedId && !filteredIds.includes(focusedId)) {
      setFocusedId(filteredIds[0] ?? null);
    }
  }, [filteredIds, focusedId]);

  useEffect(() => {
    if (!focusedId) return;
    const el = findRowElement(focusedId);
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [focusedId]);

  useInboxKeyboard({
    itemIds: filteredIds,
    focusedId,
    enabled: selectedId === null && pendingBulk === null && !mergeOpen,
    onFocusChange: setFocusedId,
    onOpen: setSelectedId,
    onFocusSearch: () => searchInputRef.current?.focus(),
  });

  const applySavedView = (view: SavedView) => {
    setFilters({
      q: "",
      status: "",
      category: "",
      channel: "",
      userType: "",
      assignee: "",
      view: "",
      ...view.filters,
    });
  };

  const handleExport = () => {
    const csv = conversationsToCsv(filtered);
    const stamp = new Date().toISOString().slice(0, 10);
    downloadCsv("atlas-support-" + stamp + ".csv", csv);
  };

  const handleViewProvider = (providerId: string) => {
    router.push("/admin/providers/" + providerId);
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSendReply = (conversationId: string, message: string) => {
    sendTicketReply(conversationId, message, actor);
  };

  const handleStatusChange = (id: string, status: SupportStatus) => {
    changeTicketStatus(id, status, actor);
  };

  const handlePriorityChange = (id: string, priority: SupportPriority) => {
    changeTicketPriority(id, priority, actor);
  };

  const handleAssign = (id: string, adminId: string) => {
    const adminUser = findAdminById(adminId);
    if (!adminUser) return;
    assignTicket(id, adminUser.id, adminUser.name, adminUser.email, actor);
  };

  const handleAddInternalNote = (id: string, note: string) => {
    addInternalNote(id, note, actor);
  };

  const handleRetryFulfillment = (id: string, transactionId: string) => {
    retryFulfillment(id, transactionId, actor);
  };

  const handleEscalateToProvider = (id: string, transactionId: string) => {
    const conv = conversations.find((c) => c.id === id);
    if (!conv || conv.linkedEntity?.kind !== "digital_transaction") return;
    const year = new Date().getFullYear();
    const suffix = transactionId.replace(/[^A-Za-z0-9]/g, "").slice(-6);
    const reference = "ESC-" + year + "-" + suffix;
    escalateToProvider(id, conv.linkedEntity.providerId, reference, actor);
  };

  const handleCreditCommission = (id: string, orderId: string) => {
    creditCommission(id, orderId, actor);
  };

  const handleHoldPayout = (id: string, orderId: string) => {
    holdPayout(id, orderId, actor);
  };

  const handleChangePlan = (id: string, merchantId: string) => {
    changePlan(id, merchantId, actor);
  };

  const handleExtendTrial = (id: string, merchantId: string) => {
    extendTrial(id, merchantId, actor);
  };

  const handleResetTemplate = (id: string, merchantId: string) => {
    resetTemplate(id, merchantId, actor);
  };

  const handleApplyCompensation = (
    id: string,
    payload: CompensationPayload
  ) => {
    applyCompensation(
      id,
      payload.amount,
      payload.method,
      payload.reason,
      payload.note,
      actor
    );
  };

  const handleSendClusterReply = (
    cluster: IncidentCluster,
    message: string
  ) => {
    for (const id of cluster.conversationIds) {
      const conv = conversations.find((c) => c.id === id);
      if (!conv) continue;
      const interpolated = interpolateCannedResponse(message, conv);
      sendTicketReply(id, interpolated, actor);
    }
  };

  const handleAcknowledgeCluster = (cluster: IncidentCluster) => {
    const incidentId = "INC-" + crypto.randomUUID().slice(0, 8);
    const summary =
      cluster.providerName + " " + MIDDOT + " " + cluster.serviceCategory;
    for (const id of cluster.conversationIds) {
      setTicketIncident(id, incidentId, summary, actor);
    }
  };

  const handleViewCluster = (cluster: IncidentCluster) => {
    setSelectedIds(cluster.conversationIds);
  };

  const handleMerge = (primaryId: string) => {
    const sources = selectedIds.filter((id) => id !== primaryId);
    mergeTickets(primaryId, sources, actor);
    setSelectedIds([]);
    setMergeOpen(false);
  };

  const captureUndoSnapshot = (ids: string[]): UndoSnapshot => {
    const idSet = new Set(ids);
    const previous = conversations
      .filter((c) => idSet.has(c.id))
      .map((c) => ({
        status: c.status,
        priority: c.priority,
        assigneeId: c.assigneeId,
        assigneeName: c.assigneeName,
        assignee: c.assignee,
        tags: c.tags,
        snoozedUntil: c.snoozedUntil,
      }));
    return { ids: [...ids], previous, label: "" };
  };

  const runBulkMutation = (
    label: string,
    ids: string[],
    result: SupportMutationResult
  ) => {
    if (!result.ok) return;
    const snapshot = captureUndoSnapshot(ids);
    snapshot.label = label;
    setUndoState(snapshot);
    setSelectedIds([]);
  };

  const handleBulkAssign = (adminId: string) => {
    const adminUser = findAdminById(adminId);
    if (!adminUser) return;
    const label = "Assigned to " + adminUser.name;
    const result = bulkPatchTickets(
      selectedIds,
      {
        assigneeId: adminUser.id,
        assigneeName: adminUser.name,
        assignee: adminUser.email,
      },
      actor,
      label
    );
    runBulkMutation(label, selectedIds, result);
  };

  const handleBulkAssignToMe = () => {
    const label = "Assigned to " + actor.name;
    const result = bulkPatchTickets(
      selectedIds,
      {
        assigneeId: actor.id,
        assigneeName: actor.name,
        assignee: actor.email,
      },
      actor,
      label
    );
    runBulkMutation(label, selectedIds, result);
  };

  const handleBulkPriority = (priority: SupportPriority) => {
    const label = "Priority set to " + priority;
    const result = bulkPatchTickets(
      selectedIds,
      { priority },
      actor,
      label
    );
    runBulkMutation(label, selectedIds, result);
  };

  const handleBulkTag = (tag: string) => {
    const label = "Added tag " + tag;
    const result = bulkAddTag(selectedIds, tag, actor);
    runBulkMutation(label, selectedIds, result);
  };

  const handleBulkSnooze = (untilIso: string) => {
    const label = "Snoozed";
    const result = bulkPatchTickets(
      selectedIds,
      { snoozedUntil: untilIso },
      actor,
      label
    );
    runBulkMutation(label, selectedIds, result);
  };

  const confirmBulkStatus = () => {
    if (!pendingBulk) return;
    const nextStatus: SupportStatus =
      pendingBulk === "resolve" ? "resolved" : "closed";
    const label = pendingBulk === "resolve" ? "Resolved" : "Closed";
    const result = bulkPatchTickets(
      selectedIds,
      { status: nextStatus },
      actor,
      label
    );
    runBulkMutation(label, selectedIds, result);
    setPendingBulk(null);
  };

  const undoLastBulk = () => {
    if (!undoState) return;
    for (let i = 0; i < undoState.ids.length; i++) {
      const id = undoState.ids[i];
      const previous = undoState.previous[i];
      const conv = conversations.find((c) => c.id === id);
      if (!conv) continue;
      if (previous.status !== conv.status) {
        changeTicketStatus(id, previous.status, actor);
      }
      if (previous.priority !== conv.priority) {
        changeTicketPriority(id, previous.priority, actor);
      }
      if (previous.assigneeId !== conv.assigneeId) {
        if (previous.assigneeId && previous.assigneeName) {
          assignTicket(
            id,
            previous.assigneeId,
            previous.assigneeName,
            previous.assignee ?? "",
            actor
          );
        }
      }
      if (
        previous.snoozedUntil !== conv.snoozedUntil &&
        previous.snoozedUntil
      ) {
        snoozeTicket(id, previous.snoozedUntil, actor);
      }
    }
    setUndoState(null);
  };

  const activeCount = aggregates.active;
  const unreadCount = aggregates.unread;
  const breachedCount = aggregates.breached;
  const confirmCount = bulkSummary.count;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Support"
        description="Unified inbox for customer, reseller, and merchant conversations."
        meta={
          <>
            <span>{activeCount} active</span>
            <span aria-hidden="true">{MIDDOT}</span>
            <span>{unreadCount} unread</span>
            {breachedCount > 0 && (
              <>
                <span aria-hidden="true">{MIDDOT}</span>
                <span className="text-danger-700 dark:text-danger-300">
                  {breachedCount} SLA breached
                </span>
              </>
            )}
          </>
        }
        actions={
          <Button variant="outline" size="sm" onClick={handleExport}>
            Export CSV
          </Button>
        }
      />

      <SupportFilters
        values={filters}
        assignees={assignees}
        savedViews={savedViews}
        hasActive={hasActive}
        searchInputRef={searchInputRef}
        onChange={(patch) => setFilters(patch)}
        onSelectView={applySavedView}
        onClear={clearFilters}
      />

      <IncidentsPanel
        clusters={incidents}
        now={now}
        replyDraft={clusterReply}
        onReplyDraftChange={setClusterReply}
        onSendClusterReply={handleSendClusterReply}
        onAcknowledgeCluster={handleAcknowledgeCluster}
        onViewCluster={handleViewCluster}
      />

      {selectedIds.length > 0 && (
        <BulkActionsBar
          summary={bulkSummary}
          currentAdminName={currentAdminName}
          onAssign={handleBulkAssign}
          onAssignToMe={handleBulkAssignToMe}
          onPriority={handleBulkPriority}
          onTag={handleBulkTag}
          onSnooze={handleBulkSnooze}
          onResolve={() => setPendingBulk("resolve")}
          onClose={() => setPendingBulk("close")}
          onMerge={() => setMergeOpen(true)}
          onClear={() => setSelectedIds([])}
        />
      )}

      {undoState && (
        <div
          className="flex items-center justify-between rounded-md border border-neutral-200 bg-neutral-50 p-3 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          role="status"
        >
          <span className="text-neutral-700 dark:text-neutral-300">
            {undoState.label} {MIDDOT} {undoState.ids.length} conversation
            {undoState.ids.length === 1 ? "" : "s"}
          </span>
          <Button variant="ghost" size="sm" onClick={undoLastBulk}>
            Undo
          </Button>
        </div>
      )}

      {loading ? (
        <div
          className="space-y-2"
          aria-busy="true"
          aria-label="Loading conversations"
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          {hasActive ? (
            <EmptyState
              variant="no_results"
              title="No conversations match these filters"
              description="Try a different search or clear the filters to see the full inbox."
              action={
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              variant="no_data"
              title="You're all caught up"
              description="New conversations will appear here as they come in."
            />
          )}
        </div>
      ) : (
        <ul role="list" className="space-y-2">
          {filtered.map((c) => (
            <SupportRow
              key={c.id}
              conversation={c}
              selected={selectedIds.includes(c.id)}
              focused={focusedId === c.id}
              now={now}
              onToggleSelect={toggleSelected}
              onOpen={setSelectedId}
              onFocus={setFocusedId}
            />
          ))}
        </ul>
      )}

      <SupportDetailDrawer
        conversation={selected}
        currentAdminId={actor.id}
        currentAdminName={actor.name}
        relatedTicketCount={relatedTicketCount}
        onClose={() => setSelectedId(null)}
        onSendReply={handleSendReply}
        onStatusChange={handleStatusChange}
        onPriorityChange={handlePriorityChange}
        onAssign={handleAssign}
        onAddInternalNote={handleAddInternalNote}
        onRetryFulfillment={handleRetryFulfillment}
        onEscalateToProvider={handleEscalateToProvider}
        onViewProvider={handleViewProvider}
        onCreditCommission={handleCreditCommission}
        onHoldPayout={handleHoldPayout}
        onChangePlan={handleChangePlan}
        onExtendTrial={handleExtendTrial}
        onResetTemplate={handleResetTemplate}
        onApplyCompensation={handleApplyCompensation}
      />

      <MergeDialog
        open={mergeOpen}
        conversations={selectedConversations}
        now={now}
        onCancel={() => setMergeOpen(false)}
        onConfirm={handleMerge}
      />

      <ConfirmDialog
        open={pendingBulk !== null}
        title={buildConfirmTitle(pendingBulk, confirmCount)}
        description={buildConfirmDescription(pendingBulk)}
        confirmLabel={pendingBulk === "resolve" ? "Resolve" : "Close"}
        danger={pendingBulk === "close"}
        onConfirm={confirmBulkStatus}
        onCancel={() => setPendingBulk(null)}
      />
    </div>
  );
}

function matchesSearch(c: SupportConversation, q: string): boolean {
  if (c.subject.toLowerCase().includes(q)) return true;
  if (c.userName.toLowerCase().includes(q)) return true;
  if (c.contactName?.toLowerCase().includes(q)) return true;
  if (c.id.toLowerCase().includes(q)) return true;
  if (!c.linkedEntity) return false;

  const linked = c.linkedEntity;
  if (linked.kind === "digital_transaction") {
    if (linked.transactionId.toLowerCase().includes(q)) return true;
    if (linked.recipient.toLowerCase().includes(q)) return true;
    return false;
  }
  if (linked.kind === "reseller_order") {
    if (linked.orderId.toLowerCase().includes(q)) return true;
    return false;
  }
  if (linked.kind === "merchant_account") {
    if (linked.merchantId.toLowerCase().includes(q)) return true;
    return false;
  }
  if (
    linked.kind === "merchant_storefront" ||
    linked.kind === "merchant_order" ||
    linked.kind === "merchant_subscription" ||
    linked.kind === "merchant_template"
  ) {
    if (linked.label.toLowerCase().includes(q)) return true;
    return false;
  }
  return false;
}