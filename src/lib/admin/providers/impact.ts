import type {
  Provider,
  ProviderService,
} from "@/lib/admin/types/provider";
import type { Plan, ServiceCategory } from "@/lib/services-page-data";
import { PROVIDER_THRESHOLDS } from "./constants";
import { providerBalanceState, providerOperationalState } from "./state";

export interface AffectedPlan {
  plan: Plan;
  capability: ProviderService["capability"];
  network?: string;
  categoryName: string;
}

export interface ProviderImpact {
  services: ProviderService[];
  plans: AffectedPlan[];
  planCount: number;
  serviceCount: number;
  transactionVolumeToday: number;
}

/**
 * Which plans in the source catalog depend on this provider. Matches on
 * capability and network. Exam-result plans carry no network so they match
 * on capability alone.
 */
export function affectedPlans(
  provider: Provider,
  catalog: ServiceCategory[]
): AffectedPlan[] {
  const out: AffectedPlan[] = [];
  for (const service of provider.services) {
    const source = catalog.find((c) => c.id === serviceCapabilityToCatalogId(service.capability));
    if (!source) continue;
    const tree = source.formConfig?.networkPlanCategories;

    if (tree && service.network) {
      const cats = tree[service.network];
      if (!cats) continue;
      for (const cat of cats) {
        for (const plan of cat.plans) {
          out.push({
            plan,
            capability: service.capability,
            network: service.network,
            categoryName: cat.name,
          });
        }
      }
      continue;
    }

    const flat = source.formConfig?.plans ?? [];
    for (const plan of flat) {
      out.push({
        plan,
        capability: service.capability,
        categoryName: source.name,
      });
    }
  }
  return out;
}

export function providerImpact(
  provider: Provider,
  catalog: ServiceCategory[]
): ProviderImpact {
  const plans = affectedPlans(provider, catalog);
  return {
    services: provider.services,
    plans,
    planCount: plans.length,
    serviceCount: provider.services.length,
    transactionVolumeToday: provider.transactionCountToday,
  };
}

/**
 * Given a hypothetical provider cost rise, which plans go from healthy to
 * tight margin. Reads providerCost off the plan and compares bands.
 */
export interface CostRiseImpact {
  planId: string;
  planName: string;
  currentMarginPercent: number | null;
  projectedMarginPercent: number | null;
  band: "healthy" | "ok" | "tight" | "critical" | "unknown";
}

export function providerCostRiseImpact(
  provider: Provider,
  catalog: ServiceCategory[],
  risePercent: number
): CostRiseImpact[] {
  const plans = affectedPlans(provider, catalog);
  return plans.map(({ plan }) => {
    if (plan.providerCost === undefined || plan.price <= 0) {
      return {
        planId: plan.id,
        planName: plan.name,
        currentMarginPercent: null,
        projectedMarginPercent: null,
        band: "unknown",
      };
    }
    const current = ((plan.price - plan.providerCost) / plan.price) * 100;
    const newCost = plan.providerCost * (1 + risePercent / 100);
    const projected = ((plan.price - newCost) / plan.price) * 100;
    return {
      planId: plan.id,
      planName: plan.name,
      currentMarginPercent: current,
      projectedMarginPercent: projected,
      band: bandFor(projected),
    };
  });
}

/* ------------------------------ Failover ------------------------------ */

export interface FailoverStep {
  providerId: string;
  providerName: string;
  status: string;
  isDead: boolean;
}

export function failoverChain(
  provider: Provider,
  allProviders: Provider[]
): FailoverStep[] {
  const steps: FailoverStep[] = [];
  let current: Provider | undefined = provider;
  const seen = new Set<string>();

  while (current && !seen.has(current.id)) {
    seen.add(current.id);
    const state = providerOperationalState(current);
    steps.push({
      providerId: current.id,
      providerName: current.name,
      status: state.label,
      isDead: state.kind === "down" || state.kind === "disabled",
    });
    const nextId: string | undefined = current.failover.destinationProviderId;
    current = nextId ? allProviders.find((p) => p.id === nextId) : undefined;
  }

  return steps;
}

/* ------------------------------ Risk ---------------------------------- */

export interface ProviderRiskSummary {
  atRisk: boolean;
  reasons: string[];
}

export function providerRiskSummary(provider: Provider): ProviderRiskSummary {
  const reasons: string[] = [];
  const state = providerOperationalState(provider);
  const balance = providerBalanceState(provider);

  if (state.kind === "down") reasons.push("Provider is unreachable");
  if (state.kind === "impaired") reasons.push("Provider is degraded");
  if (balance && balance.kind === "critical") reasons.push("Balance is critically low");
  else if (balance && balance.kind === "low") reasons.push("Balance is below minimum");
  if (provider.priority === "primary" && !provider.failover.enabled) {
    reasons.push("Primary provider with no failover");
  }
  if (
    provider.successRate < PROVIDER_THRESHOLDS.successRateWarning &&
    state.kind === "live"
  ) {
    reasons.push("Success rate below healthy threshold");
  }

  return {
    atRisk: reasons.length > 0,
    reasons,
  };
}

/* ------------------------------ Helpers ------------------------------- */

function serviceCapabilityToCatalogId(
  capability: ProviderService["capability"]
): string {
  switch (capability) {
    case "airtime":
      return "airtime";
    case "data":
      return "data";
    case "bills":
      return "billpayments";
    case "tv":
      return "cabletv";
    case "results":
      return "exampins";
    default:
      return "";
  }
}

function bandFor(
  percent: number
): "healthy" | "ok" | "tight" | "critical" {
  if (percent >= 15) return "healthy";
  if (percent >= 10) return "ok";
  if (percent >= 5) return "tight";
  return "critical";
}