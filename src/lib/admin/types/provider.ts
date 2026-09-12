/* ------------------------------ Status -------------------------------- */

/**
 * Administrative intent. Only admin actions change this. Routing reads
 * status to decide whether a provider is eligible to receive traffic.
 */
export type ProviderStatus = "enabled" | "disabled" | "maintenance";

/**
 * Observed runtime signal. Only health checks change this. Never gates
 * routing; it is a display and alerting input.
 */
export type ProviderHealthStatus =
  | "healthy"
  | "warning"
  | "critical"
  | "unknown";

export type ProviderType =
  | "api"
  | "aggregator"
  | "direct"
  | "internal"
  | "manual"
  | "payment";

/**
 * What a provider sells. Distinct from ProviderPaymentRail, which is how
 * the money moves.
 */
export type ProviderCapability =
  | "airtime"
  | "data"
  | "bills"
  | "tv"
  | "results"
  | "other";

export type ProviderPaymentRail =
  | "mobile_money"
  | "card_payment"
  | "bank_transfer"
  | "ussd"
  | "wallet";

export type RoutingPriority = "primary" | "secondary" | "fallback";

export type HealthCheckOutcome = "pass" | "warn" | "fail" | "skip";

export type SettlementStatus = "pending" | "settled" | "failed";

export type AlertSeverity = "warning" | "critical";

export type ProviderEnvironment = "production" | "sandbox";

/* ------------------------------ Service ------------------------------- */

export interface ProviderService {
  id: string;
  capability: ProviderCapability;
  paymentRail?: ProviderPaymentRail;
  network?: string;
  status: "enabled" | "disabled";
  routingPriority: RoutingPriority;
  providerIdentifier?: string;
  settlementStatus?: SettlementStatus;
  feePercentage?: number;
  fixedFee?: number;
}

/* ------------------------------ Credentials --------------------------- */

/**
 * Credential values are never stored on the client. Only presence and
 * rotation metadata are exposed. Write-only pattern, matching Settings.
 */
export interface ProviderCredentials {
  hasApiKey: boolean;
  hasSecret: boolean;
  accountId: string;
  lastRotatedAt?: string;
}

/* ------------------------------ Configuration ------------------------- */

export interface ProviderConfiguration {
  timeout: number;
  retryAttempts: number;
  healthCheckInterval: number;
  webhookEnabled: boolean;
  statusPollingEnabled: boolean;
}

/* ------------------------------ Failover ------------------------------ */

export interface ProviderFailover {
  enabled: boolean;
  triggerFailureRate: number;
  triggerResponseTime: number;
  triggerConsecutiveFailures: number;
  destinationProviderId?: string;
}

/* ------------------------------ SLA ----------------------------------- */

export interface ProviderSLA {
  targetUptime: number;
  targetLatencyMs: number;
  targetSuccessRate: number;
}

/* ------------------------------ Balance ------------------------------- */

export interface ProviderBalance {
  current: number;
  minimumThreshold: number;
  criticalThreshold: number;
}

/* ------------------------------ Payment ------------------------------- */

export interface ProviderPaymentInfo {
  settlementMethod?: string;
  merchantAccount?: string;
  supportedCurrencies?: string[];
}

/* ------------------------------ Provider ------------------------------ */

export interface Provider {
  id: string;
  name: string;
  code: string;
  type: ProviderType;
  status: ProviderStatus;
  healthStatus: ProviderHealthStatus;
  country: string;
  currency: string;
  baseUrl?: string;
  apiVersion?: string;
  environment: ProviderEnvironment;
  priority: RoutingPriority;
  maintenanceUntil?: string;
  maintenanceReason?: string;
  createdAt: string;
  updatedAt: string;
  lastCredentialRotation?: string;
  lastHealthCheck: string;
  lastSuccessfulRequest?: string;
  lastFailedRequest?: string;
  averageResponseTime: number;
  successRate: number;
  transactionCountToday: number;
  services: ProviderService[];
  credentials: ProviderCredentials;
  configuration: ProviderConfiguration;
  failover: ProviderFailover;
  sla: ProviderSLA;
  balance?: ProviderBalance;
  paymentSpecific?: ProviderPaymentInfo;
}

/* ------------------------------ History ------------------------------- */

export interface HealthCheckHistory {
  id: string;
  providerId: string;
  timestamp: string;
  outcome: HealthCheckOutcome;
  responseTime: number;
  details?: {
    api?: HealthCheckOutcome;
    auth?: HealthCheckOutcome;
    latency?: HealthCheckOutcome;
    routing?: HealthCheckOutcome;
  };
}

/* ------------------------------ Transaction --------------------------- */

export interface ProviderTransaction {
  id: string;
  providerId: string;
  atlasTransactionId: string;
  providerTransactionId?: string;
  service: string;
  network?: string;
  customer: string;
  amount: number;
  providerStatus: string;
  atlasStatus: string;
  responseTime: number;
  createdAt: string;
  providerResponse?: {
    httpStatus: number;
    providerCode: string;
    message: string;
  };
}

/* ------------------------------ Audit --------------------------------- */

export type ProviderAuditScope =
  | "provider"
  | "service"
  | "routing"
  | "credentials"
  | "configuration";

export interface ProviderAuditEntry {
  id: string;
  providerId: string;
  scope: ProviderAuditScope;
  admin: string;
  adminEmail: string;
  action: string;
  timestamp: string;
  previousValue?: string;
  newValue?: string;
  reason?: string;
}

/* ------------------------------ Alert --------------------------------- */

export interface ProviderAlert {
  id: string;
  providerId: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  timestamp: string;
  acknowledged: boolean;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
}

/* ------------------------------ Activity ------------------------------ */

export type ActivityEventType =
  | "health_check"
  | "transaction"
  | "config_change"
  | "credential_event"
  | "routing_change";

export interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  title: string;
  description?: string;
  timestamp: string;
  status: "success" | "warning" | "danger" | "info";
  actor?: string;
}