// lib/admin/support/provider-health.ts

import {
  getProviderById,
  getProviders,
} from "@/lib/admin/mock/providers-store";
import type { DigitalTransactionLink } from "@/lib/admin/types/support";

export interface ProviderHealthView {
  id: string;
  name: string;
  healthStatus: "healthy" | "warning" | "critical" | "unknown";
  status: string;
  averageResponseTime: number;
  successRate: number;
}

/**
 * Reads live provider state from the store. Edits made on the Providers
 * page are visible here immediately.
 */
export function getProviderHealth(
  providerId: string
): ProviderHealthView | null {
  const p = getProviderById(providerId);
  if (!p) return null;

  return {
    id: p.id,
    name: p.name,
    healthStatus: p.healthStatus,
    status: p.status,
    averageResponseTime: p.averageResponseTime,
    successRate: p.successRate,
  };
}

/**
 * Convenience read for callers that need every provider's health at once,
 * e.g. counting degraded providers on the Support page.
 */
export function getAllProviderHealth(): ProviderHealthView[] {
  return getProviders().map((p) => ({
    id: p.id,
    name: p.name,
    healthStatus: p.healthStatus,
    status: p.status,
    averageResponseTime: p.averageResponseTime,
    successRate: p.successRate,
  }));
}

export function providerHealthTone(
  status: ProviderHealthView["healthStatus"]
): "success" | "warning" | "danger" {
  if (status === "healthy") return "success";
  if (status === "unknown") return "warning";
  if (status === "warning") return "warning";
  return "danger";
}

export function countRelatedTickets(
  conversations: { linkedEntity?: unknown; status: string }[],
  entity: DigitalTransactionLink
): number {
  return conversations.filter((c) => {
    const e = c.linkedEntity as DigitalTransactionLink | undefined;
    if (!e || e.kind !== "digital_transaction") return false;
    if (e.providerId !== entity.providerId) return false;
    if (e.serviceCategory !== entity.serviceCategory) return false;
    return c.status === "open" || c.status === "pending";
  }).length;
}