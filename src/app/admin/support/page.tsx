/* eslint-disable react-hooks/set-state-in-effect */
// app/(admin)/support/page.tsx
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
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { SupportDetailDrawer } from "@/components/admin/support/support-detail-drawer";
import {
  SupportFilters,
  type SupportFilterValues,
} from "@/components/admin/support/support-filters";
import { SupportRow } from "@/components/admin/support/support-row";
import { BulkActionsBar } from "@/components/admin/support/bulk-actions-bar";
import { IncidentsPanel } from "@/components/admin/support/incedents-panel";
import { MergeDialog } from "@/components/admin/support/merge-dialog";
import type { SavedView } from "@/components/admin/support/saved-views-bar";
import type { CompensationPayload } from "@/components/admin/support/compensation-dialog";
import { mockSupportConversations } from "@/lib/admin/mock/support";
import { mockAdminUsers, findAdminById } from "@/lib/admin/mock/admin-users";
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
import { mergeConversations } from "@/lib/admin/support/merge";
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

const CURRENT_ADMIN_ID = "usr-001";

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

type BulkActionKind = "resolve" | "close";

interface UndoSnapshot {
  ids: string[];
  previous: SupportConversation[];
  label: string;
}

export default function SupportPage() {
  return (
    <Suspense
      fallback={
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
      }
    >
      <SupportPageInner />
    </Suspense>
  );
}

