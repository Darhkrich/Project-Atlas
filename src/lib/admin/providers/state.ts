import type {
  Provider,
  ProviderService,
} from "@/lib/admin/types/provider";
import {
  HEALTH_STATUS_LABEL,
  PROVIDER_STATUS_LABEL,
  PROVIDER_THRESHOLDS,
  type BadgeVariant,
} from "./constants";

/**
 * One composed view of a provider's condition. Every component reads this
 * instead of reaching into status or healthStatus separately. Status says
 * whether the provider is eligible for routing. Health says whether it is
 * working. The composition is the actual answer to "what is this provider
 * doing right now."
 */
export type OperationalKind =
  | "live"
  | "impaired"
  | "down"
  | "disabled"
  | "maintenance"
  | "unknown";

export type OperationalSeverity = "ok" | "warning" | "danger" | "paused" | "info";

export interface OperationalState {
  kind: OperationalKind;
  label: string;
  severity: OperationalSeverity;
  headline: string;
  dotClass: string;
  badgeVariant: BadgeVariant;
}

/* ------------------------------ Compose ------------------------------- */

export function providerOperationalState(
  provider: Provider
): OperationalState {
  if (provider.status === "disabled") {
    return {
      kind: "disabled",
      label: PROVIDER_STATUS_LABEL.disabled,
      severity: "paused",
      headline: "Removed from routing by an admin",
      dotClass: "bg-neutral-400",
      badgeVariant: "neutral",
    };
  }

  if (provider.status === "maintenance") {
    const until = provider.maintenanceUntil
      ? ` until ${formatShortDate(provider.maintenanceUntil)}`
      : "";
    return {
      kind: "maintenance",
      label: PROVIDER_STATUS_LABEL.maintenance,
      severity: "paused",
      headline: `Scheduled maintenance${until}`,
      dotClass: "bg-info-500",
      badgeVariant: "info",
    };
  }

  if (provider.healthStatus === "unknown") {
    return {
      kind: "unknown",
      label: HEALTH_STATUS_LABEL.unknown,
      severity: "info",
      headline: "Never health checked",
      dotClass: "bg-neutral-400",
      badgeVariant: "neutral",
    };
  }

  if (provider.healthStatus === "critical") {
    return {
      kind: "down",
      label: HEALTH_STATUS_LABEL.critical,
      severity: "danger",
      headline: "Enabled but unreachable",
      dotClass: "bg-danger-500",
      badgeVariant: "danger",
    };
  }

  if (provider.healthStatus === "warning") {
    return {
      kind: "impaired",
      label: HEALTH_STATUS_LABEL.warning,
      severity: "warning",
      headline: "Serving traffic with degraded health",
      dotClass: "bg-warning-500",
      badgeVariant: "warning",
    };
  }

  return {
    kind: "live",
    label: HEALTH_STATUS_LABEL.healthy,
    severity: "ok",
    headline: "Serving traffic normally",
    dotClass: "bg-success-500",
    badgeVariant: "success",
  };
}

/* ------------------------------ Derived ------------------------------- */

export function isProviderRouting(state: OperationalState): boolean {
  return state.kind === "live" || state.kind === "impaired" || state.kind === "down";
}

export function isProviderPaused(state: OperationalState): boolean {
  return state.kind === "disabled" || state.kind === "maintenance";
}

export function isProviderAtRisk(state: OperationalState): boolean {
  return state.kind === "impaired" || state.kind === "down";
}

/**
 * Per-service outcome. A service inherits the provider's operational state
 * unless the service itself is disabled. When per-service health checks
 * become real, this is the seam where they plug in.
 */
export function serviceOperationalState(
  provider: Provider,
  service: ProviderService
): OperationalState {
  if (service.status === "disabled") {
    return {
      kind: "disabled",
      label: "Disabled",
      severity: "paused",
      headline: "Service is disabled for this provider",
      dotClass: "bg-neutral-400",
      badgeVariant: "neutral",
    };
  }
  return providerOperationalState(provider);
}

/* ------------------------------ Balance ------------------------------- */

export interface BalanceState {
  kind: "ok" | "low" | "critical";
  label: string;
  dotClass: string;
  badgeVariant: BadgeVariant;
}

export function providerBalanceState(provider: Provider): BalanceState | null {
  if (!provider.balance) return null;
  const { current, minimumThreshold, criticalThreshold } = provider.balance;

  if (current < criticalThreshold) {
    return {
      kind: "critical",
      label: "Critical",
      dotClass: "bg-danger-500",
      badgeVariant: "danger",
    };
  }
  if (current < minimumThreshold) {
    return {
      kind: "low",
      label: "Low",
      dotClass: "bg-warning-500",
      badgeVariant: "warning",
    };
  }
  return {
    kind: "ok",
    label: "Healthy",
    dotClass: "bg-success-500",
    badgeVariant: "success",
  };
}

/* ------------------------------ SLA ----------------------------------- */

export interface SLAStatus {
  uptime: { target: number; actual: number; met: boolean };
  latency: { target: number; actual: number; met: boolean };
  successRate: { target: number; actual: number; met: boolean };
}

export function providerSLAStatus(provider: Provider): SLAStatus {
  return {
    uptime: {
      target: provider.sla.targetUptime,
      actual: provider.successRate,
      met: provider.successRate >= provider.sla.targetUptime,
    },
    latency: {
      target: provider.sla.targetLatencyMs,
      actual: provider.averageResponseTime,
      met: provider.averageResponseTime <= provider.sla.targetLatencyMs,
    },
    successRate: {
      target: provider.sla.targetSuccessRate,
      actual: provider.successRate,
      met: provider.successRate >= provider.sla.targetSuccessRate,
    },
  };
}

/* ------------------------------ Credentials --------------------------- */

export function credentialRotationDue(provider: Provider): boolean {
  if (!provider.lastCredentialRotation) return true;
  const days =
    (Date.now() - new Date(provider.lastCredentialRotation).getTime()) /
    (1000 * 60 * 60 * 24);
  return days >= PROVIDER_THRESHOLDS.credentialRotationDueDays;
}

/* ------------------------------ Helpers ------------------------------- */

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}