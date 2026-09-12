// lib/admin/services/audit.ts

import type { CurrentAdmin } from "@/lib/admin/rbac";

export interface ServiceAuditEntry {
  id: string;
  serviceId: string;
  serviceName: string;
  timestamp: string;
  adminEmail: string;
  adminName: string;
  action: string;
  summary: string;
}

export interface BuildServiceAuditInput {
  admin: CurrentAdmin;
  serviceId: string;
  serviceName: string;
  action: string;
  summary: string;
}

export function buildServiceAuditEntry(
  input: BuildServiceAuditInput
): ServiceAuditEntry {
  return {
    id: crypto.randomUUID(),
    serviceId: input.serviceId,
    serviceName: input.serviceName,
    timestamp: new Date().toISOString(),
    adminEmail: input.admin.email,
    adminName: input.admin.name,
    action: input.action,
    summary: input.summary,
  };
}

const now = Date.now();
const hr = (n: number) => new Date(now - n * 3_600_000).toISOString();
const day = (n: number) => new Date(now - n * 86_400_000).toISOString();

export const mockServicesAudit: ServiceAuditEntry[] = [
  {
    id: "SVC-AUD-1001",
    serviceId: "airtime",
    serviceName: "Airtime",
    timestamp: hr(3),
    adminEmail: "yaw.mensah@atlas.com",
    adminName: "Yaw Mensah",
    action: "Updated",
    summary: "Raised custom amount ceiling from GHS 500 to GHS 1,000",
  },
  {
    id: "SVC-AUD-1002",
    serviceId: "data",
    serviceName: "Data",
    timestamp: hr(18),
    adminEmail: "efua.owusu@atlas.com",
    adminName: "Efua Owusu",
    action: "Updated",
    summary: "Added MTN 20GB (30 days) plan at GHS 80",
  },
  {
    id: "SVC-AUD-1003",
    serviceId: "cabletv",
    serviceName: "Cable TV",
    timestamp: day(1),
    adminEmail: "efua.owusu@atlas.com",
    adminName: "Efua Owusu",
    action: "Updated",
    summary: "Corrected DSTV Compact price to GHS 150",
  },
  {
    id: "SVC-AUD-1004",
    serviceId: "internet",
    serviceName: "Internet",
    timestamp: day(3),
    adminEmail: "yaw.mensah@atlas.com",
    adminName: "Yaw Mensah",
    action: "Status change",
    summary: "Marked as Coming Soon: awaiting Surfline partnership contract",
  },
  {
    id: "SVC-AUD-1005",
    serviceId: "exampins",
    serviceName: "Exam Pins",
    timestamp: day(6),
    adminEmail: "yaw.mensah@atlas.com",
    adminName: "Yaw Mensah",
    action: "Updated",
    summary: "Added WAEC 2025 and JAMB 2025 plans at GHS 20 and GHS 25",
  },
];

export function auditFor(
  entries: ServiceAuditEntry[],
  serviceId: string
): ServiceAuditEntry[] {
  return entries
    .filter((entry) => entry.serviceId === serviceId)
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
}