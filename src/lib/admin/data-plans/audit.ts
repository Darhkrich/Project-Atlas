import type { CurrentAdmin } from "@/lib/admin/rbac";

export type DataPlanAuditScope = "network" | "category" | "plan";

export interface DataPlanAuditEntry {
  id: string;
  scope: DataPlanAuditScope;
  scopeId: string;
  scopeName: string;
  networkName: string;
  timestamp: string;
  adminEmail: string;
  adminName: string;
  action: string;
  summary: string;
}

export interface BuildDataPlanAuditInput {
  admin: CurrentAdmin;
  scope: DataPlanAuditScope;
  scopeId: string;
  scopeName: string;
  networkName: string;
  action: string;
  summary: string;
}

export function buildDataPlanAuditEntry(
  input: BuildDataPlanAuditInput
): DataPlanAuditEntry {
  return {
    id: crypto.randomUUID(),
    scope: input.scope,
    scopeId: input.scopeId,
    scopeName: input.scopeName,
    networkName: input.networkName,
    timestamp: new Date().toISOString(),
    adminEmail: input.admin.email,
    adminName: input.admin.name,
    action: input.action,
    summary: input.summary,
  };
}

/**
 * Mock timestamps are anchored at module load. If the audit panel renders
 * them with formatRelative, "4 hours ago" freezes at that value for the
 * lifetime of the tab. Acceptable for mock data; the real feed would
 * anchor to each entry's own timestamp.
 */
const now = Date.now();
const hr = (n: number) => new Date(now - n * 3_600_000).toISOString();
const day = (n: number) => new Date(now - n * 86_400_000).toISOString();

export const mockDataPlansAudit: DataPlanAuditEntry[] = [
  {
    id: "DP-AUD-1001",
    scope: "plan",
    scopeId: "mtn-20gb-30d",
    scopeName: "20GB",
    networkName: "MTN",
    timestamp: hr(4),
    adminEmail: "efua.owusu@atlas.com",
    adminName: "Efua Owusu",
    action: "Created",
    summary: "Added MTN 20GB plan at GHS 80, 30-day validity",
  },
  {
    id: "DP-AUD-1002",
    scope: "plan",
    scopeId: "voda-stream-2gb",
    scopeName: "2GB Stream",
    networkName: "Telecel",
    timestamp: hr(20),
    adminEmail: "yaw.mensah@atlas.com",
    adminName: "Yaw Mensah",
    action: "Price update",
    summary: "Telecel 2GB Stream from GHS 10 to GHS 8",
  },
  {
    id: "DP-AUD-1003",
    scope: "category",
    scopeId: "cat-mtn-just4u",
    scopeName: "Just4U",
    networkName: "MTN",
    timestamp: day(1),
    adminEmail: "efua.owusu@atlas.com",
    adminName: "Efua Owusu",
    action: "Created",
    summary: "New Just4U category on MTN with 3 plans",
  },
  {
    id: "DP-AUD-1004",
    scope: "plan",
    scopeId: "at-unlimited-7d",
    scopeName: "Unlimited 7 Days",
    networkName: "AirtelTigo",
    timestamp: day(2),
    adminEmail: "yaw.mensah@atlas.com",
    adminName: "Yaw Mensah",
    action: "Disabled",
    summary: "AirtelTigo Unlimited 7 Days disabled pending cost review",
  },
  {
    id: "DP-AUD-1005",
    scope: "network",
    scopeId: "net-telecel",
    scopeName: "Telecel",
    networkName: "Telecel",
    timestamp: day(4),
    adminEmail: "efua.owusu@atlas.com",
    adminName: "Efua Owusu",
    action: "Bulk update",
    summary: "Bulk enabled 6 plans on Telecel after provider confirmation",
  },
];

export function auditForNetwork(
  entries: DataPlanAuditEntry[],
  networkName: string
): DataPlanAuditEntry[] {
  return entries
    .filter((entry) => entry.networkName === networkName)
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
}