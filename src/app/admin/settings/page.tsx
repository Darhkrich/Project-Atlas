"use client";

import { useState } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { cn } from "@/lib/utils";
import {
  mockGeneralSettings,
  mockNotificationSettings,
  mockSecuritySettings,
  mockMaintenanceSettings,
  mockApiKeys,
  mockSystemHealth,
  mockPaymentGatewaySettings,
  mockWalletWithdrawalSettings,
  mockSupportSettings,
  mockLocalizationSettings,
  mockDataComplianceSettings,
  mockWebhookSettings,
  mockAdminRolePermissions,
} from "@/lib/admin/mock/settings";
import {
  GeneralSettings,
  NotificationSettings,
  SecuritySettings,
  MaintenanceSettings,
  ApiKey,
  SystemHealth,
  PaymentGatewaySettings,
  WalletWithdrawalSettings,
  SupportSettings,
  LocalizationSettings,
  DataComplianceSettings,
  WebhookSettings,
  AdminRolePermissions,
} from "@/lib/admin/types/settings";

type Tab =
  | "general"
  | "notifications"
  | "security"
  | "maintenance"
  | "health"
  | "api"
  | "payments"
  | "wallet"
  | "support"
  | "localization"
  | "compliance"
  | "webhooks"
  | "roles";

