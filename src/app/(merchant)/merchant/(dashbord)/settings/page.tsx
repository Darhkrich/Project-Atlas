/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SettingsTabNav } from "@/components/merchant/settings/settings-tab-nav";
import type { SettingsTabDefinition } from "@/components/merchant/settings/settings-tab-nav";
import { SettingsProfilePanel } from "@/components/merchant/settings/settings-profile-panel";
import { SettingsBusinessPanel } from "@/components/merchant/settings/settings-business-panel";
import { SettingsSecurityPanel } from "@/components/merchant/settings/settings-security-panel";
import { SettingsPreferencesPanel } from "@/components/merchant/settings/settings-preferences-panel";
import { SettingsDangerZonePanel } from "@/components/merchant/settings/settings-danger-zone-panel";

type SettingsTab =
  | "profile"
  | "business"
  | "security"
  | "preferences"
  | "danger";

const TABS: SettingsTabDefinition<SettingsTab>[] = [
  { id: "profile", label: "Profile", icon: "user" },
  { id: "business", label: "Business", icon: "store" },
  { id: "security", label: "Security", icon: "lock" },
  { id: "preferences", label: "Preferences", icon: "settings" },
  { id: "danger", label: "Danger zone", icon: "alert" },
];

const VALID_TABS = TABS.map((t) => t.id);

function parseTab(raw: string | null): SettingsTab {
  if (raw && (VALID_TABS as string[]).includes(raw)) {
    return raw as SettingsTab;
  }
  return "profile";
}

export default function MerchantSettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<SettingsTab>(() =>
    parseTab(searchParams.get("tab"))
  );

  useEffect(() => {
    const fromUrl = parseTab(searchParams.get("tab"));
    setActiveTab(fromUrl);
  }, [searchParams]);

  const handleTabChange = (next: SettingsTab) => {
    setActiveTab(next);
    const url = new URL(window.location.href);
    if (next === "profile") {
      url.searchParams.delete("tab");
    } else {
      url.searchParams.set("tab", next);
    }
    window.history.replaceState({}, "", url.toString());
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-3xl">
          Settings
        </h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          Manage your account, business, and preferences.
        </p>
      </div>

      <SettingsTabNav
        tabs={TABS}
        active={activeTab}
        onChange={handleTabChange}
      />

      <div
        role="tabpanel"
        id={"settings-panel-" + activeTab}
        aria-labelledby={"settings-tab-" + activeTab}
        tabIndex={0}
      >
        {activeTab === "profile" && <SettingsProfilePanel />}
        {activeTab === "business" && <SettingsBusinessPanel />}
        {activeTab === "security" && <SettingsSecurityPanel />}
        {activeTab === "preferences" && <SettingsPreferencesPanel />}
        {activeTab === "danger" && <SettingsDangerZonePanel />}
      </div>
    </div>
  );
}