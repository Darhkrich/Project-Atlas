"use client";

import { Badge } from "@/components/admin/ui/badge";
import type { Provider } from "@/lib/admin/types/provider";
import { providerOperationalState } from "@/lib/admin/providers/state";

interface ProviderStatusBadgeProps {
  provider: Provider;
  size?: "sm" | "md" | "lg";
}

export function ProviderStatusBadge({
  provider,
  size = "md",
}: ProviderStatusBadgeProps) {
  const state = providerOperationalState(provider);
  return (
    <Badge variant={state.badgeVariant} size={size}>
      {state.label}
    </Badge>
  );
}