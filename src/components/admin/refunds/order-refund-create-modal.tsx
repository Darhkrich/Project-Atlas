"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { ModalShell } from "@/components/admin/ui/model-shell";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { SettingsField } from "@/components/admin/ui/settings-field";
import { Badge } from "@/components/admin/ui/badge";
import { useOrders } from "@/lib/admin/hooks/use-orders";
import { useCurrentAdmin } from "@/lib/admin/rbac/context";
import { formatCurrency } from "@/lib/admin/formatters";
import type { Order } from "@/lib/admin/types/orders";
import type {
  RefundReason,
  RefundReasonCustomer,
  RefundReasonSystem,
} from "@/lib/admin/types/refund";
import {
  REFUND_REASON_CUSTOMER_LABELS,
  REFUND_REASON_SYSTEM_LABELS,
} from "@/lib/admin/refunds/refunds-labels";
import {
  CUSTOMER_REASONS,
  SYSTEM_REASONS,
} from "@/lib/admin/refunds/refunds-constants";

interface OrderRefundCreateModalProps {
  open: boolean;
  prefillOrderId?: string;
  prefillSupportTicketId?: string;
  onClose: () => void;
  onSubmit: (input: {
    order: Order;
    reason: RefundReason;
    amount: number;
    reasonNote?: string;
    supportTicketId?: string;
  }) => void;
}

export function OrderRefundCreateModal({
  open,
  prefillOrderId,
  prefillSupportTicketId,
  onClose,
  onSubmit,
}: OrderRefundCreateModalProps) {
  const { orders } = useOrders();
  const currentAdmin = useCurrentAdmin();

  const searchId = useId();
  const reasonId = useId();
  const amountId = useId();
  const noteId = useId();
  const ticketId = useId();

  const [orderSearch, setOrderSearch] = useState(prefillOrderId ?? "");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [reason, setReason] = useState<RefundReason | "">("");
  const [amount, setAmount] = useState<number>(0);
  const [reasonNote, setReasonNote] = useState("");
  const [supportTicketId, setSupportTicketId] = useState(
    prefillSupportTicketId ?? ""
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (prefillOrderId) {
      const match = orders.find((o) => o.id === prefillOrderId);
      if (match) {
        setSelectedOrder(match);
        setAmount(match.amount);
      }
    }
    setSupportTicketId(prefillSupportTicketId ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, prefillOrderId, prefillSupportTicketId]);

  const orderMatches = useMemo(() => {
    if (!orderSearch.trim()) return [];
    const needle = orderSearch.trim().toLowerCase();
    return orders
      .filter(
        (o) =>
          o.id.toLowerCase().includes(needle) ||
          o.customer.name.toLowerCase().includes(needle)
      )
      .slice(0, 8);
  }, [orders, orderSearch]);

  const handleSelectOrder = (order: Order) => {
    setSelectedOrder(order);
    setAmount(order.amount);
    setOrderSearch(order.id);
  };

  const handleSubmit = () => {
    if (!selectedOrder) {
      setError("Select an order to refund.");
      return;
    }
    if (!reason) {
      setError("Select a reason.");
      return;
    }
    if (amount <= 0 || amount > selectedOrder.amount) {
      setError("Amount must be greater than zero and no more than the order total.");
      return;
    }
    if (!currentAdmin) {
      setError("No admin session available.");
      return;
    }
    onSubmit({
      order: selectedOrder,
      reason,
      amount,
      reasonNote: reasonNote.trim() || undefined,
      supportTicketId: supportTicketId.trim() || undefined,
    });
  };

  const allSystem = SYSTEM_REASONS.map((r) => ({
    value: r,
    label: REFUND_REASON_SYSTEM_LABELS[r],
  }));
  const allCustomer = CUSTOMER_REASONS.map((r) => ({
    value: r,
    label: REFUND_REASON_CUSTOMER_LABELS[r],
  }));

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Create order refund"
      description="Requested refunds require admin review before payout. Support investigation should already be on file."
      size="md"
    >
      <div className="space-y-4">
        <SettingsField
          label="Order"
          hint="Search by order ID or customer name."
          htmlFor={searchId}
        >
          <Input
            id={searchId}
            value={orderSearch}
            onChange={(e) => {
              setOrderSearch(e.target.value);
              setSelectedOrder(null);
            }}
            placeholder="Search orders"
          />
        </SettingsField>

        {orderMatches.length > 0 && !selectedOrder && (
          <ul
            role="list"
            className="max-h-48 overflow-y-auto rounded-md border border-neutral-200 dark:border-neutral-700"
          >
            {orderMatches.map((o) => (
              <li key={o.id}>
                <button
                  type="button"
                  onClick={() => handleSelectOrder(o)}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  <span className="font-mono text-xs">{o.id}</span>
                  <span className="text-neutral-500">{o.customer.name}</span>
                  <span>{formatCurrency(o.amount)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {selectedOrder && (
          <div className="rounded-lg bg-neutral-50 p-3 text-sm dark:bg-neutral-900">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-medium">
                {selectedOrder.id}
              </span>
              <Badge variant="info">{selectedOrder.status}</Badge>
            </div>
            <div className="mt-1 flex justify-between">
              <span className="text-neutral-500">Customer</span>
              <span>{selectedOrder.customer.name}</span>
            </div>
            <div className="mt-1 flex justify-between">
              <span className="text-neutral-500">Amount</span>
              <span className="font-semibold">
                {formatCurrency(selectedOrder.amount)}
              </span>
            </div>
          </div>
        )}

        <SettingsField label="Reason" htmlFor={reasonId}>
          <select
            id={reasonId}
            aria-label="Refund reason"
            className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
            value={reason}
            onChange={(e) => setReason(e.target.value as RefundReason)}
          >
            <option value="">Select a reason</option>
            <optgroup label="System">
              {allSystem.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </optgroup>
            <optgroup label="Customer">
              {allCustomer.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </optgroup>
          </select>
        </SettingsField>

        <SettingsField
          label="Amount"
          hint={
            selectedOrder
              ? "Maximum " + formatCurrency(selectedOrder.amount) + ". Partial refunds allowed."
              : "Select an order first."
          }
          htmlFor={amountId}
        >
          <Input
            id={amountId}
            type="number"
            min={0}
            max={selectedOrder?.amount ?? 0}
            value={amount || ""}
            onChange={(e) => setAmount(Number(e.target.value))}
            disabled={!selectedOrder}
          />
        </SettingsField>

        <SettingsField
          label="Reason note"
          hint="Optional. Recorded on the refund timeline."
          htmlFor={noteId}
        >
          <textarea
            id={noteId}
            value={reasonNote}
            onChange={(e) => setReasonNote(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            placeholder="What happened on the order?"
          />
        </SettingsField>

        <SettingsField
          label="Support ticket"
          hint="Optional but recommended. Links this refund to the investigation trail."
          htmlFor={ticketId}
        >
          <Input
            id={ticketId}
            value={supportTicketId}
            onChange={(e) => setSupportTicketId(e.target.value)}
            placeholder="TKT-XXXX"
          />
        </SettingsField>

        {error && (
          <p className="text-sm text-danger-600" role="alert">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit}>
            Create refund
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}