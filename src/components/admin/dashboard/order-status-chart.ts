"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import React from "react";

const data = [
  { name: "Successful", value: 8200, color: "#22c55e" },
  { name: "Pending", value: 120, color: "#f59e0b" },
  { name: "Failed", value: 80, color: "#ef4444" },
  { name: "Cancelled", value: 20, color: "#8a8881" },
];

export function OrderStatusChart() {
  return React.createElement(
    "div",
    null,
    React.createElement(
      "h3",
      { className: "text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-4" },
      "Order Activity",
    ),
    React.createElement(
      "div",
      { className: "h-64" },
      // eslint-disable-next-line react/no-children-prop
      React.createElement(
        ResponsiveContainer,
        {
          width: "100%",
          height: "100%",
          children: React.createElement(
            PieChart,
            null,
            React.createElement(
              Pie,
              {
                data,
                dataKey: "value",
                nameKey: "name",
                cx: "50%",
                cy: "50%",
                innerRadius: 60,
                outerRadius: 90,
                paddingAngle: 2,
              },
              data.map((entry, index) =>
                React.createElement(Cell, { key: `cell-${index}`, fill: entry.color }),
              ),
            ),
            React.createElement(Tooltip),
            React.createElement(Legend),
          ),
        },
      ),
    ),
  );
}