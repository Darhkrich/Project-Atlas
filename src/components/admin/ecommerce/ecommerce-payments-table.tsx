"use client";

import { EcommercePayment } from "@/lib/admin/types/ecommerce-payment";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { formatCurrency } from "@/lib/admin/formatters";

interface EcommercePaymentsTableProps {
  payments: EcommercePayment[];
  onView: (payment: EcommercePayment) => void;
  onRefund: (id: string) => void;
}

const statusVariantMap: Record<string, "success" | "warning" | "danger" | "info" | "neutral"> = {
  successful: "success",
  pending: "warning",
  failed: "danger",
  refunded: "info",
};

const walletCreditVariantMap: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  credited: "success",
  pending: "warning",
  failed: "danger",
};

export function EcommercePaymentsTable({ payments, onView, onRefund }: EcommercePaymentsTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
      <table className="w-full text-sm">
        <thead className="bg-neutral-50 dark:bg-neutral-900">
          <tr className="text-left text-xs font-semibold text-neutral-500">
            <th className="px-4 py-3">Payment ID</th>
            <th className="px-4 py-3">Merchant</th>
            <th className="px-4 py-3">Amount</th>
            <th className="px-4 py-3">Fee</th>
            <th className="px-4 py-3">Net</th>
            <th className="px-4 py-3">Method</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Wallet Credit</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {payments.map(p => (
            <tr key={p.id} className="border-t border-neutral-100 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900/50">
              <td className="px-4 py-3 font-mono text-xs">{p.id}</td>
              <td className="px-4 py-3">{p.merchantName}</td>
              <td className="px-4 py-3 font-medium">{formatCurrency(p.amount)}</td>
              <td className="px-4 py-3">{formatCurrency(p.fee)}</td>
              <td className="px-4 py-3">{formatCurrency(p.netAmount)}</td>
              <td className="px-4 py-3 capitalize">{p.method}</td>
              <td className="px-4 py-3">
                <Badge variant={statusVariantMap[p.status]}>{p.status}</Badge>
              </td>
              <td className="px-4 py-3">
                {p.walletCreditStatus ? (
                  <Badge variant={walletCreditVariantMap[p.walletCreditStatus]}>{p.walletCreditStatus}</Badge>
                ) : (
                  <span className="text-xs text-neutral-400">—</span>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => onView(p)}>View</Button>
                  {p.status === "successful" && (
                    <Button variant="outline" size="sm" onClick={() => onRefund(p.id)}>Refund</Button>
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