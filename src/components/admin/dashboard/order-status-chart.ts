// components/admin/dashboard/order-status-chart.tsx
// This component contains JSX and must be compiled with JSX support.
"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { createElement } from "react";
import { orderStatusDistribution } from "@/lib/admin/mock/dashboard-series";
import { CHART_COLORS } from "@/lib/admin/dashboard/chart-palette";
import { formatNumber } from "@/lib/shared/format";

export function OrderStatusChart() {
  const total = orderStatusDistribution.reduce(
    (sum, entry) => sum + entry.value,
    0
  );

  return createElement("div", null,
    createElement("h2", { className: "mb-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300" }, "Order Activity"),
    createElement("div", { className: "relative h-64" },
      createElement(ResponsiveContainer, { width: "100%", height: "100%" },
        createElement(PieChart, null,
          createElement(Pie, {
            data: orderStatusDistribution, dataKey: "value", nameKey: "name",
            cx: "50%", cy: "50%", innerRadius: 60, outerRadius: 90,
            paddingAngle: 2, stroke: "none"
          }, orderStatusDistribution.map((entry, index) =>
            createElement(Cell, { key: "cell-" + index, fill: CHART_COLORS[entry.colorName] })
          )),
          createElement(Tooltip, {
            formatter: (value: number) => [formatNumber(value), "Orders"]
          })
        )
      ),
      createElement("div", { className: "pointer-events-none absolute inset-0 flex flex-col items-center justify-center" },
        createElement("p", { className: "text-2xl font-semibold tabular-nums" }, formatNumber(total)),
        createElement("p", { className: "text-[10px] uppercase tracking-wide text-neutral-500 dark:text-neutral-400" }, "orders")
      )
    ),
    createElement("ul", { role: "list", className: "mt-3 grid grid-cols-2 gap-x-4 gap-y-1" },
      orderStatusDistribution.map((entry) => createElement("li", {
        key: entry.name, className: "flex items-center justify-between text-xs"
      },
        createElement("span", { className: "flex items-center gap-2 text-neutral-600 dark:text-neutral-300" },
          createElement("span", { "aria-hidden": true, className: "h-2 w-2 rounded-full", style: { backgroundColor: CHART_COLORS[entry.colorName] } }),
          entry.name
        ),
        createElement("span", { className: "tabular-nums text-neutral-500 dark:text-neutral-400" }, formatNumber(entry.value))
      ))
    )
  );
}