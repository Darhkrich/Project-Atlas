import type { DataNetwork } from "@/lib/admin/types/data-plan";
import type { DataPlanAuditEntry } from "./audit";
import { computeMargin } from "./helpers";
import { marginBand, MARGIN_BAND_LABEL } from "./constants";

function escape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function dataPlansToCsv(networks: DataNetwork[]): string {
  const header = [
    "network",
    "category",
    "planId",
    "name",
    "description",
    "price",
    "validity",
    "typeTag",
    "providerCost",
    "margin",
    "marginBand",
    "active",
  ];

  const rows: (string | number)[][] = [];

  for (const network of networks) {
    for (const category of network.categories) {
      for (const plan of category.plans) {
        const m = computeMargin(plan);
        rows.push([
          network.name,
          category.name,
          plan.id,
          plan.name,
          plan.description ?? "",
          plan.price,
          plan.validity ?? "",
          plan.typeTag ?? "",
          plan.providerCost ?? "",
          m ? m.absolute.toFixed(2) : "",
          m ? MARGIN_BAND_LABEL[marginBand(m.percent)] : "",
          plan.active === false ? "no" : "yes",
        ]);
      }
    }
  }

  return [header, ...rows]
    .map((row) => row.map(escape).join(","))
    .join("\r\n");
}

export function dataPlanAuditToCsv(entries: DataPlanAuditEntry[]): string {
  const header = [
    "timestamp",
    "admin",
    "adminEmail",
    "scope",
    "scopeName",
    "network",
    "action",
    "summary",
  ];

  const rows = entries.map((e) => [
    e.timestamp,
    e.adminName,
    e.adminEmail,
    e.scope,
    e.scopeName,
    e.networkName,
    e.action,
    e.summary,
  ]);

  return [header, ...rows]
    .map((row) => row.map(escape).join(","))
    .join("\r\n");
}