"use client";

import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { ExportMenu } from "@/components/admin/ui/export-menu";
import { AtlasIcon } from "@/components/atlas/icons";

interface DataPlansToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedCount: number;
  onEnable: () => void;
  onDisable: () => void;
  onClearSelection: () => void;
  onExport: (format: "csv" | "excel" | "pdf") => void;
  onExportAudit: () => void;
  onImport: () => void;
  onAddCategory: () => void;
}

export function DataPlansToolbar({
  search,
  onSearchChange,
  selectedCount,
  onEnable,
  onDisable,
  onClearSelection,
  onExport,
  onExportAudit,
  onImport,
  onAddCategory,
}: DataPlansToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="relative min-w-[220px] flex-1">
        <AtlasIcon
          name="search"
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
        />
        <Input
          placeholder="Search plans across all networks..."
          className="pl-9"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {selectedCount > 0 && (
        <div className="flex items-center gap-2 rounded-md bg-neutral-50 p-1 dark:bg-neutral-900">
          <span className="px-2 text-sm font-medium">{selectedCount} selected</span>
          <Button variant="outline" size="sm" onClick={onEnable}>
            Enable
          </Button>
          <Button variant="outline" size="sm" onClick={onDisable}>
            Disable
          </Button>
          <Button variant="ghost" size="sm" onClick={onClearSelection}>
            Clear
          </Button>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onImport}>
          Import CSV
        </Button>
        <Button variant="outline" size="sm" onClick={onExportAudit}>
          Export Audit
        </Button>
        <ExportMenu onExport={onExport} />
        <Button size="sm" onClick={onAddCategory}>
          Add Category
        </Button>
      </div>
    </div>
  );
}