"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useCurrentMerchant } from "@/lib/merchant/hooks/use-current-merchant";
import { SettingsSection } from "./settings-section";
import { SettingsSaveBar } from "./settings-save-bar";

interface FormState {
  name: string;
  phone: string;
}

function serialize(state: FormState): string {
  return JSON.stringify(state);
}

export function SettingsProfilePanel() {
  const { updateProfile } = useAuth();
  const merchant = useCurrentMerchant();

  const baseline = useMemo<FormState>(
    () => ({
      name: merchant?.name ?? "",
      phone: merchant?.phone ?? "",
    }),
    [merchant?.name, merchant?.phone]
  );

  const [form, setForm] = useState<FormState>(baseline);
  const [baselineSerialized, setBaselineSerialized] = useState(
    serialize(baseline)
  );
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentSerialized = serialize(form);
  const isDirty = currentSerialized !== baselineSerialized;

  const handleChange = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (success) setSuccess(null);
    if (error) setError(null);
  };

  const handleReset = () => {
    setForm(baseline);
    setBaselineSerialized(serialize(baseline));
    setSuccess(null);
    setError(null);
  };

  const handleSave = () => {
    setIsSaving(true);
    const result = updateProfile({ name: form.name, phone: form.phone });
    setIsSaving(false);
    if (!result.ok) {
      setError(result.error ?? "Could not save.");
      return;
    }
    setBaselineSerialized(currentSerialized);
    setSuccess("Profile updated.");
  };

  return (
    <SettingsSection
      title="Personal information"
      description="Your name and phone. Only visible to Atlas."
      successMessage={success}
      errorMessage={error}
    >
      <div className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="settings-profile-name"
              className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Full name
            </label>
            <input
              id="settings-profile-name"
              type="text"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
            />
          </div>
          <div>
            <label
              htmlFor="settings-profile-phone"
              className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Phone number
            </label>
            <input
              id="settings-profile-phone"
              type="tel"
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="e.g., 024 123 4567"
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="settings-profile-email"
            className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            Login email
          </label>
          <input
            id="settings-profile-email"
            type="email"
            value={merchant?.email ?? ""}
            readOnly
            className="w-full cursor-not-allowed rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400"
          />
          <p className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400">
            Contact Atlas support to change your login email.
          </p>
        </div>
      </div>

      <SettingsSaveBar
        isDirty={isDirty}
        isSaving={isSaving}
        onSave={handleSave}
        onReset={handleReset}
      />
    </SettingsSection>
  );
}