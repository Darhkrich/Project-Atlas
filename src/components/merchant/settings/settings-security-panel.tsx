"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { AtlasIcon } from "@/components/atlas/icons";
import { SettingsSection } from "./settings-section";

interface PasswordForm {
  current: string;
  next: string;
  confirm: string;
}

const EMPTY_FORM: PasswordForm = { current: "", next: "", confirm: "" };

export function SettingsSecurityPanel() {
  const { user, changePassword } = useAuth();

  const [form, setForm] = useState<PasswordForm>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (key: keyof PasswordForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (success) setSuccess(null);
    if (error) setError(null);
  };

  const handleSubmit = () => {
    if (form.next !== form.confirm) {
      setError("New passwords do not match.");
      return;
    }
    setIsSaving(true);
    const result = changePassword({
      current: form.current,
      next: form.next,
    });
    setIsSaving(false);
    if (!result.ok) {
      setError(result.error ?? "Could not change your password.");
      return;
    }
    setForm(EMPTY_FORM);
    setSuccess("Password changed.");
  };

  const twoFactorOn = user?.twoFactor === true;

  return (
    <div className="space-y-6">
      <SettingsSection
        title="Change password"
        description="Choose a password of at least 8 characters."
        successMessage={success}
        errorMessage={error}
      >
        <div className="space-y-5">
          <div>
            <label
              htmlFor="settings-security-current"
              className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Current password
            </label>
            <input
              id="settings-security-current"
              type="password"
              autoComplete="current-password"
              value={form.current}
              onChange={(e) => handleChange("current", e.target.value)}
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="settings-security-next"
                className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                New password
              </label>
              <input
                id="settings-security-next"
                type="password"
                autoComplete="new-password"
                value={form.next}
                onChange={(e) => handleChange("next", e.target.value)}
                placeholder="At least 8 characters"
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
              />
            </div>
            <div>
              <label
                htmlFor="settings-security-confirm"
                className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Confirm new password
              </label>
              <input
                id="settings-security-confirm"
                type="password"
                autoComplete="new-password"
                value={form.confirm}
                onChange={(e) => handleChange("confirm", e.target.value)}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving}
              aria-busy={isSaving}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? "Updating..." : "Update password"}
            </button>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Two-factor authentication"
        description="Add an extra layer of security to your account."
      >
        <div className="flex items-start gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-950">
          <AtlasIcon
            name="shield"
            className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400"
            aria-hidden="true"
          />
          <div className="min-w-0">
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              {twoFactorOn ? "Enabled" : "Not yet available"}
            </p>
            <p className="mt-0.5 text-xs text-neutral-600 dark:text-neutral-400">
              Two-factor authentication is coming soon. You will be notified
              when it is available.
            </p>
          </div>
        </div>
      </SettingsSection>
    </div>
  );
}