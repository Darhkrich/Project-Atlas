/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Provider } from "@/lib/admin/types/provider";
import {
  getProviderById,
  updateProvider,
} from "@/lib/admin/mock/providers-store";
import { ProviderDetailHeader } from "@/components/admin/providers/provider-detail-header";
import { ProviderOverview } from "@/components/admin/providers/provider-overview";
import { ProviderPerformance } from "@/components/admin/providers/provider-performance";
import { ProviderHealth } from "@/components/admin/providers/provider-health";
import { ProviderHealthHistory } from "@/components/admin/providers/provider-health-history";
import { ProviderServicesPanel } from "@/components/admin/providers/provider-services-panel";
import { ProviderRouting } from "@/components/admin/providers/provider-routing";
import { ProviderTransactions } from "@/components/admin/providers/provider-transactions";
import { ProviderConfiguration } from "@/components/admin/providers/provider-configuration";
import { ProviderCredentials } from "@/components/admin/providers/provider-credentials";
import { ProviderAuditLog } from "@/components/admin/providers/provider-audit-log";
import {
  ProviderActivityStream,
  type ActivityEvent,
} from "@/components/admin/providers/provider-activity-stream";
import {
  ProviderAlertsPanel,
  type ProviderAlert,
} from "@/components/admin/providers/provider-alerts-panel";
import { TestProviderDialog } from "@/components/admin/providers/test-provider-dialog";
import { EditProviderDialog } from "@/components/admin/providers/edit-provider-dialog";
import { DisableProviderDialog } from "@/components/admin/providers/disable-provider";
import { UpdateCredentialsDialog } from "@/components/admin/providers/update-credentials-dialog";
import {
  mockProviderHealthHistory,
  mockProviderTransactions,
  mockProviderAuditLogs,
} from "@/lib/admin/mock/providers";
import { Button } from "@/components/admin/ui/button";
import { cn } from "@/lib/utils";

type Tab =
  | "overview"
  | "health"
  | "activity"
  | "alerts"
  | "services"
  | "routing"
  | "transactions"
  | "configuration"
  | "audit";

