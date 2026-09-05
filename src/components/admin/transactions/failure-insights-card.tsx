"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";

const failureReasons = [
  { reason: "Provider timeout", count: 3 },
  { reason: "Insufficient funds", count: 2 },
  { reason: "Invalid account", count: 1 },
  { reason: "Network error", count: 1 },
];

export function FailureInsightsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Failure Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {failureReasons.map((item) => (
            <li key={item.reason} className="flex justify-between text-sm">
              <span>{item.reason}</span>
              <span className="font-medium">{item.count}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4">
          <p className="text-sm font-medium">Failure Rate by Payment Method</p>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-xs"><span>MoMo</span><span>4%</span></div>
            <div className="flex justify-between text-xs"><span>Card</span><span>2%</span></div>
            <div className="flex justify-between text-xs"><span>Wallet</span><span>1%</span></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}