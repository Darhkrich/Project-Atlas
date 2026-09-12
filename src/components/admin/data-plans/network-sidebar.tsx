"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/admin/ui/card";
import { Button } from "@/components/admin/ui/button";
import { AtlasIcon } from "@/components/atlas/icons";
import type { DataNetwork } from "@/lib/admin/types/data-plan";
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
    <Card
      className="w-full shrink-0 lg:w-64"
      role="navigation"
      aria-label="Networks"
    >
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm">Networks</CardTitle>
        <Button
          size="sm"
          variant="ghost"
          onClick={onAddNetwork}
          aria-label="Add network"
        >
          <AtlasIcon name="plus" aria-hidden="true" className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-1">
        {networks.length === 0 ? (
          <p className="text-sm text-neutral-500">
            No networks yet. Add one to get started.
          </p>
        ) : (
          <ul role="list" className="space-y-1">
            {networks.map((net) => {
              const planCount = net.categories.reduce(
                (s, c) => s + c.plans.length,
                0
              );
              const isSelected = selectedNetworkId === net.id;
              return (
                <li key={net.id}>
                  <button
                    type="button"
                    onClick={() => onSelectNetwork(net.id)}
                    aria-current={isSelected ? "page" : undefined}
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                      isSelected
                        ? "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                        : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        aria-hidden="true"
                        className={cn(
                          "h-2 w-2 rounded-full",
                          isSelected
                            ? "bg-brand-500"
                            : "bg-neutral-300 dark:bg-neutral-600"
                        )}
                      />
                      <span>{net.name}</span>
                    </span>
                    <span className="text-xs text-neutral-500">
                      {planCount}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <div className="pt-3 text-xs text-neutral-500 dark:text-neutral-400">
          <p>
            {networks.length} network{networks.length === 1 ? "" : "s"} ·{" "}
            {totalPlans} plan{totalPlans === 1 ? "" : "s"} total
          </p>
        </div>
      </CardContent>
    </Card>
  );
}