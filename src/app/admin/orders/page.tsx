/* eslint-disable react-hooks/purity */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  OrdersWorkspaceNav,
  type OrdersView,
} from "@/components/admin/orders/orders-workspace-nav";
import { OrderLiveBoard } from "@/components/admin/orders/order-live-board";
import { OrderAnalytics } from "@/components/admin/orders/order-analytics";
import { OrderDetailDrawer } from "@/components/admin/orders/order-detail-drawer";
import { OrderCancelModal } from "@/components/admin/orders/order-cancel-modal";
import { OrdersFilters } from "@/components/admin/orders/orders-filters";
import { OrdersSummaryCards } from "@/components/admin/orders/orders-summary-cards";
import { OrdersTable } from "@/components/admin/orders/orders-table";
import { OrdersEmptyState } from "@/components/admin/orders/orders-empty-state";
import { Button } from "@/components/admin/ui/button";
import { ErrorState } from "@/components/admin/ui/error-state";
import { Can } from "@/lib/admin/rbac/can";
import { useCurrentAdmin } from "@/lib/admin/rbac";
import { PERMISSIONS } from "@/lib/admin/rbac/permissions";
import { useNow } from "@/lib/shared/hooks/use-now";
import { useOrders } from "@/lib/admin/hooks/use-orders";
import { cancelOrder } from "@/lib/admin/mock/orders-mutations";
import { exportOrdersCsv } from "@/lib/admin/orders/orders-csv-export";
import {
  projectOrdersSummary,
  projectLiveBoard,
  projectHistory,
  projectOrdersAnalytics,
  type OrderFilters as OrderFiltersShape,
  type OrdersAnalyticsRange,
} from "@/lib/admin/orders/orders-projection";
import type { Order } from "@/lib/admin/types/orders";
import type { AuditActor } from "@/lib/domains/audit";
import { DEFAULT_ORDERS_PAGE_SIZE } from "@/lib/admin/orders/orders-constants";

const VIEW_VALUES: OrdersView[] = ["live", "history", "analytics"];

function parseView(raw: string | null): OrdersView {
  if (raw && (VIEW_VALUES as string[]).includes(raw)) return raw as OrdersView;
  return "live";
}

function parseFilters(params: URLSearchParams): OrderFiltersShape {
  const filters: OrderFiltersShape = {};
  const search = params.get("q");
  if (search) filters.search = search;
  const status = params.get("status");
  if (status) filters.status = status as OrderFiltersShape["status"];
  const audience = params.get("audience");
  if (audience) filters.audience = audience as OrderFiltersShape["audience"];
  const service = params.get("service");
  if (service) filters.serviceId = service;
  const network = params.get("network");
  if (network) filters.networkId = network;
  const from = params.get("from");
  if (from) filters.dateFrom = from;
  const to = params.get("to");
  if (to) filters.dateTo = to;
  return filters;
}

function filtersToParams(filters: OrderFiltersShape): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.search) params.set("q", filters.search);
  if (filters.status) params.set("status", filters.status);
  if (filters.audience) params.set("audience", filters.audience);
  if (filters.serviceId) params.set("service", filters.serviceId);
  if (filters.networkId) params.set("network", filters.networkId);
  if (filters.dateFrom) params.set("from", filters.dateFrom);
  if (filters.dateTo) params.set("to", filters.dateTo);
  return params;
}

