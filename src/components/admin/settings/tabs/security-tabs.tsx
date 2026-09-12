// components/admin/settings/tabs/security-tabs.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Badge } from "@/components/admin/ui/badge";
import { SettingsField } from "@/components/admin/ui/settings-field";
import type {
  MaintenanceSettings,
  SecuritySettings,
} from "@/lib/admin/types/settings";

interface SecurityTabProps {
  value: SecuritySettings;
  onChange: (patch: Partial<SecuritySettings>) => void;
}

export function SecurityTab({ value, onChange }: SecurityTabProps) {
  const passwordRangeInvalid =
    value.passwordMinLength > value.passwordMinLengthMax;
  const sessionInvalid =
    value.sessionTimeoutMinutes > value.sessionTimeoutMinutesMax;
  const loginAttemptsInvalid =
    value.maxLoginAttempts > value.maxLoginAttemptsMax;
  const lockoutInvalid =
    value.lockoutDurationMinutes > value.lockoutDurationMinutesMax;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Password policy</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SettingsField
            label="Minimum length"
            htmlFor="security-password-min"
            hint="Between 8 and 64 characters."
            error={
              passwordRangeInvalid
                ? "Minimum cannot exceed maximum."
                : value.passwordMinLength < 8
                ? "Minimum must be at least 8."
                : undefined
            }
          >
            <Input
              id="security-password-min"
              type="number"
              min={8}
              max={value.passwordMinLengthMax}
              value={value.passwordMinLength}
              onChange={(e) =>
                onChange({ passwordMinLength: Number(e.target.value) })
              }
            />
          </SettingsField>

          <SettingsField
            label="Maximum length"
            htmlFor="security-password-max"
            hint="Upper bound enforced at signup. Existing passwords are unaffected."
          >
            <Input
              id="security-password-max"
              type="number"
              min={value.passwordMinLength}
              max={128}
              value={value.passwordMinLengthMax}
              onChange={(e) =>
                onChange({ passwordMinLengthMax: Number(e.target.value) })
              }
            />
          </SettingsField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Session &amp; login</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SettingsField
            label="Session timeout (minutes)"
            htmlFor="security-session-timeout"
            hint="Admins are signed out after this period of inactivity."
            error={sessionInvalid ? "Exceeds the upper bound." : undefined}
          >
            <Input
              id="security-session-timeout"
              type="number"
              min={5}
              max={value.sessionTimeoutMinutesMax}
              value={value.sessionTimeoutMinutes}
              onChange={(e) =>
                onChange({ sessionTimeoutMinutes: Number(e.target.value) })
              }
            />
          </SettingsField>

          <SettingsField
            label="Session timeout ceiling"
            htmlFor="security-session-timeout-max"
            hint="Caps how high the timeout can be set to."
          >
            <Input
              id="security-session-timeout-max"
              type="number"
              min={value.sessionTimeoutMinutes}
              max={1440}
              value={value.sessionTimeoutMinutesMax}
              onChange={(e) =>
                onChange({ sessionTimeoutMinutesMax: Number(e.target.value) })
              }
            />
          </SettingsField>

          <SettingsField
            label="Max login attempts"
            htmlFor="security-max-attempts"
            hint="After this many failures, the account locks temporarily."
            error={loginAttemptsInvalid ? "Exceeds the ceiling." : undefined}
          >
            <Input
              id="security-max-attempts"
              type="number"
              min={3}
              max={value.maxLoginAttemptsMax}
              value={value.maxLoginAttempts}
              onChange={(e) =>
                onChange({ maxLoginAttempts: Number(e.target.value) })
              }
            />
          </SettingsField>

          <SettingsField
            label="Login attempts ceiling"
            htmlFor="security-max-attempts-max"
            hint="Caps how high the attempt count can be set to."
          >
            <Input
              id="security-max-attempts-max"
              type="number"
              min={value.maxLoginAttempts}
              max={50}
              value={value.maxLoginAttemptsMax}
              onChange={(e) =>
                onChange({ maxLoginAttemptsMax: Number(e.target.value) })
              }
            />
          </SettingsField>

          <SettingsField
            label="Lockout duration (minutes)"
            htmlFor="security-lockout-duration"
            hint="How long an account stays locked after too many failures."
            error={lockoutInvalid ? "Exceeds the ceiling." : undefined}
          >
            <Input
              id="security-lockout-duration"
              type="number"
              min={5}
              max={value.lockoutDurationMinutesMax}
              value={value.lockoutDurationMinutes}
              onChange={(e) =>
                onChange({ lockoutDurationMinutes: Number(e.target.value) })
              }
            />
          </SettingsField>

          <SettingsField
            label="Lockout duration ceiling"
            htmlFor="security-lockout-duration-max"
            hint="Caps how long a lockout can last."
          >
            <Input
              id="security-lockout-duration-max"
              type="number"
              min={value.lockoutDurationMinutes}
              max={1440}
              value={value.lockoutDurationMinutesMax}
              onChange={(e) =>
                onChange({
                  lockoutDurationMinutesMax: Number(e.target.value),
                })
              }
            />
          </SettingsField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Two-factor authentication</CardTitle>
        </CardHeader>
        <CardContent>
          <label className="flex items-start gap-3 rounded-md border border-neutral-200 p-3 dark:border-neutral-700">
            <input
              type="checkbox"
              checked={value.require2FA}
              onChange={(e) => onChange({ require2FA: e.target.checked })}
              className="mt-0.5 h-4 w-4"
            />
            <span>
              <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
                Require two-factor authentication for admins
              </span>
              <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                Every admin account must have a second factor enrolled.
                Admins without one are locked out at their next login.
              </span>
            </span>
          </label>
        </CardContent>
      </Card>
    </div>
  );
}

