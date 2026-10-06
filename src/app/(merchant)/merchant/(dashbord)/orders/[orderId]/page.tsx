"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AtlasIcon } from "@/components/atlas/icons";
import { useStorefrontConfig } from "@/contexts/storefront-config-context";
import { useOrders } from "@/contexts/orders-context";
import { useCurrentMerchant } from "@/lib/merchant/hooks/use-current-merchant";
import { useMerchantOrder } from "@/lib/merchant/orders/use-merchant-order";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
} from "@/lib/merchant/orders/labels";
import {
  canTransitionOrderStatus,
  type CustomerOrderStatus,
} from "@/lib/merchant/orders/types";
import {
  addOrderNote,
  cancelOrder,
  markPaymentConfirmed,
  shipOrder,
  transitionOrderStatus,
  type MutableOrder,
} from "@/lib/merchant/orders/mutations";
import {
  createMerchantRefund,
  type MerchantRefundReason,
} from "@/lib/merchant/orders/refund";
import { OrderDetailHeader } from "@/components/merchant/orders/order-detail-header";
import { ShipModal } from "@/components/merchant/orders/ship-modal";
import { CancelModal } from "@/components/merchant/orders/cancel-modal";
import { RefundModal } from "@/components/merchant/orders/refund-modal";
import { ContactActions } from "@/components/merchant/orders/contact-actions";
import { cn } from "@/lib/utils";

