// Compatibility shim. The store lives at lib/domains/orders. Everything
// that used to be exported from this file is re-exported here so existing
// admin consumers keep working. New code imports from
// @/lib/domains/orders/orders-store directly.
export * from "@/lib/domains/orders/orders-store";