/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { ServicePricing, PriceChangeRecord, SERVICE_CATEGORIES, SERVICE_STATUS_LABELS } from "@/lib/admin/types/pricing";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { formatCurrency } from "@/lib/admin/formatters";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { mockPriceChangeRecords } from "@/lib/admin/mock/pricing";

interface PricingDetailDrawerProps {
  service: ServicePricing | null;
  onClose: () => void;
}

export function PricingDetailDrawer({ service, onClose }: PricingDetailDrawerProps) {
  const [providerCost, setProviderCost] = useState(service?.providerCost || 0);
  const [atlasPrice, setAtlasPrice] = useState(service?.atlasPrice || 0);
  const [resellerPrice, setResellerPrice] = useState(service?.resellerPrice || 0);
  const [commissionRate, setCommissionRate] = useState(service?.commissionRate || 0);
  const [status, setStatus] = useState<ServicePricing["status"]>(service?.status || "active");
  const [reason, setReason] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  if (!service) return null;

  const margin = atlasPrice - providerCost;
  const marginPercent = atlasPrice > 0 ? (margin / atlasPrice) * 100 : 0;

  const history = mockPriceChangeRecords.filter(r => r.serviceId === service.id);

  const handleSave = () => {
    console.log("Saving price changes", { providerCost, atlasPrice, resellerPrice, commissionRate, status, reason });
    setShowConfirm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl dark:bg-neutral-900 flex flex-col">
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <h2 className="text-lg font-semibold">{service.serviceName}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <p className="text-sm text-neutral-500">Category</p>
            <p className="font-medium">{SERVICE_CATEGORIES.find(c => c.value === service.category)?.label}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Status</p>
            <Badge variant={status === "active" ? "success" : status === "maintenance" ? "warning" : "neutral"}>{SERVICE_STATUS_LABELS[status]}</Badge>
          </div>

          <div>
            <label className="text-sm">Provider Cost (GHS)</label>
            <Input type="number" value={providerCost} onChange={e => setProviderCost(Number(e.target.value))} />
          </div>
          <div>
            <label className="text-sm">Atlas Price (GHS)</label>
            <Input type="number" value={atlasPrice} onChange={e => setAtlasPrice(Number(e.target.value))} />
          </div>
          <div>
            <label className="text-sm">Reseller Price (GHS)</label>
            <Input type="number" value={resellerPrice} onChange={e => setResellerPrice(Number(e.target.value))} />
          </div>
          <div>
            <label className="text-sm">Commission Rate (%)</label>
            <Input type="number" value={commissionRate} onChange={e => setCommissionRate(Number(e.target.value))} />
          </div>
          <div>
            <label className="text-sm">Status</label>
            <select
              className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
              value={status}
              onChange={e => setStatus(e.target.value as ServicePricing["status"])}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
          <div>
            <label className="text-sm">Reason for Change</label>
            <Input value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g., Provider cost update" />
          </div>

          <div className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-900">
            <p className="text-sm font-medium">Margin Calculation</p>
            <p className="mt-1">Margin: {formatCurrency(margin)}</p>
            <p>Margin %: {marginPercent.toFixed(2)}%</p>
          </div>

          <div>
            <p className="text-sm font-medium">Price History</p>
            {history.length === 0 ? (
              <p className="text-sm text-neutral-400">No previous changes</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {history.map(record => (
                  <li key={record.id} className="text-sm">
                    {record.admin} changed on {new Date(record.timestamp).toLocaleString()}
                    <br />
                    <span className="text-xs text-neutral-500">
                      Old: {formatCurrency(record.oldValues.atlasPrice ?? 0)} → New: {formatCurrency(record.newValues.atlasPrice ?? 0)} ({record.reason})
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="border-t border-neutral-200 p-4 dark:border-neutral-800 flex gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={() => setShowConfirm(true)}>Save Changes</Button>
        </div>
      </div>

      <ConfirmDialog
        open={showConfirm}
        title="Confirm Price Changes"
        description={`Are you sure you want to save these price changes for ${service.serviceName}?`}
        confirmLabel="Save"
        danger
        onConfirm={handleSave}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}