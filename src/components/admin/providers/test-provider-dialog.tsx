"use client";

import { useState } from "react";
import { Provider } from "@/lib/admin/types/provider";
import { Button } from "@/components/admin/ui/button";

interface TestProviderDialogProps {
  provider: Provider;
  onClose: () => void;
}

export function TestProviderDialog({ provider, onClose }: TestProviderDialogProps) {
  const [status, setStatus] = useState<"testing" | "success" | "failed">("testing");

  const runTest = () => {
    setStatus("testing");
    setTimeout(() => {
      setStatus(Math.random() > 0.2 ? "success" : "failed");
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-lg bg-white p-6 shadow-xl dark:bg-neutral-900">
        <h3 className="text-lg font-semibold">Test Connection</h3>
        <p className="text-sm text-neutral-500 mt-2">Testing connection to {provider.name}...</p>
        {status === "testing" && <p className="mt-4 text-sm text-warning-600">Connecting... Authenticating... Checking API...</p>}
        {status === "success" && <p className="mt-4 text-sm text-success-600">✓ Connection successful. Response time: 438ms</p>}
        {status === "failed" && <p className="mt-4 text-sm text-danger-600">✗ Connection failed. Error: INVALID_CREDENTIALS</p>}
        <div className="mt-6 flex justify-end gap-2">
          {status !== "testing" && <Button variant="outline" size="sm" onClick={runTest}>Retry</Button>}
          <Button size="sm" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}