export type SecurityEventType =
  | "login_success"
  | "login_failure"
  | "logout"
  | "password_change"
  | "role_change"
  | "permission_change"
  | "wallet_adjustment"
  | "api_key_change"
  | "suspicious_activity"
  | "ip_blocked"
  | "ip_unblocked";

export type SecurityStatus = "normal" | "warning" | "critical";

export interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  user: string;
  ip: string;
  timestamp: string;
  details?: string;
  severity: "info" | "warning" | "critical";
}

export interface SecuritySummary {
  activeSessions: number;
  failedLogins24h: number;
  suspiciousActivities24h: number;
  blockedIPs: number;
  lastSecurityScan: string;
  status: SecurityStatus;
}

export interface SecurityAlert {
  id: string;
  title: string;
  description: string;
  severity: "warning" | "critical";
  timestamp: string;
  acknowledged: boolean;
}

export interface BlockedIP {
  id: string;
  ip: string;
  reason: string;
  blockedAt: string;
  blockedBy: string;
  expiresAt?: string;
}

export interface ActiveSession {
  id: string;
  user: string;
  ip: string;
  device: string;
  lastActive: string;
  current: boolean;
}