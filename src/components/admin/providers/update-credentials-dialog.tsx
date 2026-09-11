"use client";

import { useState } from "react";
import { Provider } from "@/lib/admin/types/provider";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";

interface UpdateCredentialsDialogProps {
  provider: Provider;
  onClose: () => void;
  onSave: (credentials: Provider["credentials"]) => void;
}

export function UpdateCredentialsDialog({ provider, onClose, onSave }: UpdateCredentialsDialogProps) {
  const [apiKey, setApiKey] = useState(provider.credentials.apiKey);
  const [secret, setSecret] = useState(provider.credentials.secret);
  const [accountId, setAccountId] = useState(provider.credentials.accountId);

  const handleSave = () => {
    onSave({ apiKey, secret, accountId });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-neutral-900">
        <h3 className="text-lg font-semibold">Update Credentials</h3>
        <div className="mt-4 space-y-3">
          <label className="text-sm">API Key</label>
          <Input value={apiKey} onChange={e => setApiKey(e.target.value)} />
          <label className="text-sm">Secret</label>
          <Input type="password" value={secret} onChange={e => setSecret(e.target.value)} />
          <label className="text-sm">Account ID</label>
          <Input value={accountId} onChange={e => setAccountId(e.target.value)} />
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={handleSave}>Save</Button>
        </div>
      </div>
    </div>
  );
}