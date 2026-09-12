/* eslint-disable react/no-unescaped-entities */
// components/admin/support/support-detail-drawer.tsx
"use client";

import { useId, useMemo, useState } from "react";
import {
  SupportConversation,
  SupportPriority,
  SupportStatus,
} from "@/lib/admin/types/support";
import { mockCannedResponses } from "@/lib/admin/mock/support";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { AssigneePicker } from "@/components/admin/ui/assignee-picker";
import { SlaIndicator } from "@/components/admin/ui/sla-indicator";
import { cn } from "@/lib/utils";
import { AtlasIcon } from "@/components/atlas/icons";
import { useFocusTrap } from "@/lib/admin/hooks/use-focus-trap";
import { useNow } from "@/lib/admin/hooks/use-now";
import { formatAbsolute, formatRelative } from "@/lib/admin/support/format";
import {
  channelLabel,
  priorityLabel,
  priorityVariant,
  statusLabel,
  statusVariant,
} from "@/lib/admin/support/constants";
import { interpolateCannedResponse } from "@/lib/admin/support/interpolate";
import { LinkedContextPanel } from "./linked-context-panel";
import {
  CompensationDialog,
  type CompensationPayload,
} from "./compensation-dialog";

export interface SupportDetailDrawerProps {
  conversation: SupportConversation | null;
  currentAdminId: string;
  currentAdminName: string;
  relatedTicketCount?: number;
  onClose: () => void;
  onSendReply: (conversationId: string, message: string) => void;
  onStatusChange: (conversationId: string, status: SupportStatus) => void;
  onPriorityChange: (conversationId: string, priority: SupportPriority) => void;
  onAssign: (conversationId: string, adminId: string) => void;
  onAddInternalNote: (conversationId: string, note: string) => void;
  onRetryFulfillment: (conversationId: string, transactionId: string) => void;
  onEscalateToProvider: (conversationId: string, transactionId: string) => void;
  onViewProvider: (providerId: string) => void;
  onCreditCommission: (conversationId: string, orderId: string) => void;
  onHoldPayout: (conversationId: string, orderId: string) => void;
  onChangePlan: (conversationId: string, merchantId: string) => void;
  onExtendTrial: (conversationId: string, merchantId: string) => void;
  onResetTemplate: (conversationId: string, merchantId: string) => void;
  onApplyCompensation: (
    conversationId: string,
    payload: CompensationPayload
  ) => void;
}

