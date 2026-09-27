import type { TreasuryEvent } from "@/lib/domains/treasury/types";
import { downloadCsv } from "@/lib/admin/support/csv-export";
import {
  TREASURY_KIND_LABELS,
  TREASURY_DIRECTION_LABELS,
  TREASURY_APPROVAL_LABELS,
  TREASURY_RECONCILIATION_LABELS,
} from "@/lib/domains/treasury/labels";

const HEADERS = [
  "Event ID",
  "Kind",
  "Direction",
  "Amount",
  "Currency",
  "Counterparty",
  "Reference",
  "Description",
  "Approval",
  "Reconciliation",
  "Created at",
  "Settled at",
  "Created by",
  "Approved by",
];

function escape(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return "";
  const s = String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function rowFor(event: TreasuryEvent): string[] {
  return [
    escape(event.id),
    escape(TREASURY_KIND_LABELS[event.kind]),
    escape(TREASURY_DIRECTION_LABELS[event.direction]),
    escape(event.amount.toFixed(2)),
    escape(event.currency),
    escape(event.counterparty?.name ?? ""),
    escape(event.reference),
    escape(event.description),
    escape(TREASURY_APPROVAL_LABELS[event.approvalStatus]),
    escape(TREASURY_RECONCILIATION_LABELS[event.reconciliationStatus]),
    escape(event.createdAt),
    escape(event.settledAt ?? ""),
    escape(event.createdBy.name),
    escape(event.approvedBy?.name ?? ""),
  ];
}

export function exportTreasuryCsv(events: TreasuryEvent[]): void {
  const lines: string[] = [];
  lines.push(HEADERS.join(","));
  for (const event of events) {
    lines.push(rowFor(event).join(","));
  }
  const csv = lines.join("\n");
  const stamp = new Date().toISOString().slice(0, 10);
  downloadCsv(csv, "treasury-" + stamp + ".csv");
}