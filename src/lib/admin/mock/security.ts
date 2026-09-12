// lib/admin/mock/security.ts

import type {
  ActiveSession,
  AllowlistedIP,
  BlockedIP,
  LockedAccount,
  SecurityAlert,
  SecurityEvent,
  SecurityPolicySummary,
  TwoFactorStatus,
} from "../types/security";

const now = Date.now();
const MIN = 60_000;
const HR = 60 * MIN;
const DAY = 24 * HR;

const at = (offsetMs: number) => new Date(now + offsetMs).toISOString();
const min = (n: number) => at(-n * MIN);
const hr = (n: number) => at(-n * HR);
const day = (n: number) => at(-n * DAY);
const inMin = (n: number) => at(n * MIN);
const inHr = (n: number) => at(n * HR);
const inDay = (n: number) => at(n * DAY);

export const mockSecurityEvents: SecurityEvent[] = [
  {
    id: "SEC-EV-001",
    type: "login_failure",
    severity: "warning",
    user: "yaw.mensah@atlas.com",
    actorId: "usr-001",
    actorName: "Yaw Mensah",
    ip: "197.251.0.1",
    countryCode: "GH",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    timestamp: min(28),
    details: "Invalid credentials",
    resourceKind: "admin_user",
    resourceId: "usr-001",
  },
  {
    id: "SEC-EV-002",
    type: "login_failure",
    severity: "warning",
    user: "yaw.mensah@atlas.com",
    actorId: "usr-001",
    actorName: "Yaw Mensah",
    ip: "197.251.0.1",
    countryCode: "GH",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    timestamp: min(26),
    details: "Invalid credentials",
    resourceKind: "admin_user",
    resourceId: "usr-001",
  },
  {
    id: "SEC-EV-003",
    type: "login_failure",
    severity: "warning",
    user: "yaw.mensah@atlas.com",
    actorId: "usr-001",
    actorName: "Yaw Mensah",
    ip: "197.251.0.1",
    countryCode: "GH",
    timestamp: min(24),
    details: "Invalid credentials",
    resourceKind: "admin_user",
    resourceId: "usr-001",
  },
  {
    id: "SEC-EV-004",
    type: "suspicious_activity",
    severity: "critical",
    user: "efua.owusu@atlas.com",
    actorId: "usr-004",
    actorName: "Efua Owusu",
    ip: "41.66.11.2",
    countryCode: "NG",
    timestamp: hr(2),
    details: "Login attempt from unverified location",
    resourceKind: "admin_user",
    resourceId: "usr-004",
  },
  {
    id: "SEC-EV-005",
    type: "password_change",
    severity: "info",
    user: "akosua.boateng@atlas.com",
    actorId: "usr-002",
    actorName: "Akosua Boateng",
    ip: "154.160.1.1",
    countryCode: "GH",
    timestamp: day(1),
    details: "Password changed by user",
    resourceKind: "admin_user",
    resourceId: "usr-002",
  },
  {
    id: "SEC-EV-006",
    type: "wallet_adjustment",
    severity: "info",
    user: "akosua.boateng@atlas.com",
    actorId: "usr-002",
    actorName: "Akosua Boateng",
    ip: "154.160.1.1",
    countryCode: "GH",
    timestamp: day(2),
    details: "Wallet adjustment of GHS 500 for RS-001",
    section: "resellers",
    resourceKind: "wallet",
    resourceId: "RS-001",
  },
  {
    id: "SEC-EV-007",
    type: "role_change",
    severity: "warning",
    user: "yaw.mensah@atlas.com",
    actorId: "usr-001",
    actorName: "Yaw Mensah",
    ip: "154.160.1.1",
    countryCode: "GH",
    timestamp: day(3),
    details: "Role changed for efua.owusu@atlas.com: Support admin to Operations admin",
    resourceKind: "admin_user",
    resourceId: "usr-004",
  },
  {
    id: "SEC-EV-008",
    type: "api_key_change",
    severity: "warning",
    user: "yaw.mensah@atlas.com",
    actorId: "usr-001",
    actorName: "Yaw Mensah",
    ip: "154.160.1.1",
    countryCode: "GH",
    timestamp: day(4),
    details: "Revoked API key 'Legacy payout worker'",
    resourceKind: "api_key",
    resourceId: "API-003",
  },
  {
    id: "SEC-EV-009",
    type: "ip_blocked",
    severity: "warning",
    user: "system",
    ip: "203.0.113.10",
    countryCode: "US",
    timestamp: day(5),
    details: "Automatically blocked after 5 failed logins",
    resourceKind: "admin_user",
  },
  {
    id: "SEC-EV-010",
    type: "login_success",
    severity: "info",
    user: "yaw.mensah@atlas.com",
    actorId: "usr-001",
    actorName: "Yaw Mensah",
    ip: "154.160.1.1",
    countryCode: "GH",
    timestamp: min(120),
    details: "Session started",
    resourceKind: "session",
  },
];

