"use client";

import { useState } from "react";
import { AtlasCard } from "@/components/atlas/card";
import { Button } from "@/components/atlas/button";
import { AtlasInput } from "@/components/atlas/Input";
import { AtlasIcon } from "@/components/atlas/icons";
import { mockProfile } from "@/lib/mock-data";

export function ResellerSettings() {
  const [profile, setProfile] = useState({
    fullName: mockProfile.fullName,
    email: mockProfile.email,
    phone: mockProfile.phone,
  });
  const [password, setPassword] = useState({ current: "", new: "", confirm: "" });
  const [saved, setSaved] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm font-medium text-brand-700 dark:text-brand-300">Account</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-950 dark:text-white sm:text-3xl">
          Settings
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-600 dark:text-neutral-400">
          Manage your reseller profile, password and notification preferences.
        </p>
      </div>

      {/* Profile */}
      <AtlasCard>
        <div className="flex items-center gap-2">
          <AtlasIcon name="user" className="h-5 w-5 text-neutral-500" />
          <h2 className="text-base font-semibold text-neutral-950 dark:text-white">Profile</h2>
        </div>
        <form onSubmit={handleSaveProfile} className="mt-5 space-y-4">
          <AtlasInput
            label="Full Name"
            value={profile.fullName}
            onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
          />
          <AtlasInput
            label="Email"
            type="email"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
          />
          <AtlasInput
            label="Phone"
            type="tel"
            value={profile.phone}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
          />
          <div className="flex items-center gap-3">
            <Button type="submit">Save Profile</Button>
            {saved && <span className="text-sm text-success-600">Saved successfully.</span>}
          </div>
        </form>
      </AtlasCard>

      {/* Password */}
      <AtlasCard>
        <div className="flex items-center gap-2">
          <AtlasIcon name="shield" className="h-5 w-5 text-neutral-500" />
          <h2 className="text-base font-semibold text-neutral-950 dark:text-white">Change Password</h2>
        </div>
        <div className="mt-5 space-y-4">
          <AtlasInput
            label="Current Password"
            type="password"
            value={password.current}
            onChange={(e) => setPassword({ ...password, current: e.target.value })}
          />
          <AtlasInput
            label="New Password"
            type="password"
            value={password.new}
            onChange={(e) => setPassword({ ...password, new: e.target.value })}
          />
          <AtlasInput
            label="Confirm New Password"
            type="password"
            value={password.confirm}
            onChange={(e) => setPassword({ ...password, confirm: e.target.value })}
          />
          <Button variant="outline">Update Password</Button>
        </div>
      </AtlasCard>

      {/* Notification Preferences */}
      <AtlasCard>
        <div className="flex items-center gap-2">
          <AtlasIcon name="bell" className="h-5 w-5 text-neutral-500" />
          <h2 className="text-base font-semibold text-neutral-950 dark:text-white">Notification Preferences</h2>
        </div>
        <div className="mt-5 space-y-3">
          {[
            "Order updates",
            "Wallet funding alerts",
            "Promotions and offers",
            "Product updates",
          ].map((pref) => (
            <label key={pref} className="flex items-center justify-between">
              <span className="text-sm text-neutral-700 dark:text-neutral-300">{pref}</span>
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-neutral-300 text-brand-700 focus:ring-brand-500" />
            </label>
          ))}
        </div>
      </AtlasCard>
    </div>
  );
}