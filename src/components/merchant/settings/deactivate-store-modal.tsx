"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AtlasModalShell } from "@/components/atlas/modal-shell";
import { useStorefrontConfig } from "@/contexts/storefront-config-context";

interface DeactivateStoreModalProps {
  open: boolean;
  onClose: () => void;
}

export function DeactivateStoreModal({
  open,
  onClose,
}: DeactivateStoreModalProps) {
  const router = useRouter();
  const { updateStorefrontConfig } = useStorefrontConfig();
  const [busy, setBusy] = useState(false);

  const handleConfirm = () => {
    setBusy(true);
    updateStorefrontConfig({ status: "draft" });
    setBusy(false);
    onClose();
    router.push("/merchant/dashboard");
  };

  return (
    <AtlasModalShell
      open={open}
      onClose={onClose}
      title="Deactivate store"
      description="Your storefront will stop accepting new orders."
      size="md"
    >
      <div className="space-y-4">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Your products, orders, and settings stay intact. Customers visiting
          your store will see that it is temporarily unavailable. You can
          reactivate at any time from Settings.
        </p>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            Keep active
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={busy}
            className="rounded-lg bg-warning-600 px-4 py-2 text-sm font-semibold text-white hover:bg-warning-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? "Deactivating..." : "Deactivate store"}
          </button>
        </div>
      </div>
    </AtlasModalShell>
  );
}