// app/(admin)/settings/page.tsx
"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/admin/ui/button";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { EnvironmentBadge } from "@/components/admin/ui/environment-badge";
import { SettingsTabs } from "@/components/admin/settings/settings-tabs";
import { SettingsSaveBar } from "@/components/admin/settings/settings-save-bar";
import { SettingsDiffPreview } from "@/components/admin/settings/settings-diff-preview";
import { SettingsAuditPanel } from "@/components/admin/settings/settings-audit-panel";
import { ApiKeyCreateModal } from "@/components/admin/settings/api-key-create-modal";
import { WebhookCreateModal } from "@/components/admin/settings/webhook-create-modal";
import {
  GeneralTab,
  LocalizationTab,
  ComplianceTab,
} from "@/components/admin/settings/tabs/platform-tabs";
import {
  NotificationsTab,
  SupportTab,
} from "@/components/admin/settings/tabs/communication-tabs";
import {
  SecurityTab,
  MaintenanceTab,
} from "@/components/admin/settings/tabs/security-tabs";
import {
  ApiTab,
  PaymentsTab,
  PaymentMethodConfigModal,
  WalletTab,
  WebhooksTab,
} from "@/components/admin/settings/tabs/integration-tabs";
import {
  HealthTab,
  RolesTab,
} from "@/components/admin/settings/tabs/operations-tabs";
import { useUrlFilters } from "@/lib/admin/hooks/use-url-filters";
import { useNow } from "@/lib/admin/hooks/use-now";
import { useSettingsDraft } from "@/lib/admin/hooks/use-settings-draft";
import { useUnsavedChanges } from "@/lib/admin/hooks/use-unsaved-changes";
import { createAuditEntries } from "@/lib/admin/settings/audit";
import {
  SETTINGS_TABS,
  type TabConfig,
} from "@/lib/admin/settings/constant";
import {
  mockAdminRolePermissions,
  mockApiKeys,
  mockDataComplianceSettings,
  mockGeneralSettings,
  mockLocalizationSettings,
  mockMaintenanceSettings,
  mockNotificationSettings,
  mockPaymentGatewaySettings,
  mockSecuritySettings,
  mockSupportSettings,
  mockSystemHealth,
  mockWalletWithdrawalSettings,
  mockWebhookSettings,
} from "@/lib/admin/mock/settings";
import { mockSettingsAudit } from "@/lib/admin/mock/settings-audit";
import type {
  ApiKey,
  AtlasSection,
  DataComplianceSettings,
  GeneralSettings,
  LocalizationSettings,
  MaintenanceSettings,
  NotificationChannel,
  NotificationSettings,
  PaymentMethodConfig,
  PlatformEnvironment,
  SecuritySettings,
  SettingsAuditEntry,
  SettingsTab,
  SupportSettings,
  SystemHealth,
  WalletWithdrawalSettings,
  Webhook,
} from "@/lib/admin/types/settings";

const CURRENT_ADMIN = {
  id: "usr-001",
  name: "Yaw Mensah",
  email: "yaw.mensah@atlas.com",
};

const DEFAULT_URL_FILTERS = { tab: "general" };

type ToastKind = "success" | "error";

interface Toast {
  kind: ToastKind;
  text: string;
}

interface SystemHealthState {
  data: SystemHealth;
  refreshing: boolean;
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <SettingsPageInner />
    </Suspense>
  );
}

function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-72 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
      <div className="h-10 w-full animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800"
          />
        ))}
      </div>
    </div>
  );
}

