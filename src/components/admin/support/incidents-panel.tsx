/* eslint-disable @typescript-eslint/no-unused-vars */
// components/admin/support/incidents-panel.tsx
"use client";

import { useState } from "react";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { StatusDot } from "@/components/admin/ui/status-dot";
import { cn } from "@/lib/utils";
import { formatRelative } from "@/lib/admin/support/format";
import { digitalServiceCategoryLabel } from "@/lib/admin/support/constants";
import {
  getProviderHealth,
  providerHealthTone,
} from "@/lib/admin/support/provider-health";
import type { IncidentCluster } from "@/lib/admin/support/incidents";

interface IncidentsPanelProps {
  clusters: IncidentCluster[];
  now: number | null;
  replyDraft: { clusterId: string; text: string } | null;
  onReplyDraftChange: (draft: { clusterId: string; text: string } | null) => void;
  onSendClusterReply: (cluster: IncidentCluster, message: string) => void;
  onAcknowledgeCluster: (cluster: IncidentCluster) => void;
  onViewCluster: (cluster: IncidentCluster) => void;
}

export function IncidentsPanel({
  clusters,
  now,
  replyDraft,
  onReplyDraftChange,
  onSendClusterReply,
  onAcknowledgeCluster,
  onViewCluster,
}: IncidentsPanelProps) {
  const [collapsed, setCollapsed] = useState(false);

  if (clusters.length === 0) return null;

  return (
    <section
      aria-label="Active incidents"
      className="rounded-lg border border-danger-200 bg-danger-50/50 dark:border-danger-800/60 dark:bg-danger-900/15"
    >
      <div className="flex items-center justify-between gap-3 px-3 py-2">
        <div className="flex items-center gap-2">
          <StatusDot tone="danger" />
          <span className="text-sm font-medium text-danger-800 dark:text-danger-200">
            {clusters.length} active incident
            {clusters.length === 1 ? "" : "s"}
          </span>
          <span className="text-xs text-danger-700/80 dark:text-danger-300/80">
            auto-clustered by provider and service
          </span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          aria-expanded={!collapsed}
          onClick={() => setCollapsed((v) => !v)}
        >
          {collapsed ? "Show" : "Hide"}
        </Button>
      </div>

      {!collapsed && (
        <div className="space-y-2 border-t border-danger-200 px-3 py-3 dark:border-danger-800/60">
          {clusters.map((cluster) => {
            const health = getProviderHealth(cluster.providerId);
            const drafting = replyDraft?.clusterId === cluster.id;

            return (
              <div
                key={cluster.id}
                className="rounded-md border border-danger-200 bg-white p-3 dark:border-danger-800/60 dark:bg-neutral-900"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {health && (
                        <StatusDot
                          tone={providerHealthTone(health.healthStatus)}
                          size="sm"
                        />
                      )}
                      <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {cluster.providerName}
                      </span>
                      <Badge variant="neutral" size="sm">
                        {digitalServiceCategoryLabel[cluster.serviceCategory]}
                      </Badge>
                      <Badge variant="danger" size="sm">
                        {cluster.count} open
                      </Badge>
                      {cluster.unreadCount > 0 && (
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                          {cluster.unreadCount} unread
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                      Oldest: {formatRelative(cluster.oldestAt, now)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewCluster(cluster)}
                    >
                      View tickets
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAcknowledgeCluster(cluster)}
                    >
                      Acknowledge
                    </Button>
                    <Button
                      variant={drafting ? "primary" : "outline"}
                      size="sm"
                      aria-expanded={drafting}
                      onClick={() =>
                        onReplyDraftChange(
                          drafting
                            ? null
                            : { clusterId: cluster.id, text: "" }
                        )
                      }
                    >
                      Reply to all
                    </Button>
                  </div>
                </div>

                {drafting && (
                  <div className="mt-3 border-t border-neutral-200 pt-3 dark:border-neutral-800">
                    <textarea
                      aria-label="Reply to all tickets in this incident"
                      className="w-full rounded-md border border-neutral-300 p-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                      rows={3}
                      placeholder="Type one reply. It will be sent to every ticket in this incident. Supports {contactName}, {amount}, {transactionRef}, {providerName}."
                      value={replyDraft?.text ?? ""}
                      onChange={(e) =>
                        onReplyDraftChange({
                          clusterId: cluster.id,
                          text: e.target.value,
                        })
                      }
                    />
                    <div className="mt-2 flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onReplyDraftChange(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        disabled={!replyDraft?.text.trim()}
                        onClick={() => {
                          if (!replyDraft) return;
                          onSendClusterReply(cluster, replyDraft.text.trim());
                          onReplyDraftChange(null);
                        }}
                      >
                        Send to {cluster.count}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}