const tabs: { key: Tab; label: string }[] = [
  { key: "general", label: "General" },
  { key: "notifications", label: "Notifications" },
  { key: "security", label: "Security" },
  { key: "maintenance", label: "Maintenance" },
  { key: "health", label: "System Health" },
  { key: "api", label: "API Keys" },
  { key: "payments", label: "Payment Gateway" },
  { key: "wallet", label: "Wallet & Withdrawals" },
  { key: "support", label: "Support" },
  { key: "localization", label: "Localization" },
  { key: "compliance", label: "Data & Compliance" },
  { key: "webhooks", label: "Webhooks" },
  { key: "roles", label: "Roles & Permissions" },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("general");

  const [general, setGeneral] = useState<GeneralSettings>(mockGeneralSettings);
  const [notifications, setNotifications] = useState<NotificationSettings>(mockNotificationSettings);
  const [security, setSecurity] = useState<SecuritySettings>(mockSecuritySettings);
  const [maintenance, setMaintenance] = useState<MaintenanceSettings>(mockMaintenanceSettings);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(mockApiKeys);
  const [systemHealth] = useState<SystemHealth>(mockSystemHealth);
  const [paymentGateway, setPaymentGateway] = useState<PaymentGatewaySettings>(mockPaymentGatewaySettings);
  const [walletWithdrawal, setWalletWithdrawal] = useState<WalletWithdrawalSettings>(mockWalletWithdrawalSettings);
  const [supportSettings, setSupportSettings] = useState<SupportSettings>(mockSupportSettings);
  const [localization, setLocalization] = useState<LocalizationSettings>(mockLocalizationSettings);
  const [compliance, setCompliance] = useState<DataComplianceSettings>(mockDataComplianceSettings);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [webhooks, setWebhooks] = useState<WebhookSettings>(mockWebhookSettings);
  const [roles] = useState<AdminRolePermissions>(mockAdminRolePermissions);

  const [confirmSave, setConfirmSave] = useState(false);
  const [confirmRevoke, setConfirmRevoke] = useState<string | null>(null);
  const [confirmMaintenance, setConfirmMaintenance] = useState(false);

  const [showAddApiKeyModal, setShowAddApiKeyModal] = useState(false);
  const [newApiKeyName, setNewApiKeyName] = useState("");
  const [configureMethodId, setConfigureMethodId] = useState<string | null>(null);
  const [showAddWebhookModal, setShowAddWebhookModal] = useState(false);
  const [testResult, setTestResult] = useState<{ id: string; status: "success" | "failed" } | null>(null);

  const handleSave = () => {
    console.log("Saving settings");
    setConfirmSave(false);
  };

  const handleToggleMaintenance = () => {
    setMaintenance(prev => ({ ...prev, enabled: !prev.enabled }));
    setConfirmMaintenance(false);
  };

  const handleGenerateApiKey = () => {
    if (!newApiKeyName.trim()) return;
    const newKey: ApiKey = {
      id: `API-${Date.now()}`,
      name: newApiKeyName,
      key: `ak_live_${Math.random().toString(36).substring(2, 10)}...`,
      createdAt: new Date().toISOString(),
      status: "active",
    };
    setApiKeys(prev => [...prev, newKey]);
    setNewApiKeyName("");
    setShowAddApiKeyModal(false);
  };

  const handleRevokeKey = (id: string) => {
    setApiKeys(prev => prev.map(k => k.id === id ? { ...k, status: "revoked" } : k));
    setConfirmRevoke(null);
  };

  const handleConfigurePaymentMethod = (methodId: string) => {
    setConfigureMethodId(methodId);
  };

  const handleSavePaymentMethodConfig = (updatedMethod: PaymentGatewaySettings["methods"][number]) => {
    setPaymentGateway(prev => ({
      ...prev,
      methods: prev.methods.map(m => m.id === updatedMethod.id ? updatedMethod : m),
    }));
    setConfigureMethodId(null);
  };

  const handleAddWebhook = () => {
    // In a real app, we'd add the webhook; here we just close modal.
    setShowAddWebhookModal(false);
  };

  const handleTestWebhook = (id: string) => {
    // eslint-disable-next-line react-hooks/purity
    setTestResult({ id, status: Math.random() > 0.5 ? "success" : "failed" });
    setTimeout(() => setTestResult(null), 3000);
  };

  const healthStatusVariant = {
    operational: "success",
    degraded: "warning",
    down: "danger",
  } as const;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Settings"
        description="Configure Atlas platform, security, notifications, integrations, and compliance."
      />

      {/* Tabs */}
      <div className="flex gap-2 border-b border-neutral-200 dark:border-neutral-800 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap",
              activeTab === tab.key ? "border-brand-600 text-brand-600" : "border-transparent text-neutral-500 hover:text-neutral-700"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "general" && (
        <Card>
          <CardHeader><CardTitle>General Configuration</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm">Platform Name</label>
                <Input value={general.platformName} onChange={e => setGeneral({ ...general, platformName: e.target.value })} />
              </div>
              <div>
                <label className="text-sm">Support Email</label>
                <Input value={general.supportEmail} onChange={e => setGeneral({ ...general, supportEmail: e.target.value })} />
              </div>
              <div>
                <label className="text-sm">Support Phone</label>
                <Input value={general.supportPhone} onChange={e => setGeneral({ ...general, supportPhone: e.target.value })} />
              </div>
              <div>
                <label className="text-sm">Currency</label>
                <Input value={general.currency} onChange={e => setGeneral({ ...general, currency: e.target.value })} />
              </div>
              <div>
                <label className="text-sm">Timezone</label>
                <Input value={general.timezone} onChange={e => setGeneral({ ...general, timezone: e.target.value })} />
              </div>
              <div>
                <label className="text-sm">Default Commission Rate (%)</label>
                <Input type="number" value={general.defaultCommissionRate} onChange={e => setGeneral({ ...general, defaultCommissionRate: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-sm">Daily Transaction Limit (GHS)</label>
                <Input type="number" value={general.transactionLimitPerDay} onChange={e => setGeneral({ ...general, transactionLimitPerDay: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-sm">Max Withdrawal Limit (GHS)</label>
                <Input type="number" value={general.maxWithdrawalLimit} onChange={e => setGeneral({ ...general, maxWithdrawalLimit: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-sm">Low Balance Threshold (GHS)</label>
                <Input type="number" value={general.lowBalanceThreshold} onChange={e => setGeneral({ ...general, lowBalanceThreshold: Number(e.target.value) })} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "notifications" && (
        <Card>
          <CardHeader><CardTitle>Notification Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={notifications.emailEnabled} onChange={e => setNotifications({ ...notifications, emailEnabled: e.target.checked })} className="h-4 w-4" />
                Email
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={notifications.smsEnabled} onChange={e => setNotifications({ ...notifications, smsEnabled: e.target.checked })} className="h-4 w-4" />
                SMS
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={notifications.pushEnabled} onChange={e => setNotifications({ ...notifications, pushEnabled: e.target.checked })} className="h-4 w-4" />
                Push
              </label>
            </div>
            <div>
              <label className="text-sm">Order Placed Email Template</label>
              <textarea className="mt-1 w-full rounded-md border border-neutral-300 p-2 text-sm dark:border-neutral-700 dark:bg-neutral-800" rows={2} value={notifications.emailTemplateOrderPlaced} onChange={e => setNotifications({ ...notifications, emailTemplateOrderPlaced: e.target.value })} />
            </div>
            <div>
              <label className="text-sm">Payment Failed Email Template</label>
              <textarea className="mt-1 w-full rounded-md border border-neutral-300 p-2 text-sm dark:border-neutral-700 dark:bg-neutral-800" rows={2} value={notifications.emailTemplatePaymentFailed} onChange={e => setNotifications({ ...notifications, emailTemplatePaymentFailed: e.target.value })} />
            </div>
            <div>
              <label className="text-sm">Order Placed SMS Template</label>
              <Input value={notifications.smsTemplateOrderPlaced} onChange={e => setNotifications({ ...notifications, smsTemplateOrderPlaced: e.target.value })} />
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "security" && (
        <Card>
          <CardHeader><CardTitle>Security Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm">Password Min Length</label>
                <Input type="number" value={security.passwordMinLength} onChange={e => setSecurity({ ...security, passwordMinLength: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-sm">Session Timeout (minutes)</label>
                <Input type="number" value={security.sessionTimeoutMinutes} onChange={e => setSecurity({ ...security, sessionTimeoutMinutes: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-sm">Max Login Attempts</label>
                <Input type="number" value={security.maxLoginAttempts} onChange={e => setSecurity({ ...security, maxLoginAttempts: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-sm">Lockout Duration (minutes)</label>
                <Input type="number" value={security.lockoutDurationMinutes} onChange={e => setSecurity({ ...security, lockoutDurationMinutes: Number(e.target.value) })} />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={security.require2FA} onChange={e => setSecurity({ ...security, require2FA: e.target.checked })} className="h-4 w-4" />
              Require Two-Factor Authentication for Admins
            </label>
          </CardContent>
        </Card>
      )}

      {activeTab === "maintenance" && (
        <Card>
          <CardHeader><CardTitle>Maintenance Mode</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Maintenance Mode</span>
              <Badge variant={maintenance.enabled ? "danger" : "success"}>{maintenance.enabled ? "Enabled" : "Disabled"}</Badge>
            </div>
            <div>
              <label className="text-sm">Message</label>
              <textarea className="mt-1 w-full rounded-md border border-neutral-300 p-2 text-sm dark:border-neutral-700 dark:bg-neutral-800" rows={2} value={maintenance.message} onChange={e => setMaintenance({ ...maintenance, message: e.target.value })} />
            </div>
            <div>
              <label className="text-sm">Expected Duration</label>
              <Input value={maintenance.expectedDuration} onChange={e => setMaintenance({ ...maintenance, expectedDuration: e.target.value })} />
            </div>
            <div>
              <label className="text-sm">Allowed IPs (comma separated)</label>
              <Input value={maintenance.allowedIPs.join(", ")} onChange={e => setMaintenance({ ...maintenance, allowedIPs: e.target.value.split(",").map(s => s.trim()) })} />
            </div>
            <Button variant={maintenance.enabled ? "destructive" : "outline"} size="sm" onClick={() => setConfirmMaintenance(true)}>
              {maintenance.enabled ? "Disable Maintenance Mode" : "Enable Maintenance Mode"}
            </Button>
          </CardContent>
        </Card>
      )}

      {activeTab === "health" && (
        <Card>
          <CardHeader><CardTitle>System Health</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "API", status: systemHealth.apiStatus },
                { label: "Database", status: systemHealth.databaseStatus },
                { label: "Queue", status: systemHealth.queueStatus },
                { label: "Providers", status: systemHealth.providerStatus },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between rounded-md bg-neutral-50 p-3 dark:bg-neutral-900">
                  <span>{item.label}</span>
                  <Badge variant={healthStatusVariant[item.status]}>{item.status}</Badge>
                </div>
              ))}
            </div>
            <p className="text-xs text-neutral-500">Last checked: {new Date(systemHealth.lastChecked).toLocaleString()}</p>
          </CardContent>
        </Card>
      )}

      {activeTab === "api" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>API Keys & Integrations</CardTitle>
            <Button size="sm" onClick={() => setShowAddApiKeyModal(true)}>Generate New Key</Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {apiKeys.map(key => (
              <div key={key.id} className="flex items-center justify-between rounded-md border border-neutral-200 p-3 dark:border-neutral-700">
                <div>
                  <p className="font-medium">{key.name}</p>
                  <p className="font-mono text-xs text-neutral-500">{key.key}</p>
                  <p className="text-xs text-neutral-400">Created: {new Date(key.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={key.status === "active" ? "success" : "neutral"}>{key.status}</Badge>
                  {key.status === "active" && (
                    <Button variant="ghost" size="sm" onClick={() => setConfirmRevoke(key.id)}>Revoke</Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {activeTab === "payments" && (
        <Card>
          <CardHeader><CardTitle>Payment Gateway Configuration</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {paymentGateway.methods.map(method => (
              <div key={method.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-neutral-200 p-3 dark:border-neutral-700">
                <div>
                  <p className="font-medium">{method.name}</p>
                  <p className="text-xs text-neutral-500">Fee: {method.feePercent}% + {method.fixedFee} GHS</p>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1 text-sm">
                    <input
                      type="checkbox"
                      checked={method.enabled}
                      onChange={e => {
                        const updated = { ...method, enabled: e.target.checked };
                        setPaymentGateway(prev => ({ ...prev, methods: prev.methods.map(m => m.id === method.id ? updated : m) }));
                      }}
                      className="h-4 w-4"
                    />
                    Enabled
                  </label>
                  <Button variant="outline" size="sm" onClick={() => handleConfigurePaymentMethod(method.id)}>Configure</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {activeTab === "wallet" && (
        <Card>
          <CardHeader><CardTitle>Wallet & Withdrawal Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm">Auto‑Approve Threshold (GHS)</label>
                <Input type="number" value={walletWithdrawal.autoApproveThreshold} onChange={e => setWalletWithdrawal({ ...walletWithdrawal, autoApproveThreshold: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-sm">Daily Withdrawal Limit (GHS)</label>
                <Input type="number" value={walletWithdrawal.dailyWithdrawalLimit} onChange={e => setWalletWithdrawal({ ...walletWithdrawal, dailyWithdrawalLimit: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-sm">Monthly Withdrawal Limit (GHS)</label>
                <Input type="number" value={walletWithdrawal.monthlyWithdrawalLimit} onChange={e => setWalletWithdrawal({ ...walletWithdrawal, monthlyWithdrawalLimit: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-sm">Minimum Balance to Withdraw (GHS)</label>
                <Input type="number" value={walletWithdrawal.minBalanceToWithdraw} onChange={e => setWalletWithdrawal({ ...walletWithdrawal, minBalanceToWithdraw: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-sm">Processing Time</label>
                <select
                  className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                  value={walletWithdrawal.processingTime}
                  onChange={e => setWalletWithdrawal({ ...walletWithdrawal, processingTime: e.target.value as "instant" | "t1" })}
                >
                  <option value="instant">Instant</option>
                  <option value="t1">T+1</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "support" && (
        <Card>
          <CardHeader><CardTitle>Support Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm">SLA Warning (hours)</label>
                <Input type="number" value={supportSettings.slaWarningHours} onChange={e => setSupportSettings({ ...supportSettings, slaWarningHours: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-sm">SLA Critical (hours)</label>
                <Input type="number" value={supportSettings.slaCriticalHours} onChange={e => setSupportSettings({ ...supportSettings, slaCriticalHours: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-sm">Live Chat Hours</label>
                <Input value={supportSettings.liveChatHours} onChange={e => setSupportSettings({ ...supportSettings, liveChatHours: e.target.value })} />
              </div>
              <div className="flex items-end gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={supportSettings.autoAssign} onChange={e => setSupportSettings({ ...supportSettings, autoAssign: e.target.checked })} className="h-4 w-4" />
                  Auto‑Assign
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={supportSettings.liveChatEnabled} onChange={e => setSupportSettings({ ...supportSettings, liveChatEnabled: e.target.checked })} className="h-4 w-4" />
                  Live Chat Enabled
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "localization" && (
        <Card>
          <CardHeader><CardTitle>Localization</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm">Default Language</label>
                <Input value={localization.defaultLanguage} onChange={e => setLocalization({ ...localization, defaultLanguage: e.target.value })} />
              </div>
              <div>
                <label className="text-sm">Date Format</label>
                <Input value={localization.dateFormat} onChange={e => setLocalization({ ...localization, dateFormat: e.target.value })} />
              </div>
              <div>
                <label className="text-sm">Time Format</label>
                <Input value={localization.timeFormat} onChange={e => setLocalization({ ...localization, timeFormat: e.target.value })} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "compliance" && (
        <Card>
          <CardHeader><CardTitle>Data & Compliance</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm">Audit Log Retention (days)</label>
                <Input type="number" value={compliance.auditLogRetentionDays} onChange={e => setCompliance({ ...compliance, auditLogRetentionDays: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-sm">Backup Schedule</label>
                <Input value={compliance.backupSchedule} onChange={e => setCompliance({ ...compliance, backupSchedule: e.target.value })} />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={compliance.dataExportEnabled} onChange={e => setCompliance({ ...compliance, dataExportEnabled: e.target.checked })} className="h-4 w-4" />
                Data Export Enabled
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={compliance.dataDeleteEnabled} onChange={e => setCompliance({ ...compliance, dataDeleteEnabled: e.target.checked })} className="h-4 w-4" />
                Data Delete Enabled
              </label>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "webhooks" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Webhooks & Integrations</CardTitle>
            <Button size="sm" onClick={() => setShowAddWebhookModal(true)}>Add Webhook</Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {webhooks.webhooks.map(webhook => (
              <div key={webhook.id} className="flex items-center justify-between rounded-md border border-neutral-200 p-3 dark:border-neutral-700">
                <div>
                  <p className="font-medium">{webhook.event}</p>
                  <p className="text-xs text-neutral-500">{webhook.url}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={webhook.enabled ? "success" : "neutral"}>{webhook.enabled ? "Enabled" : "Disabled"}</Badge>
                  <Button variant="outline" size="sm" onClick={() => handleTestWebhook(webhook.id)}>Test</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {activeTab === "roles" && (
        <Card>
          <CardHeader><CardTitle>Roles & Permissions</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {roles.roles.map(role => (
              <div key={role.name} className="rounded-md border border-neutral-200 p-3 dark:border-neutral-700">
                <p className="font-medium">{role.name}</p>
                <p className="text-xs text-neutral-500">{role.permissions.join(", ")}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setConfirmSave(true)}>Save All Changes</Button>
      </div>

      {/* Modals */}
      {showAddApiKeyModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAddApiKeyModal(false)} />
          <div className="relative w-full max-w-sm rounded-lg bg-white p-6 shadow-xl dark:bg-neutral-900">
            <h3 className="text-lg font-semibold">Generate New API Key</h3>
            <Input className="mt-4" placeholder="Key Name" value={newApiKeyName} onChange={e => setNewApiKeyName(e.target.value)} />
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowAddApiKeyModal(false)}>Cancel</Button>
              <Button size="sm" onClick={handleGenerateApiKey}>Generate</Button>
            </div>
          </div>
        </div>
      )}

      {configureMethodId && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setConfigureMethodId(null)} />
          <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-neutral-900">
            <h3 className="text-lg font-semibold">Configure Payment Method</h3>
            {paymentGateway.methods.filter(m => m.id === configureMethodId).map(method => (
              <div key={method.id} className="mt-4 space-y-3">
                <div>
                  <label className="text-sm">Fee Percentage (%)</label>
                  <Input type="number" value={method.feePercent} onChange={e => {
                    const updated = { ...method, feePercent: Number(e.target.value) };
                    setPaymentGateway(prev => ({ ...prev, methods: prev.methods.map(m => m.id === method.id ? updated : m) }));
                  }} />
                </div>
                <div>
                  <label className="text-sm">Fixed Fee (GHS)</label>
                  <Input type="number" value={method.fixedFee} onChange={e => {
                    const updated = { ...method, fixedFee: Number(e.target.value) };
                    setPaymentGateway(prev => ({ ...prev, methods: prev.methods.map(m => m.id === method.id ? updated : m) }));
                  }} />
                </div>
                <div>
                  <label className="text-sm">API Key</label>
                  <Input value={method.apiKey || ""} onChange={e => {
                    const updated = { ...method, apiKey: e.target.value };
                    setPaymentGateway(prev => ({ ...prev, methods: prev.methods.map(m => m.id === method.id ? updated : m) }));
                  }} />
                </div>
                <div>
                  <label className="text-sm">Secret</label>
                  <Input type="password" value={method.secret || ""} onChange={e => {
                    const updated = { ...method, secret: e.target.value };
                    setPaymentGateway(prev => ({ ...prev, methods: prev.methods.map(m => m.id === method.id ? updated : m) }));
                  }} />
                </div>
                <div className="mt-6 flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setConfigureMethodId(null)}>Close</Button>
                  <Button size="sm" onClick={() => handleSavePaymentMethodConfig(method)}>Save</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showAddWebhookModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAddWebhookModal(false)} />
          <div className="relative w-full max-w-sm rounded-lg bg-white p-6 shadow-xl dark:bg-neutral-900">
            <h3 className="text-lg font-semibold">Add Webhook</h3>
            <div className="mt-4 space-y-3">
              <Input placeholder="Event (e.g., order.placed)" />
              <Input placeholder="URL" />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowAddWebhookModal(false)}>Cancel</Button>
              <Button size="sm" onClick={handleAddWebhook}>Add</Button>
            </div>
          </div>
        </div>
      )}

      {testResult && (
        <div className="fixed bottom-4 right-4 rounded-md bg-white p-4 shadow-lg dark:bg-neutral-900">
          <p className={testResult.status === "success" ? "text-success-600" : "text-danger-600"}>
            Webhook test {testResult.status === "success" ? "succeeded" : "failed"}
          </p>
        </div>
      )}

      {/* Confirmations */}
      <ConfirmDialog
        open={confirmSave}
        title="Save Settings"
        description="Are you sure you want to save all changes?"
        confirmLabel="Save"
        onConfirm={handleSave}
        onCancel={() => setConfirmSave(false)}
      />
      <ConfirmDialog
        open={confirmRevoke !== null}
        title="Revoke API Key"
        description="Are you sure you want to revoke this API key? This action cannot be undone."
        confirmLabel="Revoke"
        danger
        onConfirm={() => confirmRevoke && handleRevokeKey(confirmRevoke)}
        onCancel={() => setConfirmRevoke(null)}
      />
      <ConfirmDialog
        open={confirmMaintenance}
        title={`${maintenance.enabled ? "Disable" : "Enable"} Maintenance Mode`}
        description={`Are you sure you want to ${maintenance.enabled ? "disable" : "enable"} maintenance mode?`}
        confirmLabel="Confirm"
        danger={!maintenance.enabled}
        onConfirm={handleToggleMaintenance}
        onCancel={() => setConfirmMaintenance(false)}
      />
    </div>
  );
}