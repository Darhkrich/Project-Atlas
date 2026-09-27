"use client";

import { Suspense, useMemo } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  useCurrentAdmin,
  roleLabel,
  rolePermissions,
  type Permission,
} from "@/lib/admin/rbac";
import { useDashboard } from "@/lib/admin/hooks/use-dashboard";
import { layoutForRole } from "@/lib/admin/dashboard/role-layouts";
import type { DashboardCardKey } from "@/lib/admin/dashboard/role-layouts";
import { DASHBOARD_CARD_REGISTRY } from "@/lib/admin/dashboard/dashboard-card-registry";
import { filterAttentionByPermissions } from "@/lib/admin/dashboard/dashboard-attention";
import { kpiPropsFor } from "@/lib/admin/dashboard/kpi-for-key";
import { renderDashboardPanel } from "@/lib/admin/dashboard/dashboard-panel-renderers";
import { GreetingStrip } from "@/components/admin/dashboard/greeting-strip";
import { CommandStrip } from "@/components/admin/dashboard/command-strip";
import {
  KpiCard,
  type KpiCardProps,
} from "@/components/admin/dashboard/kpi-card";
import { QuickActionsCard } from "@/components/admin/dashboard/quick-actions-card";
import { ActivityFeed } from "@/components/admin/dashboard/activity-feed";

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardInner />
    </Suspense>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-64 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
      <div className="h-20 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"
          />
        ))}
      </div>
      <div className="h-80 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800" />
    </div>
  );
}

interface KpiEntry {
  key: DashboardCardKey;
  props: KpiCardProps;
}

function DashboardInner() {
  const admin = useCurrentAdmin();
  const { snapshot, slices, loading } = useDashboard();

  const role = admin?.role ?? "viewer";
  const layout = useMemo(() => layoutForRole(role), [role]);

  const can = useMemo(() => {
    const granted = new Set<Permission>(rolePermissions(role));
    return (perm: Permission) => granted.has(perm);
  }, [role]);

  const visibleAttention = useMemo(() => {
    if (!layout.command) return [];
    return filterAttentionByPermissions(snapshot.attention, can);
  }, [layout.command, snapshot.attention, can]);

  const visibleKpis: KpiEntry[] = useMemo(() => {
    const out: KpiEntry[] = [];
    for (const key of layout.kpis) {
      const def = DASHBOARD_CARD_REGISTRY[key];
      if (!def) continue;
      if (def.permission && !can(def.permission)) continue;
      const props = kpiPropsFor(key, snapshot);
      if (!props) continue;
      out.push({ key, props });
    }
    return out;
  }, [layout.kpis, snapshot, can]);

  const visibleFocus = useMemo(() => {
    return layout.focus.filter((key) => {
      const def = DASHBOARD_CARD_REGISTRY[key];
      if (!def) return false;
      if (def.permission && !can(def.permission)) return false;
      return true;
    });
  }, [layout.focus, can]);

  const visibleSecondary = useMemo(() => {
    return layout.secondary.filter((key) => {
      const def = DASHBOARD_CARD_REGISTRY[key];
      if (!def) return false;
      if (def.permission && !can(def.permission)) return false;
      return true;
    });
  }, [layout.secondary, can]);

  const firstName = (admin?.name ?? "").split(" ")[0] || "there";

  const headerMeta = useMemo(() => {
    return (
      <>
        <span>{roleLabel(role)}</span>
        {loading && (
          <>
            <span aria-hidden="true"> · </span>
            <span>Refreshing…</span>
          </>
        )}
      </>
    );
  }, [role, loading]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Dashboard"
        description="Role-based operational overview. Every card links to its source."
        meta={headerMeta}
      />

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <GreetingStrip
            firstName={firstName}
            roleLabel={roleLabel(role)}
            attentionCount={visibleAttention.length}
          />

          {layout.command && <CommandStrip items={visibleAttention} />}

          {visibleKpis.length > 0 && (
            <section
              aria-label="Key metrics"
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5"
            >
              {visibleKpis.map((entry) => (
                <KpiCard key={entry.key} {...entry.props} />
              ))}
            </section>
          )}

          {visibleFocus.length > 0 && (
            <section aria-label="Focus">
              <div
                className={
                  visibleFocus.length === 1
                    ? "grid grid-cols-1 gap-4"
                    : "grid grid-cols-1 gap-4 lg:grid-cols-3"
                }
              >
                {visibleFocus.map((key) => {
                  const def = DASHBOARD_CARD_REGISTRY[key];
                  const className =
                    def?.kind === "focus_wide"
                      ? "lg:col-span-2"
                      : def?.kind === "focus_full"
                      ? "lg:col-span-3"
                      : "lg:col-span-1";
                  return (
                    <div key={key} className={className}>
                      {renderDashboardPanel({ key, snapshot, slices })}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {visibleSecondary.length > 0 && (
            <section
              aria-label="Secondary panels"
              className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
            >
              {visibleSecondary.map((key) => (
                <div key={key}>
                  {renderDashboardPanel({ key, snapshot, slices })}
                </div>
              ))}
            </section>
          )}

          <QuickActionsCard />

          {layout.activity && <ActivityFeed />}
        </>
      )}
    </div>
  );
}