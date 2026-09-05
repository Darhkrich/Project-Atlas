"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Order } from "@/lib/admin/types/orders";

interface FailedOrdersCardProps {
  orders: Order[];
  onViewAll: () => void;
  onOrderClick: (order: Order) => void;
  onRetry?: (orderId: string) => void;
  onRefund?: (orderId: string) => void;
}

const MAX_DISPLAY = 5;

export function FailedOrdersCard({
  orders,
  onViewAll,
  onOrderClick,
  onRetry,
  onRefund,
}: FailedOrdersCardProps) {
  const displayOrders = orders.slice(0, MAX_DISPLAY);
  const remainingCount = Math.max(0, orders.length - MAX_DISPLAY);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CardTitle>Failed Today</CardTitle>
          <span className="inline-flex items-center rounded-full bg-danger-100 px-2 py-0.5 text-xs font-medium text-danger-700 dark:bg-danger-900/30 dark:text-danger-300">
            {orders.length}
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={onViewAll}>
          View All
        </Button>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="text-sm text-neutral-500">
            No failed orders today.{" "}
            <a href="/admin/providers" className="text-brand-600 hover:underline">
              Check provider health
            </a>
          </div>
        ) : (
          <>
            <ul className="space-y-2">
              {displayOrders.map((order) => (
                <li
                  key={order.id}
                  className="flex items-center justify-between rounded-md bg-neutral-50 p-2 dark:bg-neutral-800"
                >
                  <div className="flex items-center gap-3" onClick={() => onOrderClick(order)}>
                    <span className="font-medium">{order.id}</span>
                    <Badge variant={order.source === "reseller" ? "brand" : "info"}>
                      {order.source === "reseller" ? "Reseller" : "Direct"}
                    </Badge>
                    <span className="text-sm">{order.service}</span>
                    <Badge variant="danger" title={order.failureReason || "Failed"}>
                      Failed
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    {onRetry && (
                      <Button variant="outline" size="sm" onClick={() => onRetry(order.id)}>
                        Retry
                      </Button>
                    )}
                    {onRefund && (
                      <Button variant="ghost" size="sm" onClick={() => onRefund(order.id)}>
                        Refund
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            {remainingCount > 0 && (
              <p className="mt-2 text-xs text-neutral-500">
                +{remainingCount} more failed orders
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}