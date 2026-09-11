"use client";

import { Button } from "@/components/admin/ui/button";
import { ExportMenu } from "@/components/admin/ui/export-menu";
import { AtlasIcon } from "@/components/atlas/icons";

interface ProvidersToolbarProps {
  selectedCount: number;
  onEnable: () => void;
  onDisable: () => void;
  onMaintenance: () => void;
  onClearSelection: () => void;
  onExport: (format: "csv" | "excel" | "pdf") => void;
  onAddProvider: () => void;
}

export function ProvidersToolbar({
  selectedCount,
  onEnable,
  onDisable,
  onMaintenance,
  onClearSelection,
  onExport,
  onAddProvider,
}: ProvidersToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {selectedCount > 0 ? (
          <>
            <span className="text-sm font-medium">{selectedCount} selected</span>
            <Button variant="outline" size="sm" onClick={onEnable}>
              <AtlasIcon name="check" className="mr-1 h-3.5 w-3.5" />
              Enable
            </Button>
            <Button variant="outline" size="sm" onClick={onDisable}>
              <AtlasIcon name="x-circle" className="mr-1 h-3.5 w-3.5" />
              Disable
            </Button>
            <Button variant="outline" size="sm" onClick={onMaintenance}>
              <AtlasIcon name="clock" className="mr-1 h-3.5 w-3.5" />
              Maintenance
            </Button>
            <Button variant="ghost" size="sm" onClick={onClearSelection}>
              Clear
            </Button>
          </>
        ) : (
          <span className="text-sm text-neutral-500">
            Select providers for bulk actions
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <ExportMenu onExport={onExport} />
        <Button size="sm" onClick={onAddProvider}>
          Add Provider
        </Button>
      </div>
    </div>
  );
}