// lib/domains/treasury/period-store.ts
//
// Closed-period store. Holds period close records. Separate from the
// treasury event store so period closes are a distinct concept.
//
// Seed ships exactly one close: the period immediately before the most
// recent treasury event's period. Snapshot is derived from the treasury
// events in that range, not fabricated.

import type {
  PeriodClose,
  PeriodCloseSnapshot,
  TreasuryPeriodId,
} from "./period-types";
import { getTreasuryEvents } from "./store";
import { projectTreasurySummary } from "./projection";
import { computeTotalLiabilities } from "./liabilities";
import {
  getPeriodIdFromIso,
  getPeriodRange,
  getPreviousPeriodId,
} from "./period-projection";

type Listener = () => void;

let closes: PeriodClose[] | null = null;
const listeners = new Set<Listener>();

function buildSnapshotFor(
  periodId: TreasuryPeriodId
): { snapshot: PeriodCloseSnapshot; eventCount: number } {
  const range = getPeriodRange(periodId);
  const allEvents = getTreasuryEvents();
  const inPeriod = allEvents.filter((e) => {
    const t = new Date(e.createdAt).getTime();
    return t >= range.startMs && t < range.endMs;
  });

  let liabilities = 0;
  try {
    liabilities = computeTotalLiabilities();
  } catch {
    liabilities = 0;
  }

  const summary = projectTreasurySummary(inPeriod, liabilities);

  return {
    eventCount: inPeriod.length,
    snapshot: {
      cashAtBank: summary.cashAtBank,
      committedOutbound: summary.committedOutbound,
      available: summary.available,
      userLiabilities: summary.userLiabilities,
      freeCash: summary.freeCash,
      coverageStatus: summary.coverageStatus,
      coverageRatio: summary.coverageRatio,
      eventCount: inPeriod.length,
      unmatchedCount: summary.unmatchedCount,
    },
  };
}

function buildSeed(): PeriodClose[] {
  const events = getTreasuryEvents();
  if (events.length === 0) return [];

  let latestIso = events[0].createdAt;
  let latestMs = new Date(latestIso).getTime();
  for (const e of events) {
    const t = new Date(e.createdAt).getTime();
    if (t > latestMs) {
      latestMs = t;
      latestIso = e.createdAt;
    }
  }

  const latestPeriodId = getPeriodIdFromIso(latestIso);
  const priorPeriodId = getPreviousPeriodId(latestPeriodId);

  const { snapshot, eventCount } = buildSnapshotFor(priorPeriodId);
  if (eventCount === 0) return [];

  const range = getPeriodRange(priorPeriodId);

  const close: PeriodClose = {
    id: "PC-" + priorPeriodId,
    periodId: priorPeriodId,
    openedAt: new Date(range.startMs).toISOString(),
    closedAt: new Date(range.endMs).toISOString(),
    closedBy: {
      id: "ADM-003",
      name: "Finance Admin",
      email: "finance@atlas.com",
    },
    snapshot,
    unmatchedCountAtClose: snapshot.unmatchedCount,
    notes: "Seeded close for demonstration.",
  };

  return [close];
}

function ensureLoaded(): PeriodClose[] {
  if (closes === null) closes = buildSeed();
  return closes;
}

export function getPeriodCloses(): PeriodClose[] {
  return [...ensureLoaded()];
}

export function getPeriodCloseById(
  periodId: TreasuryPeriodId
): PeriodClose | undefined {
  return ensureLoaded().find((c) => c.periodId === periodId);
}

export function subscribeToPeriodStore(listener: Listener): () => void {
  ensureLoaded();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function notifyPeriodStore(): void {
  listeners.forEach((l) => l());
}

export function isPeriodStoreLoaded(): boolean {
  return closes !== null;
}

export function resetPeriodStoreForTest(): void {
  closes = buildSeed();
  notifyPeriodStore();
}

export function internalAppendPeriodClose(close: PeriodClose): PeriodClose {
  const list = ensureLoaded();
  closes = [close, ...list];
  notifyPeriodStore();
  return close;
}