/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  getTeamFor,
  getTeamVersion,
  subscribeToTeam,
} from "./store";
import {
  addTeamMember,
  removeTeamMember,
  setTeamMemberStatus,
  updateTeamMemberRole,
  type AddTeamMemberInput,
  type AddTeamMemberResult,
} from "./mutations";
import { evaluateTeamLimit, type TeamLimitEvaluation } from "./limits";
import type { TeamMemberStatus, TeamRole } from "./types";

export function useTeamMembers(
  storefrontId: string,
  planId: string | null | undefined
) {
  const snapshot = useSyncExternalStore(
    subscribeToTeam,
    getTeamVersion,
    () => 0
  );

  const members = useMemo(
    () => getTeamFor(storefrontId),
    [storefrontId, snapshot]
  );

  const limit: TeamLimitEvaluation = useMemo(
    () => evaluateTeamLimit(planId, members.length),
    [planId, members.length]
  );

  return {
    members,
    limit,
    add: (input: Omit<AddTeamMemberInput, "planId">): AddTeamMemberResult =>
      addTeamMember(storefrontId, { ...input, planId }),
    updateRole: (id: string, role: TeamRole) =>
      updateTeamMemberRole(storefrontId, id, role),
    setStatus: (id: string, status: TeamMemberStatus) =>
      setTeamMemberStatus(storefrontId, id, status),
    remove: (id: string) => removeTeamMember(storefrontId, id),
  };
}