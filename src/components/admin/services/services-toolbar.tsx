"use client";

import { Button } from "@/components/admin/ui/button";
import { ExportMenu } from "@/components/admin/ui/export-menu";

interface ServicesToolbarProps {
  selectedCount: number;
  onEnable: () => void;
  onDisable: () => void;
  onClearSelection: () => void;
  onExport: (format: "csv" | "excel" | "pdf") => void;
  onAddService: () => void;
}

export function ServicesToolbar({
  selectedCount,
  onEnable,
  onDisable,
  onClearSelection,
  onExport,
  onAddService,
}: ServicesToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {selectedCount > 0 ? (
          <>
            <span className="text-sm font-medium">
              {selectedCount} selected
            </span>
            <Button variant="outline" size="sm" onClick={onEnable}>
              Enable
            </Button>
            <Button variant="outline" size="sm" onClick={onDisable}>
              Disable
            </Button>
            <Button variant="ghost" size="sm" onClick={onClearSelection}>
              Clear
            </Button>
          </>
        ) : (
          <span className="text-sm text-neutral-500">
            Select services to perform bulk actions
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <ExportMenu onExport={onExport} />
        <Button size="sm" onClick={onAddService}>
          Add Service
        </Button>
      </div>
    </div>
  );
}