const ALL_STATUSES: CustomerOrderStatus[] = [
  "new",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export default function MerchantOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = (params?.orderId as string) ?? "";

  const { storefrontConfig } = useStorefrontConfig();
  const { getOrdersForStore, updateOrder } = useOrders();
  const merchant = useCurrentMerchant();

  const storeSlug = storefrontConfig.slug || "my-store";

  const orders = useMemo(
    () => getOrdersForStore(storeSlug),
    [getOrdersForStore, storeSlug]
  );

  const { order, row, timeline } = useMerchantOrder(orders, orderId);

  const [shipOpen, setShipOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);
  const [pendingStatus, setPendingStatus] =
    useState<CustomerOrderStatus | null>(null);
  const [noteBody, setNoteBody] = useState("");
  const [noteError, setNoteError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  const actor = useMemo(() => {
    if (merchant) {
      return {
        id: merchant.id,
        name: merchant.name,
        email: merchant.email,
      };
    }
    return {
      id: "merchant",
      name: "Merchant",
      email: "merchant@atlas.local",
    };
  }, [merchant]);

  const mutableOrder: MutableOrder | null = useMemo(() => {
    if (!order) return null;
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      total: order.total,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      events: order.events,
      notes: order.notes,
      cancelRecord: order.cancelRecord,
      trackingNumber: order.trackingNumber,
      carrier: order.carrier,
      refundIds: order.refundIds,
      shippingAddress: order.shippingAddress,
    };
  }, [order]);

  const showFlash = (message: string) => {
    setFlash(message);
    window.setTimeout(() => setFlash(null), 4000);
  };

  if (!order || !mutableOrder || !row) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
          <AtlasIcon
            name="package"
            className="h-5 w-5 text-neutral-500 dark:text-neutral-400"
            aria-hidden="true"
          />
        </div>
        <h1 className="mt-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Order not found
        </h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          This order may have been removed.
        </p>
        <Link
          href="/merchant/orders"
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Back to orders
        </Link>
      </div>
    );
  }

  const availableStatuses = ALL_STATUSES.filter((s) =>
    canTransitionOrderStatus(order.status, s)
  );

  const canShip = order.status === "processing";
  const canCancel =
    order.status === "new" ||
    order.status === "processing" ||
    order.status === "shipped";
  const canRefund =
    order.paymentStatus === "paid" ||
    order.paymentStatus === "partially_refunded";
  const canMarkPaid = order.paymentStatus === "pending";

  const handleTransitionStatus = () => {
    if (!pendingStatus) return;
    const result = transitionOrderStatus(
      mutableOrder,
      { to: pendingStatus },
      actor,
      Date.now()
    );
    if (!result.ok || !result.patch) {
      showFlash(result.error?.message ?? "Could not update status.");
      setPendingStatus(null);
      return;
    }
    updateOrder(order.id, result.patch);
    showFlash("Status updated.");
    setPendingStatus(null);
  };

  const handleShip = (input: { carrier: string; trackingNumber: string }) => {
    const result = shipOrder(mutableOrder, input, actor, Date.now());
    if (!result.ok || !result.patch) {
      return {
        ok: false,
        error: result.error?.message ?? "Could not mark as shipped.",
      };
    }
    updateOrder(order.id, result.patch);
    setShipOpen(false);
    router.push("/merchant/orders?saved=shipped");
    return { ok: true };
  };

  const handleCancel = (input: {
    reason: "customer_request" | "out_of_stock" | "unable_to_fulfill" | "other";
    note?: string;
    restock: boolean;
  }) => {
    const result = cancelOrder(mutableOrder, input, actor, Date.now());
    if (!result.ok || !result.patch) {
      return {
        ok: false,
        error: result.error?.message ?? "Could not cancel the order.",
      };
    }
    updateOrder(order.id, result.patch);
    setCancelOpen(false);
    router.push("/merchant/orders?saved=cancelled");
    return { ok: true };
  };

  const handleMarkPaid = () => {
    const result = markPaymentConfirmed(mutableOrder, actor, Date.now());
    if (!result.ok || !result.patch) {
      showFlash(result.error?.message ?? "Could not mark payment as received.");
      return;
    }
    updateOrder(order.id, result.patch);
    showFlash("Payment marked as received.");
  };

  const handleRefund = (input: {
    amount: number;
    reason: MerchantRefundReason;
    reasonNote?: string;
  }) => {
    if (!merchant) {
      return { ok: false, error: "No merchant session." };
    }
    const result = createMerchantRefund(
      {
        order,
        amount: input.amount,
        reason: input.reason,
        reasonNote: input.reasonNote,
      },
      {
        id: merchant.id,
        name: merchant.name,
        email: merchant.email,
      },
      {
        updateOrder: (id, patch) => updateOrder(id, patch),
      },
      Date.now()
    );

    if (!result.ok) {
      return {
        ok: false,
        error: result.error ?? "Refund could not be processed.",
        requiresApproval: result.requiresApproval,
      };
    }
    setRefundOpen(false);
    router.push("/merchant/orders?saved=refunded");
    return { ok: true };
  };

  const handleAddNote = () => {
    if (noteBody.trim().length === 0) {
      setNoteError("Write a note before saving.");
      return;
    }
    const result = addOrderNote(
      mutableOrder,
      { body: noteBody },
      actor,
      Date.now()
    );
    if (!result.ok || !result.patch) {
      setNoteError(result.error?.message ?? "Could not save the note.");
      return;
    }
    updateOrder(order.id, result.patch);
    setNoteBody("");
    setNoteError(null);
    showFlash("Note added.");
  };

  return (
    <div className="space-y-6">
      <OrderDetailHeader
        orderNumber={order.orderNumber}
        customerName={order.customerName}
        customerEmail={order.customerEmail}
        date={order.date}
        status={order.status}
        paymentStatus={order.paymentStatus}
        onShip={() => setShipOpen(true)}
        onCancel={() => setCancelOpen(true)}
        onRefund={() => setRefundOpen(true)}
        onMarkPaid={handleMarkPaid}
        canShip={canShip}
        canCancel={canCancel}
        canRefund={canRefund}
        canMarkPaid={canMarkPaid}
      />

      {flash && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-lg border border-success-200 bg-success-50 px-4 py-3 text-sm text-success-800 dark:border-success-900 dark:bg-success-900/30 dark:text-success-200"
        >
          <AtlasIcon
            name="check-circle"
            className="h-4 w-4"
            aria-hidden="true"
          />
          {flash}
        </div>
      )}

      {availableStatuses.length > 0 && (
        <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 sm:p-5">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Update status
          </h2>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
            <label htmlFor="order-status-select" className="sr-only">
              New status
            </label>
            <select
              id="order-status-select"
              value={pendingStatus ?? ""}
              onChange={(e) =>
                setPendingStatus(
                  e.target.value === ""
                    ? null
                    : (e.target.value as CustomerOrderStatus)
                )
              }
              className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
            >
              <option value="">Choose a new status</option>
              {availableStatuses.map((s) => (
                <option key={s} value={s}>
                  {ORDER_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleTransitionStatus}
              disabled={!pendingStatus}
              className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Update status
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <div className="border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Items ({order.items.reduce((s, it) => s + it.quantity, 0)})
              </h2>
            </div>
            {order.items.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-neutral-500">
                No items on this order.
              </p>
            ) : (
              <ul
                role="list"
                className="divide-y divide-neutral-200 dark:divide-neutral-800"
              >
                {order.items.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between px-5 py-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {item.name}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {item.quantity} {"\u00D7"} {"GH\u20B5 "}
                        {item.price.toFixed(2)}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      {"GH\u20B5 "}
                      {(item.price * item.quantity).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <div className="border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Timeline
              </h2>
            </div>
            {timeline.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-neutral-500">
                No activity recorded yet.
              </p>
            ) : (
              <ul role="list" className="px-5 py-4">
                {timeline.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-start gap-3 border-b border-neutral-100 py-3 last:border-b-0 dark:border-neutral-800"
                  >
                    <span
                      className={cn(
                        "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                        item.tone === "success"
                          ? "bg-success-500"
                          : item.tone === "danger"
                          ? "bg-danger-500"
                          : item.tone === "warning"
                          ? "bg-warning-500"
                          : item.tone === "info"
                          ? "bg-info-500"
                          : "bg-neutral-400"
                      )}
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-neutral-900 dark:text-neutral-100">
                        {item.description}
                      </p>
                      <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                        {item.actorName}
                        {" \u00B7 "}
                        {new Date(item.createdAt).toLocaleString("en-GH", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <div className="border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Internal notes
              </h2>
            </div>
            <div className="p-5">
              {order.notes.length > 0 && (
                <ul
                  role="list"
                  className="mb-4 space-y-3 border-b border-neutral-100 pb-4 dark:border-neutral-800"
                >
                  {order.notes.map((note) => (
                    <li key={note.id}>
                      <p className="text-sm text-neutral-900 dark:text-neutral-100">
                        {note.body}
                      </p>
                      <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                        {note.author.name}
                        {" \u00B7 "}
                        {new Date(note.createdAt).toLocaleString("en-GH", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
              <label
                htmlFor="order-note-input"
                className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Add a note
              </label>
              <textarea
                id="order-note-input"
                value={noteBody}
                onChange={(e) => {
                  setNoteBody(e.target.value);
                  if (noteError) setNoteError(null);
                }}
                rows={3}
                placeholder="Something to remember about this order?"
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
              />
              {noteError && (
                <p className="mt-1 text-xs text-danger-600 dark:text-danger-400">
                  {noteError}
                </p>
              )}
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={handleAddNote}
                  className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
                >
                  Save note
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Customer
            </h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex items-baseline gap-2">
                <dt className="w-16 shrink-0 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  Name
                </dt>
                <dd className="min-w-0 text-neutral-900 dark:text-neutral-100">
                  {order.customerName}
                </dd>
              </div>
              <div className="flex items-baseline gap-2">
                <dt className="w-16 shrink-0 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  Email
                </dt>
                <dd className="min-w-0">
                  {order.customerEmail ? (
                    <a
                      href={"mailto:" + order.customerEmail}
                      className="break-all text-brand-600 hover:text-brand-700"
                    >
                      {order.customerEmail}
                    </a>
                  ) : (
                    <span className="text-neutral-500">Not provided</span>
                  )}
                </dd>
              </div>
              <div className="flex items-baseline gap-2">
                <dt className="w-16 shrink-0 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  Mobile
                </dt>
                <dd className="min-w-0">
                  {order.customerPhone ? (
                    <a
                      href={"tel:" + order.customerPhone}
                      className="text-brand-600 hover:text-brand-700"
                    >
                      {order.customerPhone}
                    </a>
                  ) : (
                    <span className="text-neutral-500">Not provided</span>
                  )}
                </dd>
              </div>
            </dl>
            <div className="mt-4">
              <ContactActions
                customerName={order.customerName}
                customerEmail={order.customerEmail}
                customerPhone={order.customerPhone}
              />
            </div>
          </div>

          {order.shippingAddress && (
            <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Shipping address
              </h2>
              <div className="mt-3 space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
                <p className="font-medium text-neutral-900 dark:text-neutral-100">
                  {order.shippingAddress.name}
                </p>
                <p>{order.shippingAddress.address}</p>
                <p>
                  {order.shippingAddress.city}
                  {order.shippingAddress.region
                    ? ", " + order.shippingAddress.region
                    : ""}
                </p>
                <p>{order.shippingAddress.phone}</p>
              </div>
            </div>
          )}

          {(order.trackingNumber || order.carrier) && (
            <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Shipment
              </h2>
              <div className="mt-3 space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
                {order.carrier && <p>Carrier: {order.carrier}</p>}
                {order.trackingNumber && (
                  <p>Tracking: {order.trackingNumber}</p>
                )}
              </div>
            </div>
          )}

          {order.cancelRecord && (
            <div className="rounded-xl border border-danger-200 bg-danger-50/40 p-5 dark:border-danger-900 dark:bg-danger-900/20">
              <h2 className="text-sm font-semibold text-danger-800 dark:text-danger-200">
                Cancelled
              </h2>
              <div className="mt-3 space-y-1 text-sm text-danger-700 dark:text-danger-300">
                <p>
                  {order.cancelRecord.note && order.cancelRecord.note.length > 0
                    ? order.cancelRecord.note
                    : "No additional note."}
                </p>
                <p className="text-xs">
                  By {order.cancelRecord.cancelledBy.name}
                  {" \u00B7 "}
                  {new Date(order.cancelRecord.cancelledAt).toLocaleString(
                    "en-GH",
                    {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </p>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Order summary
            </h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-neutral-600 dark:text-neutral-400">
                  Payment
                </dt>
                <dd className="font-medium text-neutral-900 dark:text-neutral-100">
                  {order.paymentMethod}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-600 dark:text-neutral-400">
                  Payment status
                </dt>
                <dd className="font-medium text-neutral-900 dark:text-neutral-100">
                  {PAYMENT_STATUS_LABELS[order.paymentStatus]}
                </dd>
              </div>
              {order.refundIds.length > 0 && (
                <div className="flex justify-between">
                  <dt className="text-neutral-600 dark:text-neutral-400">
                    Refunds
                  </dt>
                  <dd className="font-medium text-neutral-900 dark:text-neutral-100">
                    {order.refundIds.length}
                  </dd>
                </div>
              )}
              <div className="flex justify-between border-t border-neutral-200 pt-2 dark:border-neutral-800">
                <dt className="font-semibold text-neutral-900 dark:text-neutral-100">
                  Total
                </dt>
                <dd className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {"GH\u20B5 "}
                  {order.total.toFixed(2)}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <ShipModal
        open={shipOpen}
        onClose={() => setShipOpen(false)}
        onSubmit={handleShip}
      />
      <CancelModal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onSubmit={handleCancel}
      />
      <RefundModal
        open={refundOpen}
        onClose={() => setRefundOpen(false)}
        order={order}
        onSubmit={handleRefund}
      />
    </div>
  );
}