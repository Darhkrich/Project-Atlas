// lib/admin/support/csv-export.ts

import type { SupportConversation } from "@/lib/admin/types/support";

function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function linkedRef(c: SupportConversation): string {
  if (!c.linkedEntity) return "";
  switch (c.linkedEntity.kind) {
    case "digital_transaction":
      return c.linkedEntity.transactionId;
    case "reseller_order":
      return c.linkedEntity.orderId;
    case "merchant_account":
      return c.linkedEntity.merchantId;
  }
}

export function conversationsToCsv(conversations: SupportConversation[]): string {
  const headers = [
    "id",
    "subject",
    "userType",
    "userName",
    "contactName",
    "status",
    "priority",
    "category",
    "channel",
    "assigneeName",
    "linkedReference",
    "tags",
    "createdAt",
    "lastMessageAt",
    "slaDueAt",
  ];

  const rows = conversations.map((c) => [
    c.id,
    c.subject,
    c.userType,
    c.userName,
    c.contactName ?? "",
    c.status,
    c.priority,
    c.category,
    c.channel,
    c.assigneeName ?? "",
    linkedRef(c),
    c.tags.join("|"),
    c.createdAt,
    c.lastMessageAt,
    c.slaDueAt ?? "",
  ]);

  return [headers, ...rows]
    .map((row) => row.map(escapeCsv).join(","))
    .join("\r\n");
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}