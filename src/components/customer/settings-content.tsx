/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import { AtlasCard } from "@/components/atlas/card";
import { Button } from "@/components/atlas/button";
import { AtlasInput } from "@/components/atlas/Input";
import { AtlasSkeleton } from "@/components/atlas/skeleton";
import { AtlasErrorState } from "@/components/atlas/error-state";
import { AtlasAlert } from "@/components/atlas/alert";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { mockProfile, type MockProfile } from "@/lib/mock-data";

type SettingsTab = "profile" | "security" | "notifications" | "preferences";

const tabs: { id: SettingsTab; label: string; icon: AtlasIconName }[] = [
  { id: "profile", label: "Profile", icon: "user" },
  { id: "security", label: "Security", icon: "shield" },
  { id: "notifications", label: "Notifications", icon: "bell" },
  { id: "preferences", label: "Preferences", icon: "settings" },
];

const initialNotificationSettings = {
  email: true,
  push: true,
  sms: false,
  inApp: true,
};

const initialPreferences = {
  defaultPayment: "wallet",
  currency: "GHS",
  language: "English",
};

export function SettingsContent() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [profile, setProfile] = useState<MockProfile>(mockProfile);
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [notificationSettings, setNotificationSettings] = useState(initialNotificationSettings);
  const [preferences, setPreferences] = useState(initialPreferences);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    newPassword: "",
    confirm: "",
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "danger"; message: string } | null>(null);

  // Avatar states
  const [avatarPreview, setAvatarPreview] = useState<string | null>(mockProfile.avatarUrl);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => setLoading(false), 600);
  }, []);

  const updateProfile = (field: string, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setProfileErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
    setAlert(null);
  };

  const validateProfile = () => {
    const newErrors: Record<string, string> = {};
    if (!profile.fullName.trim()) newErrors.fullName = "Full name is required.";
    if (!profile.email.trim()) newErrors.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(profile.email)) newErrors.email = "Enter a valid email.";
    if (!profile.phone.trim()) newErrors.phone = "Phone is required.";
    setProfileErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = () => {
    if (!validateProfile()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setAlert({ type: "success", message: "Profile updated successfully." });
    }, 800);
  };

  const handleToggleNotification = (field: keyof typeof notificationSettings) => {
    setNotificationSettings((prev) => ({ ...prev, [field]: !prev[field] }));
    setAlert(null);
  };

  const handleSavePreferences = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setAlert({ type: "success", message: "Preferences saved." });
    }, 800);
  };

  const validatePassword = () => {
    const errors: Record<string, string> = {};
    if (!passwordForm.current) errors.current = "Current password is required.";
    if (!passwordForm.newPassword) errors.newPassword = "New password is required.";
    else if (passwordForm.newPassword.length < 8) errors.newPassword = "Password must be at least 8 characters.";
    if (!passwordForm.confirm) errors.confirm = "Please confirm new password.";
    else if (passwordForm.confirm !== passwordForm.newPassword) errors.confirm = "Passwords do not match.";
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChangePassword = () => {
    if (!validatePassword()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowPasswordModal(false);
      setPasswordForm({ current: "", newPassword: "", confirm: "" });
      setAlert({ type: "success", message: "Password changed successfully." });
    }, 800);
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setTimeout(() => {
        const url = URL.createObjectURL(file);
        setAvatarPreview(url);
        setProfile((prev) => ({ ...prev, avatarUrl: url }));
        setIsUploading(false);
      }, 800);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    setProfile((prev) => ({ ...prev, avatarUrl: null }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <AtlasSkeleton className="h-12 w-full" />
        <AtlasSkeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return <AtlasErrorState onRetry={() => setLoading(true)} />;
  }

  return (
    <div className="space-y-6">
      {/* Alert */}
      {alert && (
        <AtlasAlert variant={alert.type === "success" ? "success" : "danger"}>
          {alert.message}
        </AtlasAlert>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setAlert(null);
            }}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-brand-800 text-white"
                : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
            }`}
          >
            <AtlasIcon name={tab.icon} className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <AtlasCard>
          <div className="mx-auto max-w-2xl">
            <h2 className="mb-6 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              Profile Information
            </h2>
            <div className="space-y-5">
              {/* Avatar Upload */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Profile"
                      className="h-20 w-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-100 text-3xl font-semibold text-brand-800 dark:bg-brand-900 dark:text-brand-300">
                      {profile.fullName.charAt(0)}
                    </div>
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-white/70 dark:bg-neutral-900/70">
                      <AtlasIcon name="clock" className="h-6 w-6 animate-spin text-brand-800 dark:text-brand-300" />
                    </div>
                  )}
                </div>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                      <AtlasIcon name="plus" className="mr-2 h-4 w-4" />
                      Upload Photo
                    </Button>
                    {avatarPreview && (
                      <Button variant="outline" size="sm" onClick={handleRemoveAvatar}>
                        Remove
                      </Button>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                    PNG, JPG or GIF up to 2MB
                  </p>
                </div>
              </div>

              <AtlasInput
                label="Full Name"
                type="text"
                value={profile.fullName}
                onChange={(e) => updateProfile("fullName", e.target.value)}
                error={profileErrors.fullName}
              />
              <AtlasInput
                label="Email Address"
                type="email"
                value={profile.email}
                onChange={(e) => updateProfile("email", e.target.value)}
                error={profileErrors.email}
              />
              <AtlasInput
                label="Phone Number"
                type="tel"
                value={profile.phone}
                onChange={(e) => updateProfile("phone", e.target.value)}
                error={profileErrors.phone}
              />

              <Button onClick={handleSaveProfile} loading={isSubmitting}>
                Save Changes
              </Button>
            </div>
          </div>
        </AtlasCard>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <AtlasCard>
          <div className="mx-auto max-w-2xl">
            <h2 className="mb-6 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              Security
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                  Change Password
                </h3>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                  Update your password to keep your account secure.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setShowPasswordModal(true)}
                >
                  Change Password
                </Button>
              </div>

              <div className="border-t border-neutral-200 pt-6 dark:border-neutral-800">
                <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                  Two-Factor Authentication
                </h3>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                  Add an extra layer of security to your account.
                </p>
                <button className="mt-4 inline-flex items-center rounded-full bg-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                  Not configured
                </button>
              </div>
            </div>
          </div>
        </AtlasCard>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <AtlasCard>
          <div className="mx-auto max-w-2xl">
            <h2 className="mb-6 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              Notification Preferences
            </h2>
            <div className="space-y-4">
              {[
                { key: "email", label: "Email Notifications", description: "Receive account and transaction updates via email." },
                { key: "push", label: "Push Notifications", description: "Get real-time alerts on your device." },
                { key: "sms", label: "SMS Notifications", description: "Receive important updates via text message." },
                { key: "inApp", label: "In-App Notifications", description: "See notifications when using Atlas." },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-start justify-between gap-4 border-b border-neutral-100 pb-4 last:border-0 dark:border-neutral-800"
                >
                  <div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {item.label}
                    </p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {item.description}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleNotification(item.key as keyof typeof notificationSettings)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notificationSettings[item.key as keyof typeof notificationSettings]
                        ? "bg-brand-800"
                        : "bg-neutral-300 dark:bg-neutral-700"
                    }`}
                    aria-label={`Toggle ${item.label}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notificationSettings[item.key as keyof typeof notificationSettings]
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </AtlasCard>
      )}

      {/* Preferences Tab */}
      {activeTab === "preferences" && (
        <AtlasCard>
          <div className="mx-auto max-w-2xl">
            <h2 className="mb-6 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              Preferences
            </h2>
            <div className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-800 dark:text-neutral-200">
                  Default Payment Method
                </label>
                <select
                  value={preferences.defaultPayment}
                  onChange={(e) =>
                    setPreferences((prev) => ({ ...prev, defaultPayment: e.target.value }))
                  }
                  className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                >
                  <option value="wallet">Wallet Balance</option>
                  <option value="momo">Mobile Money</option>
                  <option value="card">Card Payment</option>
                  <option value="bank">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-800 dark:text-neutral-200">
                  Currency
                </label>
                <select
                  value={preferences.currency}
                  onChange={(e) =>
                    setPreferences((prev) => ({ ...prev, currency: e.target.value }))
                  }
                  className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                >
                  <option value="GHS">Ghana Cedi (GHS)</option>
                  <option value="NGN">Nigerian Naira (NGN)</option>
                  <option value="USD">US Dollar (USD)</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-800 dark:text-neutral-200">
                  Language
                </label>
                <select
                  value={preferences.language}
                  onChange={(e) =>
                    setPreferences((prev) => ({ ...prev, language: e.target.value }))
                  }
                  className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                >
                  <option value="English">English</option>
                  <option value="French">French</option>
                  <option value="Twi">Twi</option>
                </select>
              </div>

              <Button onClick={handleSavePreferences} loading={isSubmitting}>
                Save Preferences
              </Button>
            </div>
          </div>
        </AtlasCard>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
          <div
            className="absolute inset-0 bg-neutral-950/50 dark:bg-black/60"
            onClick={() => setShowPasswordModal(false)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-md rounded-t-xl bg-white p-6 shadow-xl dark:bg-neutral-900 sm:rounded-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                Change Password
              </h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="rounded-md p-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                aria-label="Close"
              >
                <AtlasIcon name="x-circle" className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <AtlasInput
                label="Current Password"
                type="password"
                value={passwordForm.current}
                onChange={(e) =>
                  setPasswordForm((prev) => ({ ...prev, current: e.target.value }))
                }
                error={passwordErrors.current}
              />
              <AtlasInput
                label="New Password"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))
                }
                error={passwordErrors.newPassword}
              />
              <AtlasInput
                label="Confirm New Password"
                type="password"
                value={passwordForm.confirm}
                onChange={(e) =>
                  setPasswordForm((prev) => ({ ...prev, confirm: e.target.value }))
                }
                error={passwordErrors.confirm}
              />
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowPasswordModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleChangePassword}
                  loading={isSubmitting}
                >
                  Update Password
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}