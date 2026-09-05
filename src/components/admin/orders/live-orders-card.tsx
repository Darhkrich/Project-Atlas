"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Order } from "@/lib/admin/types/orders";

interface LiveOrdersCardProps {
  orders: Order[];
  onViewAll: () => void;
  onOrderClick: (order: Order) => void;
}

const MAX_DISPLAY = 10;

export function LiveOrdersCard({ orders, onViewAll, onOrderClick }: LiveOrdersCardProps) {
  const displayOrders = orders.slice(0, MAX_DISPLAY);
  const remainingCount = Math.max(0, orders.length - MAX_DISPLAY);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CardTitle>Live Orders</CardTitle>
          <span className="inline-flex items-center rounded-full bg-warning-100 px-2 py-0.5 text-xs font-medium text-warning-700 dark:bg-warning-900/30 dark:text-warning-300">
            {orders.length}
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={onViewAll}>
          View All
        </Button>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <p className="text-sm text-neutral-500">No live orders at the moment.</p>
        ) : (
          <>
            <ul className="space-y-2">
              {displayOrders.map((order) => (
                <li
                  key={order.id}
                  className="flex items-center justify-between rounded-md bg-neutral-50 p-2 dark:bg-neutral-800 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700"
                  onClick={() => onOrderClick(order)}
                >
                  <span className="font-medium">{order.id}</span>
                  <Badge variant={order.source === "reseller" ? "brand" : "info"}>
                    {order.source === "reseller" ? "Reseller" : "Direct"}
                  </Badge>
                  <span className="text-sm">{order.service}</span>
                  <Badge variant={order.status === "pending" ? "warning" : "info"}>
                    {order.status}
                  </Badge>
                </li>
              ))}
            </ul>
            {remainingCount > 0 && (
              <p className="mt-2 text-xs text-neutral-500">
                +{remainingCount} more live orders
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}