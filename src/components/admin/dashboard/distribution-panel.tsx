/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { AXIS_STROKE_CLASS } from "@/lib/admin/charts/theme";

export interface DistributionSlice {
  id: string;
  label: string;
  value: number;
  color: string;
}

export type DistributionVariant = "donut" | "horizontal_bar" | "vertical_bar";

export function DistributionPanel({
  slices,
  variant = "donut",
  valueFormatter,
}: {
  slices: DistributionSlice[];
  variant?: DistributionVariant;
  valueFormatter?: (v: number) => string;
}) {
  const nonEmpty = slices.filter((s) => s.value > 0);

  if (nonEmpty.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-neutral-500">
        No data to show.
      </p>
    );
  }

  const format = valueFormatter ?? ((v: number) => String(v));

  if (variant === "donut") {
    return (
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={nonEmpty}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={2}
            stroke="none"
          >
            {nonEmpty.map((s) => (
              <Cell key={s.id} fill={s.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value: any) => format(Number(value))} />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (variant === "horizontal_bar") {
    return (
      <ResponsiveContainer width="100%" height={Math.max(180, nonEmpty.length * 40)}>
        <BarChart
          data={nonEmpty}
          layout="vertical"
          margin={{ left: 80 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="currentColor"
            className={AXIS_STROKE_CLASS}
            horizontal={false}
          />
          <XAxis type="number" tickLine={false} axisLine={false} />
          <YAxis
            dataKey="label"
            type="category"
            tickLine={false}
            axisLine={false}
            width={80}
            fontSize={11}
          />
          <Tooltip formatter={(value: any) => format(Number(value))} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {nonEmpty.map((s) => (
              <Cell key={s.id} fill={s.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={nonEmpty}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="currentColor"
          className={AXIS_STROKE_CLASS}
        />
        <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
        <YAxis tickLine={false} axisLine={false} fontSize={11} />
        <Tooltip formatter={(value: any) => format(Number(value))} />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {nonEmpty.map((s) => (
            <Cell key={s.id} fill={s.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}