import type { Order } from "@/lib/admin/types/orders";
import { downloadCsv } from "@/lib/admin/support/csv-export";
import {
  ORDER_STATUS_LABELS,
  ORDER_AUDIENCE_LABELS,
  serviceLabel,
  networkLabel,
  providerLabel,
} from "./orders-labels";

const HEADERS = [
  "Order ID",
  "Audience",
  "Status",
  "Customer",
  "Phone",
  "Reseller",
  "Service",
  "Network",
  "Provider",
  "Amount",
  "Commission",
  "Payment method",
  "Created at",
  "Failure class",
  "Failure reason",
];

function escape(value: string | number | undefined): string {
  if (value === undefined || value === null) return "";
  const s = String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function rowFor(order: Order): string[] {
  return [
    escape(order.id),
    escape(ORDER_AUDIENCE_LABELS[order.audience]),
    escape(ORDER_STATUS_LABELS[order.status]),
    escape(order.customer.name),
    escape(order.customer.phone),
    escape(order.reseller?.name ?? ""),
    escape(serviceLabel(order.serviceId)),
    escape(networkLabel(order.networkId)),
    escape(providerLabel(order.providerId)),
    escape(order.amount.toFixed(2)),
    escape(order.commission.toFixed(2)),
    escape(order.paymentMethodId),
    escape(order.createdAt),
    escape(order.failure?.class ?? ""),
    escape(order.failure?.reason ?? ""),
  ];
}

export function exportOrdersCsv(orders: Order[]): void {
  const lines: string[] = [];
  lines.push(HEADERS.join(","));
  for (const order of orders) {
    lines.push(rowFor(order).join(","));
  }
  const csv = lines.join("\n");
  const stamp = new Date().toISOString().slice(0, 10);
  downloadCsv(csv, "orders-" + stamp + ".csv");
}