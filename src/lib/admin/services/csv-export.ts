// lib/admin/services/csv-export.ts

import type { ServiceCategory } from "@/lib/services-page-data";
import {
  FILTER_GROUP_LABEL,
  SECTION_LABEL,
  STATUS_LABEL,
} from "./constants";
import {
  flatPlanCount,
  networkPlanCount,
  sectionsFor,
  serviceStatus,
} from "./helpers";

function escape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function servicesToCsv(categories: ServiceCategory[]): string {
  const header = [
    "id",
    "name",
    "description",
    "filterGroup",
    "status",
    "sections",
    "availableToResellers",
    "providerIds",
    "displayOrder",
    "networkOptions",
    "flatPlans",
    "networkPlans",
    "comingSoonReason",
    "disabledReason",
  ];

  const rows = categories.map((c) => [
    c.id,
    c.name,
    c.description,
    FILTER_GROUP_LABEL[c.filterGroup] ?? c.filterGroup,
    STATUS_LABEL[serviceStatus(c)],
    sectionsFor(c)
      .map((s) => SECTION_LABEL[s])
      .join("|"),
    c.availableToResellers ? "yes" : "no",
    (c.providerIds ?? []).join("|"),
    c.displayOrder ?? "",
    (c.networkOptions ?? []).join("|"),
    flatPlanCount(c),
    networkPlanCount(c),
    c.comingSoonReason ?? "",
    c.disabledReason ?? "",
  ]);

  return [header, ...rows]
    .map((row) => row.map(escape).join(","))
    .join("\r\n");
}