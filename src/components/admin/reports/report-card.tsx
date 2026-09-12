// components/admin/reports/report-card.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { useNow } from "@/lib/admin/hooks/use-now";
import { formatAbsolute, formatRelative } from "@/lib/admin/support/format";
import { SECTION_SCOPE_LABEL } from "@/lib/admin/reports/constants";
import type { Report } from "@/lib/admin/types/report";

interface ReportCardProps {
  report: Report;
  onGenerate: (report: Report) => void;
}

export function ReportCard({ report, onGenerate }: ReportCardProps) {
  const now = useNow();
  const isAllSections = report.sectionScopes.includes("all");

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle>{report.name}</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {report.description}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {isAllSections ? (
            <Badge variant="neutral" size="sm">
              All sections
            </Badge>
          ) : (
            report.sectionScopes.map((scope) => (
              <Badge key={scope} variant="brand" size="sm">
                {SECTION_SCOPE_LABEL[scope]}
              </Badge>
            ))
          )}
        </div>

        <div className="rounded-md bg-neutral-50 p-2 text-xs dark:bg-neutral-900/60">
          <p className="font-medium text-neutral-700 dark:text-neutral-300">
            Columns
          </p>
          <p className="mt-0.5 text-neutral-500 dark:text-neutral-400">
            {report.columns.join(" · ")}
          </p>
        </div>

        <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
          <span>
            {report.lastGenerated ? (
              <>
                Last run{" "}
                <time
                  dateTime={report.lastGenerated}
                  title={formatAbsolute(report.lastGenerated)}
                >
                  {formatRelative(report.lastGenerated, now)}
                </time>
              </>
            ) : (
              "Never run"
            )}
          </span>
          <Button
            variant="outline"
            size="sm"
            aria-label={`Generate ${report.name} report`}
            onClick={() => onGenerate(report)}
          >
            Generate
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}