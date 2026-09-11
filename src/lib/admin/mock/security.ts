import type { SecuritySummary, SecurityEvent, SecurityAlert, BlockedIP, ActiveSession } from "../types/security";

export const mockSecuritySummary: SecuritySummary = {
  activeSessions: 18,
  failedLogins24h: 5,
  suspiciousActivities24h: 2,
  blockedIPs: 14,
  lastSecurityScan: new Date(Date.now() - 3600000).toISOString(),
  status: "warning",
};

export const mockSecurityEvents: SecurityEvent[] = [
  { id: "SEC-EV-001", type: "login_failure", user: "admin@atlas.com", ip: "197.251.0.1", timestamp: new Date(Date.now() - 1800000).toISOString(), severity: "warning", details: "Invalid credentials" },
  { id: "SEC-EV-002", type: "suspicious_activity", user: "support@atlas.com", ip: "41.66.11.2", timestamp: new Date(Date.now() - 7200000).toISOString(), severity: "critical", details: "Multiple failed login attempts from same IP" },
  { id: "SEC-EV-003", type: "password_change", user: "finance@atlas.com", ip: "154.160.1.1", timestamp: new Date(Date.now() - 86400000).toISOString(), severity: "info", details: "Password changed by user" },
  { id: "SEC-EV-004", type: "wallet_adjustment", user: "finance@atlas.com", ip: "154.160.1.1", timestamp: new Date(Date.now() - 172800000).toISOString(), severity: "info", details: "Wallet adjustment of GH₵500 for RS-001" },
  { id: "SEC-EV-005", type: "ip_blocked", user: "system", ip: "203.0.113.10", timestamp: new Date(Date.now() - 259200000).toISOString(), severity: "warning", details: "Automatically blocked after 5 failed logins" },
];

export const mockSecurityAlerts: SecurityAlert[] = [
  { id: "SEC-ALT-001", title: "Suspicious login attempts", description: "Multiple failed login attempts from IP 197.251.0.1", severity: "warning", timestamp: new Date(Date.now() - 3600000).toISOString(), acknowledged: false },
  { id: "SEC-ALT-002", title: "Admin permission changed", description: "Role changed for user support@atlas.com", severity: "critical", timestamp: new Date(Date.now() - 7200000).toISOString(), acknowledged: false },
];

export const mockBlockedIPs: BlockedIP[] = [
  { id: "BLK-001", ip: "203.0.113.10", reason: "Multiple failed logins", blockedAt: new Date(Date.now() - 86400000).toISOString(), blockedBy: "system" },
  { id: "BLK-002", ip: "198.51.100.22", reason: "Suspicious activity", blockedAt: new Date(Date.now() - 172800000).toISOString(), blockedBy: "admin@atlas.com", expiresAt: new Date(Date.now() + 86400000 * 7).toISOString() },
];

export const mockActiveSessions: ActiveSession[] = [
  { id: "SES-001", user: "admin@atlas.com", ip: "154.160.1.1", device: "Chrome on Windows", lastActive: new Date(Date.now() - 300000).toISOString(), current: true },
  { id: "SES-002", user: "support@atlas.com", ip: "41.66.11.2", device: "Safari on macOS", lastActive: new Date(Date.now() - 1800000).toISOString(), current: false },
  { id: "SES-003", user: "finance@atlas.com", ip: "154.160.1.1", device: "Firefox on Linux", lastActive: new Date(Date.now() - 3600000).toISOString(), current: false },
];