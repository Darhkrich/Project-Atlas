/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { ResellerStorefront } from "@/lib/admin/types/reseller-storefront";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { formatCurrency } from "@/lib/admin/formatters";
import { cn } from "@/lib/utils";

interface ResellerStorefrontTableProps {
  storefronts: ResellerStorefront[];
  onView: (storefront: ResellerStorefront) => void;
  onToggleStatus: (id: string) => void;
}

const statusVariantMap: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  live: "success",
  pending: "warning",
  disabled: "danger",
};

export function ResellerStorefrontTable({ storefronts, onView, onToggleStatus }: ResellerStorefrontTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
      <table className="w-full text-sm">
        <thead className="bg-neutral-50 dark:bg-neutral-900">
          <tr className="text-left text-xs font-semibold text-neutral-500">
            <th className="px-4 py-3">Storefront</th>
            <th className="px-4 py-3">Owner</th>
            <th className="px-4 py-3">Template</th>
            <th className="px-4 py-3">Users</th>
            <th className="px-4 py-3">Orders (30d)</th>
            <th className="px-4 py-3">Revenue (30d)</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {storefronts.map(sf => (
            <tr key={sf.id} className="border-t border-neutral-100 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900/50">
              <td className="px-4 py-3">
                <div className="font-medium">{sf.storeName}</div>
                <div className="text-xs text-neutral-500">{sf.slug}</div>
              </td>
              <td className="px-4 py-3">{sf.resellerName}</td>
              <td className="px-4 py-3">{sf.template}</td>
              <td className="px-4 py-3">{sf.usersCount}</td>
              <td className="px-4 py-3">{sf.orders30d}</td>
              <td className="px-4 py-3 font-medium">{formatCurrency(sf.revenue30d)}</td>
              <td className="px-4 py-3">
                <Badge variant={statusVariantMap[sf.status]}>{sf.status}</Badge>
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => onView(sf)}>View</Button>
                  {sf.status === "live" ? (
                    <Button variant="outline" size="sm" onClick={() => onToggleStatus(sf.id)}>Disable</Button>
                  ) : sf.status === "disabled" ? (
                    <Button variant="outline" size="sm" onClick={() => onToggleStatus(sf.id)}>Enable</Button>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => onToggleStatus(sf.id)}>Review</Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}