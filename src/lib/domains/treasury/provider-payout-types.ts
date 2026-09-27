import type { TreasuryActor } from "./types";
import type { TreasuryPeriodId } from "./period-types";

export type ProviderPayoutStatus =
  | "draft"
  | "pending_approval"
  | "approved"
  | "settled"
  | "cancelled"
  | "failed";

export type ProviderPayoutSimulationOutcome = "settle" | "delay" | "fail";

export interface ProviderPayoutLine {
  id: string;
  planId: string;
  planName: string;
  orderCount: number;
  amount: number;
  excludedOrderCount: number;
}

export interface ProviderPayoutBatch {
  id: string;
  periodId: string;
  providerId: string;
  providerName: string;
  status: ProviderPayoutStatus;
  lines: ProviderPayoutLine[];
  totalAmount: number;
  orderCount: number;
  excludedOrderCount: number;
  createdBy: TreasuryActor;
  createdAt: string;
  submittedBy?: TreasuryActor;
  submittedAt?: string;
  approvedBy?: TreasuryActor;
  approvedAt?: string;
  settledBy?: TreasuryActor;
  settledAt?: string;
  treasuryEventId?: string;
  cancelledBy?: TreasuryActor;
  cancelledAt?: string;
  cancelReason?: string;
  failedBy?: TreasuryActor;
  failedAt?: string;
  failureReason?: string;
  notes?: string;
  simulationOutcome?: ProviderPayoutSimulationOutcome;
  simulationFiresAt?: string;
  simulationRescheduled?: boolean;
}

export interface PayoutOrderInput {
  providerId: string;
  serviceId: string;
  createdAt: string;
}

export interface ProviderPayoutPreview {
  providerId: string;
  providerName: string;
  lines: ProviderPayoutLine[];
  totalAmount: number;
  orderCount: number;
  excludedOrderCount: number;
}

export type { TreasuryPeriodId };