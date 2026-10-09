import { getTeamFor, setTeamFor } from "./store";
import { evaluateAddTeamMemberGate, evaluateTeamLimit } from "./limits";
import type { TeamMember, TeamMemberStatus, TeamRole } from "./types";

export interface AddTeamMemberResult {
  ok: boolean;
  error?: string;
}

export interface AddTeamMemberInput {
  name: string;
  email: string;
  role: TeamRole;
  planId: string | null | undefined;
  invitedBy: string;
}

export function addTeamMember(
  storefrontId: string,
  input: AddTeamMemberInput
): AddTeamMemberResult {
  const current = getTeamFor(storefrontId);
  const evaluation = evaluateTeamLimit(input.planId, current.length);
  const gate = evaluateAddTeamMemberGate(evaluation);
  if (!gate.ok) {
    return { ok: false, error: gate.error };
  }

  const candidate = input.email.trim().toLowerCase();
  const clash = current.some((m) => m.email.toLowerCase() === candidate);
  if (clash) {
    return { ok: false, error: "A team member with that email already exists." };
  }

  const member: TeamMember = {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    email: input.email.trim(),
    role: input.role,
    status: "invited",
    invitedAt: Date.now(),
    invitedBy: input.invitedBy,
  };

  setTeamFor(storefrontId, [...current, member]);
  return { ok: true };
}

export function updateTeamMemberRole(
  storefrontId: string,
  id: string,
  role: TeamRole
): void {
  const current = getTeamFor(storefrontId);
  const next = current.map((m) => (m.id === id ? { ...m, role } : m));
  setTeamFor(storefrontId, next);
}

export function setTeamMemberStatus(
  storefrontId: string,
  id: string,
  status: TeamMemberStatus
): void {
  const current = getTeamFor(storefrontId);
  const next = current.map((m) => (m.id === id ? { ...m, status } : m));
  setTeamFor(storefrontId, next);
}

export function removeTeamMember(storefrontId: string, id: string): void {
  const current = getTeamFor(storefrontId);
  setTeamFor(
    storefrontId,
    current.filter((m) => m.id !== id)
  );
}