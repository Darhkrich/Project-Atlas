export interface AuditLogEntry {
  id: string;
  timestamp: string;
  admin: string;
  action: string;
  resource: string;
  resourceId: string;
  ip: string;
  result: "success" | "failure";
  previousValue?: string;
  newValue?: string;
  userAgent?: string;
}