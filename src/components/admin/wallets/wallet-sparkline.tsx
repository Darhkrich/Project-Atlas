"use client";

import { LineChart, Line, ResponsiveContainer } from "recharts";

interface WalletSparklineProps {
  data: { date: string; balance: number }[];
  color?: string;
  height?: number;
}

export function WalletSparkline({
  data,
  color = "#166e59",
  height = 32,
}: WalletSparklineProps) {
  return (
    <div className="w-24" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="balance"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}