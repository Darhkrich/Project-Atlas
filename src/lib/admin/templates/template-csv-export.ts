import type { TemplateWithUsage } from "./template-projection";
import {
  PLAN_CODE_LABEL,
  TEMPLATE_CATEGORY_LABEL,
} from "./template-labels";

function escape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function rowsToCsv(header: string[], rows: (string | number)[][]): string {
  return [header, ...rows].map((r) => r.map(escape).join(",")).join("\r\n");
}

export function templatesToCsv(rows: TemplateWithUsage[]): string {
  const header = [
    "id",
    "name",
    "category",
    "description",
    "componentName",
    "allowedPlans",
    "isActive",
    "usageCount",
    "createdAt",
    "updatedAt",
    "updatedBy",
  ];

  const body = rows.map((t) => [
    t.id,
    t.name,
    TEMPLATE_CATEGORY_LABEL[t.category],
    t.description,
    t.componentName,
    t.allowedPlans.map((p) => PLAN_CODE_LABEL[p]).join("|"),
    t.isActive ? "yes" : "no",
    t.usageCount,
    t.createdAt,
    t.updatedAt,
    t.updatedBy,
  ]);

  return rowsToCsv(header, body);
}