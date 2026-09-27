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