/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import type {
  ActivityEvent,
  Provider,
  ProviderAlert,
} from "@/lib/admin/types/provider";
import { Button } from "@/components/admin/ui/button";
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
import { ProviderActivityStream } from "@/components/admin/providers/provider-activity-stream";
import { ProviderAlertsPanel } from "@/components/admin/providers/provider-alerts-panel";
import { ProviderImpactPanel } from "@/components/admin/providers/provider-impact-panel";
import {
  TestProviderDialog,
  EditProviderDialog,
  DisableProviderDialog,
  RotateCredentialsDialog,
  UpdateCredentialsDialog,
  MaintenanceDialog,
} from "@/components/admin/providers/provider-modals";
import { cn } from "@/lib/utils";
import { useProvider } from "@/lib/admin/hooks/use-providers";
import { useCurrentAdmin } from "@/lib/admin/rbac";
import {
  updateProvider,
  updateProviderCredentials,
  updateProviderRouting,
  setProviderStatus,
  startMaintenance,
  endMaintenance,
  type MutationContext,
} from "@/lib/admin/mock/providers-store";
import { providerOperationalState } from "@/lib/admin/providers/state";

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

const VALID_TABS: Tab[] = [
  "overview",
  "health",
  "activity",
  "alerts",
  "services",
  "routing",
  "transactions",
  "configuration",
  "audit",
];

export default function ProviderDetailPage() {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <ProviderDetailPageInner />
    </Suspense>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-64 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
      <div className="h-24 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800" />
      <div className="h-10 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
      <div className="h-64 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800" />
    </div>
  );
}

