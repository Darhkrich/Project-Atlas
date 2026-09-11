"use client";

import { useState } from "react";
import { Provider } from "@/lib/admin/types/provider";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";

interface MaintenanceDialogProps {
  provider: Provider;
  onClose: () => void;
  onSave: (providerId: string, reason: string, duration: string) => void;
}

export function MaintenanceDialog({ provider, onClose, onSave }: MaintenanceDialogProps) {
  const [reason, setReason] = useState("");
  const [duration, setDuration] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSave = () => {
    onSave(provider.id, reason, duration);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-lg bg-white p-6 shadow-xl dark:bg-neutral-900">
        <h3 className="text-lg font-semibold">Set Maintenance Mode</h3>
        <p className="text-sm text-neutral-500 mt-2">Provider will be excluded from routing until maintenance is removed.</p>
        <div className="mt-4 space-y-3">
          <Input placeholder="Reason" value={reason} onChange={e => setReason(e.target.value)} />
          <Input placeholder="Expected duration (e.g., 30 minutes)" value={duration} onChange={e => setDuration(e.target.value)} />
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={() => setShowConfirm(true)}>Enable Maintenance</Button>
        </div>
      </div>
      <ConfirmDialog
        open={showConfirm}
        title="Confirm Maintenance Mode"
        description="This will temporarily remove the provider from routing."
        confirmLabel="Enable"
        onConfirm={handleSave}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}