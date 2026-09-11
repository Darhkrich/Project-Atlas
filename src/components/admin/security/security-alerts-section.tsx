"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { mockSecurityAlerts } from "@/lib/admin/mock/security";

export function SecurityAlertsSection() {
  const [alerts, setAlerts] = useState(mockSecurityAlerts);

  const handleAcknowledge = (id: string) => {
    setAlerts(prev => prev.map(alert => alert.id === id ? { ...alert, acknowledged: true } : alert));
  };

  return (
    <Card>
      <CardHeader><CardTitle>Security Alerts</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {alerts.length === 0 ? (
          <p className="text-sm text-neutral-400">No active alerts.</p>
        ) : (
          alerts.map(alert => (
            <div key={alert.id} className="flex items-start justify-between gap-4 rounded-md border border-neutral-200 p-3 dark:border-neutral-700">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{alert.title}</p>
                  <Badge variant={alert.severity === "critical" ? "danger" : "warning"}>{alert.severity}</Badge>
                  {alert.acknowledged && <Badge variant="neutral">Acknowledged</Badge>}
                </div>
                <p className="text-sm text-neutral-500 mt-1">{alert.description}</p>
                <p className="text-xs text-neutral-400 mt-1">{new Date(alert.timestamp).toLocaleString()}</p>
              </div>
              {!alert.acknowledged && (
                <Button variant="outline" size="sm" onClick={() => handleAcknowledge(alert.id)}>Acknowledge</Button>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}