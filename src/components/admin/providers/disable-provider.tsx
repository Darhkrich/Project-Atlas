"use client";

import { Provider } from "@/lib/admin/types/provider";
import { Button } from "@/components/admin/ui/button";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";

interface DisableProviderDialogProps {
  provider: Provider;
  onClose: () => void;
  onConfirm: () => void;
}

export function DisableProviderDialog({ provider, onClose, onConfirm }: DisableProviderDialogProps) {
  return (
    <ConfirmDialog
      open={true}
      title="Disable Provider?"
      description={`${provider.name} is currently handling ${provider.transactionCountToday} transactions today. Disabling this provider will remove it from active routing.`}
      confirmLabel="Disable Provider"
      cancelLabel="Cancel"
      danger
      onConfirm={onConfirm}
      onCancel={onClose}
    />
  );
}