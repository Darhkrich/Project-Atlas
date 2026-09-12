// components/admin/can.tsx
// Compatibility shim. Re-exports from @/lib/admin/rbac.
// Slated for removal once all consumers migrate.

export { Can, CanAny, useCan, useCanAny } from "@/lib/admin/rbac";