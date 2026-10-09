"use client";

import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import {
  TEAM_ROLE_DESCRIPTIONS,
  TEAM_ROLE_LABELS,
  TEAM_ROLES,
} from "@/lib/merchant/team/constants";
import type {
  TeamMember,
  TeamMemberStatus,
  TeamRole,
} from "@/lib/merchant/team/types";

interface TeamMemberRowProps {
  member: TeamMember;
  onChangeRole: (role: TeamRole) => void;
  onRemove: () => void;
}

const STATUS_LABEL: Record<TeamMemberStatus, string> = {
  invited: "Invited",
  active: "Active",
  disabled: "Disabled",
};

const STATUS_CLASS: Record<TeamMemberStatus, string> = {
  invited:
    "bg-warning-100 text-warning-800 dark:bg-warning-900/40 dark:text-warning-300",
  active:
    "bg-success-100 text-success-800 dark:bg-success-900/40 dark:text-success-300",
  disabled:
    "bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400",
};

export function TeamMemberRow({
  member,
  onChangeRole,
  onRemove,
}: TeamMemberRowProps) {
  return (
    <li className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 sm:flex-row sm:items-center sm:gap-4">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
          {member.name.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {member.name}
            </span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                STATUS_CLASS[member.status]
              )}
            >
              {STATUS_LABEL[member.status]}
            </span>
          </div>
          <p className="mt-0.5 truncate text-xs text-neutral-500 dark:text-neutral-400">
            {member.email}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <label className="sr-only" htmlFor={"role-" + member.id}>
          Role for {member.name}
        </label>
        <select
          id={"role-" + member.id}
          value={member.role}
          onChange={(e) => onChangeRole(e.target.value as TeamRole)}
          title={TEAM_ROLE_DESCRIPTIONS[member.role]}
          className="rounded-md border border-neutral-300 bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-200"
        >
          {TEAM_ROLES.map((role) => (
            <option key={role} value={role}>
              {TEAM_ROLE_LABELS[role]}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={onRemove}
          aria-label={"Remove " + member.name}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-neutral-200 text-neutral-500 transition-colors hover:border-danger-500 hover:text-danger-600 dark:border-neutral-800 dark:text-neutral-400 dark:hover:border-danger-500 dark:hover:text-danger-400"
        >
          <AtlasIcon name="trash" className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </li>
  );
}