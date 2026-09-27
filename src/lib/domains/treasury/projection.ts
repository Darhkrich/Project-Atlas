// lib/domains/treasury/projection.ts

import type {
  TreasuryEvent,
  TreasuryEventFilters,
  TreasuryStatementRow,
  TreasurySummary,
} from "./types";
import {
  computeCashAtBank,
  computeCommittedOutbound,
  computeCoverage,
} from "./helpers";

export function projectTreasurySummary(
  events: TreasuryEvent[],
  liabilities: number,
  providerLiabilities: number = 0
): TreasurySummary {
  const cashAtBank = computeCashAtBank(events);
  const committedOutbound = computeCommittedOutbound(events);
  const available = Math.round((cashAtBank - committedOutbound) * 100) / 100;
  const userLiabilities = Math.round(liabilities * 100) / 100;
  const provider = Math.round(providerLiabilities * 100) / 100;
  const totalLiabilities =
    Math.round((userLiabilities + provider) * 100) / 100;
  const freeCash = Math.round((available - totalLiabilities) * 100) / 100;
  const coverage = computeCoverage(freeCash, totalLiabilities);

  let unmatchedCount = 0;
  let pendingApprovalCount = 0;
  for (const event of events) {
    if (event.reconciliationStatus === "unmatched") unmatchedCount += 1;
    if (event.approvalStatus === "pending") pendingApprovalCount += 1;
  }

  return {
    cashAtBank,
    committedOutbound,
    available,
    userLiabilities,
    providerLiabilities: provider,
    freeCash,
    coverageStatus: coverage.status,
    coverageRatio: coverage.ratio,
    unmatchedCount,
    pendingApprovalCount,
  };
}

export function projectTreasuryStatement(
  events: TreasuryEvent[]
): TreasuryStatementRow[] {
  return events.map((event) => ({
    id: event.id,
    kind: event.kind,
    direction: event.direction,
    counterpartyName: event.counterparty?.name ?? null,
    amount: event.amount,
    approvalStatus: event.approvalStatus,
    reconciliationStatus: event.reconciliationStatus,
    reference: event.reference,
    description: event.description,
    createdAt: event.createdAt,
    settledAt: event.settledAt ?? null,
  }));
}

function matchesSearch(row: TreasuryStatementRow, term: string): boolean {
  const needle = term.toLowerCase();
  if (row.id.toLowerCase().includes(needle)) return true;
  if (row.reference.toLowerCase().includes(needle)) return true;
  if (row.description.toLowerCase().includes(needle)) return true;
  if (
    row.counterpartyName &&
    row.counterpartyName.toLowerCase().includes(needle)
  )
    return true;
  return false;
}

export function filterTreasuryEvents(
  rows: TreasuryStatementRow[],
  filters: TreasuryEventFilters
): TreasuryStatementRow[] {
  return rows.filter((row) => {
    if (filters.search && !matchesSearch(row, filters.search)) return false;
    if (filters.direction && row.direction !== filters.direction) return false;
    if (filters.kind && row.kind !== filters.kind) return false;
    if (filters.approvalStatus && row.approvalStatus !== filters.approvalStatus)
      return false;
    if (
      filters.reconciliationStatus &&
      row.reconciliationStatus !== filters.reconciliationStatus
    )
      return false;
    if (filters.dateFrom) {
      const fromMs = new Date(filters.dateFrom + "T00:00:00Z").getTime();
      if (new Date(row.createdAt).getTime() < fromMs) return false;
    }
    if (filters.dateTo) {
      const toMs = new Date(filters.dateTo + "T23:59:59Z").getTime();
      if (new Date(row.createdAt).getTime() > toMs) return false;
    }
    return true;
  });
}