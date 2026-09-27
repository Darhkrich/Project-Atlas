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