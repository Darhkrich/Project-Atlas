"use client";

import { useState } from "react";
import { AtlasIcon } from "@/components/atlas/icons";
import { useStorefrontConfig } from "@/contexts/storefront-config-context";
import { useCurrentMerchant } from "@/lib/merchant/hooks/use-current-merchant";
import { resolveActivePlanId } from "@/lib/merchant/products/limits";
import { useTeamMembers } from "@/lib/merchant/team/use-team-members";
import type { TeamRole } from "@/lib/merchant/team/types";
import { TeamMemberRow } from "./team-member-row";
import { TeamInviteModal } from "./team-invite-modal";

export function TeamPageContent() {
  const { storefrontConfig } = useStorefrontConfig();
  const merchant = useCurrentMerchant();
  const planId = resolveActivePlanId(storefrontConfig);

  const storefrontId = storefrontConfig.storefrontId;
  const { members, limit, add, updateRole, remove } = useTeamMembers(
    storefrontId,
    planId
  );

  const [inviteOpen, setInviteOpen] = useState(false);

  const ownerName = merchant?.name ?? "Store owner";
  const ownerEmail = merchant?.email ?? "";

  const limitMessage = limit.isUnlimited
    ? undefined
    : limit.limit === 0
      ? "Your plan does not include team members. Upgrade to add them."
      : "Your plan allows " +
        limit.limit +
        (limit.limit === 1 ? " team member." : " team members.");

  const seatSummary = limit.isUnlimited
    ? members.length + " team members. Unlimited seats on your plan."
    : members.length + " of " + limit.limit + " seats used.";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-3xl">
            Team
          </h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            {seatSummary}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setInviteOpen(true)}
          disabled={limit.atLimit}
          className="inline-flex items-center gap-2 self-start rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40 sm:self-auto"
        >
          <AtlasIcon name="plus" className="h-4 w-4" aria-hidden="true" />
          Invite member
        </button>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-950">
        <span
          className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-warning-500"
          aria-hidden="true"
        />
        <p className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
          Team logins are not enabled yet. Invitations are saved but team
          members cannot sign in until Atlas ships merchant accounts. When they
          ship, everyone on this list receives an invitation email.
        </p>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Owner
        </p>
        <div className="mt-2 flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
            {ownerName.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {ownerName}
            </p>
            <p className="mt-0.5 truncate text-xs text-neutral-500 dark:text-neutral-400">
              {ownerEmail}
            </p>
          </div>
        </div>
      </div>

      {members.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-200 px-6 py-16 text-center dark:border-neutral-800">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            No team members yet
          </h2>
          <p className="mx-auto mt-1 max-w-md text-xs text-neutral-500 dark:text-neutral-400">
            Invite managers and staff to help run your store. They will get
            access when Atlas merchant accounts ship.
          </p>
          <button
            type="button"
            onClick={() => setInviteOpen(true)}
            disabled={limit.atLimit}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {"+ Invite member"}
          </button>
        </div>
      ) : (
        <ul role="list" className="space-y-3">
          {members.map((member) => (
            <TeamMemberRow
              key={member.id}
              member={member}
              onChangeRole={(role: TeamRole) => updateRole(member.id, role)}
              onRemove={() => remove(member.id)}
            />
          ))}
        </ul>
      )}

      <TeamInviteModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        canAdd={!limit.atLimit}
        limitMessage={limitMessage}
        onSubmit={(input) =>
          add({ name: input.name, email: input.email, role: input.role, invitedBy: ownerEmail })
        }
      />
    </div>
  );
}