"use client";

import { useMemo, useRef, useState } from "react";
import { useStorefrontConfig } from "@/contexts/storefront-config-context";
import { compressImage } from "@/lib/merchant/products/forms/image";
import { AtlasIcon } from "@/components/atlas/icons";
import { SettingsSection } from "./settings-section";
import { SettingsSaveBar } from "./settings-save-bar";

interface FormState {
  storeName: string;
  contactEmail: string;
  contactPhone: string;
  description: string;
  logo: string;
}

function serialize(state: FormState): string {
  return JSON.stringify(state);
}

export function SettingsBusinessPanel() {
  const { storefrontConfig, updateStorefrontConfig } = useStorefrontConfig();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const baseline = useMemo<FormState>(
    () => ({
      storeName: storefrontConfig.storeName ?? "",
      contactEmail: storefrontConfig.contactEmail ?? "",
      contactPhone: storefrontConfig.contactPhone ?? "",
      description: storefrontConfig.description ?? "",
      logo: storefrontConfig.logo ?? "",
    }),
    [
      storefrontConfig.storeName,
      storefrontConfig.contactEmail,
      storefrontConfig.contactPhone,
      storefrontConfig.description,
      storefrontConfig.logo,
    ]
  );

  const [form, setForm] = useState<FormState>(baseline);
  const [baselineSerialized, setBaselineSerialized] = useState(
    serialize(baseline)
  );
  const [isSaving, setIsSaving] = useState(false);
  const [imageBusy, setImageBusy] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentSerialized = serialize(form);
  const isDirty = currentSerialized !== baselineSerialized;

  const handleChange = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (success) setSuccess(null);
    if (error) setError(null);
  };

  const handleLogoChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageBusy(true);
    setError(null);
    try {
      const compressed = await compressImage(file);
      setForm((prev) => ({ ...prev, logo: compressed }));
      if (success) setSuccess(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not process the image."
      );
    } finally {
      setImageBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleReset = () => {
    setForm(baseline);
    setBaselineSerialized(serialize(baseline));
    setSuccess(null);
    setError(null);
  };

  const handleSave = () => {
    setIsSaving(true);
    updateStorefrontConfig({
      storeName: form.storeName,
      contactEmail: form.contactEmail,
      contactPhone: form.contactPhone,
      description: form.description,
      logo: form.logo.length > 0 ? form.logo : undefined,
    });
    setIsSaving(false);
    setBaselineSerialized(currentSerialized);
    setSuccess("Business details updated.");
  };

  return (
    <SettingsSection
      title="Business information"
      description="Shown to customers on your storefront."
      successMessage={success}
      errorMessage={error}
    >
      <div className="space-y-5">
        <div>
          <label
            htmlFor="settings-business-name"
            className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            Business name
          </label>
          <input
            id="settings-business-name"
            type="text"
            value={form.storeName}
            onChange={(e) => handleChange("storeName", e.target.value)}
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="settings-business-email"
              className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Business email
            </label>
            <input
              id="settings-business-email"
              type="email"
              value={form.contactEmail}
              onChange={(e) => handleChange("contactEmail", e.target.value)}
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
            />
          </div>
          <div>
            <label
              htmlFor="settings-business-phone"
              className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Business phone
            </label>
            <input
              id="settings-business-phone"
              type="tel"
              value={form.contactPhone}
              onChange={(e) => handleChange("contactPhone", e.target.value)}
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="settings-business-description"
            className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            Description
          </label>
          <textarea
            id="settings-business-description"
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            maxLength={2000}
            rows={3}
            placeholder="What does your business sell?"
            className="w-full resize-none rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
          />
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            {form.description.length} / 2000
          </p>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Logo
          </label>
          <div className="flex items-center gap-3">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
              {form.logo ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={form.logo}
                  alt="Business logo"
                  className="h-full w-full object-cover"
                />
              ) : (
                <AtlasIcon
                  name="image"
                  className="h-6 w-6 text-neutral-400"
                  aria-hidden="true"
                />
              )}
            </div>
            <label
              className={
                "cursor-pointer rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 " +
                (imageBusy ? "cursor-wait opacity-60" : "")
              }
            >
              {imageBusy ? "Processing..." : "Upload logo"}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoChange}
                disabled={imageBusy}
              />
            </label>
            {form.logo && (
              <button
                type="button"
                onClick={() => handleChange("logo", "")}
                className="text-xs font-medium text-danger-600 hover:text-danger-700"
              >
                Remove
              </button>
            )}
          </div>
          <p className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400">
            Shown on the storefront header and browser tab.
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