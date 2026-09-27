import type { ServiceCategory } from "@/lib/domains/catalog";
import { allPlansFor } from "@/lib/domains/catalog";
import {
  getPeriodIdFromIso,
  getPeriodRange,
} from "./period-projection";
import type {
  PayoutOrderInput,
  ProviderPayoutLine,
  ProviderPayoutPreview,
  TreasuryPeriodId,
} from "./provider-payout-types";

interface PlanLookup {
  planId: string;
  planName: string;
  providerCost: number | undefined;
  providerCostInferred: boolean;
}

function buildPlanLookup(catalog: ServiceCategory[]): Map<string, PlanLookup> {
  const map = new Map<string, PlanLookup>();
  for (const cat of catalog) {
    for (const plan of allPlansFor(cat)) {
      map.set(plan.id, {
        planId: plan.id,
        planName: cat.name + " " + plan.name,
        providerCost: plan.providerCost,
        providerCostInferred: plan.providerCostInferred === true,
      });
    }
  }
  return map;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function projectProviderPayoutPreviewForPeriod(input: {
  periodId: TreasuryPeriodId;
  orders: PayoutOrderInput[];
  catalog: ServiceCategory[];
  providerNameById: Map<string, string>;
}): ProviderPayoutPreview[] {
  const range = getPeriodRange(input.periodId);
  const plans = buildPlanLookup(input.catalog);

  const byProvider = new Map<
    string,
    {
      lines: Map<string, ProviderPayoutLine>;
      totalAmount: number;
      orderCount: number;
      excludedOrderCount: number;
    }
  >();

  for (const order of input.orders) {
    const t = new Date(order.createdAt).getTime();
    if (Number.isNaN(t)) continue;
    if (t < range.startMs || t >= range.endMs) continue;

    const plan = plans.get(order.serviceId);
    if (!plan) continue;
    if (plan.providerCost === undefined) continue;

    let providerBucket = byProvider.get(order.providerId);
    if (!providerBucket) {
      providerBucket = {
        lines: new Map(),
        totalAmount: 0,
        orderCount: 0,
        excludedOrderCount: 0,
      };
      byProvider.set(order.providerId, providerBucket);
    }

    const lineId = order.providerId + ":" + plan.planId;
    let line = providerBucket.lines.get(lineId);
    if (!line) {
      line = {
        id: lineId,
        planId: plan.planId,
        planName: plan.planName,
        orderCount: 0,
        amount: 0,
        excludedOrderCount: 0,
      };
      providerBucket.lines.set(lineId, line);
    }

    line.orderCount += 1;

    if (plan.providerCostInferred) {
      line.excludedOrderCount += 1;
      providerBucket.excludedOrderCount += 1;
    } else {
      line.amount = round2(line.amount + plan.providerCost);
      providerBucket.totalAmount = round2(
        providerBucket.totalAmount + plan.providerCost
      );
      providerBucket.orderCount += 1;
    }
  }

  const previews: ProviderPayoutPreview[] = [];
  for (const [providerId, bucket] of byProvider.entries()) {
    previews.push({
      providerId,
      providerName: input.providerNameById.get(providerId) ?? providerId,
      lines: Array.from(bucket.lines.values()).sort((a, b) =>
        a.planName.localeCompare(b.planName)
      ),
      totalAmount: bucket.totalAmount,
      orderCount: bucket.orderCount,
      excludedOrderCount: bucket.excludedOrderCount,
    });
  }

  previews.sort((a, b) => b.totalAmount - a.totalAmount);
  return previews;
}

export function periodIdForBatch(iso: string): TreasuryPeriodId {
  return getPeriodIdFromIso(iso);
}