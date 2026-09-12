// components/admin/admin-users/admin-user-detail-drawer.tsx
"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { AdminUser } from "@/lib/admin/types/admin-user";
import type { SupportUserType } from "@/lib/admin/types/support";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { ModalShell } from "@/components/admin/ui/model-shell";
import { SettingsField } from "@/components/admin/ui/settings-field";
import { StatusDot } from "@/components/admin/ui/status-dot";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { cn } from "@/lib/utils";
import { useFocusTrap } from "@/lib/admin/hooks/use-focus-trap";
import { useNow } from "@/lib/admin/hooks/use-now";
import { formatAbsolute, formatRelative } from "@/lib/admin/support/format";
import {
  ALL_ROLES,
  effectivePermissions,
  roleLabel,
  rolePermissions,
  type Permission,
  type Role,
} from "@/lib/admin/rbac";
import {
  STATUS_LABEL,
  STATUS_VARIANT,
  ROLE_VARIANT,
  initialsFor,
} from "@/lib/admin/admin-users/constants";
import { countModules } from "@/lib/admin/admin-users/permissions";
import { AdminUserPermissionsEditor } from "./admin-user-permission-editor";
import { AdminUserSessionsPanel } from "./admin-user-sessions-panel";
import { AdminUserAuditPanel } from "./admin-user-audit-panel";

type Tab = "overview" | "permissions" | "sessions" | "activity";

type ConfirmAction =
  | "suspend"
  | "reactivate"
  | "reset_password"
  | "resend_invite"
  | "delete"
  | "change_role";

const TABS: { key: Tab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "permissions", label: "Permissions" },
  { key: "sessions", label: "Sessions" },
  { key: "activity", label: "Activity" },
];

const USER_TYPE_LABEL: Record<SupportUserType, string> = {
  customer: "Customer",
  reseller: "Reseller",
  merchant: "Merchant",
};

interface AdminUserDetailDrawerProps {
  user: AdminUser | null;
  currentAdminId: string;
  twoFactorEnabled: boolean;
  queueNames: string[];
  onClose: () => void;
  onChangeRole: (id: string, role: Role) => void;
  onUpdatePermissions: (id: string, extraPermissions: Permission[]) => void;
  onToggleStatus: (id: string) => void;
  onResetPassword: (id: string) => void;
  onResendInvite: (id: string) => void;
  onDelete: (id: string) => void;
  onSendNotification: (
    id: string,
    channel: "email" | "sms" | "push",
    message: string
  ) => void;
}

