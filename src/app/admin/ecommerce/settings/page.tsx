/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Input } from "@/components/admin/ui/input";
import { Button } from "@/components/admin/ui/button";
import { Badge } from "@/components/admin/ui/badge";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";

type SettingsTab = "general" | "notifications" | "audit";

const tabs: { key: SettingsTab; label: string }[] = [
  { key: "general", label: "General" },
  { key: "notifications", label: "Notifications" },
  { key: "audit", label: "Audit Logs" },
];

const mockAuditLogs = [
  { id: "AUD-1", admin: "admin@atlas.com", action: "Changed transaction fee from 2.5% to 3.0%", timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: "AUD-2", admin: "support@atlas.com", action: "Updated refund policy", timestamp: new Date(Date.now() - 86400000).toISOString() },
];

function formatTimestamp(iso: string) {
  const d = new Date(iso);
  return `${d.getUTCDate()}/${d.getUTCMonth() + 1}/${d.getUTCFullYear()} ${d.getUTCHours()}:${d.getUTCMinutes()}`;
}

export default function EcommerceSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [currency, setCurrency] = useState("GHS");
  const [transactionFee, setTransactionFee] = useState(3.0);
  const [refundPolicy, setRefundPolicy] = useState("30-day refund policy");
  const [confirmSave, setConfirmSave] = useState(false);

  const handleSave = () => {
    console.log("Saving settings", { currency, transactionFee, refundPolicy });
    setConfirmSave(false);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="E-commerce Settings"
        description="Platform configuration for Atlas E-commerce."
      />

      {/* Tabs */}
      <div className="flex gap-2 border-b border-neutral-200 dark:border-neutral-800">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === tab.key ? "border-brand-600 text-brand-600" : "border-transparent text-neutral-500 hover:text-neutral-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "general" && (
        <Card>
          <CardHeader><CardTitle>General Configuration</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm">Currency</label>
              <Input value={currency} onChange={e => setCurrency(e.target.value)} />
            </div>
            <div>
              <label className="text-sm">Transaction Fee (%)</label>
              <Input type="number" step="0.1" value={transactionFee} onChange={e => setTransactionFee(Number(e.target.value))} />
            </div>
            <div>
              <label className="text-sm">Refund Policy</label>
              <textarea
                className="w-full rounded-md border border-neutral-300 p-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                rows={3}
                value={refundPolicy}
                onChange={e => setRefundPolicy(e.target.value)}
              />
            </div>
            <Button size="sm" onClick={() => setConfirmSave(true)}>Save Changes</Button>
          </CardContent>
        </Card>
      )}

      {activeTab === "notifications" && (
        <Card>
          <CardHeader><CardTitle>Notification Templates</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium">Order Placed (Email)</p>
              <Input placeholder="Subject" />
              <textarea className="mt-2 w-full rounded-md border border-neutral-300 p-2 text-sm dark:border-neutral-700 dark:bg-neutral-800" rows={3} placeholder="Email body" />
            </div>
            <div>
              <p className="text-sm font-medium">Subscription Renewed (SMS)</p>
              <Input placeholder="SMS template" />
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "audit" && (
        <Card>
          <CardHeader><CardTitle>Audit Logs</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {mockAuditLogs.map(log => (
                <li key={log.id} className="text-sm">
                  <span className="font-medium">{log.admin}</span> {log.action}
                  <span className="text-xs text-neutral-500"> · {formatTimestamp(log.timestamp)}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Save Confirmation */}
      <ConfirmDialog
        open={confirmSave}
        title="Confirm Save Settings"
        description="Are you sure you want to save these changes?"
        confirmLabel="Save"
        onConfirm={handleSave}
        onCancel={() => setConfirmSave(false)}
      />
    </div>
  );
}