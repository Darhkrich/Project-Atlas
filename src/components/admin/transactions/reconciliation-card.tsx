"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";

export function ReconciliationCard() {
  const total = 100;
  const matched = 98;
  const matchRate = (matched / total) * 100;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Reconciliation</CardTitle>
        <Badge variant="success">Healthy</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Match rate */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-neutral-500">Match Rate</span>
            <span className="font-semibold">{matchRate}%</span>
          </div>
          <div className="h-2 rounded-full bg-neutral-200 dark:bg-neutral-700">
            <div
              className="h-2 rounded-full bg-success-500"
              style={{ width: `${matchRate}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-neutral-500">Matched</p>
            <p className="font-semibold text-success-600">{matched}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Unmatched</p>
            <p className="font-semibold text-danger-600">{total - matched}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Mismatches</p>
            <p className="font-semibold">1</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Missing Settlements</p>
            <p className="font-semibold">0</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Settlement Failures</p>
            <p className="font-semibold">0</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Last Run</p>
            <p className="font-semibold">2 mins ago</p>
          </div>
        </div>

        <Button variant="outline" size="sm" className="w-full">
          View Reconciliation
        </Button>
      </CardContent>
    </Card>
  );
}