export function AdminUserDetailDrawer({
  user,
  currentAdminId,
  twoFactorEnabled,
  queueNames,
  onClose,
  onChangeRole,
  onUpdatePermissions,
  onToggleStatus,
  onResetPassword,
  onResendInvite,
  onDelete,
  onSendNotification,
}: AdminUserDetailDrawerProps) {
  const isOpen = user !== null;
  const trapRef = useFocusTrap<HTMLDivElement>(isOpen, onClose);
  const titleId = useId();

  if (!user) return null;

  return (
    <div
      ref={trapRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-50"
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      <AdminUserDetailBody
        key={user.id}
        user={user}
        currentAdminId={currentAdminId}
        twoFactorEnabled={twoFactorEnabled}
        queueNames={queueNames}
        titleId={titleId}
        onClose={onClose}
        onChangeRole={onChangeRole}
        onUpdatePermissions={onUpdatePermissions}
        onToggleStatus={onToggleStatus}
        onResetPassword={onResetPassword}
        onResendInvite={onResendInvite}
        onDelete={onDelete}
        onSendNotification={onSendNotification}
      />
    </div>
  );
}

interface BodyProps {
  user: AdminUser;
  currentAdminId: string;
  twoFactorEnabled: boolean;
  queueNames: string[];
  titleId: string;
  onClose: () => void;
  onChangeRole: (id: string, role: Role) => void;
  onUpdatePermissions: (id: string, extraPermissions: Permission[]) => void;
  onToggleStatus: (id: string) => void;
  onResetPassword: (id: string) => void;
  onResendInvite: (id: string) => void;
  onDelete: (id: string) => void;
  onSendNotification: (
    id: string,
    channel: "email" | "sms" | "push",
    message: string
  ) => void;
}

function AdminUserDetailBody({
  user,
  currentAdminId,
  twoFactorEnabled,
  queueNames,
  titleId,
  onClose,
  onChangeRole,
  onUpdatePermissions,
  onToggleStatus,
  onResetPassword,
  onResendInvite,
  onDelete,
  onSendNotification,
}: BodyProps) {
  const now = useNow();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [selectedRole, setSelectedRole] = useState<Role>(user.role);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(
    null
  );
  const [notifyOpen, setNotifyOpen] = useState(false);

  const hasRoleChanged = selectedRole !== user.role;
  const effective = effectivePermissions({
    role: user.role,
    extraPermissions: user.extraPermissions,
  });
  const inherited = rolePermissions(user.role);
  const moduleCount = countModules(effective);
  const isPending = user.status === "pending";
  const isSelf = user.id === currentAdminId;

  const confirmCopy = getConfirmCopy(confirmAction, user, selectedRole);

  return (
    <div className="absolute right-0 top-0 flex h-full w-full max-w-2xl flex-col bg-white shadow-xl dark:bg-neutral-900">
      <div className="flex items-start justify-between gap-3 border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
            {initialsFor(user.name)}
          </div>
          <div className="min-w-0">
            <p id={titleId} className="truncate text-sm font-semibold">
              {user.name}
            </p>
            <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
              {user.email}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
        <div className="flex items-center gap-1.5">
          <StatusDot
            tone={
              user.status === "active"
                ? "success"
                : user.status === "suspended"
                ? "danger"
                : "warning"
            }
            size="sm"
          />
          <Badge variant={STATUS_VARIANT[user.status]}>
            {STATUS_LABEL[user.status]}
          </Badge>
        </div>
        <Badge variant={ROLE_VARIANT[user.role]}>{roleLabel(user.role)}</Badge>
        {twoFactorEnabled ? (
          <Badge variant="success" size="sm">
            2FA on
          </Badge>
        ) : (
          <Badge variant="warning" size="sm">
            2FA missing
          </Badge>
        )}
        {isSelf && (
          <Badge variant="brand" size="sm">
            You
          </Badge>
        )}
      </div>

      <div
        role="tablist"
        aria-label="Admin user sections"
        className="flex overflow-x-auto border-b border-neutral-200 dark:border-neutral-800"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              role="tab"
              type="button"
              aria-selected={isActive}
              aria-controls={`admin-user-panel-${tab.key}`}
              id={`admin-user-tab-${tab.key}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "whitespace-nowrap border-b-2 px-4 py-2 text-xs font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                isActive
                  ? "border-brand-600 text-brand-700 dark:border-brand-400 dark:text-brand-300"
                  : "border-transparent text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`admin-user-panel-${activeTab}`}
        aria-labelledby={`admin-user-tab-${activeTab}`}
        className="flex-1 overflow-y-auto p-4"
      >
        {activeTab === "overview" && (
          <OverviewTab
            user={user}
            selectedRole={selectedRole}
            onSelectRole={setSelectedRole}
            hasRoleChanged={hasRoleChanged}
            onChangeRole={() => setConfirmAction("change_role")}
            twoFactorEnabled={twoFactorEnabled}
            queueNames={queueNames}
            effectiveCount={effective.length}
            inheritedCount={inherited.length}
            extraCount={user.extraPermissions.length}
            moduleCount={moduleCount}
            now={now}
          />
        )}

        {activeTab === "permissions" && (
          <AdminUserPermissionsEditor
            role={user.role}
            extraPermissions={user.extraPermissions}
            onSave={(next) => {
              onUpdatePermissions(user.id, next);
              onClose();
            }}
            onCancel={onClose}
          />
        )}

        {activeTab === "sessions" && <AdminUserSessionsPanel user={user} />}

        {activeTab === "activity" && <AdminUserAuditPanel user={user} />}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-neutral-200 px-4 py-3 dark:border-neutral-800">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setNotifyOpen(true)}
        >
          Send notification
        </Button>
        {isPending ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirmAction("resend_invite")}
          >
            Resend invite
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirmAction("reset_password")}
          >
            Reset password
          </Button>
        )}
        {user.status === "active" && !isSelf && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setConfirmAction("suspend")}
          >
            Suspend
          </Button>
        )}
        {user.status === "suspended" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirmAction("reactivate")}
          >
            Reactivate
          </Button>
        )}
        {!isSelf && (
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto text-danger-600 dark:text-danger-400"
            onClick={() => setConfirmAction("delete")}
          >
            Delete
          </Button>
        )}
      </div>

      <SendNotificationModal
        open={notifyOpen}
        onClose={() => setNotifyOpen(false)}
        onSend={(channel, message) => {
          onSendNotification(user.id, channel, message);
          setNotifyOpen(false);
        }}
      />

      <ConfirmDialog
        open={confirmAction !== null}
        title={confirmCopy.title}
        description={confirmCopy.description}
        confirmLabel={confirmCopy.confirmLabel}
        danger={confirmCopy.danger}
        onConfirm={() => {
          if (confirmAction === "change_role") {
            onChangeRole(user.id, selectedRole);
          } else if (
            confirmAction === "suspend" ||
            confirmAction === "reactivate"
          ) {
            onToggleStatus(user.id);
          } else if (confirmAction === "reset_password") {
            onResetPassword(user.id);
          } else if (confirmAction === "resend_invite") {
            onResendInvite(user.id);
          } else if (confirmAction === "delete") {
            onDelete(user.id);
          }
          setConfirmAction(null);
          onClose();
        }}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}

interface OverviewTabProps {
  user: AdminUser;
  selectedRole: Role;
  onSelectRole: (role: Role) => void;
  hasRoleChanged: boolean;
  onChangeRole: () => void;
  twoFactorEnabled: boolean;
  queueNames: string[];
  effectiveCount: number;
  inheritedCount: number;
  extraCount: number;
  moduleCount: number;
  now: number | null;
}

function OverviewTab({
  user,
  selectedRole,
  onSelectRole,
  hasRoleChanged,
  onChangeRole,
  twoFactorEnabled,
  queueNames,
  effectiveCount,
  inheritedCount,
  extraCount,
  moduleCount,
  now,
}: OverviewTabProps) {
  const selectClass =
    "h-10 flex-1 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100";

  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          Identity
        </p>
        <dl className="mt-2 grid grid-cols-[8rem_1fr] gap-x-3 gap-y-1.5 text-sm">
          <dt className="text-neutral-500 dark:text-neutral-400">User ID</dt>
          <dd className="font-mono text-xs text-neutral-800 dark:text-neutral-200">
            {user.id}
          </dd>
          <dt className="text-neutral-500 dark:text-neutral-400">Email</dt>
          <dd className="text-neutral-800 dark:text-neutral-200">
            {user.email}
            {user.emailVerified ? (
              <span className="ml-2 text-xs text-success-700 dark:text-success-300">
                Verified
              </span>
            ) : (
              <span className="ml-2 text-xs text-warning-700 dark:text-warning-300">
                Not verified
              </span>
            )}
          </dd>
          <dt className="text-neutral-500 dark:text-neutral-400">Created</dt>
          <dd>
            <time
              dateTime={user.createdAt}
              title={formatAbsolute(user.createdAt)}
              className="text-neutral-800 dark:text-neutral-200"
            >
              {formatRelative(user.createdAt, now)}
            </time>
          </dd>
          <dt className="text-neutral-500 dark:text-neutral-400">
            Last login
          </dt>
          <dd className="text-neutral-800 dark:text-neutral-200">
            {user.lastLogin ? (
              <time
                dateTime={user.lastLogin}
                title={formatAbsolute(user.lastLogin)}
              >
                {formatRelative(user.lastLogin, now)}
              </time>
            ) : (
              "Never"
            )}
          </dd>
          {user.lastLoginFrom && (
            <>
              <dt className="text-neutral-500 dark:text-neutral-400">
                Last from
              </dt>
              <dd className="font-mono text-xs text-neutral-800 dark:text-neutral-200">
                {user.lastLoginFrom}
              </dd>
            </>
          )}
        </dl>
      </section>

      {queueNames.length > 0 && (
        <section className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Support context
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {queueNames.map((name) => (
              <Badge key={name} variant="brand" size="sm">
                {name} queue
              </Badge>
            ))}
            {user.handles.map((handle) => (
              <Badge key={handle} variant="neutral" size="sm">
                {USER_TYPE_LABEL[handle]}
              </Badge>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Two-factor authentication
          </p>
          <Link
            href={`/admin/security?q=${encodeURIComponent(user.email)}`}
            className="text-xs font-medium text-brand-700 hover:underline dark:text-brand-300"
          >
            Manage in Security
          </Link>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <StatusDot
            tone={twoFactorEnabled ? "success" : "warning"}
            size="sm"
          />
          <span className="text-sm text-neutral-800 dark:text-neutral-200">
            {twoFactorEnabled
              ? "Enrolled"
              : "Not enrolled. This admin is exposed if their password leaks."}
          </span>
        </div>
      </section>

      <section className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          Role assignment
        </p>
        <div className="mt-2 flex gap-2">
          <label htmlFor="admin-user-role-select" className="sr-only">
            Role
          </label>
          <select
            id="admin-user-role-select"
            className={selectClass}
            value={selectedRole}
            onChange={(e) => onSelectRole(e.target.value as Role)}
          >
            {ALL_ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <Button
            variant="outline"
            size="sm"
            disabled={!hasRoleChanged}
            onClick={onChangeRole}
          >
            Update role
          </Button>
        </div>
        {hasRoleChanged && (
          <p className="mt-2 text-xs text-warning-700 dark:text-warning-300">
            Role will change from{" "}
            <strong className="font-semibold">{roleLabel(user.role)}</strong>{" "}
            to{" "}
            <strong className="font-semibold">
              {roleLabel(selectedRole)}
            </strong>
            . Inherited permissions update automatically. Extra grants are kept.
          </p>
        )}
      </section>

      <section className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          Permissions
        </p>
        <p className="mt-2 text-sm text-neutral-800 dark:text-neutral-200">
          {effectiveCount} effective across {moduleCount} modules
        </p>
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          {inheritedCount} inherited from {roleLabel(user.role)} · {extraCount}{" "}
          extra
        </p>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-md bg-neutral-50 p-3 dark:bg-neutral-900">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Activity events
          </p>
          <p className="mt-1 text-lg font-bold text-neutral-900 dark:text-neutral-100">
            {user.activityLog.length}
          </p>
        </div>
        <div className="rounded-md bg-neutral-50 p-3 dark:bg-neutral-900">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Extra grants
          </p>
          <p className="mt-1 text-lg font-bold text-neutral-900 dark:text-neutral-100">
            {extraCount}
          </p>
        </div>
      </div>
    </div>
  );
}

interface SendNotificationModalProps {
  open: boolean;
  onClose: () => void;
  onSend: (channel: "email" | "sms" | "push", message: string) => void;
}

function SendNotificationModal({
  open,
  onClose,
  onSend,
}: SendNotificationModalProps) {
  const [channel, setChannel] = useState<"email" | "sms" | "push">("email");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed) {
      setError("Write a message before sending.");
      return;
    }
    onSend(channel, trimmed);
    setMessage("");
    setError(null);
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Send notification"
      description="Delivered directly to this admin through the selected channel."
      size="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSend}>
            Send
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <SettingsField label="Channel" htmlFor="admin-notify-channel">
          <select
            id="admin-notify-channel"
            className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            value={channel}
            onChange={(e) =>
              setChannel(e.target.value as "email" | "sms" | "push")
            }
          >
            <option value="email">Email</option>
            <option value="sms">SMS</option>
            <option value="push">Push</option>
          </select>
        </SettingsField>

        <SettingsField
          label="Message"
          htmlFor="admin-notify-message"
          required
        >
          <textarea
            id="admin-notify-message"
            className="w-full rounded-md border border-neutral-300 p-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            rows={4}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              setError(null);
            }}
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

function getConfirmCopy(
  action: ConfirmAction | null,
  user: AdminUser,
  selectedRole: Role
): {
  title: string;
  description: string;
  confirmLabel: string;
  danger: boolean;
} {
  if (action === "change_role") {
    return {
      title: `Change ${user.name}'s role?`,
      description: `${user.name} will move from ${roleLabel(user.role)} to ${roleLabel(selectedRole)}. Inherited permissions update automatically; extra grants are preserved.`,
      confirmLabel: "Change role",
      danger: false,
    };
  }
  if (action === "suspend") {
    return {
      title: `Suspend ${user.name}?`,
      description: `${user.name} will be signed out and blocked from signing in until reactivated. Audit history is preserved.`,
      confirmLabel: "Suspend admin",
      danger: true,
    };
  }
  if (action === "reactivate") {
    return {
      title: `Reactivate ${user.name}?`,
      description: `${user.name} will be able to sign in again with their existing permissions.`,
      confirmLabel: "Reactivate",
      danger: false,
    };
  }
  if (action === "reset_password") {
    return {
      title: `Send password reset to ${user.name}?`,
      description: `A password reset link will be emailed to ${user.email}. The link expires in one hour.`,
      confirmLabel: "Send reset link",
      danger: false,
    };
  }
  if (action === "resend_invite") {
    return {
      title: `Resend invitation to ${user.name}?`,
      description: `A new invitation email will be sent to ${user.email}. The existing invitation is invalidated.`,
      confirmLabel: "Resend invite",
      danger: false,
    };
  }
  if (action === "delete") {
    return {
      title: `Delete ${user.name}?`,
      description: `${user.name} will be removed from the admin directory. Their audit history is preserved. You can undo this for a few seconds after.`,
      confirmLabel: "Delete admin",
      danger: true,
    };
  }
  return { title: "", description: "", confirmLabel: "Confirm", danger: false };
}