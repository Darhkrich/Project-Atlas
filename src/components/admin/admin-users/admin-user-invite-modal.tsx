/* eslint-disable react-hooks/set-state-in-effect */
// components/admin/admin-users/admin-user-invite-modal.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { ModalShell } from "@/components/admin/ui/model-shell";
import { SettingsField } from "@/components/admin/ui/settings-field";
import {
  ALL_ROLES,
  roleDescription,
  roleLabel,
  rolePermissions,
  type Role,
} from "@/lib/admin/rbac";
import type { SupportUserType } from "@/lib/admin/types/support";
import { mockAdminQueues } from "@/lib/admin/mock/admin-users";
import { INVITE_EXPIRY_DAYS } from "@/lib/admin/admin-users/constants";

interface AdminUserInviteModalProps {
  open: boolean;
  onClose: () => void;
  onInvite: (invite: {
    name: string;
    email: string;
    role: Role;
    queueIds: string[];
    handles: SupportUserType[];
    message?: string;
  }) => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const selectClass =
  "h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100";

const USER_TYPE_LABEL: Record<SupportUserType, string> = {
  customer: "Customer",
  reseller: "Reseller",
  merchant: "Merchant",
};

const HANDLE_OPTIONS: SupportUserType[] = [
  "customer",
  "reseller",
  "merchant",
];

export function AdminUserInviteModal({
  open,
  onClose,
  onInvite,
}: AdminUserInviteModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("support_admin");
  const [queueIds, setQueueIds] = useState<string[]>([]);
  const [handles, setHandles] = useState<SupportUserType[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName("");
    setEmail("");
    setRole("support_admin");
    setQueueIds([]);
    setHandles([]);
    setMessage("");
    setError(null);
  }, [open]);

  const toggleQueue = (id: string) => {
    setQueueIds((prev) =>
      prev.includes(id) ? prev.filter((q) => q !== id) : [...prev, id]
    );
  };

  const toggleHandle = (handle: SupportUserType) => {
    setHandles((prev) =>
      prev.includes(handle)
        ? prev.filter((h) => h !== handle)
        : [...prev, handle]
    );
  };

  const handleSubmit = () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setError("Enter the person's name.");
      return;
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    onInvite({
      name: trimmedName,
      email: trimmedEmail,
      role,
      queueIds,
      handles,
      message: message.trim() || undefined,
    });
    onClose();
  };

  const inheritedCount = rolePermissions(role).length;

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Invite admin user"
      description={`Atlas will email a verification link. The invitation expires in ${INVITE_EXPIRY_DAYS} days.`}
      size="lg"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit}>
            Send invitation
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <SettingsField label="Full name" htmlFor="invite-name" required>
            <Input
              id="invite-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              placeholder="e.g. Adjoa Kyei"
            />
          </SettingsField>

          <SettingsField label="Email" htmlFor="invite-email" required>
            <Input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              placeholder="name@atlas.com"
            />
          </SettingsField>
        </div>

        <SettingsField
          label="Role"
          htmlFor="invite-role"
          hint={roleDescription(role)}
          required
        >
          <select
            id="invite-role"
            className={selectClass}
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
          >
            {ALL_ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </SettingsField>

        <div className="rounded-md bg-neutral-50 p-3 text-xs dark:bg-neutral-900/60">
          <p className="font-medium text-neutral-700 dark:text-neutral-300">
            Inherited permissions
          </p>
          <p className="mt-1 text-neutral-500 dark:text-neutral-400">
            {inheritedCount} permissions come with {roleLabel(role)}. Extra
            grants can be added after the invitation is accepted.
          </p>
        </div>

        <fieldset>
          <legend className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
            Support queues
          </legend>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Which ticket queues this admin can pick up from.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {mockAdminQueues.map((queue) => {
              const isSelected = queueIds.includes(queue.id);
              return (
                <button
                  key={queue.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => toggleQueue(queue.id)}
                  className={
                    isSelected
                      ? "rounded-full border border-brand-500 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 dark:border-brand-500 dark:bg-brand-900/30 dark:text-brand-300"
                      : "rounded-full border border-neutral-300 bg-white px-3 py-1 text-xs text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700/60"
                  }
                >
                  {queue.name}
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
            Handles
          </legend>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Which user types this admin works with.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {HANDLE_OPTIONS.map((handle) => {
              const isSelected = handles.includes(handle);
              return (
                <button
                  key={handle}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => toggleHandle(handle)}
                  className={
                    isSelected
                      ? "rounded-full border border-brand-500 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 dark:border-brand-500 dark:bg-brand-900/30 dark:text-brand-300"
                      : "rounded-full border border-neutral-300 bg-white px-3 py-1 text-xs text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700/60"
                  }
                >
                  {USER_TYPE_LABEL[handle]}
                </button>
              );
            })}
          </div>
        </fieldset>

        <SettingsField
          label="Personal message (optional)"
          htmlFor="invite-message"
          hint="Included in the invitation email."
        >
          <textarea
            id="invite-message"
            className="w-full rounded-md border border-neutral-300 p-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Welcome to Atlas. Here is your access."
          />
        </SettingsField>

        {error && (
          <p
            role="alert"
            className="rounded-md border border-danger-200 bg-danger-50 p-2 text-xs text-danger-800 dark:border-danger-800/60 dark:bg-danger-900/25 dark:text-danger-200"
          >
            {error}
          </p>
        )}
      </div>
    </ModalShell>
  );
}