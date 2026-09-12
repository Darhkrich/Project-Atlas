// lib/admin/mock/admin-users.ts

import type { AdminUser } from "@/lib/admin/types/admin-user";

export type { AdminUser } from "@/lib/admin/types/admin-user";

export interface AdminQueue {
  id: string;
  name: string;
}

export const mockAdminQueues: AdminQueue[] = [
  { id: "q-support", name: "Support" },
  { id: "q-finance", name: "Finance" },
  { id: "q-operations", name: "Operations" },
];

export const mockAdminUsers: AdminUser[] = [
  {
    id: "usr-001",
    name: "Yaw Mensah",
    email: "yaw.mensah@atlas.com",
    role: "operations_admin",
    extraPermissions: ["customers:reveal_pii", "transactions:refund"],
    status: "active",
    queueIds: ["q-support", "q-operations"],
    handles: ["customer", "reseller"],
    emailVerified: true,
    emailVerifiedAt: new Date(Date.now() - 400 * 86_400_000).toISOString(),
    createdAt: new Date(Date.now() - 400 * 86_400_000).toISOString(),
    lastLogin: new Date(Date.now() - 3 * 3_600_000).toISOString(),
    lastLoginFrom: "154.160.1.1",
    activityLog: [
      {
        id: "ACT-001",
        timestamp: new Date(Date.now() - 3 * 3_600_000).toISOString(),
        action: "Signed in",
        resource: "Chrome on Windows",
      },
      {
        id: "ACT-002",
        timestamp: new Date(Date.now() - 5 * 3_600_000).toISOString(),
        action: "Replied to ticket SUP-1001",
        resource: "Support",
      },
      {
        id: "ACT-003",
        timestamp: new Date(Date.now() - 26 * 3_600_000).toISOString(),
        action: "Approved reseller RS-002",
        resource: "Resellers",
      },
    ],
  },
  {
    id: "usr-002",
    name: "Akosua Boateng",
    email: "akosua.boateng@atlas.com",
    role: "finance_admin",
    extraPermissions: ["customers:reveal_pii"],
    status: "active",
    queueIds: ["q-finance"],
    handles: ["reseller", "merchant"],
    emailVerified: true,
    emailVerifiedAt: new Date(Date.now() - 380 * 86_400_000).toISOString(),
    createdAt: new Date(Date.now() - 380 * 86_400_000).toISOString(),
    lastLogin: new Date(Date.now() - 1 * 3_600_000).toISOString(),
    lastLoginFrom: "154.160.1.1",
    activityLog: [
      {
        id: "ACT-004",
        timestamp: new Date(Date.now() - 1 * 3_600_000).toISOString(),
        action: "Signed in",
        resource: "Chrome on Windows",
      },
      {
        id: "ACT-005",
        timestamp: new Date(Date.now() - 2 * 3_600_000).toISOString(),
        action: "Adjusted reseller wallet",
        resource: "RS-001",
      },
      {
        id: "ACT-006",
        timestamp: new Date(Date.now() - 18 * 3_600_000).toISOString(),
        action: "Approved refund for ATX-928391",
        resource: "Transactions",
      },
      {
        id: "ACT-007",
        timestamp: new Date(Date.now() - 30 * 3_600_000).toISOString(),
        action: "Processed reseller payout run",
        resource: "Resellers",
      },
    ],
  },
  {
    id: "usr-003",
    name: "Kofi Asante",
    email: "kofi.asante@atlas.com",
    role: "support_admin",
    extraPermissions: [],
    status: "active",
    queueIds: ["q-operations", "q-support"],
    handles: ["customer", "merchant"],
    emailVerified: true,
    emailVerifiedAt: new Date(Date.now() - 250 * 86_400_000).toISOString(),
    createdAt: new Date(Date.now() - 250 * 86_400_000).toISOString(),
    lastLogin: new Date(Date.now() - 6 * 3_600_000).toISOString(),
    lastLoginFrom: "41.66.11.2",
    activityLog: [
      {
        id: "ACT-008",
        timestamp: new Date(Date.now() - 6 * 3_600_000).toISOString(),
        action: "Signed in",
        resource: "Safari on macOS",
      },
      {
        id: "ACT-009",
        timestamp: new Date(Date.now() - 8 * 3_600_000).toISOString(),
        action: "Escalated transaction ATX-928422",
        resource: "Support",
      },
    ],
  },
  {
    id: "usr-004",
    name: "Efua Owusu",
    email: "efua.owusu@atlas.com",
    role: "service_admin",
    extraPermissions: [],
    status: "active",
    queueIds: ["q-support"],
    handles: ["customer", "merchant"],
    emailVerified: true,
    emailVerifiedAt: new Date(Date.now() - 200 * 86_400_000).toISOString(),
    createdAt: new Date(Date.now() - 200 * 86_400_000).toISOString(),
    lastLogin: new Date(Date.now() - 12 * 3_600_000).toISOString(),
    lastLoginFrom: "41.66.11.2",
    activityLog: [
      {
        id: "ACT-010",
        timestamp: new Date(Date.now() - 12 * 3_600_000).toISOString(),
        action: "Signed in",
        resource: "Chrome on macOS",
      },
    ],
  },
  {
    id: "usr-005",
    name: "Nana Yeboah",
    email: "nana.yeboah@atlas.com",
    role: "analyst",
    extraPermissions: [],
    status: "active",
    queueIds: [],
    handles: [],
    emailVerified: true,
    emailVerifiedAt: new Date(Date.now() - 120 * 86_400_000).toISOString(),
    createdAt: new Date(Date.now() - 120 * 86_400_000).toISOString(),
    lastLogin: new Date(Date.now() - 48 * 3_600_000).toISOString(),
    lastLoginFrom: "102.176.12.4",
    activityLog: [
      {
        id: "ACT-011",
        timestamp: new Date(Date.now() - 48 * 3_600_000).toISOString(),
        action: "Exported analytics CSV",
        resource: "Analytics",
      },
    ],
  },
  {
    id: "usr-006",
    name: "Adjoa Kyei",
    email: "adjoa.kyei@atlas.com",
    role: "support_admin",
    extraPermissions: [],
    status: "pending",
    queueIds: ["q-support"],
    handles: ["customer"],
    emailVerified: false,
    invitedAt: new Date(Date.now() - 2 * 86_400_000).toISOString(),
    invitedBy: "usr-001",
    createdAt: new Date(Date.now() - 2 * 86_400_000).toISOString(),
    lastLogin: null,
    activityLog: [],
  },
  {
    id: "usr-007",
    name: "Kwabena Owusu",
    email: "kwabena.owusu@atlas.com",
    role: "operations_admin",
    extraPermissions: [],
    status: "suspended",
    queueIds: ["q-operations"],
    handles: ["reseller"],
    emailVerified: true,
    emailVerifiedAt: new Date(Date.now() - 90 * 86_400_000).toISOString(),
    createdAt: new Date(Date.now() - 90 * 86_400_000).toISOString(),
    lastLogin: new Date(Date.now() - 30 * 86_400_000).toISOString(),
    lastLoginFrom: "154.160.1.1",
    activityLog: [
      {
        id: "ACT-012",
        timestamp: new Date(Date.now() - 30 * 86_400_000).toISOString(),
        action: "Signed in",
        resource: "Chrome on Windows",
      },
    ],
  },
  {
    id: "usr-008",
    name: "Ama Agyeman",
    email: "ama.agyeman@atlas.com",
    role: "finance_admin",
    extraPermissions: [],
    status: "active",
    queueIds: ["q-finance"],
    handles: ["reseller", "merchant"],
    emailVerified: true,
    emailVerifiedAt: new Date(Date.now() - 150 * 86_400_000).toISOString(),
    createdAt: new Date(Date.now() - 150 * 86_400_000).toISOString(),
    lastLogin: new Date(Date.now() - 20 * 3_600_000).toISOString(),
    lastLoginFrom: "154.160.1.1",
    activityLog: [
      {
        id: "ACT-013",
        timestamp: new Date(Date.now() - 20 * 3_600_000).toISOString(),
        action: "Signed in",
        resource: "Firefox on Linux",
      },
      {
        id: "ACT-014",
        timestamp: new Date(Date.now() - 26 * 3_600_000).toISOString(),
        action: "Adjusted commission rate",
        resource: "Resellers",
      },
    ],
  },
];

export function findAdminById(id: string | undefined): AdminUser | undefined {
  if (!id) return undefined;
  return mockAdminUsers.find((u) => u.id === id);
}