export default function OrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const now = useNow();
  const admin = useCurrentAdmin();
  const { orders, isLoading, error } = useOrders();

  const actor: AuditActor = useMemo(
    () =>
      admin
        ? {
            id: admin.id ?? admin.email,
            name: admin.name,
            email: admin.email,
          }
        : { id: "system", name: "System", email: "system@atlas.com" },
    [admin]
  );

  const activeView = useMemo(
    () => parseView(searchParams.get("view")),
    [searchParams]
  );
  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);
  const currentPage = useMemo(() => {
    const raw = Number(searchParams.get("page") ?? "1");
    return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 1;
  }, [searchParams]);
  const analyticsRange = useMemo<OrdersAnalyticsRange>(() => {
    const raw = searchParams.get("range");
    if (raw === "7d" || raw === "30d") return raw;
    return "today";
  }, [searchParams]);

  const selectedOrderId = searchParams.get("order");

  const [pendingCancel, setPendingCancel] = useState<Order | null>(null);

  const selectedOrder = useMemo(
    () =>
      selectedOrderId
        ? orders.find((o) => o.id === selectedOrderId) ?? null
        : null,
    [orders, selectedOrderId]
  );

  const setParam = useCallback(
    (key: string, value: string | undefined) => {
      const next = new URLSearchParams(searchParams.toString());
      if (value === undefined || value === "") next.delete(key);
      else next.set(key, value);
      if (key !== "page") next.delete("page");
      router.replace("/admin/orders?" + next.toString());
    },
    [router, searchParams]
  );

  const handleViewChange = useCallback(
    (view: OrdersView) => {
      setParam("view", view);
    },
    [setParam]
  );

  const handleFiltersChange = useCallback(
    (next: OrderFiltersShape) => {
      const params = filtersToParams(next);
      const view = activeView;
      params.set("view", view);
      router.replace("/admin/orders?" + params.toString());
    },
    [router, activeView]
  );

  const handleFiltersReset = useCallback(() => {
    router.replace("/admin/orders?view=" + activeView);
  }, [router, activeView]);

  const handlePageChange = useCallback(
    (page: number) => {
      setParam("page", String(page));
    },
    [setParam]
  );

  const handleRowClick = useCallback(
    (orderId: string) => {
      setParam("order", orderId);
    },
    [setParam]
  );

  const handleCloseDrawer = useCallback(() => {
    setParam("order", undefined);
  }, [setParam]);

  const handleCancelRequested = useCallback((order: Order) => {
    setPendingCancel(order);
  }, []);

  const handleCancelConfirmed = useCallback(
    (orderId: string, reason: string) => {
      cancelOrder(orderId, reason, actor);
      setPendingCancel(null);
      setParam("order", undefined);
    },
    [setParam, actor]
  );

  const handleExport = useCallback(() => {
    const { rows } = projectHistory(orders, filters);
    const ids = new Set(rows.map((r) => r.id));
    const toExport = orders.filter((o) => ids.has(o.id));
    exportOrdersCsv(toExport);
  }, [orders, filters]);

  useEffect(() => {
    if (!searchParams.get("view")) {
      const next = new URLSearchParams(searchParams.toString());
      next.set("view", "live");
      router.replace("/admin/orders?" + next.toString());
    }
  }, [router, searchParams]);

  const summary = useMemo(
    () => projectOrdersSummary(orders, now ?? Date.now()),
    [orders, now]
  );
  const liveView = useMemo(() => projectLiveBoard(orders), [orders]);
  const history = useMemo(
    () => projectHistory(orders, filters),
    [orders, filters]
  );
  const analyticsView = useMemo(
    () => projectOrdersAnalytics(orders, now ?? Date.now(), analyticsRange),
    [orders, now, analyticsRange]
  );

  const pageSize = DEFAULT_ORDERS_PAGE_SIZE;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return history.rows.slice(start, start + pageSize);
  }, [history.rows, currentPage, pageSize]);

  const hasFilters = Object.keys(filters).length > 0;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Orders"
        description="Read-only ledger of Atlas direct and reseller storefront orders. System failures retry automatically. Cancellation is the only admin action."
        meta={
          <>
            <span>{orders.length} total</span>
            <span className="text-neutral-400">·</span>
            <span>{liveView.activeCount} active</span>
          </>
        }
        actions={
          <Can permission={PERMISSIONS.ORDERS_EXPORT}>
            <Button variant="outline" size="sm" onClick={handleExport}>
              Export CSV
            </Button>
          </Can>
        }
      />

      {error ? (
        <ErrorState
          title="Could not load orders"
          description={error.message}
        />
      ) : (
        <>
          <OrdersSummaryCards summary={summary} />

          <div className="flex flex-col gap-6 lg:flex-row">
            <OrdersWorkspaceNav
              activeView={activeView}
              onChange={handleViewChange}
            />

            <div className="min-w-0 flex-1">
              {activeView === "live" && (
                <OrderLiveBoard
                  view={liveView}
                  now={now}
                  onOrderClick={(order) => handleRowClick(order.id)}
                />
              )}

              {activeView === "history" && (
                <div className="space-y-4">
                  <OrdersFilters
                    filters={filters}
                    onChange={handleFiltersChange}
                    onReset={handleFiltersReset}
                  />

                  {history.rows.length === 0 ? (
                    <OrdersEmptyState hasFilters={hasFilters} />
                  ) : (
                    <OrdersTable
                      rows={paginatedRows}
                      isLoading={isLoading}
                      page={currentPage}
                      pageSize={pageSize}
                      onPageChange={handlePageChange}
                      onRowClick={handleRowClick}
                    />
                  )}
                </div>
              )}

              {activeView === "analytics" && (
                <OrderAnalytics
                  view={analyticsView}
                  range={analyticsRange}
                  onRangeChange={(next) => setParam("range", next)}
                />
              )}
            </div>
          </div>
        </>
      )}

      <OrderDetailDrawer
        order={selectedOrder}
        now={now}
        onClose={handleCloseDrawer}
        onCancel={handleCancelRequested}
      />

      <Can permission={PERMISSIONS.ORDERS_MANAGE}>
        <OrderCancelModal
          order={pendingCancel}
          onClose={() => setPendingCancel(null)}
          onConfirm={handleCancelConfirmed}
        />
      </Can>
    </div>
  );
}