export const mockSecurityAlerts: SecurityAlert[] = [
  {
    id: "SEC-ALT-001",
    title: "Repeated login failures",
    description: "3 failed login attempts from 197.251.0.1 within 5 minutes.",
    severity: "warning",
    timestamp: min(24),
    acknowledged: false,
    eventIds: ["SEC-EV-001", "SEC-EV-002", "SEC-EV-003"],
  },
  {
    id: "SEC-ALT-002",
    title: "Login from unverified location",
    description:
      "Efua Owusu logged in from Lagos, Nigeria. Her usual location is Accra.",
    severity: "critical",
    timestamp: hr(2),
    acknowledged: false,
    eventIds: ["SEC-EV-004"],
  },
];

export const mockBlockedIPs: BlockedIP[] = [
  {
    id: "BLK-001",
    ip: "203.0.113.10",
    reason: "Multiple failed logins",
    blockedAt: day(1),
    blockedBy: "system",
    permanent: false,
    expiresAt: inDay(6),
    countryCode: "US",
    attemptCount: 5,
    lastAttemptAt: day(1),
  },
  {
    id: "BLK-002",
    ip: "198.51.100.22",
    reason: "Suspicious activity",
    blockedAt: day(2),
    blockedBy: "yaw.mensah@atlas.com",
    blockedById: "usr-001",
    permanent: true,
    countryCode: "RU",
    attemptCount: 12,
    lastAttemptAt: day(2),
  },
];

export const mockActiveSessions: ActiveSession[] = [
  {
    id: "SES-001",
    user: "yaw.mensah@atlas.com",
    actorId: "usr-001",
    actorName: "Yaw Mensah",
    userType: "admin",
    ip: "154.160.1.1",
    countryCode: "GH",
    device: "Chrome on Windows",
    startedAt: hr(3),
    lastActive: min(2),
    current: true,
  },
  {
    id: "SES-002",
    user: "efua.owusu@atlas.com",
    actorId: "usr-004",
    actorName: "Efua Owusu",
    userType: "admin",
    ip: "41.66.11.2",
    countryCode: "NG",
    device: "Safari on macOS",
    startedAt: hr(4),
    lastActive: min(30),
    current: false,
  },
  {
    id: "SES-003",
    user: "akosua.boateng@atlas.com",
    actorId: "usr-002",
    actorName: "Akosua Boateng",
    userType: "admin",
    ip: "154.160.1.1",
    countryCode: "GH",
    device: "Firefox on Linux",
    startedAt: hr(6),
    lastActive: hr(1),
    current: false,
  },
];

export const mockAllowlistedIPs: AllowlistedIP[] = [
  {
    id: "WL-001",
    ip: "154.160.1.1",
    label: "Atlas HQ (Accra)",
    addedBy: "Yaw Mensah",
    addedAt: day(30),
    countryCode: "GH",
  },
];

export const mockTwoFactorStatuses: TwoFactorStatus[] = [
  {
    id: "2FA-001",
    adminId: "usr-001",
    adminName: "Yaw Mensah",
    adminEmail: "yaw.mensah@atlas.com",
    enabled: true,
    enrolledAt: day(60),
    lastVerifiedAt: hr(3),
  },
  {
    id: "2FA-002",
    adminId: "usr-002",
    adminName: "Akosua Boateng",
    adminEmail: "akosua.boateng@atlas.com",
    enabled: true,
    enrolledAt: day(45),
    lastVerifiedAt: day(2),
  },
  {
    id: "2FA-003",
    adminId: "usr-003",
    adminName: "Kofi Asante",
    adminEmail: "kofi.asante@atlas.com",
    enabled: false,
  },
  {
    id: "2FA-004",
    adminId: "usr-004",
    adminName: "Efua Owusu",
    adminEmail: "efua.owusu@atlas.com",
    enabled: false,
  },
];

export const mockLockedAccounts: LockedAccount[] = [
  {
    id: "LCK-001",
    adminId: "usr-003",
    adminName: "Kofi Asante",
    adminEmail: "kofi.asante@atlas.com",
    lockedAt: min(20),
    unlocksAt: inMin(10),
    attemptCount: 5,
    lastAttemptFrom: "102.176.12.4",
    countryCode: "GH",
  },
];

export const mockSecurityPolicy: SecurityPolicySummary = {
  passwordMinLength: 8,
  require2FA: true,
  sessionTimeoutMinutes: 30,
  maxLoginAttempts: 5,
  lockoutDurationMinutes: 15,
};