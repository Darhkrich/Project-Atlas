"use client";

import { mockCustomers } from "@/lib/admin/mock/customers";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Card, CardContent } from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import { formatCurrency } from "@/lib/admin/formatters";

interface StorefrontUsersListProps {
  storefrontId: string;
  storefrontType: "reseller" | "merchant";
}

export function StorefrontUsersList({ storefrontId, storefrontType }: StorefrontUsersListProps) {
  const users = mockCustomers.filter(
    c => c.storefrontId === storefrontId && c.storefrontType === storefrontType
  );

  if (users.length === 0) {
    return <p className="text-sm text-neutral-400">No storefront users found.</p>;
  }

  return (
    <div className="space-y-2">
      {users.map(customer => (
        <Card key={customer.id} className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-neutral-900 dark:text-neutral-100">{customer.name}</p>
              <p className="text-xs text-neutral-500">{customer.email}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">{formatCurrency(customer.totalSpent)}</p>
              <p className="text-xs text-neutral-500">{customer.totalOrders} orders</p>
            </div>
            <Badge variant={customer.status === "active" ? "success" : "neutral"}>{customer.status}</Badge>
          </div>
        </Card>
      ))}
    </div>
  );
}