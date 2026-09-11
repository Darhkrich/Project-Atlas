export type ProviderStatus = "active" | "degraded" | "offline" | "disabled" | "maintenance";
export type ProviderType = "api" | "aggregator" | "direct" | "internal" | "manual" | "payment";
export type ProviderServiceCategory = 
  | "airtime" 
  | "data" 
  | "bills" 
  | "tv" 
  | "results" 
  | "other"
  | "mobile_money"
  | "card_payment"
  | "bank_transfer"
  | "ussd"
  | "wallet";

export type RoutingPriority = "primary" | "secondary" | "fallback";

export interface ProviderService {
  id: string;
  serviceCategory: ProviderServiceCategory;
  network?: string;
  status: "enabled" | "disabled";
  routingPriority: RoutingPriority;
  providerIdentifier?: string;
  settlementStatus?: "pending" | "settled" | "failed";
  feePercentage?: number;
  fixedFee?: number;
}

export interface Provider {
  id: string;
  name: string;
  code: string;
  type: ProviderType;
  status: ProviderStatus;
  country: string;
  currency: string;
  baseUrl?: string;
  apiVersion?: string;
  environment: "production" | "sandbox";
  priority: RoutingPriority;
  enabled: boolean;
  maintenanceMode: boolean;
  healthStatus: "healthy" | "warning" | "critical";
  lastHealthCheck: string;
  lastSuccessfulRequest?: string;
  lastFailedRequest?: string;
  averageResponseTime: number;
  successRate: number;
  transactionCountToday: number;
  services: ProviderService[];
  credentials: {
    apiKey: string;
    secret: string;
    accountId: string;
  };
  configuration: {
    timeout: number;
    retryAttempts: number;
    healthCheckInterval: number;
    webhookEnabled: boolean;
    statusPollingEnabled: boolean;
  };
  failover: {
    enabled: boolean;
    triggerFailureRate: number;
    triggerResponseTime: number;
    triggerConsecutiveFailures: number;
    destinationProviderId?: string;
  };
  balance?: {
    current: number;
    minimumThreshold: number;
    criticalThreshold: number;
  };
  paymentSpecific?: {
    settlementMethod?: string;
    merchantAccount?: string;
    supportedCurrencies?: string[];
  };
}

export interface HealthCheckHistory {
  id: string;
  timestamp: string;
  result: "healthy" | "warning" | "failed";
  responseTime: number;
}

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

export interface AuditEntry {
  id: string;
  admin: string;
  action: string;
  timestamp: string;
  previousValue?: string;
  newValue?: string;
  reason?: string;
}


export interface ProviderService {
  // existing fields
  healthStatus?: "healthy" | "warning" | "critical";
}