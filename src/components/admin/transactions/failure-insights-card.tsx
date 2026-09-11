"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";

const failureReasons = [
  { reason: "Provider timeout", count: 3, percent: 60 },
  { reason: "Insufficient funds", count: 2, percent: 40 },
  { reason: "Invalid account", count: 1, percent: 20 },
  { reason: "Network error", count: 1, percent: 20 },
];

const failureByMethod = [
  { method: "MoMo", rate: 4 },
  { method: "Card", rate: 2 },
  { method: "Wallet", rate: 1 },
];

export function FailureInsightsCard() {
  const maxCount = Math.max(...failureReasons.map((f) => f.count));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Failure Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Reasons */}
        <div>
          <p className="mb-2 text-xs font-medium text-neutral-500">Top Failure Reasons</p>
          <ul className="space-y-2">
            {failureReasons.map((item) => (
              <li key={item.reason} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>{item.reason}</span>
                  <span className="font-medium">{item.count}</span>
                </div>
                <div className="h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-700">
                  <div
                    className="h-1.5 rounded-full bg-danger-500"
                    style={{ width: `${(item.count / maxCount) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* By method */}
        <div>
          <p className="mb-2 text-xs font-medium text-neutral-500">Failure Rate by Method</p>
          <ul className="space-y-2">
            {failureByMethod.map((item) => (
              <li key={item.method} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>{item.method}</span>
                  <span className="font-medium text-danger-600">{item.rate}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-700">
                  <div
                    className="h-1.5 rounded-full bg-warning-500"
                    style={{ width: `${(item.rate / 10) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}