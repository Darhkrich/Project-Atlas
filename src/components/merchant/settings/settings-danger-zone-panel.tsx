/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { AtlasIcon } from "@/components/atlas/icons";
import { useStorefrontConfig } from "@/contexts/storefront-config-context";
import { SettingsSection } from "./settings-section";
import { DeactivateStoreModal } from "./deactivate-store-modal";
import { DeleteAccountModal } from "./delete-account-modal";
import { DeleteAccountDataModal } from "./delete-account-data-modal";

export function SettingsDangerZonePanel() {
  const { storefrontConfig } = useStorefrontConfig();
  const storeSlug = storefrontConfig.slug || "my-store";

  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [deleteEverythingOpen, setDeleteEverythingOpen] = useState(false);

  const storeIsLive = storefrontConfig.status === "live";

  return (
    <>
      <SettingsSection
        title="Danger zone"
        description="Actions here cannot be undone. Read each carefully."
      >
        <ul role="list" className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {storeIsLive && (
            <li className="flex flex-col gap-3 py-4 first:pt-0 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  Deactivate store
                </p>
                <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                  Hides your storefront from customers. Your data stays. You can
                  reactivate at any time.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDeactivateOpen(true)}
                className="shrink-0 rounded-lg border border-warning-300 bg-warning-50 px-3 py-2 text-sm font-medium text-warning-800 hover:bg-warning-100 dark:border-warning-800 dark:bg-warning-900/30 dark:text-warning-200 dark:hover:bg-warning-900/40"
              >
                Deactivate store
              </button>
            </li>
          )}

          <li className="flex flex-col gap-3 py-4 first:pt-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                Delete account
              </p>
              <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                Signs you out and removes your Atlas account. Your business data
                stays on disk. Sign up again with the same email to recover.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDeleteAccountOpen(true)}
              className="shrink-0 rounded-lg border border-danger-300 bg-white px-3 py-2 text-sm font-medium text-danger-700 hover:bg-danger-50 dark:border-danger-800 dark:bg-neutral-900 dark:text-danger-300 dark:hover:bg-danger-900/20"
            >
              Delete account
            </button>
          </li>

          <li className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium text-danger-800 dark:text-danger-200">
                Delete account and all data
              </p>
              <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                Permanently deletes your account and every product, order,
                customer, and setting. This cannot be undone.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDeleteEverythingOpen(true)}
              className="shrink-0 rounded-lg bg-danger-600 px-3 py-2 text-sm font-semibold text-white hover:bg-danger-700"
            >
              Delete everything
            </button>
          </li>
        </ul>
      </SettingsSection>

      <DeactivateStoreModal
        open={deactivateOpen}
        onClose={() => setDeactivateOpen(false)}
      />
      <DeleteAccountModal
        open={deleteAccountOpen}
        onClose={() => setDeleteAccountOpen(false)}
      />
      <DeleteAccountDataModal
        open={deleteEverythingOpen}
        onClose={() => setDeleteEverythingOpen(false)}
        storeSlug={storeSlug}
      />
    </>
  );
}