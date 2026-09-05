/* eslint-disable @typescript-eslint/no-unused-vars */
import { Card, CardContent } from "@/components/admin/ui/card";
import { mockDashboardData } from "@/lib/admin/mock/dashboard";
import { AtlasIcon } from "@/components/atlas/icons";

function formatTimestamp(iso: string) {
  const d = new Date(iso);
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = d.getUTCFullYear();
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const min = String(d.getUTCMinutes()).padStart(2, "0");
  const ss = String(d.getUTCSeconds()).padStart(2, "0");
  return `${mm}/${dd}/${yyyy}, ${hh}:${min}:${ss}`;
}

export function RecentEventsCard() {
  const events = mockDashboardData.recentEvents;

  return (
    <Card className="p-3">
      <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Recent System Events</h3>
      <div className="mt-2 space-y-2">
        {events.map((event: (typeof events)[number]) => (
          <div key={event.id} className="flex items-start gap-2 rounded-md bg-neutral-50 p-2 dark:bg-neutral-800/50">
            <AtlasIcon name="clock" className="h-4 w-4 flex-shrink-0 text-neutral-400" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-neutral-900 dark:text-neutral-100">
                {event.actor} {event.action}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {event.resource} · {formatTimestamp(event.timestamp)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}