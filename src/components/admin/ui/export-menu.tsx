"use client";

import { useState } from "react";
import { Button } from "./button";

interface ExportMenuProps {
  onExport: (format: "csv" | "excel" | "pdf") => void;
  disabled?: boolean;
}

export function ExportMenu({ onExport, disabled }: ExportMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={() => setOpen(!open)}
      >
        Export
      </Button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-md border border-neutral-200 bg-white shadow-lg dark:border-neutral-800 dark:bg-neutral-900 z-50">
          <ul className="py-1">
            <li>
              <button
                className="block w-full px-4 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
                onClick={() => { onExport("csv"); setOpen(false); }}
              >
                CSV
              </button>
            </li>
            <li>
              <button
                className="block w-full px-4 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
                onClick={() => { onExport("excel"); setOpen(false); }}
              >
                Excel
              </button>
            </li>
            <li>
              <button
                className="block w-full px-4 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
                onClick={() => { onExport("pdf"); setOpen(false); }}
              >
                PDF
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}