interface MaintenanceTabProps {
  value: MaintenanceSettings;
  onChange: (patch: Partial<MaintenanceSettings>) => void;
  onToggle: () => void;
}

export function MaintenanceTab({
  value,
  onChange,
  onToggle,
}: MaintenanceTabProps) {
  const [ipInput, setIpInput] = useState("");

  const addIp = () => {
    const trimmed = ipInput.trim();
    if (!trimmed) return;
    if (value.allowedIPs.includes(trimmed)) {
      setIpInput("");
      return;
    }
    onChange({ allowedIPs: [...value.allowedIPs, trimmed] });
    setIpInput("");
  };

  const removeIp = (ip: string) => {
    onChange({ allowedIPs: value.allowedIPs.filter((x) => x !== ip) });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Maintenance mode</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-neutral-200 p-3 dark:border-neutral-700">
            <div>
              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                Current status
              </p>
              <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                When enabled, all non-allowlisted users are redirected to the
                maintenance page.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={value.enabled ? "danger" : "success"}>
                {value.enabled ? "Enabled" : "Disabled"}
              </Badge>
              <Button
                variant={value.enabled ? "outline" : "destructive"}
                size="sm"
                onClick={onToggle}
              >
                {value.enabled ? "Disable" : "Enable maintenance"}
              </Button>
            </div>
          </div>

          <SettingsField
            label="Public message"
            htmlFor="maintenance-message"
            hint="Shown to users on the maintenance page."
          >
            <textarea
              id="maintenance-message"
              className="w-full rounded-md border border-neutral-300 p-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              rows={3}
              value={value.message}
              onChange={(e) => onChange({ message: e.target.value })}
            />
          </SettingsField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Maintenance window</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SettingsField
            label="Starts at"
            htmlFor="maintenance-start"
            hint="Ghana time."
          >
            <Input
              id="maintenance-start"
              type="datetime-local"
              value={
                value.window?.startAt
                  ? value.window.startAt.slice(0, 16)
                  : ""
              }
              onChange={(e) =>
                onChange({
                  window: {
                    startAt: e.target.value
                      ? new Date(e.target.value).toISOString()
                      : "",
                    endAt: value.window?.endAt ?? "",
                  },
                })
              }
            />
          </SettingsField>

          <SettingsField
            label="Ends at"
            htmlFor="maintenance-end"
            hint="Ghana time."
          >
            <Input
              id="maintenance-end"
              type="datetime-local"
              value={
                value.window?.endAt ? value.window.endAt.slice(0, 16) : ""
              }
              onChange={(e) =>
                onChange({
                  window: {
                    startAt: value.window?.startAt ?? "",
                    endAt: e.target.value
                      ? new Date(e.target.value).toISOString()
                      : "",
                  },
                })
              }
            />
          </SettingsField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Allowlisted IP addresses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            These IPs can access Atlas during maintenance. Add at least one so
            admins can turn maintenance off.
          </p>

          <div className="flex gap-2">
            <Input
              aria-label="Add IP address"
              value={ipInput}
              onChange={(e) => setIpInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addIp();
                }
              }}
              placeholder="e.g. 154.160.1.1"
            />
            <Button variant="outline" size="sm" onClick={addIp}>
              Add
            </Button>
          </div>

          {value.allowedIPs.length === 0 ? (
            <p className="text-xs text-warning-700 dark:text-warning-300">
              No allowlisted IPs. Enabling maintenance will lock you out.
            </p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {value.allowedIPs.map((ip) => (
                <li
                  key={ip}
                  className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200"
                >
                  <span className="font-mono">{ip}</span>
                  <button
                    type="button"
                    aria-label={`Remove ${ip}`}
                    onClick={() => removeIp(ip)}
                    className="text-neutral-500 hover:text-danger-600 dark:text-neutral-400 dark:hover:text-danger-400"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}