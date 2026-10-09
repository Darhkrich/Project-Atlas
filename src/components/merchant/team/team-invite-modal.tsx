/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { AtlasModalShell } from "@/components/atlas/modal-shell";
import {
  TEAM_EMAIL_MAX,
  TEAM_NAME_MAX,
  TEAM_ROLES,
  TEAM_ROLE_DESCRIPTIONS,
  TEAM_ROLE_LABELS,
} from "@/lib/merchant/team/constants";
import type { TeamRole } from "@/lib/merchant/team/types";

interface TeamInviteModalProps {
  open: boolean;
  onClose: () => void;
  canAdd: boolean;
  limitMessage?: string;
  onSubmit: (input: {
    name: string;
    email: string;
    role: TeamRole;
  }) => { ok: boolean; error?: string };
}

const inputClass =
  "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100";

function looksLikeEmail(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length < 3) return false;
  const at = trimmed.indexOf("@");
  const dot = trimmed.lastIndexOf(".");
  return at > 0 && dot > at + 1 && dot < trimmed.length - 1;
}

export function TeamInviteModal({
  open,
  onClose,
  canAdd,
  limitMessage,
  onSubmit,
}: TeamInviteModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TeamRole>("staff");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName("");
    setEmail("");
    setRole("staff");
    setError(null);
  }, [open]);

  function handleSubmit() {
    if (!canAdd) {
      setError(limitMessage ?? "Your plan does not allow more team members.");
      return;
    }
    if (name.trim().length === 0) {
      setError("Enter the team member's name.");
      return;
    }
    if (!looksLikeEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }
    const result = onSubmit({
      name: name.trim().slice(0, TEAM_NAME_MAX),
      email: email.trim().slice(0, TEAM_EMAIL_MAX),
      role,
    });
    if (!result.ok) {
      setError(result.error ?? "Could not add team member.");
      return;
    }
    onClose();
  }

  return (
    <AtlasModalShell
      open={open}
      onClose={onClose}
      title="Invite team member"
      description="Add someone to help run your store."
      size="md"
    >
      <div className="space-y-4">
        {!canAdd && limitMessage && (
          <div
            role="alert"
            className="rounded-lg border border-warning-200 bg-warning-50 px-3 py-2 text-xs text-warning-800 dark:border-warning-900 dark:bg-warning-900/20 dark:text-warning-200"
          >
            {limitMessage}
          </div>
        )}

        <div>
          <label
            htmlFor="team-name"
            className="mb-1.5 block text-xs font-medium text-neutral-700 dark:text-neutral-300"
          >
            Name
          </label>
          <input
            id="team-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            maxLength={TEAM_NAME_MAX}
            autoComplete="name"
            className={inputClass}
          />
        </div>

        <div>
          <label
            htmlFor="team-email"
            className="mb-1.5 block text-xs font-medium text-neutral-700 dark:text-neutral-300"
          >
            Email
          </label>
          <input
            id="team-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            maxLength={TEAM_EMAIL_MAX}
            autoComplete="email"
            className={inputClass}
          />
        </div>

        <div>
          <label
            htmlFor="team-role"
            className="mb-1.5 block text-xs font-medium text-neutral-700 dark:text-neutral-300"
          >
            Role
          </label>
          <select
            id="team-role"
            value={role}
            onChange={(e) => setRole(e.target.value as TeamRole)}
            className={inputClass}
          >
            {TEAM_ROLES.map((r) => (
              <option key={r} value={r}>
                {TEAM_ROLE_LABELS[r]}
              </option>
            ))}
          </select>
          <p className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
            {TEAM_ROLE_DESCRIPTIONS[role]}
          </p>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 dark:border-neutral-800 dark:bg-neutral-950">
          <p className="text-[11px] leading-relaxed text-neutral-600 dark:text-neutral-400">
            Atlas merchant accounts are coming. When they ship, this team
            member will receive an invitation email to sign in.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-danger-200 bg-danger-50 px-3 py-2 text-xs text-danger-700 dark:border-danger-900 dark:bg-danger-900/20 dark:text-danger-300"
          >
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canAdd}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Save invitation
          </button>
        </div>
      </div>
    </AtlasModalShell>
  );
}