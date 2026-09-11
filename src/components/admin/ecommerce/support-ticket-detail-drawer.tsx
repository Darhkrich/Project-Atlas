"use client";

import { useState } from "react";
import { EcommerceSupportTicket } from "@/lib/admin/types/ecommerce-support";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";

interface SupportTicketDetailDrawerProps {
  ticket: EcommerceSupportTicket | null;
  onClose: () => void;
  onRespond: (ticketId: string, message: string) => void;
  onResolve: (ticketId: string) => void;
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

export function SupportTicketDetailDrawer({
  ticket,
  onClose,
  onRespond,
  onResolve,
}: SupportTicketDetailDrawerProps) {
  const [reply, setReply] = useState("");

  if (!ticket) return null;

  const handleSendReply = () => {
    if (reply.trim()) {
      onRespond(ticket.id, reply.trim());
      setReply("");
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-xl dark:bg-neutral-900 flex flex-col">
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <h2 className="text-lg font-semibold">Ticket {ticket.id}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </div>

        <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
          <p className="font-medium">{ticket.subject}</p>
          <p className="text-sm text-neutral-500">{ticket.merchantName} · {ticket.category}</p>
          <div className="mt-2 flex gap-2">
            <Badge variant={statusVariantMap[ticket.status]}>{ticket.status}</Badge>
            <Badge variant={priorityVariantMap[ticket.priority]}>{ticket.priority}</Badge>
          </div>
        </div>

        {/* Conversation */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {ticket.messages.length === 0 ? (
            <p className="text-sm text-neutral-400">No messages yet.</p>
          ) : (
            ticket.messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "admin" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 text-sm ${
                    msg.sender === "admin"
                      ? "bg-brand-50 text-brand-900 dark:bg-brand-900/30 dark:text-brand-100"
                      : "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
                  }`}
                >
                  <p className="font-medium text-xs mb-1">{msg.sender === "admin" ? "Support" : "Merchant"}</p>
                  <p>{msg.message}</p>
                  <p className="text-xs text-neutral-500 mt-1">{new Date(msg.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Reply box */}
        <div className="border-t border-neutral-200 p-4 dark:border-neutral-800">
          <textarea
            className="w-full rounded-md border border-neutral-300 p-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
            rows={3}
            placeholder="Type your reply..."
            value={reply}
            onChange={e => setReply(e.target.value)}
          />
          <div className="mt-2 flex justify-end gap-2">
            {ticket.status !== "resolved" && (
              <Button variant="outline" size="sm" onClick={() => onResolve(ticket.id)}>Resolve</Button>
            )}
            <Button size="sm" onClick={handleSendReply}>Send Reply</Button>
          </div>
        </div>
      </div>
    </div>
  );
}