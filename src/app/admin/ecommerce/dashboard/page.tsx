"use client";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { EcommerceSummaryCards } from "@/components/admin/ecommerce/ecommerce-summary-cards";
import { EcommerceDashboardCharts } from "@/components/admin/ecommerce/ecommerce-dashboard-charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import Link from "next/link";

const mockRecentActivity = [
  { id: "EA-1", type: "registration", description: "New merchant registered: TechHub Store", timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: "EA-2", type: "subscription", description: "FashionPlus upgraded to Growth plan", timestamp: new Date(Date.now() - 7200000).toISOString() },
  { id: "EA-3", type: "order", description: "Large order placed at HomeEssentials", timestamp: new Date(Date.now() - 86400000).toISOString() },
  { id: "EA-4", type: "support", description: "New support ticket from GadgetWorld", timestamp: new Date(Date.now() - 172800000).toISOString() },
];

const activityVariantMap: Record<string, "success" | "warning" | "info" | "danger" | "neutral"> = {
  registration: "info",
  subscription: "success",
  order: "warning",
  support: "danger",
};

function formatTimestamp(iso: string) {
  const d = new Date(iso);
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = d.getUTCFullYear();
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const min = String(d.getUTCMinutes()).padStart(2, "0");
  return `${mm}/${dd}/${yyyy}, ${hh}:${min}`;
}

export default function EcommerceDashboardPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="E-commerce Dashboard"
        description="Operational overview of the Atlas E-commerce platform."
        actions={
          <>
            <Link href="/admin/ecommerce/merchants">
              <Button variant="outline" size="sm">View Merchants</Button>
            </Link>
            <Link href="/admin/ecommerce/subscriptions">
              <Button variant="outline" size="sm">Manage Subscriptions</Button>
            </Link>
          </>
        }
      />

      <EcommerceSummaryCards />
      <EcommerceDashboardCharts />

      {/* Recent Activity */}
      <Card>
        <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {mockRecentActivity.map(activity => (
              <li key={activity.id} className="flex items-center gap-3 text-sm">
                <Badge variant={activityVariantMap[activity.type]}>{activity.type}</Badge>
                <span className="text-neutral-700 dark:text-neutral-300">{activity.description}</span>
                <span className="ml-auto text-xs text-neutral-500">{formatTimestamp(activity.timestamp)}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}