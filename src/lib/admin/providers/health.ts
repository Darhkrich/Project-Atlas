import type {
  HealthCheckHistory,
  HealthCheckOutcome,
  Provider,
  ProviderAlert,
} from "@/lib/admin/types/provider";
import { PROVIDER_THRESHOLDS } from "./constants";
import { providerOperationalState } from "./state";

export interface HealthCheckRun {
  timestamp: string;
  outcome: HealthCheckOutcome;
  responseTime: number;
  details: {
    api: HealthCheckOutcome;
    auth: HealthCheckOutcome;
    latency: HealthCheckOutcome;
    routing: HealthCheckOutcome;
  };
}

export interface HealthCheckSummary {
  passed: number;
  warned: number;
  failed: number;
  skipped: number;
  total: number;
}

/**
 * Mock health check. Derives outcomes from provider state rather than
 * random, so the result is coherent with everything else on the page. When
 * a real endpoint exists, this is the only function that changes.
 */
export async function runProviderHealthCheck(
  provider: Provider
): Promise<HealthCheckRun> {
  const timestamp = new Date().toISOString();
  const state = providerOperationalState(provider);

  if (state.kind === "disabled" || state.kind === "maintenance") {
    return {
      timestamp,
      outcome: "skip",
      responseTime: 0,
      details: {
        api: "skip",
        auth: "skip",
        latency: "skip",
        routing: "skip",
      },
    };
  }

  const api: HealthCheckOutcome =
    provider.healthStatus === "critical"
      ? "fail"
      : provider.healthStatus === "unknown"
      ? "skip"
      : "pass";

  const auth: HealthCheckOutcome =
    provider.credentials.hasApiKey && provider.credentials.hasSecret
      ? "pass"
      : "fail";

  const latency: HealthCheckOutcome =
    provider.averageResponseTime === 0
      ? "fail"
      : provider.averageResponseTime < PROVIDER_THRESHOLDS.latencyHealthyMs
      ? "pass"
      : provider.averageResponseTime < PROVIDER_THRESHOLDS.latencyWarningMs
      ? "warn"
      : "fail";

  const routing: HealthCheckOutcome = provider.failover.enabled
    ? "pass"
    : provider.priority === "primary"
    ? "warn"
    : "pass";

  const outcome = worstOutcome([api, auth, latency, routing]);

  return {
    timestamp,
    outcome,
    responseTime: provider.averageResponseTime,
    details: { api, auth, latency, routing },
  };
}

export function healthCheckSummary(run: HealthCheckRun): HealthCheckSummary {
  const all = Object.values(run.details);
  return {
    passed: all.filter((o) => o === "pass").length,
    warned: all.filter((o) => o === "warn").length,
    failed: all.filter((o) => o === "fail").length,
    skipped: all.filter((o) => o === "skip").length,
    total: all.length,
  };
}

export function toHealthCheckHistory(
  run: HealthCheckRun,
  providerId: string
): Omit<HealthCheckHistory, "id"> {
  return {
    providerId,
    timestamp: run.timestamp,
    outcome: run.outcome,
    responseTime: run.responseTime,
    details: run.details,
  };
}

/**
 * Returns an alert if the run warrants one. The caller decides whether to
 * write it to the store.
 */
export function shouldAlert(
  provider: Provider,
  run: HealthCheckRun
): ProviderAlert | null {
  if (run.outcome === "pass" || run.outcome === "skip") return null;

  if (run.details.auth === "fail") {
    return {
      id: crypto.randomUUID(),
      providerId: provider.id,
      title: "Authentication failing",
      description: `${provider.name} rejected its stored credentials on the last check.`,
      severity: "critical",
      timestamp: run.timestamp,
      acknowledged: false,
    };
  }

  if (run.details.api === "fail") {
    return {
      id: crypto.randomUUID(),
      providerId: provider.id,
      title: "Connection failures detected",
      description: `${provider.name} did not respond to the API probe. Failure rate is ${(
        100 - provider.successRate
      ).toFixed(1)}%.`,
      severity: "critical",
      timestamp: run.timestamp,
      acknowledged: false,
    };
  }

  if (run.details.latency === "fail" || run.details.latency === "warn") {
    return {
      id: crypto.randomUUID(),
      providerId: provider.id,
      title: "Elevated latency",
      description: `Average response time is ${provider.averageResponseTime}ms (target ${provider.sla.targetLatencyMs}ms).`,
      severity: run.details.latency === "fail" ? "critical" : "warning",
      timestamp: run.timestamp,
      acknowledged: false,
    };
  }

  if (run.details.routing === "warn") {
    return {
      id: crypto.randomUUID(),
      providerId: provider.id,
      title: "No failover configured",
      description: `${provider.name} is a primary provider with failover disabled.`,
      severity: "warning",
      timestamp: run.timestamp,
      acknowledged: false,
    };
  }

  return null;
}

/* ------------------------------ Helpers ------------------------------- */

function worstOutcome(outcomes: HealthCheckOutcome[]): HealthCheckOutcome {
  if (outcomes.some((o) => o === "fail")) return "fail";
  if (outcomes.some((o) => o === "warn")) return "warn";
  if (outcomes.every((o) => o === "skip")) return "skip";
  return "pass";
}