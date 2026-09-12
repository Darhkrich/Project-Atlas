import type { Provider } from "@/lib/admin/types/provider";
import { providerOperationalState } from "./state";

export interface SidebarProviderCounts {
  total: number;
  impaired: number;
  down: number;
  paused: number;
  attention: number;
}

/**
 * Small pure projection for the admin sidebar. Consumers read attention to
 * decide whether to show a warning dot next to the Providers nav item.
 * The sidebar itself is not wired to RBAC yet; this function is data only.
 */
export function sidebarProviderCounts(
  providers: Provider[]
): SidebarProviderCounts {
  let impaired = 0;
  let down = 0;
  let paused = 0;

  for (const p of providers) {
    const state = providerOperationalState(p);
    if (state.kind === "impaired") impaired += 1;
    else if (state.kind === "down") down += 1;
    else if (state.kind === "disabled" || state.kind === "maintenance") {
      paused += 1;
    }
  }

  return {
    total: providers.length,
    impaired,
    down,
    paused,
    attention: impaired + down,
  };
}