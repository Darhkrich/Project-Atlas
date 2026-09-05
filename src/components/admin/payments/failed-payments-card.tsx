"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Payment } from "@/lib/admin/types/payment";
import { formatCurrency } from "@/lib/admin/formatters";

interface FailedPaymentsCardProps {
  payments: Payment[];
  onViewAll: () => void;
  onPaymentClick: (payment: Payment) => void;
}

const MAX_DISPLAY = 5;

export function FailedPaymentsCard({ payments, onViewAll, onPaymentClick }: FailedPaymentsCardProps) {
  const displayPayments = payments.slice(0, MAX_DISPLAY);
  const remaining = Math.max(0, payments.length - MAX_DISPLAY);

  return (
    <Card className="border-l-4 border-l-danger-500">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-danger-400 opacity-75"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full bg-danger-500"></span>
          </span>
          <CardTitle>Failed Payments</CardTitle>
          <span className="rounded-full bg-danger-100 px-2 py-0.5 text-xs font-semibold text-danger-700 dark:bg-danger-900/60 dark:text-danger-300">
            {payments.length}
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={onViewAll}>View All</Button>
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <p className="text-sm text-neutral-500">No failed payments today.</p>
        ) : (
          <>
            <ul className="space-y-2">
              {displayPayments.map((payment) => (
                <li
                  key={payment.id}
                  className="flex items-center justify-between rounded-lg bg-danger-50/50 p-3 dark:bg-danger-900/10 cursor-pointer hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-colors"
                  onClick={() => onPaymentClick(payment)}
                >
                  <div>
                    <p className="font-mono text-xs font-semibold">{payment.id}</p>
                    <p className="text-xs text-neutral-500">{payment.user.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatCurrency(payment.amount)}</p>
                    <p className="text-xs text-neutral-500">{payment.failureReason || "Unknown"}</p>
                  </div>
                  <Badge variant="danger">Failed</Badge>
                </li>
              ))}
            </ul>
            {remaining > 0 && (
              <p className="mt-2 text-center text-xs text-neutral-500">+{remaining} more failed</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}