export function SupportDetailDrawer({
  conversation,
  onClose,
  ...rest
}: SupportDetailDrawerProps) {
  const isOpen = conversation !== null;
  const trapRef = useFocusTrap<HTMLDivElement>(isOpen, onClose);
  const titleId = useId();
  const now = useNow();

  if (!conversation) return null;

  return (
    <div
      ref={trapRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-50"
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      <SupportDetailDrawerBody
        key={conversation.id}
        conversation={conversation}
        titleId={titleId}
        now={now}
        onClose={onClose}
        {...rest}
      />
    </div>
  );
}

interface SupportDetailDrawerBodyProps
  extends Omit<SupportDetailDrawerProps, "conversation"> {
  conversation: SupportConversation;
  titleId: string;
  now: number | null;
}

function SupportDetailDrawerBody({
  conversation,
  currentAdminId,
  currentAdminName,
  relatedTicketCount,
  titleId,
  now,
  onClose,
  onSendReply,
  onStatusChange,
  onPriorityChange,
  onAssign,
  onAddInternalNote,
  onRetryFulfillment,
  onEscalateToProvider,
  onViewProvider,
  onCreditCommission,
  onHoldPayout,
  onChangePlan,
  onExtendTrial,
  onResetTemplate,
  onApplyCompensation,
}: SupportDetailDrawerBodyProps) {
  const [reply, setReply] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [showCanned, setShowCanned] = useState(false);
  const [compensationOpen, setCompensationOpen] = useState(false);

  const assignedToMe = conversation.assigneeId === currentAdminId;

  const relevantCanned = useMemo(() => {
    return mockCannedResponses.filter((can) => {
      if (!can.scope) return true;
      if (
        can.scope.categories &&
        !can.scope.categories.includes(conversation.category)
      ) {
        return false;
      }
      if (
        can.scope.userTypes &&
        !can.scope.userTypes.includes(conversation.userType)
      ) {
        return false;
      }
      if (
        can.scope.channels &&
        !can.scope.channels.includes(conversation.channel)
      ) {
        return false;
      }
      return true;
    });
  }, [conversation.category, conversation.userType, conversation.channel]);

  const handleSendReply = () => {
    const trimmed = reply.trim();
    if (!trimmed) return;
    onSendReply(conversation.id, trimmed);
    setReply("");
  };

  const handleAddNote = () => {
    const trimmed = internalNote.trim();
    if (!trimmed) return;
    onAddInternalNote(conversation.id, trimmed);
    setInternalNote("");
  };

  const applyCanned = (content: string) => {
    setReply(interpolateCannedResponse(content, conversation));
    setShowCanned(false);
  };

  return (
    <div className="absolute right-0 top-0 flex h-full w-full max-w-2xl flex-col bg-white shadow-xl dark:bg-neutral-900">
      <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
        <h2 id={titleId} className="truncate text-lg font-semibold">
          {conversation.subject}
        </h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>

      <div className="border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={statusVariant[conversation.status]}>
            {statusLabel[conversation.status]}
          </Badge>
          <Badge variant={priorityVariant[conversation.priority]}>
            {priorityLabel[conversation.priority]}
          </Badge>
          <Badge variant="info">{channelLabel[conversation.channel]}</Badge>
          <SlaIndicator dueAt={conversation.slaDueAt} now={now} />
        </div>

        <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
          <div className="text-sm text-neutral-500">
            <p className="font-medium text-neutral-900 dark:text-neutral-100">
              {conversation.userName}
            </p>
            <p>
              {conversation.userType} · {conversation.userId}
            </p>
            {conversation.contactName &&
              conversation.contactName !== conversation.userName && (
                <p className="text-xs">Contact: {conversation.contactName}</p>
              )}
            <p className="text-xs">
              Last activity: {formatRelative(conversation.lastMessageAt, now)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Change status"
              className="h-9 rounded-md border border-neutral-300 bg-white px-2 text-xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              value={conversation.status}
              onChange={(e) =>
                onStatusChange(conversation.id, e.target.value as SupportStatus)
              }
            >
              <option value="open">Open</option>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>

            <select
              aria-label="Change priority"
              className="h-9 rounded-md border border-neutral-300 bg-white px-2 text-xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              value={conversation.priority}
              onChange={(e) =>
                onPriorityChange(
                  conversation.id,
                  e.target.value as SupportPriority
                )
              }
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>

            <div className="w-52">
              <AssigneePicker
                value={conversation.assigneeId}
                valueName={conversation.assigneeName}
                onChange={(adminId) => {
                  if (adminId) onAssign(conversation.id, adminId);
                }}
              />
            </div>

            {assignedToMe ? (
              <Badge variant="success" size="sm">
                Assigned to you
              </Badge>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAssign(conversation.id, currentAdminId)}
              >
                Assign to me ({currentAdminName})
              </Button>
            )}
          </div>
        </div>
      </div>

      {conversation.escalatedToProvider && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-warning-200 bg-warning-50/70 px-4 py-2 text-xs dark:border-warning-800/60 dark:bg-warning-900/20">
          <span className="font-medium text-warning-800 dark:text-warning-200">
            Escalated to provider
          </span>
          <span className="text-warning-700 dark:text-warning-300">
            Reference {conversation.escalatedToProvider.reference}
          </span>
          <time
            dateTime={conversation.escalatedToProvider.at}
            className="text-warning-600 dark:text-warning-400"
          >
            {formatRelative(conversation.escalatedToProvider.at, now)}
          </time>
        </div>
      )}

      {conversation.linkedEntity && (
        <div className="border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <LinkedContextPanel
            entity={conversation.linkedEntity}
            relatedTicketCount={relatedTicketCount}
            onRetry={(txId) => onRetryFulfillment(conversation.id, txId)}
            onRefund={() => setCompensationOpen(true)}
            onEscalate={(txId) => onEscalateToProvider(conversation.id, txId)}
            onViewProvider={onViewProvider}
            onCreditCommission={(orderId) => {
              onCreditCommission(conversation.id, orderId);
              setCompensationOpen(true);
            }}
            onHoldPayout={(orderId) => onHoldPayout(conversation.id, orderId)}
            onChangePlan={(merchantId) =>
              onChangePlan(conversation.id, merchantId)
            }
            onExtendTrial={(merchantId) =>
              onExtendTrial(conversation.id, merchantId)
            }
            onResetTemplate={(merchantId) =>
              onResetTemplate(conversation.id, merchantId)
            }
          />
        </div>
      )}

      <div
        role="log"
        aria-live="polite"
        aria-label="Conversation messages"
        className="flex-1 space-y-3 overflow-y-auto p-4"
      >
        {conversation.messages.map((msg) => {
          const isAdmin = msg.sender === "admin";
          const isSystem = msg.sender === "system";

          return (
            <div
              key={msg.id}
              className={cn(
                "flex",
                isAdmin
                  ? "justify-end"
                  : isSystem
                  ? "justify-center"
                  : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-lg p-3 text-sm",
                  isAdmin
                    ? "bg-brand-50 text-brand-900 dark:bg-brand-900/30 dark:text-brand-100"
                    : isSystem
                    ? "bg-neutral-100 text-neutral-500 dark:bg-neutral-800"
                    : "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
                )}
              >
                <p className="mb-1 text-xs font-medium">
                  {isAdmin
                    ? msg.authorName ?? "Support"
                    : isSystem
                    ? "System"
                    : conversation.userName}
                </p>
                <p>{msg.content}</p>

                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {msg.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center gap-2 rounded bg-neutral-200/50 p-1 text-xs dark:bg-neutral-700/50"
                      >
                        <AtlasIcon name="file-text" className="h-4 w-4" />
                        <span>{att.fileName}</span>
                        <span className="text-neutral-500">
                          {att.size
                            ? `(${Math.round(att.size / 1024)}KB)`
                            : "(—)"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <time
                  dateTime={msg.timestamp}
                  title={formatAbsolute(msg.timestamp)}
                  className="mt-1 block text-xs text-neutral-500"
                >
                  {formatRelative(msg.timestamp, now)}
                </time>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-neutral-200 p-3 dark:border-neutral-800">
        <p className="mb-2 text-xs font-medium text-neutral-500">
          Internal Notes
        </p>
        <div className="max-h-32 space-y-2 overflow-y-auto">
          {conversation.internalNotes && conversation.internalNotes.length > 0 ? (
            conversation.internalNotes.map((note) => (
              <div
                key={note.id}
                className="rounded bg-neutral-50 p-2 text-xs dark:bg-neutral-900"
              >
                <p className="font-medium">{note.admin}</p>
                <p>{note.content}</p>
                <time
                  dateTime={note.timestamp}
                  title={formatAbsolute(note.timestamp)}
                  className="text-neutral-400"
                >
                  {formatRelative(note.timestamp, now)}
                </time>
              </div>
            ))
          ) : (
            <p className="text-xs text-neutral-400">No internal notes.</p>
          )}
        </div>
        <div className="mt-2 flex gap-2">
          <Input
            aria-label="Add internal note"
            className="h-8 text-xs"
            placeholder="Add internal note..."
            value={internalNote}
            onChange={(e) => setInternalNote(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleAddNote();
              }
            }}
          />
          <Button variant="outline" size="sm" onClick={handleAddNote}>
            Add Note
          </Button>
        </div>
      </div>

      <div className="border-t border-neutral-200 p-4 dark:border-neutral-800">
        <div className="mb-2 flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            aria-expanded={showCanned}
            onClick={() => setShowCanned((v) => !v)}
          >
            Canned Responses ({relevantCanned.length})
          </Button>
        </div>

        {showCanned && (
          <div className="mb-2 max-h-48 space-y-1 overflow-y-auto">
            {relevantCanned.length === 0 ? (
              <p className="rounded bg-neutral-50 p-2 text-xs text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">
                No canned responses match this ticket's category and user type.
              </p>
            ) : (
              relevantCanned.map((canned) => (
                <button
                  key={canned.id}
                  type="button"
                  className="block w-full rounded bg-neutral-50 p-2 text-left text-xs hover:bg-neutral-100 dark:bg-neutral-900 dark:hover:bg-neutral-800"
                  onClick={() => applyCanned(canned.content)}
                >
                  <span className="block font-medium">{canned.title}</span>
                  <span className="mt-0.5 block truncate text-neutral-500 dark:text-neutral-400">
                    {canned.content}
                  </span>
                </button>
              ))
            )}
          </div>
        )}

        <textarea
          aria-label="Reply to conversation"
          className="w-full rounded-md border border-neutral-300 p-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          rows={3}
          placeholder="Type your reply… (⌘/Ctrl + Enter to send)"
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              handleSendReply();
            }
          }}
        />

        <div className="mt-2 flex justify-end gap-2">
          <Button size="sm" onClick={handleSendReply}>
            Send Reply
          </Button>
        </div>
      </div>

      <CompensationDialog
        open={compensationOpen}
        entity={conversation.linkedEntity ?? null}
        onCancel={() => setCompensationOpen(false)}
        onConfirm={(payload) => {
          onApplyCompensation(conversation.id, payload);
          setCompensationOpen(false);
        }}
      />
    </div>
  );
}