function ProviderDetailPageInner() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const providerIdParam = params.providerId;
  const providerId = Array.isArray(providerIdParam)
    ? providerIdParam[0]
    : providerIdParam ?? "";

  const { provider, healthHistory, transactions, auditLog, loading, notFound } =
    useProvider(providerId);
  const admin = useCurrentAdmin();

  const initialTab = useMemo<Tab>(() => {
    const t = searchParams.get("tab") as Tab | null;
    return t && VALID_TABS.includes(t) ? t : "overview";
  }, [searchParams]);

  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, providerId]);

  const setTab = (tab: Tab) => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    router.replace(url.pathname + url.search);
  };

  const [showTest, setShowTest] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDisable, setShowDisable] = useState(false);
  const [showRotate, setShowRotate] = useState(false);
  const [showUpdateCreds, setShowUpdateCreds] = useState(false);
  const [showMaintenance, setShowMaintenance] = useState(false);
  const [acknowledgedAlertIds, setAcknowledgedAlertIds] = useState<string[]>([]);

  const ctx: MutationContext = useMemo(
    () => ({
      actor: admin
        ? { name: admin.name, email: admin.email }
        : { name: "System", email: "system@atlas.com" },
    }),
    [admin]
  );

  const alerts = useMemo<ProviderAlert[]>(() => {
    if (!provider) return [];
    const out: ProviderAlert[] = [];
    const state = providerOperationalState(provider);
    const now = new Date().toISOString();

    if (state.kind === "down") {
      out.push({
        id: `alert-conn-${provider.id}`,
        providerId: provider.id,
        title: "Connection failures detected",
        description: `Failure rate is ${(100 - provider.successRate).toFixed(1)}%.`,
        severity: "critical",
        timestamp: provider.lastHealthCheck,
        acknowledged: acknowledgedAlertIds.includes(`alert-conn-${provider.id}`),
      });
    }
    if (state.kind === "impaired") {
      out.push({
        id: `alert-lat-${provider.id}`,
        providerId: provider.id,
        title: "Elevated latency",
        description: `Average response time is ${provider.averageResponseTime}ms (target ${provider.sla.targetLatencyMs}ms).`,
        severity: "warning",
        timestamp: provider.lastHealthCheck,
        acknowledged: acknowledgedAlertIds.includes(`alert-lat-${provider.id}`),
      });
    }
    if (
      provider.balance &&
      provider.balance.current < provider.balance.minimumThreshold
    ) {
      out.push({
        id: `alert-bal-${provider.id}`,
        providerId: provider.id,
        title: "Low provider balance",
        description: `Balance ${provider.balance.current} ${provider.currency} is below minimum of ${provider.balance.minimumThreshold}.`,
        severity:
          provider.balance.current < provider.balance.criticalThreshold
            ? "critical"
            : "warning",
        timestamp: now,
        acknowledged: acknowledgedAlertIds.includes(`alert-bal-${provider.id}`),
      });
    }
    if (provider.priority === "primary" && !provider.failover.enabled) {
      out.push({
        id: `alert-fail-${provider.id}`,
        providerId: provider.id,
        title: "No failover configured",
        description:
          "Primary provider with failover disabled. An outage will not route automatically.",
        severity: "warning",
        timestamp: provider.updatedAt,
        acknowledged: acknowledgedAlertIds.includes(`alert-fail-${provider.id}`),
      });
    }
    return out;
  }, [provider, acknowledgedAlertIds]);

  const activityEvents = useMemo<ActivityEvent[]>(() => {
    if (!provider) return [];
    const events: ActivityEvent[] = [];

    for (const h of healthHistory) {
      events.push({
        id: `hc-${h.id}`,
        type: "health_check",
        title: `Health check ${h.outcome}`,
        description:
          h.responseTime > 0
            ? `Response time ${h.responseTime}ms`
            : "No response captured",
        timestamp: h.timestamp,
        status:
          h.outcome === "pass"
            ? "success"
            : h.outcome === "warn"
            ? "warning"
            : h.outcome === "fail"
            ? "danger"
            : "info",
        actor: "system",
      });
    }

    for (const t of transactions) {
      events.push({
        id: `tx-${t.id}`,
        type: "transaction",
        title: `${t.service} · ${t.providerStatus}`,
        description: `${t.atlasTransactionId} · ${t.responseTime}ms`,
        timestamp: t.createdAt,
        status: t.providerStatus.toLowerCase().includes("success")
          ? "success"
          : t.providerStatus.toLowerCase().includes("timeout") ||
            t.providerStatus.toLowerCase().includes("pending")
          ? "warning"
          : "danger",
        actor: "system",
      });
    }

    for (const a of auditLog) {
      const type: ActivityEvent["type"] =
        a.scope === "credentials"
          ? "credential_event"
          : a.scope === "routing"
          ? "routing_change"
          : "config_change";
      events.push({
        id: `aud-${a.id}`,
        type,
        title: a.action,
        description: a.reason,
        timestamp: a.timestamp,
        status: "info",
        actor: a.admin,
      });
    }

    return events.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [provider, healthHistory, transactions, auditLog]);

  if (loading) return <DetailSkeleton />;

  if (notFound || !provider) {
    return (
      <div className="space-y-4 py-16 text-center">
        <p className="text-lg font-medium">Provider not found</p>
        <Link
          href="/admin/providers"
          className="inline-flex h-9 items-center rounded-md border border-neutral-300 px-4 text-sm font-medium hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
        >
          Back to providers
        </Link>
      </div>
    );
  }

  const openAlertCount = alerts.filter((a) => !a.acknowledged).length;

  const tabs: { key: Tab; label: string; badge?: number }[] = [
    { key: "overview", label: "Overview" },
    { key: "health", label: "Health" },
    { key: "activity", label: "Activity" },
    { key: "alerts", label: "Alerts", badge: openAlertCount },
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
        onEnable={() =>
          setProviderStatus(provider.id, "enabled", ctx)
        }
        onSetMaintenance={() => setShowMaintenance(true)}
        onEndMaintenance={() => endMaintenance(provider.id, ctx)}
        onRotateCredentials={() => setShowRotate(true)}
        onUpdateCredentials={() => setShowUpdateCreds(true)}
      />

      <div
        role="tablist"
        aria-label="Provider detail tabs"
        className="flex gap-1 overflow-x-auto border-b border-neutral-200 dark:border-neutral-800"
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            type="button"
            id={`tab-${tab.key}`}
            aria-selected={activeTab === tab.key}
            aria-controls={`panel-${tab.key}`}
            tabIndex={activeTab === tab.key ? 0 : -1}
            onClick={() => setTab(tab.key)}
            className={cn(
              "flex items-center gap-1.5 whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
              activeTab === tab.key
                ? "border-brand-600 text-brand-600"
                : "border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
            )}
          >
            {tab.label}
            {typeof tab.badge === "number" && tab.badge > 0 && (
              <span className="rounded-full bg-danger-100 px-1.5 py-0.5 text-[10px] font-semibold text-danger-700 dark:bg-danger-900/40 dark:text-danger-300">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        className="space-y-4"
      >
        {activeTab === "overview" && (
          <>
            <ProviderOverview provider={provider} />
            <ProviderImpactPanel provider={provider} />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <ProviderPerformance provider={provider} />
              <ProviderHealth provider={provider} />
            </div>
          </>
        )}

        {activeTab === "health" && (
          <>
            <ProviderHealth provider={provider} />
            <ProviderHealthHistory
              provider={provider}
              healthHistory={healthHistory}
            />
          </>
        )}

        {activeTab === "activity" && (
          <ProviderActivityStream events={activityEvents} />
        )}

        {activeTab === "alerts" && (
          <ProviderAlertsPanel
            providerId={provider.id}
            alerts={alerts}
            onAcknowledge={(id) =>
              setAcknowledgedAlertIds((prev) =>
                prev.includes(id) ? prev : [...prev, id]
              )
            }
            onUnacknowledge={(id) =>
              setAcknowledgedAlertIds((prev) =>
                prev.filter((x) => x !== id)
              )
            }
            onAcknowledgeAll={() =>
              setAcknowledgedAlertIds(alerts.map((a) => a.id))
            }
          />
        )}

        {activeTab === "services" && (
          <ProviderServicesPanel provider={provider} />
        )}

        {activeTab === "routing" && (
          <ProviderRouting provider={provider} allProviders={[provider]} />
        )}

        {activeTab === "transactions" && (
          <ProviderTransactions
            provider={provider}
            transactions={transactions}
          />
        )}

        {activeTab === "configuration" && (
          <>
            <ProviderConfiguration provider={provider} />
            <ProviderCredentials
              provider={provider}
              onRotate={() => setShowRotate(true)}
              onUpdate={() => setShowUpdateCreds(true)}
            />
          </>
        )}

        {activeTab === "audit" && (
          <ProviderAuditLog provider={provider} auditLog={auditLog} />
        )}
      </div>

      <TestProviderDialog
        open={showTest}
        provider={provider}
        onClose={() => setShowTest(false)}
      />
      <EditProviderDialog
        open={showEdit}
        provider={provider}
        onClose={() => setShowEdit(false)}
        onSave={(patch) => updateProvider(provider.id, patch, ctx)}
      />
      <DisableProviderDialog
        open={showDisable}
        provider={provider}
        onClose={() => setShowDisable(false)}
        onConfirm={() =>
          setProviderStatus(provider.id, "disabled", ctx)
        }
      />
      <RotateCredentialsDialog
        open={showRotate}
        provider={provider}
        onClose={() => setShowRotate(false)}
        onConfirm={() =>
          updateProviderCredentials(
            provider.id,
            {
              hasApiKey: true,
              hasSecret: true,
              accountId: provider.credentials.accountId,
            },
            { ...ctx, reason: "Manual rotation" }
          )
        }
      />
      <UpdateCredentialsDialog
        open={showUpdateCreds}
        provider={provider}
        onClose={() => setShowUpdateCreds(false)}
        onSave={(input) =>
          updateProviderCredentials(provider.id, input, ctx)
        }
      />
      <MaintenanceDialog
        open={showMaintenance}
        provider={provider}
        onClose={() => setShowMaintenance(false)}
        onConfirm={(input) => startMaintenance(provider.id, input, ctx)}
      />
    </div>
  );
}