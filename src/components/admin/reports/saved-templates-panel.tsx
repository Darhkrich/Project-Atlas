// components/admin/reports/saved-templates-panel.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Button } from "@/components/admin/ui/button";
import { Badge } from "@/components/admin/ui/badge";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { useNow } from "@/lib/admin/hooks/use-now";
import { formatAbsolute, formatRelative } from "@/lib/admin/support/format";
import {
  FORMAT_LABEL,
  REPORT_TYPE_LABEL,
  SECTION_SCOPE_LABEL,
} from "@/lib/admin/reports/constants";
import type { SavedReportTemplate } from "@/lib/admin/types/report";

interface SavedTemplatesPanelProps {
  templates: SavedReportTemplate[];
  onApply: (template: SavedReportTemplate) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
}

export function SavedTemplatesPanel({
  templates,
  onApply,
  onDelete,
  onCreate,
}: SavedTemplatesPanelProps) {
  const [deleteTarget, setDeleteTarget] = useState<SavedReportTemplate | null>(
    null
  );
  const now = useNow();

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div>
          <CardTitle>Saved templates</CardTitle>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Predefined report configurations you can reuse.
          </p>
        </div>
        <Button size="sm" onClick={onCreate}>
          New template
        </Button>
      </CardHeader>

      <CardContent className="space-y-2">
        {templates.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No saved templates yet. Build one from the report builder.
          </p>
        ) : (
          templates.map((tmpl) => (
            <div
              key={tmpl.id}
              className="flex flex-wrap items-start justify-between gap-3 rounded-md border border-neutral-200 p-3 dark:border-neutral-700"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {tmpl.name}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <Badge variant="brand" size="sm">
                    {REPORT_TYPE_LABEL[tmpl.reportType]}
                  </Badge>
                  <Badge variant="neutral" size="sm">
                    {SECTION_SCOPE_LABEL[tmpl.section]}
                  </Badge>
                  <Badge variant="neutral" size="sm">
                    {FORMAT_LABEL[tmpl.format]}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  {tmpl.dateFrom} to {tmpl.dateTo}
                </p>
                <p className="mt-0.5 text-xs text-neutral-400 dark:text-neutral-500">
                  {tmpl.createdByName ? `By ${tmpl.createdByName} · ` : ""}
                  <time
                    dateTime={tmpl.createdAt}
                    title={formatAbsolute(tmpl.createdAt)}
                  >
                    {formatRelative(tmpl.createdAt, now)}
                  </time>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onApply(tmpl)}
                >
                  Apply
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteTarget(tmpl)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete saved template?"
        description={
          deleteTarget
            ? `"${deleteTarget.name}" will be removed. This cannot be undone.`
            : ""
        }
        confirmLabel="Delete template"
        danger
        onConfirm={() => {
          if (!deleteTarget) return;
          onDelete(deleteTarget.id);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </Card>
  );
}