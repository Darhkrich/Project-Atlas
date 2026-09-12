/* eslint-disable @typescript-eslint/no-unused-vars */
// lib/admin/mock/settings-audit.ts

import type { SettingsAuditEntry } from "../types/settings";

const now = Date.now();
const min = (n: number) => new Date(now - n * 60_000).toISOString();
const hr = (n: number) => new Date(now - n * 3_600_000).toISOString();
const day = (n: number) => new Date(now - n * 86_400_000).toISOString();

export const mockSettingsAudit: SettingsAuditEntry[] = [
  {
    id: "AUD-1001",
    tab: "payments",
    field: "methods.card.feePercent",
    previousValue: "2.0",
    newValue: "2.5",
    actorId: "usr-002",
    actorName: "Akosua Boateng",
    at: hr(2),
  },
  {
    id: "AUD-1002",
    tab: "general",
    field: "commissionPerSection.resellers",
    previousValue: "3",
    newValue: "3.5",
    actorId: "usr-002",
    actorName: "Akosua Boateng",
    at: hr(6),
  },
  {
    id: "AUD-1003",
    tab: "support",
    field: "slaWarningHours",
    previousValue: "12",
    newValue: "8",
    actorId: "usr-001",
    actorName: "Yaw Mensah",
    at: day(1),
  },
  {
    id: "AUD-1004",
    tab: "security",
    field: "require2FA",
    previousValue: "Disabled",
    newValue: "Enabled",
    actorId: "usr-001",
    actorName: "Yaw Mensah",
    at: day(2),
  },
  {
    id: "AUD-1005",
    tab: "wallet",
    field: "autoApproveThreshold",
    previousValue: "3,000",
    newValue: "5,000",
    actorId: "usr-002",
    actorName: "Akosua Boateng",
    at: day(3),
  },
  {
    id: "AUD-1006",
    tab: "api",
    field: "keys.API-003.status",
    previousValue: "active",
    newValue: "revoked",
    actorId: "usr-003",
    actorName: "Kofi Asante",
    at: day(15),
  },
];