// components/admin/reports/empty-tab-state.tsx
"use client";

import { EmptyState } from "@/components/admin/ui/empty-state";
import { Button } from "@/components/admin/ui/button";
import { type ReactNode } from "react";

interface EmptyTabStateProps {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: ReactNode;
}

export function EmptyTabState({
  title,
  description,
  action,
}: EmptyTabStateProps) {
  return (
    <EmptyState
      variant="no_data"
      title={title}
      description={description}
      action={
        action ? (
          <Button variant="outline" size="sm" onClick={action.onClick}>
            {action.label}
          </Button>
        ) : undefined
      }
    />
  );
}