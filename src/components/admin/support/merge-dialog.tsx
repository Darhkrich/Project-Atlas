/* eslint-disable react-hooks/set-state-in-effect */
// components/admin/support/merge-dialog.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { ModalShell } from "@/components/admin/ui/model-shell";
import { Button } from "@/components/admin/ui/button";
import { Badge } from "@/components/admin/ui/badge";
import { cn } from "@/lib/utils";
import { formatAbsolute, formatRelative } from "@/lib/admin/support/format";
import {
  statusLabel,
  statusVariant,
  userTypeLabel,
} from "@/lib/admin/support/constants";
import type { SupportConversation } from "@/lib/admin/types/support";

interface MergeDialogProps {
  open: boolean;
  conversations: SupportConversation[];
  now: number | null;
  onCancel: () => void;
  onConfirm: (primaryId: string) => void;
}

export function MergeDialog({
  open,
  conversations,
  now,
  onCancel,
  onConfirm,
}: MergeDialogProps) {
  const [primaryId, setPrimaryId] = useState<string>("");

  useEffect(() => {
    if (!open) return;
    if (conversations.length === 0) {
      setPrimaryId("");
      return;
    }
    const oldest = [...conversations].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )[0];
    setPrimaryId(oldest?.id ?? "");
  }, [open, conversations]);

  const totalMessages = useMemo(
    () => conversations.reduce((acc, c) => acc + c.messages.length, 0),
    [conversations]
  );

  if (!open) return null;

  return (
    <ModalShell
      open={open}
      onClose={onCancel}
      title={"Merge " + conversations.length + " conversations"}
      description="Choose the conversation to keep. All messages and notes from the others will fold into it, and the others will close with a link to the primary."
      size="lg"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={!primaryId}
            onClick={() => primaryId && onConfirm(primaryId)}
          >
            Merge
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Primary conversation
          </p>

          <ul
            role="radiogroup"
            aria-label="Primary conversation"
            className="mt-2 space-y-2"
          >
            {conversations.map((c) => {
              const isPrimary = primaryId === c.id;
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={isPrimary}
                    onClick={() => setPrimaryId(c.id)}
                    className={cn(
                      "w-full rounded-lg border p-3 text-left transition-colors",
                      isPrimary
                        ? "border-brand-500 bg-brand-50 dark:border-brand-500 dark:bg-brand-900/30"
                        : "border-neutral-200 bg-white hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800"
                    )}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "h-3 w-3 shrink-0 rounded-full border",
                          isPrimary
                            ? "border-brand-600 bg-brand-600 dark:border-brand-400 dark:bg-brand-400"
                            : "border-neutral-300 dark:border-neutral-600"
                        )}
                        aria-hidden="true"
                      />
                      <span className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {c.subject}
                      </span>
                      <Badge variant={statusVariant[c.status]}>
                        {statusLabel[c.status]}
                      </Badge>
                      <Badge variant="brand" size="sm">
                        {userTypeLabel[c.userType]}
                      </Badge>
                      {isPrimary && (
                        <Badge variant="success" size="sm">
                          Primary
                        </Badge>
                      )}
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400">
                      <span>{c.userName}</span>
                      <span>
                        {c.messages.length} message
                        {c.messages.length === 1 ? "" : "s"}
                      </span>
                      {(c.internalNotes?.length ?? 0) > 0 && (
                        <span>
                          {c.internalNotes?.length} note
                          {c.internalNotes?.length === 1 ? "" : "s"}
                        </span>
                      )}
                      <time
                        dateTime={c.lastMessageAt}
                        title={formatAbsolute(c.lastMessageAt)}
                      >
                        {formatRelative(c.lastMessageAt, now)}
                      </time>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="rounded-md bg-neutral-50 p-3 text-xs text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400">
          Result:{" "}
          <span className="font-medium">{totalMessages} messages</span> in the
          primary conversation. The other {conversations.length - 1} will be
          closed and point to the primary.
        </div>
      </div>
    </ModalShell>
  );
}