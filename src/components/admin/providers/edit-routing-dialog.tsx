"use client";

import { useState } from "react";
import { Provider } from "@/lib/admin/types/provider";
import { Button } from "@/components/admin/ui/button";

interface EditRoutingDialogProps {
  provider: Provider;
  onClose: () => void;
  onSave: (priority: Provider["priority"], failover: Provider["failover"]) => void;
}

export function EditRoutingDialog({ provider, onClose, onSave }: EditRoutingDialogProps) {
  const [priority, setPriority] = useState(provider.priority);
  const [failoverEnabled, setFailoverEnabled] = useState(provider.failover.enabled);

  const handleSave = () => {
    onSave(priority, { ...provider.failover, enabled: failoverEnabled });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-lg bg-white p-6 shadow-xl dark:bg-neutral-900">
        <h3 className="text-lg font-semibold">Edit Routing</h3>
        <div className="mt-4 space-y-3">
          <label className="text-sm">Priority</label>
          <select className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm" value={priority} onChange={e => setPriority(e.target.value as Provider["priority"])}>
            <option value="primary">Primary</option>
            <option value="secondary">Secondary</option>
            <option value="fallback">Fallback</option>
          </select>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={failoverEnabled} onChange={e => setFailoverEnabled(e.target.checked)} />
            Automatic Failover
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={handleSave}>Save</Button>
        </div>
      </div>
    </div>
  );
}