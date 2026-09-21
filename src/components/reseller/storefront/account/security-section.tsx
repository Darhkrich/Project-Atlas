"use client";

import { AtlasCard } from "@/components/atlas/card";
import { AtlasBadge } from "@/components/atlas/badge";
import { Button } from "@/components/atlas/button";

interface Props {
  twoFactorEnabled: boolean;
  onEnable: () => void;
  onDisable: () => void;
  onDeleteAccount: () => void;
}

export function SecuritySection({
  twoFactorEnabled,
  onEnable,
  onDisable,
  onDeleteAccount,
}: Props) {
  return (
    <section aria-labelledby="storefront-security-heading">
      <h2
        id="storefront-security-heading"
        className="mb-4 text-lg font-semibold text-neutral-900"
      >
        Security
      </h2>
      <AtlasCard>
        <div className="space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-neutral-900">
                Two-factor authentication
              </p>
              <p className="mt-0.5 text-xs text-neutral-500">
                Adds a code sent to your phone whenever you sign in.
              </p>
            </div>
            {twoFactorEnabled ? (
              <div className="flex items-center gap-3">
                <AtlasBadge variant="success">Enabled</AtlasBadge>
                <Button variant="outline" size="sm" onClick={onDisable}>
                  Disable
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={onEnable}>
                Enable 2FA
              </Button>
            )}
          </div>

          <div className="border-t border-neutral-100 pt-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-danger-700">
                  Delete account
                </p>
                <p className="mt-0.5 text-xs text-neutral-500">
                  Removes your wallet, order history, and saved details. This
                  cannot be undone.
                </p>
              </div>
              <Button variant="destructive" size="sm" onClick={onDeleteAccount}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      </AtlasCard>
    </section>
  );
}