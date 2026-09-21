import type { StorefrontRow } from "./storefront-projection";

function escape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function rowsToCsv(header: string[], rows: (string | number)[][]): string {
  return [header, ...rows].map((r) => r.map(escape).join(",")).join("\r\n");
}

export function storefrontsToCsv(rows: StorefrontRow[]): string {
  const header = [
    "storefrontId",
    "storeName",
    "slug",
    "ownerId",
    "ownerName",
    "template",
    "status",
    "usersCount",
    "orders30d",
    "revenue30d",
    "publicUrl",
    "createdAt",
    "lastActive",
  ];

  const body = rows.map((r) => {
    const sf = r.storefront;
    return [
      sf.id,
      sf.storeName,
      sf.slug,
      sf.ownerId,
      sf.ownerName,
      sf.template,
      sf.status,
      sf.usersCount,
      sf.orders30d,
      sf.revenue30d,
      sf.publicUrl,
      sf.createdAt,
      sf.lastActive,
    ];
  });

  return rowsToCsv(header, body);
}