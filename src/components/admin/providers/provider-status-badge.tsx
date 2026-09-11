import { Badge } from "@/components/admin/ui/badge";

const variantMap = {
  active: "success",
  degraded: "warning",
  offline: "danger",
  disabled: "neutral",
  maintenance: "info",
} as const;

export function ProviderStatusBadge({ status }: { status: keyof typeof variantMap }) {
  return <Badge variant={variantMap[status]}>{status}</Badge>;
}