import {
  getProviderPayoutBatches,
  getProviderPayoutBatchById,
  internalReplaceProviderPayoutBatch,
  notifyProviderPayoutStore,
} from "./provider-payout-store";
import {
  failProviderPayoutBatch,
  settleProviderPayoutBatch,
} from "./provider-payout-mutations";
import { PROVIDER_PAYOUT_SYSTEM_ACTOR } from "./provider-payout-system-actor";
import { rescheduleFireAtMs } from "./provider-response-simulator";
import type { ProviderPayoutBatch } from "./provider-payout-types";

const TICK_INTERVAL_MS = 1000;

let intervalHandle: ReturnType<typeof setInterval> | null = null;
let tickRefCount = 0;

function applyDueSimulations(nowMs: number): void {
  const listed = getProviderPayoutBatches();
  for (const snapshot of listed) {
    if (snapshot.status !== "approved") continue;
    if (!snapshot.simulationFiresAt) continue;
    const firesAt = new Date(snapshot.simulationFiresAt).getTime();
    if (!Number.isFinite(firesAt)) continue;
    if (firesAt > nowMs) continue;

    const batch = getProviderPayoutBatchById(snapshot.id);
    if (!batch) continue;
    if (batch.status !== "approved") continue;

    if (batch.simulationOutcome === "fail") {
      failProviderPayoutBatch(
        batch.id,
        "Simulated provider rejection. Automated mock outcome.",
        PROVIDER_PAYOUT_SYSTEM_ACTOR
      );
      continue;
    }

    if (
      batch.simulationOutcome === "delay" &&
      !batch.simulationRescheduled
    ) {
      const next: ProviderPayoutBatch = {
        ...batch,
        simulationRescheduled: true,
        simulationFiresAt: new Date(
          rescheduleFireAtMs(nowMs)
        ).toISOString(),
      };
      if (internalReplaceProviderPayoutBatch(batch.id, next)) {
        notifyProviderPayoutStore();
      }
      continue;
    }

    settleProviderPayoutBatch(batch.id, PROVIDER_PAYOUT_SYSTEM_ACTOR);
  }
}

export function startProviderResponseTick(): () => void {
  if (typeof window === "undefined") return () => {};
  if (process.env.NODE_ENV === "production") return () => {};

  tickRefCount += 1;

  if (intervalHandle === null) {
    intervalHandle = setInterval(() => {
      try {
        applyDueSimulations(Date.now());
      } catch {
        // never break the loop on a single failure.
      }
    }, TICK_INTERVAL_MS);
  }

  let released = false;
  return () => {
    if (released) return;
    released = true;
    tickRefCount = Math.max(0, tickRefCount - 1);
    if (tickRefCount === 0 && intervalHandle !== null) {
      clearInterval(intervalHandle);
      intervalHandle = null;
    }
  };
}

export function stopProviderResponseTick(): void {
  if (intervalHandle !== null) {
    clearInterval(intervalHandle);
    intervalHandle = null;
  }
  tickRefCount = 0;
}