function SupportPageInner() {
  const router = useRouter();
  const [conversations, setConversations] = useState<SupportConversation[]>([]);
  const [loading, setLoading] = useState(true);

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

  const currentAdmin = findAdminById(CURRENT_ADMIN_ID);
  const currentAdminName = currentAdmin?.name ?? "You";

  useEffect(() => {
    const t = window.setTimeout(() => {
      setConversations(mockSupportConversations);
      setLoading(false);
    }, 500);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!undoState) return;
    const t = window.setTimeout(() => setUndoState(null), 8000);
    return () => window.clearTimeout(t);
  }, [undoState]);

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
      list = list.filter((c) => {
        if (c.subject.toLowerCase().includes(q)) return true;
        if (c.userName.toLowerCase().includes(q)) return true;
        if (c.contactName?.toLowerCase().includes(q)) return true;
        if (c.linkedEntity) {
          if (c.linkedEntity.kind === "digital_transaction") {
            if (c.linkedEntity.transactionId.toLowerCase().includes(q))
              return true;
            if (c.linkedEntity.recipient.toLowerCase().includes(q)) return true;
          }
          if (c.linkedEntity.kind === "reseller_order") {
            if (c.linkedEntity.orderId.toLowerCase().includes(q)) return true;
          }
          if (c.linkedEntity.kind === "merchant_account") {
            if (c.linkedEntity.merchantId.toLowerCase().includes(q))
              return true;
          }
        }
        return false;
      });
    }

    if (filters.status) list = list.filter((c) => c.status === filters.status);
    if (filters.category)
      list = list.filter((c) => c.category === filters.category);
    if (filters.channel)
      list = list.filter((c) => c.channel === filters.channel);
    if (filters.userType)
      list = list.filter((c) => c.userType === filters.userType);
    if (filters.assignee === "unassigned") {
      list = list.filter((c) => !c.assigneeId);
    } else if (filters.assignee) {
      list = list.filter((c) => c.assigneeId === filters.assignee);
    }

    return list;
  }, [conversations, filters, now]);

  const filteredIds = useMemo(() => filtered.map((c) => c.id), [filtered]);

  useEffect(() => {
    if (focusedId && !filteredIds.includes(focusedId)) {
      setFocusedId(filteredIds[0] ?? null);
    }
  }, [filteredIds, focusedId]);

  useEffect(() => {
    if (!focusedId) return;
    const el = document.querySelector(
      `[data-conversation-id="${focusedId}"]`
    );
    if (el instanceof HTMLElement) {
      el.scrollIntoView({ block: "nearest" });
    }
  }, [focusedId]);

  useInboxKeyboard({
    itemIds: filteredIds,
    focusedId,
    enabled: selectedId === null && pendingBulk === null && !mergeOpen,
    onFocusChange: setFocusedId,
    onOpen: setSelectedId,
    onFocusSearch: () => searchInputRef.current?.focus(),
  });

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
        filters: { assignee: CURRENT_ADMIN_ID },
        count: count((c) => c.assigneeId === CURRENT_ADMIN_ID),
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
  }, [conversations]);

  const aggregates = useMemo(() => {
    const unread = conversations.reduce((acc, c) => acc + c.unreadCount, 0);
    const active = conversations.filter(
      (c) => c.status === "open" || c.status === "pending"
    ).length;
    const breached =
      now === null
        ? 0
        : conversations.filter((c) => {
            if (!c.slaDueAt) return false;
            if (c.status === "resolved" || c.status === "closed") return false;
            return new Date(c.slaDueAt).getTime() < now;
          }).length;
    return { unread, active, breached };
  }, [conversations, now]);

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
    downloadCsv(`atlas-support-${stamp}.csv`, csv);
  };

  const handleViewProvider = (providerId: string) => {
    router.push(`/admin/providers/${providerId}`);
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const updateConversation = (
    id: string,
    patch: (c: SupportConversation) => SupportConversation
  ) => {
    setConversations((prev) => prev.map((c) => (c.id === id ? patch(c) : c)));
  };

  const pushSystemMessage = (
    c: SupportConversation,
    content: string
  ): SupportConversation => {
    const timestamp = new Date().toISOString();
    return {
      ...c,
      updatedAt: timestamp,
      lastMessageAt: timestamp,
      messages: [
        ...c.messages,
        {
          id: crypto.randomUUID(),
          sender: "system",
          content,
          timestamp,
          readByAdmin: true,
        },
      ],
    };
  };

  const pushInternalNote = (
    c: SupportConversation,
    content: string
  ): SupportConversation => {
    return {
      ...c,
      internalNotes: [
        ...(c.internalNotes ?? []),
        {
          id: crypto.randomUUID(),
          admin: "current_admin@atlas.com",
          content,
          timestamp: new Date().toISOString(),
        },
      ],
    };
  };

  const handleSendReply = (conversationId: string, message: string) => {
    const timestamp = new Date().toISOString();
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== conversationId) return c;
        return {
          ...c,
          messages: [
            ...c.messages,
            {
              id: crypto.randomUUID(),
              sender: "admin" as const,
              content: message,
              timestamp,
              readByAdmin: true,
              authorName: "You",
            },
          ],
          lastMessageAt: timestamp,
          unreadCount: 0,
        };
      })
    );
  };

  const handleStatusChange = (id: string, status: SupportStatus) => {
    updateConversation(id, (c) => ({ ...c, status }));
  };

  const handlePriorityChange = (id: string, priority: SupportPriority) => {
    updateConversation(id, (c) => ({ ...c, priority }));
  };

  const handleAssign = (id: string, adminId: string) => {
    const admin = findAdminById(adminId);
    updateConversation(id, (c) => ({
      ...c,
      assigneeId: admin?.id,
      assigneeName: admin?.name,
      assignee: admin?.email,
    }));
  };

  const handleAddInternalNote = (id: string, note: string) => {
    updateConversation(id, (c) => pushInternalNote(c, note));
  };

  const handleRetryFulfillment = (id: string, transactionId: string) => {
    updateConversation(id, (c) => {
      if (c.linkedEntity?.kind !== "digital_transaction") return c;
      const next: SupportConversation = {
        ...c,
        linkedEntity: {
          ...c.linkedEntity,
          retryCount: c.linkedEntity.retryCount + 1,
        },
      };
      return pushSystemMessage(
        next,
        `Fulfillment retry initiated for ${transactionId}.`
      );
    });
  };

  const handleEscalateToProvider = (id: string, transactionId: string) => {
    updateConversation(id, (c) => {
      if (c.linkedEntity?.kind !== "digital_transaction") return c;
      const reference = `ESC-${new Date().getFullYear()}-${Math.floor(
        Math.random() * 9000 + 1000
      )}`;
      const next: SupportConversation = {
        ...c,
        escalatedToProvider: {
          providerId: c.linkedEntity.providerId,
          reference,
          at: new Date().toISOString(),
        },
      };
      return pushSystemMessage(
        next,
        `Escalated ${transactionId} to provider. Reference: ${reference}.`
      );
    });
  };

  const handleCreditCommission = (id: string, orderId: string) => {
    updateConversation(id, (c) => {
      if (c.linkedEntity?.kind !== "reseller_order") return c;
      const next: SupportConversation = {
        ...c,
        linkedEntity: {
          ...c.linkedEntity,
          payoutState: "pending",
        },
      };
      return pushSystemMessage(
        next,
        `Commission for ${orderId} queued for next payout cycle.`
      );
    });
  };

  const handleHoldPayout = (id: string, orderId: string) => {
    updateConversation(id, (c) => {
      if (c.linkedEntity?.kind !== "reseller_order") return c;
      const next: SupportConversation = {
        ...c,
        linkedEntity: {
          ...c.linkedEntity,
          payoutState: "on_hold",
        },
      };
      return pushSystemMessage(next, `Payout for ${orderId} placed on hold.`);
    });
  };

  const handleChangePlan = (id: string, merchantId: string) => {
    updateConversation(id, (c) =>
      pushInternalNote(
        c,
        `Plan change requested for ${merchantId}. Awaiting merchant confirmation.`
      )
    );
  };

  const handleExtendTrial = (id: string, merchantId: string) => {
    updateConversation(id, (c) =>
      pushSystemMessage(c, `Trial extended by 14 days for ${merchantId}.`)
    );
  };

  const handleResetTemplate = (id: string, merchantId: string) => {
    updateConversation(id, (c) =>
      pushSystemMessage(
        c,
        `Template reset to last stable version for ${merchantId}.`
      )
    );
  };

  const handleApplyCompensation = (
    id: string,
    payload: CompensationPayload
  ) => {
    updateConversation(id, (c) => {
      const base = pushInternalNote(
        c,
        `Compensation issued: GHS ${payload.amount} via ${payload.method}. Reason: ${payload.reason}.${
          payload.note ? ` Note: ${payload.note}` : ""
        }`
      );
      const next: SupportConversation = {
        ...base,
        linkedEntity:
          base.linkedEntity?.kind === "digital_transaction"
            ? { ...base.linkedEntity, status: "refunded" }
            : base.linkedEntity,
      };
      return pushSystemMessage(
        next,
        `Compensation of GHS ${payload.amount} issued via ${payload.method}.`
      );
    });
  };

  /* ------------------------- Incident cluster actions -------------------- */

  const handleSendClusterReply = (
    cluster: IncidentCluster,
    message: string
  ) => {
    const timestamp = new Date().toISOString();
    const idSet = new Set(cluster.conversationIds);
    setConversations((prev) =>
      prev.map((c) => {
        if (!idSet.has(c.id)) return c;
        return {
          ...c,
          messages: [
            ...c.messages,
            {
              id: crypto.randomUUID(),
              sender: "admin" as const,
              content: interpolateCannedResponse(message, c),
              timestamp,
              readByAdmin: true,
              authorName: "You",
            },
          ],
          lastMessageAt: timestamp,
          unreadCount: 0,
        };
      })
    );
  };

  const handleAcknowledgeCluster = (cluster: IncidentCluster) => {
    const incidentId = `INC-${crypto.randomUUID().slice(0, 8)}`;
    const idSet = new Set(cluster.conversationIds);
    setConversations((prev) =>
      prev.map((c) => {
        if (!idSet.has(c.id)) return c;
        const withNote = pushInternalNote(
          c,
          `Acknowledged as part of incident ${incidentId} (${cluster.providerName} · ${cluster.serviceCategory}).`
        );
        return {
          ...withNote,
          incidentId,
          tags: withNote.tags.includes("incident")
            ? withNote.tags
            : [...withNote.tags, "incident"],
        };
      })
    );
  };

  const handleViewCluster = (cluster: IncidentCluster) => {
    setSelectedIds(cluster.conversationIds);
  };

  /* ------------------------------ Merge action --------------------------- */

  const handleMerge = (primaryId: string) => {
    const sources = selectedIds.filter((id) => id !== primaryId);
    const result = mergeConversations(
      conversations,
      { primaryId, sourceIds: sources },
      { id: CURRENT_ADMIN_ID, name: currentAdminName }
    );
    setConversations(result.conversations);
    setSelectedIds([]);
    setMergeOpen(false);
  };

  /* ----------------------------- Bulk actions ---------------------------- */

  const bulkSummary = useMemo(() => {
    const selectedSet = new Set(selectedIds);
    const list = conversations.filter((c) => selectedSet.has(c.id));
    return {
      count: list.length,
      unreadCount: list.reduce((acc, c) => acc + c.unreadCount, 0),
    };
  }, [conversations, selectedIds]);

  const runBulkMutation = (
    label: string,
    mutate: (c: SupportConversation) => SupportConversation
  ) => {
    const idSet = new Set(selectedIds);
    const previous = conversations.filter((c) => idSet.has(c.id));
    setConversations((prev) =>
      prev.map((c) => (idSet.has(c.id) ? mutate(c) : c))
    );
    setUndoState({ ids: selectedIds, previous, label });
    setSelectedIds([]);
  };

  const handleBulkAssign = (adminId: string) => {
    const admin = findAdminById(adminId);
    runBulkMutation(`Assigned to ${admin?.name ?? adminId}`, (c) => ({
      ...c,
      assigneeId: admin?.id,
      assigneeName: admin?.name,
      assignee: admin?.email,
    }));
  };

  const handleBulkAssignToMe = () => {
    handleBulkAssign(CURRENT_ADMIN_ID);
  };

  const handleBulkPriority = (priority: SupportPriority) => {
    runBulkMutation(`Priority set to ${priority}`, (c) => ({ ...c, priority }));
  };

  const handleBulkTag = (tag: string) => {
    runBulkMutation(`Added tag "${tag}"`, (c) => ({
      ...c,
      tags: c.tags.includes(tag) ? c.tags : [...c.tags, tag],
    }));
  };

  const handleBulkSnooze = (untilIso: string) => {
    runBulkMutation("Snoozed", (c) => ({ ...c, snoozedUntil: untilIso }));
  };

  const confirmBulkStatus = () => {
    if (!pendingBulk) return;
    const nextStatus: SupportStatus =
      pendingBulk === "resolve" ? "resolved" : "closed";
    runBulkMutation(
      pendingBulk === "resolve" ? "Resolved" : "Closed",
      (c) => ({ ...c, status: nextStatus })
    );
    setPendingBulk(null);
  };

  const undoLastBulk = () => {
    if (!undoState) return;
    const previousMap = new Map(undoState.previous.map((c) => [c.id, c]));
    setConversations((prev) => prev.map((c) => previousMap.get(c.id) ?? c));
    setUndoState(null);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Support"
        description="Unified inbox for customer, reseller, and merchant conversations."
        meta={
          <>
            <span>{aggregates.active} active</span>
            <span aria-hidden="true">·</span>
            <span>{aggregates.unread} unread</span>
            {aggregates.breached > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-danger-700 dark:text-danger-300">
                  {aggregates.breached} SLA breached
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
          currentAdminId={CURRENT_ADMIN_ID}
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
            {undoState.label} · {undoState.ids.length} conversation
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
        currentAdminId={CURRENT_ADMIN_ID}
        currentAdminName={currentAdminName}
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
        title={
          pendingBulk === "resolve"
            ? `Resolve ${bulkSummary.count} ${
                bulkSummary.count === 1 ? "conversation" : "conversations"
              }?`
            : pendingBulk === "close"
            ? `Close ${bulkSummary.count} ${
                bulkSummary.count === 1 ? "conversation" : "conversations"
              }?`
            : ""
        }
        description={
          pendingBulk === "resolve"
            ? "The selected conversations will be marked as resolved. You can undo this for a few seconds after."
            : pendingBulk === "close"
            ? "The selected conversations will be closed. You can undo this for a few seconds after."
            : ""
        }
        confirmLabel={pendingBulk === "resolve" ? "Resolve" : "Close"}
        danger={pendingBulk === "close"}
        onConfirm={confirmBulkStatus}
        onCancel={() => setPendingBulk(null)}
      />
    </div>
  );
}