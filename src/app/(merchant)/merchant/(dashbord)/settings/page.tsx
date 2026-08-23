/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";

export default function MerchantSettingsPage() {
  const [activeTab, setActiveTab] = useState<
    "profile" | "business" | "security" | "preferences"
  >("profile");
  const [darkMode, setDarkMode] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  useEffect(() => {
    // Apply dark mode class to document
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    // Store preference
    localStorage.setItem("atlas-dark-mode", darkMode ? "true" : "false");
  }, [darkMode]);

  // Load dark mode preference on mount
  useEffect(() => {
    const stored = localStorage.getItem("atlas-dark-mode");
    if (stored === "true") {
      setDarkMode(true);
    }
  }, []);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: "user" as const },
    { id: "business", label: "Business", icon: "store" as const },
    { id: "security", label: "Security", icon: "lock" as const },
    { id: "preferences", label: "Preferences", icon: "settings" as const },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
          Settings
        </h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          Manage your account and business preferences.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-neutral-200 dark:border-neutral-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
              activeTab === tab.id
                ? "border-brand-600 text-brand-700 dark:text-brand-200"
                : "border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            )}
          >
            <AtlasIcon name={tab.icon} className="h-5 w-5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === "profile" && (
          <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Personal Information
            </h2>
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Full name
                </label>
                <input
                  id="fullName"
                  type="text"
                  defaultValue="John Mensah"
                  className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                />
              </div>
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  defaultValue="john@example.com"
                  className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                />
              </div>
              <div>
                <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Phone number
                </label>
                <input
                  id="phone"
                  type="tel"
                  defaultValue="024 123 4567"
                  className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800">
                Cancel
              </button>
              <button className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
                Save Changes
              </button>
            </div>
          </div>
        )}

        {activeTab === "business" && (
          <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Business Information
            </h2>
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Business Logo
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 overflow-hidden dark:border-neutral-700 dark:bg-neutral-950">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <AtlasIcon name="image" className="h-8 w-8 text-neutral-400" />
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="cursor-pointer rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800">
                      Upload Logo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoChange}
                      />
                    </label>
                    {logoPreview && (
                      <button
                        onClick={() => setLogoPreview(null)}
                        className="text-sm text-danger-600 hover:text-danger-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="businessName" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Business / Store name
                </label>
                <input
                  id="businessName"
                  type="text"
                  defaultValue="Glow Beauty Cosmetics"
                  className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                />
              </div>
              <div>
                <label htmlFor="businessEmail" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Business email
                </label>
                <input
                  id="businessEmail"
                  type="email"
                  defaultValue="support@glowbeauty.com"
                  className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="businessDescription" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Description
                </label>
                <textarea
                  id="businessDescription"
                  rows={3}
                  defaultValue="Natural and organic beauty products."
                  className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 resize-none"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800">
                Cancel
              </button>
              <button className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
                Save Changes
              </button>
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Security
            </h2>
            <div className="mt-4 space-y-5">
              <div>
                <label htmlFor="currentPassword" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Current password
                </label>
                <input
                  id="currentPassword"
                  type="password"
                  placeholder="Enter current password"
                  className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="newPassword" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    New password
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    placeholder="At least 8 characters"
                    className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Confirm new password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="Re-enter new password"
                    className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                  />
                </div>
              </div>

              {/* Two-Factor Authentication */}
              <div className="border-t border-neutral-200 pt-5 dark:border-neutral-800">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      Two-Factor Authentication (2FA)
                    </h3>
                    <p className="mt-1 text-sm text-neutral-500">
                      Add an extra layer of security to your account by requiring a code in addition to your password.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={twoFactorEnabled}
                      onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-500 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                  </label>
                </div>
                {twoFactorEnabled && (
                  <div className="mt-4 rounded-lg bg-brand-50 p-4 dark:bg-brand-900/30">
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">
                      <AtlasIcon name="shield" className="mr-1 inline h-4 w-4" />
                      2FA is enabled. Use an authenticator app to scan the QR code below (simulated).
                    </p>
                    <div className="mt-3 flex h-40 w-40 items-center justify-center rounded-lg bg-white dark:bg-neutral-800">
                      <span className="text-neutral-400">QR Code</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
                Update Security
              </button>
            </div>
          </div>
        )}

        {activeTab === "preferences" && (
          <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Preferences
            </h2>
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Dark Mode
                  </p>
                  <p className="text-xs text-neutral-500">
                    Switch between light and dark theme.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={darkMode}
                    onChange={(e) => setDarkMode(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-500 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                </label>
              </div>
              <div className="border-t border-neutral-200 pt-4 dark:border-neutral-800">
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Notification Preferences
                </p>
                {[
                  { label: "New order received", enabled: true },
                  { label: "Order status updates", enabled: true },
                  { label: "Low stock alerts", enabled: true },
                  { label: "Subscription renewal reminders", enabled: false },
                ].map((pref) => (
                  <div key={pref.label} className="mt-3 flex items-center justify-between">
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">
                      {pref.label}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={pref.enabled}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-500 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
                Save Preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}