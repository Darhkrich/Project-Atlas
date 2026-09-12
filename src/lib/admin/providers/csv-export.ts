import type {
  Provider,
  HealthCheckHistory,
  ProviderTransaction,
  ProviderAuditEntry,
} from "@/lib/admin/types/provider";
import {
  HEALTH_OUTCOME_LABEL,
  PROVIDER_CAPABILITY_LABEL,
  PROVIDER_PAYMENT_RAIL_LABEL,
  PROVIDER_STATUS_LABEL,
  PROVIDER_TYPE_LABEL,
  ROUTING_PRIORITY_LABEL,
  HEALTH_STATUS_LABEL,
} from "./constants";

function escape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function rowsToCsv(header: string[], rows: (string | number)[][]): string {
  return [header, ...rows].map((r) => r.map(escape).join(",")).join("\r\n");
}

/* ------------------------------ Providers ----------------------------- */

export function providersToCsv(providers: Provider[]): string {
  const header = [
    "id",
    "name",
    "code",
    "type",
    "status",
    "healthStatus",
    "country",
    "currency",
    "environment",
    "priority",
    "services",
    "capabilities",
    "successRate",
    "averageResponseTime",
    "transactionsToday",
    "balance",
    "slaTargetUptime",
    "slaTargetSuccessRate",
    "failoverEnabled",
    "failoverDestination",
    "lastHealthCheck",
  ];

  const rows = providers.map((p) => [
    p.id,
    p.name,
    p.code,
    PROVIDER_TYPE_LABEL[p.type],
    PROVIDER_STATUS_LABEL[p.status],
    HEALTH_STATUS_LABEL[p.healthStatus],
    p.country,
    p.currency,
    p.environment,
    ROUTING_PRIORITY_LABEL[p.priority],
    p.services.length,
    p.services
      .map((s) => PROVIDER_CAPABILITY_LABEL[s.capability])
      .join("|"),
    p.successRate,
    p.averageResponseTime,
    p.transactionCountToday,
    p.balance?.current ?? "",
    p.sla.targetUptime,
    p.sla.targetSuccessRate,
    p.failover.enabled ? "yes" : "no",
    p.failover.destinationProviderId ?? "",
    p.lastHealthCheck,
  ]);

  return rowsToCsv(header, rows);
}

/* --------------------------- Health history --------------------------- */

export function providerHealthHistoryToCsv(
  provider: Provider,
  history: HealthCheckHistory[]
): string {
  const header = [
    "timestamp",
    "provider",
    "outcome",
    "responseTime",
    "api",
    "auth",
    "latency",
    "routing",
  ];

  const rows = history.map((h) => [
    h.timestamp,
    provider.name,
    HEALTH_OUTCOME_LABEL[h.outcome],
    h.responseTime,
    h.details?.api ? HEALTH_OUTCOME_LABEL[h.details.api] : "",
    h.details?.auth ? HEALTH_OUTCOME_LABEL[h.details.auth] : "",
    h.details?.latency ? HEALTH_OUTCOME_LABEL[h.details.latency] : "",
    h.details?.routing ? HEALTH_OUTCOME_LABEL[h.details.routing] : "",
  ]);

  return rowsToCsv(header, rows);
}

/* --------------------------- Transactions ----------------------------- */

export function providerTransactionsToCsv(
  provider: Provider,
  transactions: ProviderTransaction[]
): string {
  const header = [
    "createdAt",
    "provider",
    "atlasTransactionId",
    "providerTransactionId",
    "service",
    "network",
    "customer",
    "amount",
    "providerStatus",
    "atlasStatus",
    "responseTime",
    "httpStatus",
    "providerCode",
    "message",
  ];

  const rows = transactions.map((t) => [
    t.createdAt,
    provider.name,
    t.atlasTransactionId,
    t.providerTransactionId ?? "",
    t.service,
    t.network ?? "",
    t.customer,
    t.amount,
    t.providerStatus,
    t.atlasStatus,
    t.responseTime,
    t.providerResponse?.httpStatus ?? "",
    t.providerResponse?.providerCode ?? "",
    t.providerResponse?.message ?? "",
  ]);

  return rowsToCsv(header, rows);
}

/* ------------------------------ Audit --------------------------------- */

export function providerAuditToCsv(
  provider: Provider,
  entries: ProviderAuditEntry[]
): string {
  const header = [
    "timestamp",
    "provider",
    "scope",
    "admin",
    "adminEmail",
    "action",
    "previousValue",
    "newValue",
    "reason",
  ];

  const rows = entries.map((e) => [
    e.timestamp,
    provider.name,
    e.scope,
    e.admin,
    e.adminEmail,
    e.action,
    e.previousValue ?? "",
    e.newValue ?? "",
    e.reason ?? "",
  ]);

  return rowsToCsv(header, rows);
}

/* --------------------------- Capability map --------------------------- */

export function providerServiceRowsToCsv(provider: Provider): string {
  const header = [
    "serviceId",
    "capability",
    "paymentRail",
    "network",
    "status",
    "routingPriority",
    "providerIdentifier",
    "settlementStatus",
    "feePercentage",
    "fixedFee",
  ];

  const rows = provider.services.map((s) => [
    s.id,
    PROVIDER_CAPABILITY_LABEL[s.capability],
    s.paymentRail ? PROVIDER_PAYMENT_RAIL_LABEL[s.paymentRail] : "",
    s.network ?? "",
    s.status,
    ROUTING_PRIORITY_LABEL[s.routingPriority],
    s.providerIdentifier ?? "",
    s.settlementStatus ?? "",
    s.feePercentage ?? "",
    s.fixedFee ?? "",
  ]);

  return rowsToCsv(header, rows);
}