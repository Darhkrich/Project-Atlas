/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/purity */
"use client";

import { useState } from "react";
import {
  SupportConversation,
  SupportStatus,
  SupportPriority,
  InternalNote,
  CannedResponse,
} from "@/lib/admin/types/support";
import { mockCannedResponses } from "@/lib/admin/mock/support";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { cn } from "@/lib/utils";
import { AtlasIcon } from "@/components/atlas/icons";

interface SupportDetailDrawerProps {
  conversation: SupportConversation | null;
  onClose: () => void;
  onSendReply: (conversationId: string, message: string) => void;
  onStatusChange: (conversationId: string, status: SupportStatus) => void;
  onPriorityChange: (conversationId: string, priority: SupportPriority) => void;
  onAssign: (conversationId: string, adminEmail: string) => void;
  onAddInternalNote: (conversationId: string, note: string) => void;
}

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

function timeSince(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function SupportDetailDrawer({
  conversation,
  onClose,
  onSendReply,
  onStatusChange,
  onPriorityChange,
  onAssign,
  onAddInternalNote,
}: SupportDetailDrawerProps) {
  const [reply, setReply] = useState("");
  const [assignee, setAssignee] = useState(conversation?.assignee || "");
  const [internalNote, setInternalNote] = useState("");
  const [showCanned, setShowCanned] = useState(false);

  if (!conversation) return null;

  const handleSendReply = () => {
    if (reply.trim()) {
      onSendReply(conversation.id, reply.trim());
      setReply("");
    }
  };

  const handleAssign = () => {
    if (assignee.trim()) {
      onAssign(conversation.id, assignee.trim());
    }
  };

  const handleAddNote = () => {
    if (internalNote.trim()) {
      onAddInternalNote(conversation.id, internalNote.trim());
      setInternalNote("");
    }
  };

  const slaHours = Math.floor((Date.now() - new Date(conversation.lastMessageAt).getTime()) / 3600000);
  const slaColor = slaHours > 24 ? "text-danger-600" : slaHours > 8 ? "text-warning-600" : "text-success-600";

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl dark:bg-neutral-900 flex flex-col">
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <h2 className="text-lg font-semibold">{conversation.subject}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </div>

        {/* Header with status, priority, SLA, user context */}
        <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={statusVariantMap[conversation.status]}>{conversation.status}</Badge>
            <Badge variant={priorityVariantMap[conversation.priority]}>{conversation.priority}</Badge>
            <Badge variant="info">{conversation.channel}</Badge>
            <span className={cn("text-xs font-medium", slaColor)}>SLA: {slaHours}h</span>
          </div>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
            <div className="text-sm text-neutral-500">
              <p className="font-medium text-neutral-900 dark:text-neutral-100">{conversation.userName}</p>
              <p>{conversation.userType} · {conversation.userId}</p>
              <p className="text-xs">Last activity: {timeSince(conversation.lastMessageAt)}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                className="h-9 rounded-md border border-neutral-300 bg-white px-2 text-xs dark:border-neutral-700 dark:bg-neutral-800"
                value={conversation.status}
                onChange={e => onStatusChange(conversation.id, e.target.value as SupportStatus)}
              >
                <option value="open">Open</option>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              <select
                className="h-9 rounded-md border border-neutral-300 bg-white px-2 text-xs dark:border-neutral-700 dark:bg-neutral-800"
                value={conversation.priority}
                onChange={e => onPriorityChange(conversation.id, e.target.value as SupportPriority)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
              <div className="flex items-center gap-1">
                <Input
                  className="h-9 w-40 text-xs"
                  placeholder="Assign to (email)"
                  value={assignee}
                  onChange={e => setAssignee(e.target.value)}
                />
                <Button variant="outline" size="sm" onClick={handleAssign}>Assign</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {conversation.messages.map(msg => (
            <div
              key={msg.id}
              className={cn(
                "flex",
                msg.sender === "admin" ? "justify-end" : msg.sender === "system" ? "justify-center" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-lg p-3 text-sm",
                  msg.sender === "admin"
                    ? "bg-brand-50 text-brand-900 dark:bg-brand-900/30 dark:text-brand-100"
                    : msg.sender === "system"
                    ? "bg-neutral-100 text-neutral-500 dark:bg-neutral-800"
                    : "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
                )}
              >
                <p className="font-medium text-xs mb-1">
                  {msg.sender === "admin" ? "Support" : msg.sender === "system" ? "System" : conversation.userName}
                </p>
                <p>{msg.content}</p>
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {msg.attachments.map(att => (
                      <div key={att.id} className="flex items-center gap-2 rounded bg-neutral-200/50 p-1 text-xs dark:bg-neutral-700/50">
                        <AtlasIcon name="file-text" className="h-4 w-4" />
                        <span>{att.fileName}</span>
                        <span className="text-neutral-500">({att.size ? `${Math.round(att.size / 1024)}KB` : "—"})</span>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-neutral-500 mt-1">{new Date(msg.timestamp).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Internal Notes */}
        <div className="border-t border-neutral-200 p-3 dark:border-neutral-800">
          <p className="text-xs font-medium text-neutral-500 mb-2">Internal Notes</p>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {conversation.internalNotes && conversation.internalNotes.length > 0 ? (
              conversation.internalNotes.map(note => (
                <div key={note.id} className="rounded bg-neutral-50 p-2 text-xs dark:bg-neutral-900">
                  <p className="font-medium">{note.admin}</p>
                  <p>{note.content}</p>
                  <p className="text-neutral-400">{new Date(note.timestamp).toLocaleString()}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-neutral-400">No internal notes.</p>
            )}
          </div>
          <div className="mt-2 flex gap-2">
            <Input
              className="h-8 text-xs"
              placeholder="Add internal note..."
              value={internalNote}
              onChange={e => setInternalNote(e.target.value)}
            />
            <Button variant="outline" size="sm" onClick={handleAddNote}>Add Note</Button>
          </div>
        </div>

        {/* Reply with canned responses */}
        <div className="border-t border-neutral-200 p-4 dark:border-neutral-800">
          <div className="flex justify-between items-center mb-2">
            <Button variant="ghost" size="sm" onClick={() => setShowCanned(!showCanned)}>Canned Responses</Button>
          </div>
          {showCanned && (
            <div className="mb-2 space-y-1">
              {mockCannedResponses.map(canned => (
                <button
                  key={canned.id}
                  className="block w-full text-left rounded bg-neutral-50 p-2 text-xs hover:bg-neutral-100 dark:bg-neutral-900"
                  onClick={() => setReply(canned.content)}
                >
                  {canned.title}
                </button>
              ))}
            </div>
          )}
          <textarea
            className="w-full rounded-md border border-neutral-300 p-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
            rows={3}
            placeholder="Type your reply..."
            value={reply}
            onChange={e => setReply(e.target.value)}
          />
          <div className="mt-2 flex justify-end gap-2">
            <Button size="sm" onClick={handleSendReply}>Send Reply</Button>
          </div>
        </div>
      </div>
    </div>
  );
}