export default function ProviderDetailPage() {
  const { providerId } = useParams();
  const router = useRouter();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const [showTest, setShowTest] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDisable, setShowDisable] = useState(false);
  const [showRotate, setShowRotate] = useState(false);
  const [showUpdateCreds, setShowUpdateCreds] = useState(false);

  // Alerts state
  const [alerts, setAlerts] = useState<ProviderAlert[]>([]);

  useEffect(() => {
    const p = getProviderById(providerId as string);
    setProvider(p || null);

    if (p) {
      // Seed some alerts from the provider's state
      const seedAlerts: ProviderAlert[] = [];
      if (p.healthStatus === "critical") {
        seedAlerts.push({
          id: "ALT-1",
          title: "Connection failures detected",
          description: `Failure rate is ${(100 - p.successRate).toFixed(1)}%`,
          severity: "critical",
          timestamp: p.lastHealthCheck,
          acknowledged: false,
        });
      }
      if (p.healthStatus === "warning") {
        seedAlerts.push({
          id: "ALT-2",
          title: "Elevated latency",
          description: `Average response time is ${p.averageResponseTime}ms`,
          severity: "warning",
          timestamp: p.lastHealthCheck,
          acknowledged: false,
        });
      }
      if (p.balance && p.balance.current < p.balance.minimumThreshold) {
        seedAlerts.push({
          id: "ALT-3",
          title: "Low provider balance",
          description: `Balance ${p.balance.current} is below minimum of ${p.balance.minimumThreshold}`,
          severity: "warning",
          timestamp: new Date().toISOString(),
          acknowledged: false,
        });
      }
      setAlerts(seedAlerts);
    }
  }, [providerId]);

  if (!provider) {
    return (
      <div className="space-y-4 py-16 text-center">
        <p className="text-lg font-medium">Provider not found</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/admin/providers")}
        >
          Back to Providers
        </Button>
      </div>
    );
  }

  const handleDisable = () => {
    updateProvider(provider.id, { status: "disabled", enabled: false });
    setProvider(getProviderById(provider.id) || null);
    setShowDisable(false);
  };

  const handleRotateCredentials = () => {
    alert("Credentials rotated successfully (mock).");
    setShowRotate(false);
  };

  const handleUpdateCredentials = (creds: Provider["credentials"]) => {
    updateProvider(provider.id, { credentials: creds });
    setProvider(getProviderById(provider.id) || null);
    setShowUpdateCreds(false);
  };

  const handleEdit = (updates: Partial<Provider>) => {
    updateProvider(provider.id, updates);
    setProvider(getProviderById(provider.id) || null);
    setShowEdit(false);
  };

  const handleSaveRouting = (
    priority: Provider["priority"],
    failover: Provider["failover"]
  ) => {
    updateProvider(provider.id, { priority, failover });
    setProvider(getProviderById(provider.id) || null);
  };

  const handleSaveConfig = (config: Provider["configuration"]) => {
    updateProvider(provider.id, { configuration: config });
    setProvider(getProviderById(provider.id) || null);
  };

  // Build activity stream from health history + transactions + audit logs
  const activityEvents: ActivityEvent[] = [
    ...(mockProviderHealthHistory[provider.id] || []).map((h) => ({
      id: `hc-${h.id}`,
      type: "health_check" as const,
      title: `Health check ${h.result}`,
      description: `Response time ${h.responseTime}ms`,
      timestamp: h.timestamp,
      status:
        h.result === "healthy"
          ? ("success" as const)
          : h.result === "warning"
          ? ("warning" as const)
          : ("danger" as const),
      actor: "system",
    })),
    ...mockProviderTransactions
      .filter((t) => t.providerId === provider.id)
      .map((t) => ({
        id: `tx-${t.id}`,
        type: "transaction" as const,
        title: `${t.service} ${t.providerStatus.toLowerCase()}`,
        description: `${t.atlasTransactionId} · ${t.responseTime}ms`,
        timestamp: t.createdAt,
        status:
          t.providerStatus.toLowerCase().includes("success")
            ? ("success" as const)
            : t.providerStatus.toLowerCase().includes("timeout")
            ? ("warning" as const)
            : ("danger" as const),
        actor: "system",
      })),
    ...(mockProviderAuditLogs[provider.id] || []).map((a) => ({
      id: `aud-${a.id}`,
      type: "config_change" as const,
      title: a.action,
      description: a.reason,
      timestamp: a.timestamp,
      status: "info" as const,
      actor: a.admin,
    })),
  ].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const openAlertsCount = alerts.filter((a) => !a.acknowledged).length;

  const tabs: { key: Tab; label: string; badge?: number }[] = [
    { key: "overview", label: "Overview" },
    { key: "health", label: "Health" },
    { key: "activity", label: "Activity" },
    { key: "alerts", label: "Alerts", badge: openAlertsCount },
    { key: "services", label: "Services" },
    { key: "routing", label: "Routing" },
    { key: "transactions", label: "Transactions" },
    { key: "configuration", label: "Configuration" },
    { key: "audit", label: "Audit" },
  ];

  return (
    <div className="space-y-6">
      <ProviderDetailHeader
        provider={provider}
        onTest={() => setShowTest(true)}
        onEdit={() => setShowEdit(true)}
        onDisable={() => setShowDisable(true)}
        onRotateCredentials={() => setShowRotate(true)}
        onUpdateCredentials={() => setShowUpdateCreds(true)}
      />

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto border-b border-neutral-200 dark:border-neutral-800">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex items-center gap-1.5 whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium",
              activeTab === tab.key
                ? "border-brand-600 text-brand-600"
                : "border-transparent text-neutral-500 hover:text-neutral-700"
            )}
          >
            {tab.label}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="rounded-full bg-danger-100 px-1.5 py-0.5 text-[10px] font-semibold text-danger-700 dark:bg-danger-900/40 dark:text-danger-300">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          <ProviderOverview provider={provider} />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ProviderPerformance provider={provider} />
            <ProviderHealth provider={provider} />
          </div>
        </div>
      )}

      {activeTab === "health" && (
        <div className="space-y-4">
          <ProviderHealth provider={provider} />
          <ProviderHealthHistory
            providerId={provider.id}
            healthHistory={mockProviderHealthHistory[provider.id] || []}
          />
        </div>
      )}

      {activeTab === "activity" && (
        <ProviderActivityStream events={activityEvents} />
      )}

      {activeTab === "alerts" && (
        <ProviderAlertsPanel
          alerts={alerts}
          onAcknowledge={(id) =>
            setAlerts((prev) =>
              prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))
            )
          }
          onAcknowledgeAll={() =>
            setAlerts((prev) => prev.map((a) => ({ ...a, acknowledged: true })))
          }
        />
      )}

      {activeTab === "services" && <ProviderServicesPanel provider={provider} />}

      {activeTab === "routing" && (
        <ProviderRouting provider={provider} onSave={handleSaveRouting} />
      )}

      {activeTab === "transactions" && (
        <ProviderTransactions
          providerId={provider.id}
          transactions={mockProviderTransactions.filter(
            (t) => t.providerId === provider.id
          )}
        />
      )}

      {activeTab === "configuration" && (
        <div className="space-y-4">
          <ProviderConfiguration
            provider={provider}
            onSave={handleSaveConfig}
          />
          <ProviderCredentials
            provider={provider}
            onRotate={() => setShowRotate(true)}
            onUpdate={() => setShowUpdateCreds(true)}
          />
        </div>
      )}

      {activeTab === "audit" && (
        <ProviderAuditLog
          providerId={provider.id}
          auditLogs={mockProviderAuditLogs[provider.id] || []}
        />
      )}

      {/* Dialogs */}
      {showTest && (
        <TestProviderDialog provider={provider} onClose={() => setShowTest(false)} />
      )}
      {showEdit && (
        <EditProviderDialog
          provider={provider}
          onClose={() => setShowEdit(false)}
          onSave={handleEdit}
        />
      )}
      {showDisable && (
        <DisableProviderDialog
          provider={provider}
          onClose={() => setShowDisable(false)}
          onConfirm={handleDisable}
        />
      )}
      {showRotate && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowRotate(false)}
          />
          <div className="relative w-full max-w-sm rounded-lg bg-white p-6 shadow-xl dark:bg-neutral-900">
            <h3 className="text-lg font-semibold">Rotate Credentials?</h3>
            <p className="mt-2 text-sm text-neutral-500">
              This will invalidate the current API key and secret and generate
              new ones.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowRotate(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleRotateCredentials}>
                Rotate
              </Button>
            </div>
          </div>
        </div>
      )}
      {showUpdateCreds && (
        <UpdateCredentialsDialog
          provider={provider}
          onClose={() => setShowUpdateCreds(false)}
          onSave={handleUpdateCredentials}
        />
      )}
    </div>
  );
}