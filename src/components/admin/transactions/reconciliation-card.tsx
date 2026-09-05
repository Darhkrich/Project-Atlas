"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";

export function ReconciliationCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reconciliation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span>Matched Transactions</span><span>98</span></div>
          <div className="flex justify-between"><span>Unmatched Transactions</span><span>2</span></div>
          <div className="flex justify-between"><span>Amount Mismatches</span><span>1</span></div>
          <div className="flex justify-between"><span>Missing Settlements</span><span>0</span></div>
          <div className="flex justify-between"><span>Settlement Failures</span><span>0</span></div>
          <div className="flex justify-between"><span>Last Run</span><span>2 mins ago</span></div>
          <div className="flex justify-between"><span>Status</span><span className="text-success-600">Healthy</span></div>
        </div>
        <button className="mt-3 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800">
          View Reconciliation
        </button>
      </CardContent>
    </Card>
  );
}