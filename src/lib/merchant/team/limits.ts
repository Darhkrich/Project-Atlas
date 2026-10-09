import { DEFAULT_TEAM_SEAT_LIMIT } from "./constants";

// Seat counts per plan code. Owner does not count against the limit.
// Unknown plan codes fall back to zero seats.
export const TEAM_SEAT_LIMIT: Record<string, number> = {
  starter: 0,
  growth: 3,
  pro: 10,
  enterprise: Infinity,
};

export interface TeamLimitEvaluation {
  planId: string;
  limit: number;
  current: number;
  remaining: number | null;
  isUnlimited: boolean;
  atLimit: boolean;
}

export function evaluateTeamLimit(
  planId: string | null | undefined,
  currentMemberCount: number
): TeamLimitEvaluation {
  const key = (planId ?? "").toLowerCase();
  const raw = TEAM_SEAT_LIMIT[key];
  const limit =
    raw === undefined ? DEFAULT_TEAM_SEAT_LIMIT : raw;

  if (!Number.isFinite(limit)) {
    return {
      planId: key,
      limit: Infinity,
      current: currentMemberCount,
      remaining: null,
      isUnlimited: true,
      atLimit: false,
    };
  }

  const remaining = Math.max(0, limit - currentMemberCount);
  return {
    planId: key,
    limit,
    current: currentMemberCount,
    remaining,
    isUnlimited: false,
    atLimit: remaining <= 0,
  };
}

export interface AddTeamMemberGate {
  ok: boolean;
  error?: string;
}

export function evaluateAddTeamMemberGate(
  evaluation: TeamLimitEvaluation
): AddTeamMemberGate {
  if (evaluation.isUnlimited) return { ok: true };
  if (evaluation.atLimit) {
    return {
      ok: false,
      error:
        evaluation.limit === 0
          ? "Your plan does not include team members. Upgrade to add them."
          : "Your plan's seat limit is reached.",
    };
  }
  return { ok: true };
}