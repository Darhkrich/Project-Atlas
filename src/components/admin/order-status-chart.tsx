"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const data = [
  { name: "Successful", value: 8200, color: "#2d9444" },
  { name: "Pending", value: 120, color: "#c89c1e" },
  { name: "Failed", value: 80, color: "#c56151" },
  { name: "Cancelled", value: 20, color: "#8a8881" },
];

export function OrderStatusChart() {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) =>
              typeof value === "number" ? value.toLocaleString() : String(value ?? "")
            }
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}