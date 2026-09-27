/* eslint-disable react/jsx-no-undef */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/admin/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { formatCurrency } from "@/lib/admin/formatters";
import {
  CHART_PALETTE,
  AXIS_STROKE_CLASS,
  seriesColor,
} from "@/lib/admin/charts/theme";
import {
  AUDIENCE_TO_STREAM,
  STREAM_LABEL,
} from "@/lib/admin/revenue/revenue-labels";
import type {
  StreamRow,
  TopServiceRow,
  MethodRow,
  NetworkRow,
  PerformerRow,
  CustomerRow,
  WeekdayRow,
  SourceRow,
} from "@/lib/admin/revenue/revenue-projection";

function EmptyRow({ label }: { label: string }) {
  return (
    <p className="py-8 text-center text-sm text-neutral-500">{label}</p>
  );
}

export function RevenueStreamBreakdown({ rows }: { rows: StreamRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue by stream</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <EmptyRow label="No streams in this range." />
        ) : (
          <ul role="list" className="space-y-3">
            {rows.map((row) => (
              <li key={row.stream} className="flex items-center gap-3">
                <span className="w-32 shrink-0 text-sm text-neutral-600 dark:text-neutral-400">
                  {STREAM_LABEL[row.stream]}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: row.share.toFixed(1) + "%",
                      backgroundColor: CHART_PALETTE.brand,
                    }}
                  />
                </div>
                <span className="w-24 shrink-0 text-right text-sm font-medium tabular-nums">
                  {formatCurrency(row.amount)}
                </span>
                <span className="w-12 shrink-0 text-right text-xs text-neutral-500 tabular-nums">
                  {row.share.toFixed(1)}%
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export function TopServicesRevenue({ rows }: { rows: TopServiceRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top services</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <EmptyRow label="No services in this range." />
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={rows}
              layout="vertical"
              margin={{ left: 90 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="currentColor"
                className={AXIS_STROKE_CLASS}
              />
              <XAxis type="number" tickLine={false} axisLine={false} />
              <YAxis
                dataKey="serviceName"
                type="category"
                tickLine={false}
                axisLine={false}
                width={90}
              />
              <Tooltip
                formatter={(value: any) => formatCurrency(Number(value))}
              />
              <Bar
                dataKey="amount"
                fill={CHART_PALETTE.brand}
                radius={[0, 4, 4, 0]}
                barSize={18}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

export function PaymentMethodRevenueChart({ rows }: { rows: MethodRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue by payment method</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <EmptyRow label="No payments in this range." />
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={rows}
                dataKey="amount"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={2}
                stroke="none"
              >
                {rows.map((_, i) => (
                  <Cell key={rows[i].methodId} fill={seriesColor(i)} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any) => formatCurrency(Number(value))}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

export function NetworkRevenueChart({ rows }: { rows: NetworkRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue by network</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <EmptyRow label="No data-network orders in this range." />
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={rows}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="currentColor"
                className={AXIS_STROKE_CLASS}
              />
              <XAxis dataKey="network" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip
                formatter={(value: any) => formatCurrency(Number(value))}
              />
              <Bar
                dataKey="amount"
                fill={CHART_PALETTE.warning}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

export function TopPerformersTable({
  resellers,
  merchants,
}: {
  resellers: PerformerRow[];
  merchants: PerformerRow[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top performers</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Resellers
          </h3>
          {resellers.length === 0 ? (
            <p className="text-sm text-neutral-500">
              No reseller revenue in this range.
            </p>
          ) : (
            <table className="w-full text-sm">
              <caption className="sr-only">Top resellers by revenue</caption>
              <thead>
                <tr className="text-left text-xs text-neutral-500 dark:text-neutral-400">
                  <th scope="col" className="pb-2">
                    Reseller
                  </th>
                  <th scope="col" className="pb-2 text-right">
                    Revenue
                  </th>
                  <th scope="col" className="pb-2 text-right">
                    Orders
                  </th>
                  <th scope="col" className="pb-2 text-right">
                    Trend
                  </th>
                </tr>
              </thead>
              <tbody>
                {resellers.map((r) => (
                  <tr
                    key={r.id}
                    className="border-t border-neutral-100 dark:border-neutral-800"
                  >
                    <td className="py-2">
                      <Link
                        href={"/admin/resellers/" + r.id}
                        className="font-medium text-brand-600 hover:underline dark:text-brand-400"
                      >
                        {r.name}
                      </Link>
                    </td>
                    <td className="py-2 text-right tabular-nums">
                      {formatCurrency(r.amount)}
                    </td>
                    <td className="py-2 text-right tabular-nums">
                      {r.orders}
                    </td>
                    <td className="py-2 text-right tabular-nums">
                      {r.trend === null ? (
                        "—"
                      ) : (
                        <span
                          className={
                            r.trend >= 0
                              ? "text-success-700 dark:text-success-400"
                              : "text-danger-700 dark:text-danger-400"
                          }
                        >
                          {r.trend.toFixed(1)}%
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div>
          <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Merchants
          </h3>
          {merchants.length === 0 ? (
            <p className="text-sm text-neutral-500">
              No merchant revenue in this range.
            </p>
          ) : (
            <table className="w-full text-sm">
              <caption className="sr-only">Top merchants by revenue</caption>
              <thead>
                <tr className="text-left text-xs text-neutral-500 dark:text-neutral-400">
                  <th scope="col" className="pb-2">
                    Merchant
                  </th>
                  <th scope="col" className="pb-2 text-right">
                    Revenue
                  </th>
                  <th scope="col" className="pb-2 text-right">
                    Orders
                  </th>
                </tr>
              </thead>
              <tbody>
                {merchants.map((m) => (
                  <tr
                    key={m.id}
                    className="border-t border-neutral-100 dark:border-neutral-800"
                  >
                    <td className="py-2">
                      <Link
                        href={"/admin/ecommerce/merchants/" + m.id}
                        className="font-medium text-brand-600 hover:underline dark:text-brand-400"
                      >
                        {m.name}
                      </Link>
                    </td>
                    <td className="py-2 text-right tabular-nums">
                      {formatCurrency(m.amount)}
                    </td>
                    <td className="py-2 text-right tabular-nums">
                      {m.orders}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function TopCustomersCard({ rows }: { rows: CustomerRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top customers</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <EmptyRow label="No customer-attributed revenue in this range." />
        ) : (
          <table className="w-full text-sm">
            <caption className="sr-only">
              Top customers by revenue
            </caption>
            <thead>
              <tr className="text-left text-xs text-neutral-500 dark:text-neutral-400">
                <th scope="col" className="pb-2">
                  Customer
                </th>
                <th scope="col" className="pb-2">
                  Stream
                </th>
                <th scope="col" className="pb-2 text-right">
                  Revenue
                </th>
                <th scope="col" className="pb-2 text-right">
                  Orders
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr
                  key={c.customerId}
                  className="border-t border-neutral-100 dark:border-neutral-800"
                >
                  <td className="py-2">
                    <Link
                      href={"/admin/customers/" + c.customerId}
                      className="font-medium text-brand-600 hover:underline dark:text-brand-400"
                    >
                      {c.name}
                    </Link>
                  </td>
                  <td className="py-2 text-neutral-600 dark:text-neutral-400">
                    {STREAM_LABEL[c.stream]}
                  </td>
                  <td className="py-2 text-right tabular-nums">
                    {formatCurrency(c.amount)}
                  </td>
                  <td className="py-2 text-right tabular-nums">
                    {c.orders}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
}

export function WeekdayRevenueCard({ rows }: { rows: WeekdayRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue by weekday</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.every((r) => r.amount === 0) ? (
          <EmptyRow label="No revenue in this range." />
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={rows}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="currentColor"
                className={AXIS_STROKE_CLASS}
              />
              <XAxis dataKey="short" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip
                formatter={(value: any) => formatCurrency(Number(value))}
              />
              <Bar
                dataKey="amount"
                fill={CHART_PALETTE.info}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

export function SourceRevenueCard({ rows }: { rows: SourceRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Acquisition source</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <EmptyRow label="No revenue in this range." />
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={rows}
                dataKey="amount"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                stroke="none"
              >
                {rows.map((r, i) => (
                  <Cell key={r.source} fill={seriesColor(i)} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any) => formatCurrency(Number(value))}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}