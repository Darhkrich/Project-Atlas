import { Card } from "@/components/admin/ui/card";
import { mockDashboardData } from "@/lib/admin/mock/dashboard";
import { AtlasIcon } from "@/components/atlas/icons";

type RecentEvent = {
  id: string | number;
  actor: string;
  action: string;
  resource: string;
  timestamp: string;
};

function timeAgo(iso: string) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function RecentEventsCard() {
  const events = mockDashboardData.recentEvents as RecentEvent[];

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
        Recent System Events
      </h3>
      <div className="space-y-2">
        {events.map((event) => (
          <div
            key={event.id}
            className="flex items-start gap-2 rounded-md bg-neutral-50 p-2 dark:bg-neutral-800/50"
          >
            <AtlasIcon name="clock" className="h-4 w-4 flex-shrink-0 text-neutral-400" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-neutral-900 dark:text-neutral-100">
                {event.actor} {event.action}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {event.resource} · {timeAgo(event.timestamp)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}