/* eslint-disable react-hooks/purity */
"use client";

import { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card } from "@/components/admin/ui/card";
import {
  AdminDataTable,
  type Column,
} from "@/components/admin/ui/admin-data-table";
import { Input } from "@/components/admin/ui/input";
import { Button } from "@/components/admin/ui/button";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { formatCurrency } from "@/lib/shared/format";
import { formatDate } from "@/lib/shared/format";
import type { PlatformMargin } from "@/lib/admin/types/commission";
import type { PlatformTrendPoint } from "@/lib/admin/commissions/commission-projection";

const BRAND_STROKE = "#166e59";

type DatePreset = "30d" | "90d" | "mtd" | "all";

interface Props {
  margins: PlatformMargin[];
  trend: PlatformTrendPoint[];
  loading: boolean;
}

function presetSinceMs(preset: DatePreset, nowMs: number): number {
  if (preset === "all") return 0;
  if (preset === "mtd") {
    const d = new Date(nowMs);
    return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1);
  }
  if (preset === "30d") return nowMs - 30 * 86_400_000;
  return nowMs - 90 * 86_400_000;
}

function marginColumns(): Column<PlatformMargin>[] {
  return [
    {
      key: "id",
      header: "Margin ID",
      cell: (m) => <span className="font-mono text-xs">{m.id}</span>,
    },
    {
      key: "orderId",
      header: "Order",
      cell: (m) => <span className="font-mono text-xs">{m.orderId}</span>,
    },
    {
      key: "service",
      header: "Service",
      cell: (m) => m.service,
    },
    {
      key: "providerCost",
      header: "Provider Cost",
      cell: (m) => formatCurrency(m.providerCost),
    },
    {
      key: "atlasPrice",
      header: "Atlas Price",
      cell: (m) => formatCurrency(m.atlasPrice),
    },
    {
      key: "margin",
      header: "Margin",
      cell: (m) => (
        <span className="font-semibold">{formatCurrency(m.margin)}</span>
      ),
    },
    {
      key: "marginPercentage",
      header: "Margin %",
      cell: (m) => m.marginPercentage.toFixed(1) + "%",
    },
    {
      key: "date",
      header: "Date",
      cell: (m) => formatDate(m.date),
    },
  ];
}

export function PlatformMarginView({ margins, trend, loading }: Props) {
  const [preset, setPreset] = useState<DatePreset>("30d");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  const filtered = useMemo(() => {
    const nowMs = Date.now();
    const sinceMs = presetSinceMs(preset, nowMs);
    const q = search.trim().toLowerCase();
    let list = margins;
    if (sinceMs > 0) {
      list = list.filter((m) => new Date(m.date).getTime() >= sinceMs);
    }
    if (q) {
      list = list.filter(
        (m) =>
          m.id.toLowerCase().includes(q) ||
          m.orderId.toLowerCase().includes(q) ||
          m.service.toLowerCase().includes(q)
      );
    }
    return list;
  }, [margins, preset, search]);

  const safePage = Math.max(1, page);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageSafe = Math.min(safePage, totalPages);
  const paginated = useMemo(() => {
    const start = (pageSafe - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, pageSafe, pageSize]);

  const columns = useMemo(() => marginColumns(), []);

  const emptyState = (
    <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      {search || preset !== "all" ? (
        <EmptyState
          variant="no_results"
          title="No margin rows match these filters"
          description="Try a wider date range or a different search."
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch("");
                setPreset("all");
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <EmptyState
          variant="no_data"
          title="No platform margins yet"
          description="Margin rows appear as orders settle."
        />
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <Card>
        <div className="p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Margin trend (last 7 days)
            </h3>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <defs>
                  <linearGradient
                    id="commissionMarginTrendGrad"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={BRAND_STROKE}
                      stopOpacity={0.5}
                    />
                    <stop
                      offset="95%"
                      stopColor={BRAND_STROKE}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="text-neutral-200 dark:text-neutral-800"
                />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value))}
                  labelFormatter={(label) => String(label)}
                />
                <Area
                  type="monotone"
                  dataKey="margin"
                  stroke={BRAND_STROKE}
                  fill="url(#commissionMarginTrendGrad)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-56 flex-1">
          <label
            htmlFor="margin-search"
            className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400"
          >
            Search
          </label>
          <Input
            id="margin-search"
            aria-label="Search platform margins"
            placeholder="Margin ID, order, service"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div>
          <label
            htmlFor="margin-preset"
            className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400"
          >
            Period
          </label>
          <select
            id="margin-preset"
            aria-label="Filter by period"
            value={preset}
            onChange={(e) => {
              setPreset(e.target.value as DatePreset);
              setPage(1);
            }}
            className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          >
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="mtd">This month</option>
            <option value="all">All time</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div
          aria-busy="true"
          aria-label="Loading platform margins"
          className="space-y-2"
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-12 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        emptyState
      ) : (
        <AdminDataTable
          columns={columns}
          data={paginated}
          isLoading={false}
          rowKey={(m) => m.id}
          emptyMessage="No platform margins found."
          caption="Platform margins"
          pageSize={pageSize}
          currentPage={pageSafe}
          totalCount={filtered.length}
          onPageChange={(p) => setPage(p)}
        />
      )}
    </div>
  );
}