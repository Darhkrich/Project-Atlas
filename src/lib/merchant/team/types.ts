export type TeamRole = "manager" | "staff";

export type TeamMemberStatus = "invited" | "active" | "disabled";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  status: TeamMemberStatus;
  invitedAt: number;
  invitedBy: string;
  acceptedAt?: number;
}