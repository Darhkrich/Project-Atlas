/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";

type ActiveTab = "profile" | "business" | "security" | "preferences";

const tabs: Array<{ id: ActiveTab; label: string; icon: "user" | "store" | "lock" | "settings" }> = [
  { id: "profile", label: "Profile", icon: "user" as const },
  { id: "business", label: "Business", icon: "store" as const },
  { id: "security", label: "Security", icon: "lock" as const },
  { id: "preferences", label: "Preferences", icon: "settings" as const },
];

export default function MerchantSettingsPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("profile");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [darkMode, setDarkMode] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [notificationPrefs, setNotificationPrefs] = useState({
    newOrder: true,
    orderStatus: true,
    lowStock: true,
    subscription: false,
  });

  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    const stored = localStorage.getItem("atlas-dark-mode");
    if (stored !== null) {
      setDarkMode(stored === "true");
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setDarkMode(true);
    }
  }, []);

  // Apply dark class whenever darkMode changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("atlas-dark-mode", String(darkMode));
  }, [darkMode]);

  const simulateSave = () => {
    setSaveState("saving");
    setTimeout(() => {
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2000);
    }, 800);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
          Settings
        </h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          Manage your account, business, and preferences.
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
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Personal Information</h2>
                <p className="text-sm text-neutral-500">Update your personal details.</p>
              </div>
              <button
                onClick={simulateSave}
                disabled={saveState === "saving"}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
              >
                {saveState === "saving" ? "Saving..." : saveState === "saved" ? "Saved!" : "Save Changes"}
              </button>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Full Name</label>
                <input
                  type="text"
                  defaultValue="John Mensah"
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Email Address</label>
                <input
                  type="email"
                  defaultValue="john@example.com"
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Phone Number</label>
                <input
                  type="tel"
                  defaultValue="024 123 4567"
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "business" && (
          <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Business Information</h2>
                <p className="text-sm text-neutral-500">Manage your business details and logo.</p>
              </div>
              <button
                onClick={simulateSave}
                disabled={saveState === "saving"}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
              >
                {saveState === "saving" ? "Saving..." : saveState === "saved" ? "Saved!" : "Save Changes"}
              </button>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Business / Store Name</label>
                <input
                  type="text"
                  defaultValue="Glow Beauty Cosmetics"
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Business Email</label>
                <input
                  type="email"
                  defaultValue="support@glowbeauty.com"
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Business Phone</label>
                <input
                  type="tel"
                  defaultValue="055 987 6543"
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Business Description</label>
                <textarea
                  rows={3}
                  defaultValue="Natural and organic beauty products."
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 resize-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Business Logo</label>
                <div className="flex items-center gap-3">
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo" className="h-full w-full object-cover" />
                    ) : (
                      <AtlasIcon name="image" className="h-6 w-6 text-neutral-400" />
                    )}
                  </div>
                  <label className="cursor-pointer rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800">
                    Upload Logo
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                  </label>
                  {logoPreview && (
                    <button onClick={() => setLogoPreview(null)} className="text-xs text-danger-600 hover:text-danger-700">
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-6">Security</h2>
            <div className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Current Password</label>
                <input type="password" placeholder="Enter current password" className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100" />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">New Password</label>
                  <input type="password" placeholder="At least 8 characters" className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Confirm New Password</label>
                  <input type="password" placeholder="Re-enter new password" className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100" />
                </div>
              </div>

              {/* Two-factor authentication */}
              <div className="border-t border-neutral-200 pt-5 dark:border-neutral-800">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Two-Factor Authentication (2FA)</p>
                    <p className="mt-1 text-sm text-neutral-500">Add an extra layer of security to your account.</p>
                  </div>
                  <button
                    onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                    className={cn(
                      "relative h-6 w-11 rounded-full transition-colors",
                      twoFactorEnabled ? "bg-brand-600" : "bg-neutral-300 dark:bg-neutral-700"
                    )}
                  >
                    <span className={cn(
                      "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                      twoFactorEnabled ? "translate-x-5" : "translate-x-0.5"
                    )} />
                  </button>
                </div>
                {twoFactorEnabled && (
                  <div className="mt-4 rounded-lg bg-brand-50 p-4 dark:bg-brand-900/30">
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">
                      <AtlasIcon name="shield" className="mr-1 inline h-4 w-4" />
                      2FA is enabled. Use an authenticator app to scan the QR code.
                    </p>
                    <div className="mt-3 flex h-32 w-32 items-center justify-center rounded-lg bg-white dark:bg-neutral-800">
                      <span className="text-neutral-400">QR Code</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={simulateSave}
                  disabled={saveState === "saving"}
                  className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
                >
                  {saveState === "saving" ? "Saving..." : saveState === "saved" ? "Saved!" : "Update Security"}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "preferences" && (
          <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-6">Preferences</h2>
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Dark Mode</p>
                  <p className="text-xs text-neutral-500">Switch between light and dark theme.</p>
                </div>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={cn(
                    "relative h-6 w-11 rounded-full transition-colors",
                    darkMode ? "bg-brand-600" : "bg-neutral-300 dark:bg-neutral-700"
                  )}
                >
                  <span className={cn(
                    "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                    darkMode ? "translate-x-5" : "translate-x-0.5"
                  )} />
                </button>
              </div>

              <div className="border-t border-neutral-200 pt-5 dark:border-neutral-800">
                <p className="mb-3 text-sm font-medium text-neutral-900 dark:text-neutral-100">Notification Preferences</p>
                {[
                  { key: "newOrder", label: "New order received" },
                  { key: "orderStatus", label: "Order status updates" },
                  { key: "lowStock", label: "Low stock alerts" },
                  { key: "subscription", label: "Subscription renewal reminders" },
                ].map((pref) => (
                  <div key={pref.key} className="flex items-center justify-between py-2">
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">{pref.label}</span>
                    <button
                      onClick={() =>
                        setNotificationPrefs((prev) => ({
                          ...prev,
                          [pref.key]: !prev[pref.key as keyof typeof prev],
                        }))
                      }
                      className={cn(
                        "relative h-6 w-11 rounded-full transition-colors",
                        notificationPrefs[pref.key as keyof typeof notificationPrefs]
                          ? "bg-brand-600"
                          : "bg-neutral-300 dark:bg-neutral-700"
                      )}
                    >
                      <span className={cn(
                        "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                        notificationPrefs[pref.key as keyof typeof notificationPrefs]
                          ? "translate-x-5"
                          : "translate-x-0.5"
                      )} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={simulateSave}
                  disabled={saveState === "saving"}
                  className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
                >
                  {saveState === "saving" ? "Saving..." : saveState === "saved" ? "Saved!" : "Save Preferences"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}