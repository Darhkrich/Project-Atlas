"use client";

import { useState, useEffect } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent } from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { SupportDetailDrawer } from "@/components/admin/support/support-detail-drawer";
import { mockSupportConversations } from "@/lib/admin/mock/support";
import { SupportConversation, SupportStatus, SupportPriority } from "@/lib/admin/types/support";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";

const statusVariantMap = {
  open: "warning",
  pending: "info",
  resolved: "success",
  closed: "neutral",
} as const;

const priorityVariantMap = {
  low: "neutral",
  medium: "info",
  high: "warning",
  urgent: "danger",
} as const;

function formatTimestamp(iso: string) {
  const d = new Date(iso);
  return `${d.getUTCDate()}/${d.getUTCMonth() + 1}/${d.getUTCFullYear()} ${d.getUTCHours()}:${d.getUTCMinutes()}`;
}

export default function SupportPage() {
  const [conversations, setConversations] = useState<SupportConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [channelFilter, setChannelFilter] = useState("");
  const [userTypeFilter, setUserTypeFilter] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");
  const [selected, setSelected] = useState<SupportConversation | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<"resolve" | "close" | null>(null);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setConversations(mockSupportConversations);
      setLoading(false);
    }, 500);
  }, []);

  const filtered = conversations.filter(c => {
    if (search && !c.userName.toLowerCase().includes(search.toLowerCase()) &&
        !c.subject.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter && c.status !== statusFilter) return false;
    if (channelFilter && c.channel !== channelFilter) return false;
    if (userTypeFilter && c.userType !== userTypeFilter) return false;
    if (assigneeFilter === "unassigned" && c.assignee) return false;
    if (assigneeFilter && assigneeFilter !== "unassigned" && c.assignee !== assigneeFilter) return false;
    return true;
  });

  const assignees = Array.from(new Set(conversations.map(c => c.assignee).filter(Boolean))) as string[];

  const handleSendReply = (conversationId: string, message: string) => {
    setConversations(prev => prev.map(c => {
      if (c.id !== conversationId) return c;
      const newMsg = {
        id: `MSG-${Date.now()}`,
        sender: "admin" as const,
        content: message,
        timestamp: new Date().toISOString(),
        readByAdmin: true,
      };
      return { ...c, messages: [...c.messages, newMsg], lastMessageAt: new Date().toISOString(), unreadCount: 0 };
    }));
    setSelected(prev => {
      if (!prev || prev.id !== conversationId) return prev;
      const newMsg = {
        id: `MSG-${Date.now()}`,
        sender: "admin" as const,
        content: message,
        timestamp: new Date().toISOString(),
        readByAdmin: true,
      };
      return { ...prev, messages: [...prev.messages, newMsg], lastMessageAt: new Date().toISOString(), unreadCount: 0 };
    });
  };

  const handleStatusChange = (conversationId: string, status: SupportStatus) => {
    setConversations(prev => prev.map(c => c.id === conversationId ? { ...c, status } : c));
    setSelected(prev => prev && prev.id === conversationId ? { ...prev, status } : prev);
  };

  const handlePriorityChange = (conversationId: string, priority: SupportPriority) => {
    setConversations(prev => prev.map(c => c.id === conversationId ? { ...c, priority } : c));
    setSelected(prev => prev && prev.id === conversationId ? { ...prev, priority } : prev);
  };

  const handleAssign = (conversationId: string, adminEmail: string) => {
    setConversations(prev => prev.map(c => c.id === conversationId ? { ...c, assignee: adminEmail } : c));
    setSelected(prev => prev && prev.id === conversationId ? { ...prev, assignee: adminEmail } : prev);
  };

  const handleAddInternalNote = (conversationId: string, note: string) => {
    setConversations(prev => prev.map(c => {
      if (c.id !== conversationId) return c;
      const newNote = { id: `NOTE-${Date.now()}`, admin: "current_admin@atlas.com", content: note, timestamp: new Date().toISOString() };
      return { ...c, internalNotes: [...(c.internalNotes || []), newNote] };
    }));
    setSelected(prev => {
      if (!prev || prev.id !== conversationId) return prev;
      const newNote = { id: `NOTE-${Date.now()}`, admin: "current_admin@atlas.com", content: note, timestamp: new Date().toISOString() };
      return { ...prev, internalNotes: [...(prev.internalNotes || []), newNote] };
    });
  };

  const toggleSelected = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleBulkAction = () => {
    if (bulkAction) {
      setConversations(prev => prev.map(c => selectedIds.includes(c.id) ? { ...c, status: bulkAction === "resolve" ? "resolved" : "closed" } : c));
      setSelectedIds([]);
    }
    setShowBulkConfirm(false);
    setBulkAction(null);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Support"
        description="Unified inbox for customer, reseller, and merchant conversations."
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Input placeholder="Search conversations..." className="max-w-xs" value={search} onChange={e => setSearch(e.target.value)} />
        <select className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="pending">Pending</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <select className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm" value={channelFilter} onChange={e => setChannelFilter(e.target.value)}>
          <option value="">All Channels</option>
          <option value="live_chat">Live Chat</option>
          <option value="ticket">Ticket</option>
        </select>
        <select className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm" value={userTypeFilter} onChange={e => setUserTypeFilter(e.target.value)}>
          <option value="">All User Types</option>
          <option value="customer">Customer</option>
          <option value="reseller">Reseller</option>
          <option value="merchant">Merchant</option>
        </select>
        <select className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm" value={assigneeFilter} onChange={e => setAssigneeFilter(e.target.value)}>
          <option value="">All Assignees</option>
          <option value="unassigned">Unassigned</option>
          {assignees.map(admin => <option key={admin} value={admin}>{admin}</option>)}
        </select>
      </div>

      {/* Bulk actions */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-2 rounded-md bg-neutral-50 p-2 dark:bg-neutral-900">
          <span className="text-sm">{selectedIds.length} selected</span>
          <Button variant="outline" size="sm" onClick={() => { setBulkAction("resolve"); setShowBulkConfirm(true); }}>Resolve</Button>
          <Button variant="outline" size="sm" onClick={() => { setBulkAction("close"); setShowBulkConfirm(true); }}>Close</Button>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <Card><CardContent>No conversations found.</CardContent></Card>
          ) : (
            filtered.map(c => (
              <div key={c.id} className="flex items-center justify-between rounded-lg border border-neutral-200 p-3 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-900/50">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(c.id)}
                    onChange={() => toggleSelected(c.id)}
                    className="h-4 w-4"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{c.subject}</p>
                      {c.unreadCount > 0 && <Badge variant="danger">{c.unreadCount} new</Badge>}
                    </div>
                    <p className="text-sm text-neutral-500">{c.userName} · {c.userType}</p>
                    <p className="text-xs text-neutral-400">{formatTimestamp(c.lastMessageAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {c.assignee ? <span className="text-xs text-neutral-500">{c.assignee}</span> : <Badge variant="warning">Unassigned</Badge>}
                  <Badge variant={statusVariantMap[c.status]}>{c.status}</Badge>
                  <Badge variant={priorityVariantMap[c.priority]}>{c.priority}</Badge>
                  <Button variant="ghost" size="sm" onClick={() => setSelected(c)}>Open</Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <SupportDetailDrawer
        conversation={selected}
        onClose={() => setSelected(null)}
        onSendReply={handleSendReply}
        onStatusChange={handleStatusChange}
        onPriorityChange={handlePriorityChange}
        onAssign={handleAssign}
        onAddInternalNote={handleAddInternalNote}
      />

      <ConfirmDialog
        open={showBulkConfirm}
        title={`Confirm ${bulkAction ?? ''}`}
        description={`Are you sure you want to ${bulkAction ?? ''} ${selectedIds.length} conversations?`}
        confirmLabel="Confirm"
        onConfirm={handleBulkAction}
        onCancel={() => setShowBulkConfirm(false)}
      />
    </div>
  );
}