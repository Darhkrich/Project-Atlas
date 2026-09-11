/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Button } from "@/components/admin/ui/button";
import { Badge } from "@/components/admin/ui/badge";
import { AtlasIcon } from "@/components/atlas/icons";
import { DataNetwork } from "@/lib/admin/types/data-plan";
import { cn } from "@/lib/utils";

interface NetworkSidebarProps {
  networks: DataNetwork[];
  selectedNetworkId: string;
  onSelectNetwork: (id: string) => void;
  onAddNetwork: () => void;
}

export function NetworkSidebar({
  networks,
  selectedNetworkId,
  onSelectNetwork,
  onAddNetwork,
}: NetworkSidebarProps) {
  const totalPlans = networks.reduce(
    (sum, n) => sum + n.categories.reduce((s, c) => s + c.plans.length, 0),
    0
  );

  return (
    <Card className="w-full lg:w-64 shrink-0">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm">Networks</CardTitle>
        <Button size="sm" variant="ghost" onClick={onAddNetwork}>
          <AtlasIcon name="plus" className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-1">
        {networks.length === 0 ? (
          <p className="text-sm text-neutral-500">No networks yet.</p>
        ) : (
          networks.map((net) => {
            const planCount = net.categories.reduce(
              (s, c) => s + c.plans.length,
              0
            );
            const isSelected = selectedNetworkId === net.id;
            return (
              <button
                key={net.id}
                onClick={() => onSelectNetwork(net.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm font-medium transition-colors",
                  isSelected
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                    : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                )}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      isSelected ? "bg-brand-500" : "bg-neutral-300 dark:bg-neutral-600"
                    )}
                  />
                  <span>{net.name}</span>
                </div>
                <span className="text-xs text-neutral-500">{planCount}</span>
              </button>
            );
          })
        )}

        {/* Footer summary */}
        <div className="pt-3 text-xs text-neutral-500">
          <p>
            {networks.length} networks · {totalPlans} plans total
          </p>
        </div>
      </CardContent>
    </Card>
  );
}