function SettingsPageInner() {
  const { filters, setFilter } = useUrlFilters(DEFAULT_URL_FILTERS);
  const activeTab = useMemo<SettingsTab>(() => {
    const found = SETTINGS_TABS.find((t) => t.key === filters.tab);
    return found?.key ?? "general";
  }, [filters.tab]);

  const initialDraft = useMemo(
    () => ({
      general: { ...mockGeneralSettings },
      notifications: { ...mockNotificationSettings },
      security: { ...mockSecuritySettings },
      maintenance: { ...mockMaintenanceSettings },
      api: { keys: mockApiKeys.map((k) => ({ ...k })) },
      payments: {
        methods: mockPaymentGatewaySettings.methods.map((m) => ({
          ...m,
          sections: [...m.sections],
        })),
      },
      wallet: {
        ...mockWalletWithdrawalSettings,
        perSectionOverrides: mockWalletWithdrawalSettings.perSectionOverrides
          ? { ...mockWalletWithdrawalSettings.perSectionOverrides }
          : undefined,
      },
      support: { ...mockSupportSettings },
      localization: { ...mockLocalizationSettings },
      compliance: {
        ...mockDataComplianceSettings,
        backupSchedule: { ...mockDataComplianceSettings.backupSchedule },
      },
      webhooks: {
        webhooks: mockWebhookSettings.webhooks.map((w) => ({ ...w })),
      },
    }),
    []
  );

  const draft = useSettingsDraft(initialDraft);
  const now = useNow();

  const [auditEntries, setAuditEntries] = useState<SettingsAuditEntry[]>(
    mockSettingsAudit
  );
  const [auditPanelOpen, setAuditPanelOpen] = useState(false);

  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [configureMethodId, setConfigureMethodId] = useState<string | null>(
    null
  );

  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [showMaintenanceConfirm, setShowMaintenanceConfirm] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<ApiKey | null>(null);
  const [removeWebhookTarget, setRemoveWebhookTarget] = useState<Webhook | null>(
    null
  );

  const [toast, setToast] = useState<Toast | null>(null);
  const [testResult, setTestResult] = useState<{
    id: string;
    status: "success" | "failed";
  } | null>(null);
  const [health, setHealth] = useState<SystemHealthState>({
    data: mockSystemHealth,
    refreshing: false,
  });

  useUnsavedChanges({ hasChanges: draft.hasChanges });

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!testResult) return;
    const t = window.setTimeout(() => setTestResult(null), 3000);
    return () => window.clearTimeout(t);
  }, [testResult]);

  const activeTabConfig: TabConfig | undefined = SETTINGS_TABS.find(
    (t) => t.key === activeTab
  );
  const isReadOnly = activeTabConfig?.readOnly === true;

  const general = draft.draft.general as unknown as GeneralSettings;
  const notifications = draft.draft.notifications as unknown as NotificationSettings;
  const security = draft.draft.security as unknown as SecuritySettings;
  const maintenance = draft.draft.maintenance as unknown as MaintenanceSettings;
  const apiState = draft.draft.api as unknown as { keys: ApiKey[] };
  const payments =
    draft.draft.payments as unknown as typeof mockPaymentGatewaySettings;
  const wallet =
    draft.draft.wallet as unknown as WalletWithdrawalSettings;
  const support = draft.draft.support as unknown as SupportSettings;
  const localization =
    draft.draft.localization as unknown as LocalizationSettings;
  const compliance =
    draft.draft.compliance as unknown as DataComplianceSettings;
  const webhooks =
    draft.draft.webhooks as unknown as typeof mockWebhookSettings;

  const environment: PlatformEnvironment = general.environment;

  const handleTabChange = (tab: SettingsTab) => {
    setFilter("tab", tab);
  };

  const patchGeneral = (patch: Partial<GeneralSettings>) =>
    draft.patch("general", patch as Partial<Record<string, unknown>>);
  const patchNotifications = (patch: Partial<NotificationSettings>) =>
    draft.patch("notifications", patch as Partial<Record<string, unknown>>);
  const patchSecurity = (patch: Partial<SecuritySettings>) =>
    draft.patch("security", patch as Partial<Record<string, unknown>>);
  const patchMaintenance = (patch: Partial<MaintenanceSettings>) =>
    draft.patch("maintenance", patch as Partial<Record<string, unknown>>);
  const patchApi = (patch: { keys: ApiKey[] }) =>
    draft.patch("api", patch as unknown as Partial<Record<string, unknown>>);
  const patchPayments = (
    patch: Partial<typeof mockPaymentGatewaySettings>
  ) =>
    draft.patch("payments", patch as Partial<Record<string, unknown>>);
  const patchWallet = (patch: Partial<WalletWithdrawalSettings>) =>
    draft.patch("wallet", patch as Partial<Record<string, unknown>>);
  const patchSupport = (patch: Partial<SupportSettings>) =>
    draft.patch("support", patch as Partial<Record<string, unknown>>);
  const patchLocalization = (patch: Partial<LocalizationSettings>) =>
    draft.patch("localization", patch as Partial<Record<string, unknown>>);
  const patchCompliance = (patch: Partial<DataComplianceSettings>) =>
    draft.patch("compliance", patch as Partial<Record<string, unknown>>);
  const patchWebhooks = (patch: Partial<typeof mockWebhookSettings>) =>
    draft.patch("webhooks", patch as Partial<Record<string, unknown>>);

  const handleConfirmSave = () => {
    const actor = { id: CURRENT_ADMIN.id, name: CURRENT_ADMIN.name };
    const newEntries: SettingsAuditEntry[] = [];

    const tabStateKeys: Record<
      SettingsTab,
      keyof typeof draft.draft | null
    > = {
      general: "general",
      notifications: "notifications",
      security: "security",
      maintenance: "maintenance",
      health: null,
      api: "api",
      payments: "payments",
      wallet: "wallet",
      support: "support",
      localization: "localization",
      compliance: "compliance",
      webhooks: "webhooks",
      roles: null,
    };

    for (const tab of draft.dirtyTabs) {
      const key = tabStateKeys[tab];
      if (!key) continue;
      newEntries.push(
        ...createAuditEntries(
          tab,
          draft.saved[key] as Record<string, unknown>,
          draft.draft[key] as Record<string, unknown>,
          actor
        )
      );
    }

    if (newEntries.length > 0) {
      setAuditEntries((prev) => [...newEntries, ...prev]);
    }
    draft.markSaved();
    setShowSaveConfirm(false);
    setToast({
      kind: "success",
      text:
        newEntries.length === 1
          ? "1 change saved."
          : `${newEntries.length} changes saved.`,
    });
  };

  const handleDiscard = () => {
    draft.discardAll();
    setShowDiscardConfirm(false);
    setToast({ kind: "success", text: "Changes discarded." });
  };

  const requestMaintenanceToggle = () => {
    setShowMaintenanceConfirm(true);
  };

  const confirmMaintenanceToggle = () => {
    patchMaintenance({ enabled: !maintenance.enabled });
    setShowMaintenanceConfirm(false);
  };

  const handleApiKeyCreate = (key: ApiKey) => {
    patchApi({ keys: [key, ...apiState.keys] });
  };

  const confirmApiKeyRevoke = () => {
    if (!revokeTarget) return;
    const target = revokeTarget;
    patchApi({
      keys: apiState.keys.map((k) =>
        k.id === target.id
          ? { ...k, status: "revoked", revokedAt: new Date().toISOString() }
          : k
      ),
    });
    setRevokeTarget(null);
    setToast({ kind: "success", text: `${target.name} revoked.` });
  };

  const handleWebhookCreate = (webhook: Webhook) => {
    patchWebhooks({ webhooks: [...webhooks.webhooks, webhook] });
  };

  const handleWebhookToggle = (id: string, enabled: boolean) => {
    patchWebhooks({
      webhooks: webhooks.webhooks.map((w) =>
        w.id === id ? { ...w, enabled } : w
      ),
    });
  };

  const handleWebhookRemove = (id: string) => {
    const target = webhooks.webhooks.find((w) => w.id === id);
    if (!target) return;
    setRemoveWebhookTarget(target);
  };

  const confirmWebhookRemove = () => {
    if (!removeWebhookTarget) return;
    const target = removeWebhookTarget;
    patchWebhooks({
      webhooks: webhooks.webhooks.filter((w) => w.id !== target.id),
    });
    setRemoveWebhookTarget(null);
    setToast({ kind: "success", text: `Webhook ${target.event} removed.` });
  };

  const handleWebhookTest = (webhook: Webhook) => {
    const nextStatus: "success" | "failed" =
      webhook.url.startsWith("https://") ? "success" : "failed";
    setTestResult({ id: webhook.id, status: nextStatus });
  };

  const handlePaymentMethodToggle = (id: string, enabled: boolean) => {
    patchPayments({
      methods: payments.methods.map((m) =>
        m.id === id ? { ...m, enabled } : m
      ),
    });
  };

  const handlePaymentMethodSave = (updated: PaymentMethodConfig) => {
    patchPayments({
      methods: payments.methods.map((m) =>
        m.id === updated.id ? updated : m
      ),
    });
    setConfigureMethodId(null);
  };

  const handleHealthRefresh = () => {
    setHealth((prev) => ({ ...prev, refreshing: true }));
    window.setTimeout(() => {
      setHealth({
        data: {
          ...mockSystemHealth,
          lastChecked: new Date().toISOString(),
        },
        refreshing: false,
      });
    }, 700);
  };

  const handleSendTestNotification = (
    channel: NotificationChannel,
    content: string
  ) => {
    void channel;
    void content;
  };

  const configureMethod = configureMethodId
    ? payments.methods.find((m) => m.id === configureMethodId) ?? null
    : null;

  const recentWebhookEvents = webhooks.webhooks.map((w) => w.event);

  const tabsDirtyCount = draft.dirtyTabs.length;

  return (
    <div className="space-y-6 pb-24">
      <AdminPageHeader
        title="Settings"
        description="Configure Atlas platform, security, notifications, integrations, and compliance."
        meta={
          <>
            <EnvironmentBadge environment={environment} />
            {tabsDirtyCount > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-warning-700 dark:text-warning-300">
                  {tabsDirtyCount} unsaved{" "}
                  {tabsDirtyCount === 1 ? "tab" : "tabs"}
                </span>
              </>
            )}
          </>
        }
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAuditPanelOpen(true)}
          >
            Audit log
          </Button>
        }
      />

      <SettingsTabs
        activeTab={activeTab}
        dirtyTabs={draft.dirtyTabs}
        onChange={handleTabChange}
      />

      <div
        role="tabpanel"
        id={`settings-panel-${activeTab}`}
        aria-labelledby={`settings-tab-${activeTab}`}
        tabIndex={0}
        className="focus-visible:outline-none"
      >
        {activeTab === "general" && (
          <GeneralTab value={general} onChange={patchGeneral} />
        )}

        {activeTab === "notifications" && (
          <NotificationsTab
            value={notifications}
            onChange={patchNotifications}
            onSendTest={handleSendTestNotification}
          />
        )}

        {activeTab === "security" && (
          <SecurityTab value={security} onChange={patchSecurity} />
        )}

        {activeTab === "maintenance" && (
          <MaintenanceTab
            value={maintenance}
            onChange={patchMaintenance}
            onToggle={requestMaintenanceToggle}
          />
        )}

        {activeTab === "health" && (
          <HealthTab
            value={health.data}
            refreshing={health.refreshing}
            onRefresh={handleHealthRefresh}
          />
        )}

        {activeTab === "api" && (
          <ApiTab
            keys={apiState.keys}
            onGenerate={() => setShowApiKeyModal(true)}
            onRevoke={(id) => {
              const target = apiState.keys.find((k) => k.id === id);
              if (target) setRevokeTarget(target);
            }}
          />
        )}

        {activeTab === "payments" && (
          <PaymentsTab
            value={payments}
            onToggleMethod={handlePaymentMethodToggle}
            onConfigureMethod={(m) => setConfigureMethodId(m.id)}
          />
        )}

        {activeTab === "wallet" && (
          <WalletTab value={wallet} onChange={patchWallet} />
        )}

        {activeTab === "support" && (
          <SupportTab value={support} onChange={patchSupport} />
        )}

        {activeTab === "localization" && (
          <LocalizationTab value={localization} onChange={patchLocalization} />
        )}

        {activeTab === "compliance" && (
          <ComplianceTab value={compliance} onChange={patchCompliance} />
        )}

        {activeTab === "webhooks" && (
          <WebhooksTab
            value={webhooks}
            onAdd={() => setShowWebhookModal(true)}
            onToggle={handleWebhookToggle}
            onRemove={handleWebhookRemove}
            testResult={testResult}
            onTest={handleWebhookTest}
          />
        )}

        {activeTab === "roles" && (
          <RolesTab value={mockAdminRolePermissions} />
        )}
      </div>

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={
            toast.kind === "success"
              ? "rounded-md border border-success-200 bg-success-50 p-3 text-sm text-success-800 dark:border-success-800/60 dark:bg-success-900/20 dark:text-success-200"
              : "rounded-md border border-danger-200 bg-danger-50 p-3 text-sm text-danger-800 dark:border-danger-800/60 dark:bg-danger-900/20 dark:text-danger-200"
          }
        >
          {toast.text}
        </div>
      )}

      {!isReadOnly && (
        <SettingsSaveBar
          dirtyTabs={draft.dirtyTabs}
          onReview={() => setShowSaveConfirm(true)}
          onDiscard={() => setShowDiscardConfirm(true)}
        />
      )}

      <ApiKeyCreateModal
        open={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        onCreate={handleApiKeyCreate}
      />

      <WebhookCreateModal
        open={showWebhookModal}
        onClose={() => setShowWebhookModal(false)}
        onCreate={handleWebhookCreate}
        existingEvents={recentWebhookEvents}
      />

      <PaymentMethodConfigModal
        method={configureMethod}
        onClose={() => setConfigureMethodId(null)}
        onSave={handlePaymentMethodSave}
      />

      <SettingsAuditPanel
        entries={auditEntries}
        open={auditPanelOpen}
        onClose={() => setAuditPanelOpen(false)}
      />

      <ConfirmDialog
        open={showSaveConfirm}
        title="Save settings?"
        description={
          draft.dirtyTabs.length === 1
            ? "1 tab has changes. Review the details below before confirming."
            : `${draft.dirtyTabs.length} tabs have changes. Review the details below before confirming.`
        }
        confirmLabel="Save changes"
        cancelLabel="Keep editing"
        danger={environment === "production"}
        onConfirm={handleConfirmSave}
        onCancel={() => setShowSaveConfirm(false)}
      >
        <div className="max-h-72 overflow-y-auto">
          <SettingsDiffPreview
            saved={draft.saved}
            draft={draft.draft}
            dirtyTabs={draft.dirtyTabs}
          />
        </div>
      </ConfirmDialog>

      <ConfirmDialog
        open={showDiscardConfirm}
        title="Discard changes?"
        description={
          draft.dirtyTabs.length === 1
            ? "Changes in 1 tab will be reverted to their last saved values. This cannot be undone."
            : `Changes across ${draft.dirtyTabs.length} tabs will be reverted to their last saved values. This cannot be undone.`
        }
        confirmLabel="Discard changes"
        cancelLabel="Keep editing"
        danger
        onConfirm={handleDiscard}
        onCancel={() => setShowDiscardConfirm(false)}
      />

      <ConfirmDialog
        open={showMaintenanceConfirm}
        title={
          maintenance.enabled
            ? "Disable maintenance mode?"
            : "Enable maintenance mode?"
        }
        description={
          maintenance.enabled
            ? "Users will be able to access Atlas again once the change is saved."
            : `All users will be redirected to the maintenance page as soon as this change is saved. Allowlisted IPs (${maintenance.allowedIPs.length}) will retain access.`
        }
        confirmLabel={
          maintenance.enabled ? "Disable maintenance" : "Enable maintenance"
        }
        cancelLabel="Cancel"
        danger={!maintenance.enabled}
        onConfirm={confirmMaintenanceToggle}
        onCancel={() => setShowMaintenanceConfirm(false)}
      />

      <ConfirmDialog
        open={revokeTarget !== null}
        title="Revoke API key?"
        description={
          revokeTarget
            ? `${revokeTarget.name} will stop working immediately. Any integration using it will receive authentication errors. This cannot be undone.`
            : ""
        }
        confirmLabel="Revoke key"
        danger
        onConfirm={confirmApiKeyRevoke}
        onCancel={() => setRevokeTarget(null)}
      />

      <ConfirmDialog
        open={removeWebhookTarget !== null}
        title="Remove webhook?"
        description={
          removeWebhookTarget
            ? `${removeWebhookTarget.event} will no longer be delivered to ${removeWebhookTarget.url}. This cannot be undone.`
            : ""
        }
        confirmLabel="Remove webhook"
        danger
        onConfirm={confirmWebhookRemove}
        onCancel={() => setRemoveWebhookTarget(null)}
      />
    </div>
  );
}