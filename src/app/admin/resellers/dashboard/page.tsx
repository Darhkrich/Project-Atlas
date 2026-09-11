"use client";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ResellerDashboardSummaryCards } from "@/components/admin/resellers/reseller-dashboard-summary-cards";
import { ResellerDashboardCharts } from "@/components/admin/resellers/reseller-dashboard-charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import { mockRecentActivities } from "@/lib/admin/mock/reseller-dashboard";
import { Button } from "@/components/admin/ui/button";
import Link from "next/link";

const activityVariantMap: Record<string, "success" | "warning" | "info" | "danger" | "neutral"> = {
  registration: "info",
  verification: "success",
  storefront: "warning",
  commission: "success",
  wallet: "info",
};

export default function ResellerDashboardPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Reseller Dashboard"
        description="Operational overview of the reseller channel."
        actions={
          <>
            <Link href="/admin/resellers">
              <Button variant="outline" size="sm">View Resellers</Button>
            </Link>
            <Link href="/admin/resellers/storefronts">
              <Button variant="outline" size="sm">Manage Storefronts</Button>
            </Link>
          </>
        }
      />

      <ResellerDashboardSummaryCards />

      <ResellerDashboardCharts />

      {/* Recent Activity */}
      <Card>
        <CardHeader><CardTitle>Recent Reseller Activity</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {mockRecentActivities.map(activity => (
              <li key={activity.id} className="flex items-center gap-3 text-sm">
                <Badge variant={activityVariantMap[activity.type]}>{activity.type}</Badge>
                <span className="text-neutral-700 dark:text-neutral-300">{activity.description}</span>
                <span className="ml-auto text-xs text-neutral-500">{new Date(activity.timestamp).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}