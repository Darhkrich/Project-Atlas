"use client";

import { useState } from "react";
import { Provider } from "@/lib/admin/types/provider";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";

interface EditProviderDialogProps {
  provider: Provider;
  onClose: () => void;
  onSave: (updates: Partial<Provider>) => void;
}

export function EditProviderDialog({ provider, onClose, onSave }: EditProviderDialogProps) {
  const [name, setName] = useState(provider.name);
  const [code, setCode] = useState(provider.code);
  const [type, setType] = useState(provider.type);
  const [country, setCountry] = useState(provider.country);
  const [currency, setCurrency] = useState(provider.currency);
  const [baseUrl, setBaseUrl] = useState(provider.baseUrl || "");
  const [apiVersion, setApiVersion] = useState(provider.apiVersion || "");
  const [environment, setEnvironment] = useState(provider.environment);

  const handleSave = () => {
    onSave({
      name,
      code,
      type,
      country,
      currency,
      baseUrl,
      apiVersion,
      environment,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-neutral-900">
        <h3 className="text-lg font-semibold">Edit Provider</h3>
        <div className="mt-4 space-y-3">
          <Input placeholder="Provider Name" value={name} onChange={e => setName(e.target.value)} />
          <Input placeholder="Provider Code" value={code} onChange={e => setCode(e.target.value)} />
          <select
            className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
            value={type}
            onChange={e => setType(e.target.value as Provider["type"])}
          >
            <option value="api">API</option>
            <option value="aggregator">Aggregator</option>
            <option value="direct">Direct</option>
            <option value="payment">Payment</option>
            <option value="manual">Manual</option>
          </select>
          <div className="flex gap-2">
            <Input placeholder="Country" value={country} onChange={e => setCountry(e.target.value)} />
            <Input placeholder="Currency" value={currency} onChange={e => setCurrency(e.target.value)} />
          </div>
          <Input placeholder="Base URL" value={baseUrl} onChange={e => setBaseUrl(e.target.value)} />
          <Input placeholder="API Version" value={apiVersion} onChange={e => setApiVersion(e.target.value)} />
          <select
            className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
            value={environment}
            onChange={e => setEnvironment(e.target.value as Provider["environment"])}
          >
            <option value="production">Production</option>
            <option value="sandbox">Sandbox</option>
          </select>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={handleSave}>Save Changes</Button>
        </div>
      </div>
    </div>
  );
}