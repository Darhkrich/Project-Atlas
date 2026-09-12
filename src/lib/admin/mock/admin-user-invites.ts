// lib/admin/mock/admin-user-invites.ts

export interface PendingInvite {
  id: string;
  email: string;
  invitedById: string;
  invitedAt: string;
  expiresAt: string;
}

export const mockPendingInvites: PendingInvite[] = [
  {
    id: "INV-001",
    email: "adjoa.kyei@atlas.com",
    invitedById: "usr-001",
    invitedAt: new Date(Date.now() - 2 * 86_400_000).toISOString(),
    expiresAt: new Date(Date.now() + 5 * 86_400_000).toISOString(),
  },
];