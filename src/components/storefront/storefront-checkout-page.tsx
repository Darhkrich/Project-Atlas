/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AtlasIcon } from "@/components/atlas/icons";
import { Button } from "@/components/atlas/button";
import { PaymentFlowModal } from "@/components/payments/PaymentFlowModal";
import { allPaymentMethods } from "@/lib/payment-methods";
import { useCart } from "@/contexts/cart-context";
import { useCustomerAuth } from "@/contexts/customer-auth-context";
import { tryGetPlanByCode } from "@/config/subscription-plans";
import { useOrders } from "@/contexts/orders-context";
import { useShipping } from "@/lib/merchant/storefront/shipping/use-shipping";
import { cn } from "@/lib/utils";
import type { MerchantStorefrontConfig } from "@/types/merchant-storefront";
import type { CustomerOrderPaymentStatus } from "@/lib/merchant/orders/types";
import type { ShippingZone } from "@/lib/merchant/storefront/shipping/types";

interface StorefrontCheckoutPageProps {
  store: MerchantStorefrontConfig;
}

type FulfillmentMethod = "delivery" | "pickup";

const inputClass =
  "w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100";

function effectiveZoneFee(
  zone: ShippingZone | undefined,
  subtotal: number
): number {
  if (!zone) return 0;
  if (!zone.enabled) return 0;
  if (typeof zone.freeAbove === "number" && subtotal >= zone.freeAbove) {
    return 0;
  }
  return Math.max(0, zone.fee);
}

function formatMoney(value: number): string {
  return "GH\u20B5 " + value.toFixed(2);
}

export function StorefrontCheckoutPage({
  store,
}: StorefrontCheckoutPageProps) {
  const { items, subtotal, clearCart, totalItems } = useCart();
  const { customer, isAuthenticated } = useCustomerAuth();
  const { addOrder } = useOrders();
  const { config: shippingConfig } = useShipping(store.storefrontId);

  const [form, setForm] = useState({
    name: customer?.name || "",
    email: customer?.email || "",
    phone: customer?.phone || "",
    address: customer?.address || "",
    city: customer?.city || "",
    region: customer?.region || "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">(
    "online"
  );
  const [fulfillment, setFulfillment] =
    useState<FulfillmentMethod>("delivery");
  const [zoneId, setZoneId] = useState<string>("");

  const plan = tryGetPlanByCode(store.planId || "starter");
  const allowedMethods = plan
    ? allPaymentMethods.filter((m) =>
        (plan.paymentMethods as readonly string[]).includes(m.id)
      )
    : allPaymentMethods;

  // Pickup configuration lives in the shipping store, which the merchant's
  // shipping panel writes.
  const pickupEnabled = shippingConfig.pickupEnabled === true;
  const pickupAddress = shippingConfig.pickupAddress?.trim() ?? "";
  const pickupInstructions =
    shippingConfig.pickupInstructions?.trim() ?? "";

  const enabledZones = shippingConfig.zones.filter((z) => z.enabled);

  const selectedZone = useMemo(
    () => enabledZones.find((z) => z.id === zoneId),
    [enabledZones, zoneId]
  );

  const shippingFee = useMemo(() => {
    if (fulfillment === "pickup") return 0;
    if (enabledZones.length === 0) return 0;
    return effectiveZoneFee(selectedZone, subtotal);
  }, [fulfillment, enabledZones.length, selectedZone, subtotal]);

  const codEnabled = store.codEnabled === true;
  const codFee = typeof store.codFee === "number" ? store.codFee : 0;
  const codMaxOrderValue =
    typeof store.codMaxOrderValue === "number"
      ? store.codMaxOrderValue
      : null;

  const codBlockedByValue =
    codMaxOrderValue !== null && subtotal > codMaxOrderValue;
  const codAvailable = codEnabled && !codBlockedByValue;

  // If COD was chosen and then becomes unavailable, fall back to online.
  const effectivePaymentMethod: "online" | "cod" =
    paymentMethod === "cod" && !codAvailable ? "online" : paymentMethod;

  const appliedCodFee =
    effectivePaymentMethod === "cod" && codFee > 0 ? codFee : 0;

  const taxPercent =
    typeof store.taxPercent === "number" ? store.taxPercent : 0;
  const taxIncluded = store.taxIncluded === true;
  const taxAppliesToShipping = store.taxAppliesToShipping === true;

  const taxBreakdown = useMemo(() => {
    if (taxPercent <= 0) {
      return { added: 0, included: 0, showIncluded: false, showAdded: false };
    }
    const shippingBase = taxAppliesToShipping ? shippingFee : 0;
    const base = subtotal + shippingBase;

    if (taxIncluded) {
      const includedTax = base - base / (1 + taxPercent / 100);
      return {
        added: 0,
        included: includedTax,
        showIncluded: includedTax > 0,
        showAdded: false,
      };
    }
    const addedTax = (base * taxPercent) / 100;
    return {
      added: addedTax,
      included: 0,
      showIncluded: false,
      showAdded: addedTax > 0,
    };
  }, [
    taxPercent,
    taxIncluded,
    taxAppliesToShipping,
    shippingFee,
    subtotal,
  ]);

  const total = subtotal + shippingFee + appliedCodFee + taxBreakdown.added;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Full name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    if (!form.phone.trim()) newErrors.phone = "Phone number is required";

    if (fulfillment === "delivery") {
      if (!form.address.trim()) newErrors.address = "Address is required";
      if (!form.city.trim()) newErrors.city = "City is required";
      if (enabledZones.length > 0 && !selectedZone) {
        newErrors.zone = "Choose a delivery zone.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = () => {
    if (!validate()) return;
    if (effectivePaymentMethod === "cod") {
      placeOrder("Cash on Delivery", "pending");
    } else {
      setPaymentOpen(true);
    }
  };

  const placeOrder = (
    paymentMethodName: string,
    paymentStatus: CustomerOrderPaymentStatus
  ) => {
    const orderItems = items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      image: item.image,
    }));

    const instructionParts: string[] = [];
    if (form.notes.trim()) instructionParts.push(form.notes.trim());
    if (fulfillment === "pickup") {
      instructionParts.push("Fulfillment: Pickup");
      if (pickupAddress) {
        instructionParts.push("Pickup location: " + pickupAddress);
      }
    } else if (selectedZone) {
      instructionParts.push("Delivery zone: " + selectedZone.name);
    }

    addOrder({
      storeSlug: store.slug,
      storefrontId: store.storefrontId,
      customerEmail: form.email,
      customerName: form.name,
      customerPhone: form.phone,
      shippingAddress: {
        name: form.name,
        phone: form.phone,
        address: fulfillment === "pickup" ? pickupAddress : form.address,
        city: fulfillment === "pickup" ? "" : form.city,
        region: fulfillment === "pickup" ? "" : form.region,
        instructions:
          instructionParts.length > 0
            ? instructionParts.join(" | ")
            : undefined,
      },
      total,
      items: orderItems,
      paymentMethod: paymentMethodName,
      paymentStatus,
    });

    setOrderPlaced(true);
    clearCart();
    setPaymentOpen(false);
  };

  const handlePaymentSuccess = (result: {
    status: string;
    message: string;
  }) => {
    placeOrder("Online Payment", "paid");
  };

  if (orderPlaced) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-200">
          <AtlasIcon name="check" className="h-8 w-8" aria-hidden="true" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-neutral-950 dark:text-neutral-100">
          Order Placed
        </h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          Thank you for your purchase. You will receive a confirmation email
          shortly.
        </p>
        <Link
          href={`/ecommerce-stores/${store.slug}/products`}
          className="mt-6 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white"
          style={{ backgroundColor: store.primaryColor }}
        >
          Continue Shopping
          <AtlasIcon
            name="arrow-right"
            className="h-4 w-4"
            aria-hidden="true"
          />
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-neutral-950 dark:text-neutral-100">
          No items to checkout
        </h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          Your cart is empty.
        </p>
        <Link
          href={`/ecommerce-stores/${store.slug}/products`}
          className="mt-6 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white"
          style={{ backgroundColor: store.primaryColor }}
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-neutral-950 dark:text-neutral-100">
        Checkout
      </h1>
      <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
        Complete your order below.
      </p>

      {!isAuthenticated && (
        <div className="mt-4 rounded-lg bg-neutral-100 p-4 text-sm text-neutral-600 dark:bg-neutral-900 dark:text-neutral-300">
          <p>
            Already have an account?{" "}
            <Link
              href={`/ecommerce-stores/${store.slug}/account/login`}
              className="font-semibold text-brand-600"
            >
              Sign in
            </Link>{" "}
            for a faster checkout.
          </p>
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          {pickupEnabled && (
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 sm:p-6">
              <h2 className="text-sm font-semibold text-neutral-950 dark:text-neutral-100">
                Fulfillment
              </h2>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFulfillment("delivery")}
                  aria-pressed={fulfillment === "delivery"}
                  className={cn(
                    "rounded-lg border px-4 py-3 text-left transition",
                    fulfillment === "delivery"
                      ? "border-brand-600 bg-brand-50 dark:border-brand-500 dark:bg-brand-900/20"
                      : "border-neutral-200 bg-white hover:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-900"
                  )}
                >
                  <p
                    className={cn(
                      "text-xs font-semibold",
                      fulfillment === "delivery"
                        ? "text-brand-700 dark:text-brand-300"
                        : "text-neutral-900 dark:text-neutral-100"
                    )}
                  >
                    Delivery
                  </p>
                  <p className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
                    Sent to your address.
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setFulfillment("pickup")}
                  aria-pressed={fulfillment === "pickup"}
                  className={cn(
                    "rounded-lg border px-4 py-3 text-left transition",
                    fulfillment === "pickup"
                      ? "border-brand-600 bg-brand-50 dark:border-brand-500 dark:bg-brand-900/20"
                      : "border-neutral-200 bg-white hover:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-900"
                  )}
                >
                  <p
                    className={cn(
                      "text-xs font-semibold",
                      fulfillment === "pickup"
                        ? "text-brand-700 dark:text-brand-300"
                        : "text-neutral-900 dark:text-neutral-100"
                    )}
                  >
                    Pickup
                  </p>
                  <p className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
                    Collect from the store.
                  </p>
                </button>
              </div>

              {fulfillment === "pickup" && (
                <div className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-950">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    Pickup location
                  </p>
                  <p className="mt-1 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {pickupAddress || store.storeName}
                  </p>
                  {(store.contactPhone || store.whatsapp) && (
                    <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                      {store.contactPhone || store.whatsapp}
                    </p>
                  )}
                  {pickupInstructions && (
                    <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400">
                      {pickupInstructions}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 sm:p-6">
            <h2 className="text-sm font-semibold text-neutral-950 dark:text-neutral-100">
              Customer Details
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="e.g., John Mensah"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-danger-600 dark:text-danger-400">
                    {errors.name}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="you@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-danger-600 dark:text-danger-400">
                    {errors.email}
                  </p>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Phone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="024 XXX XXXX"
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-danger-600 dark:text-danger-400">
                    {errors.phone}
                  </p>
                )}
              </div>

              {fulfillment === "delivery" && (
                <>
                  {enabledZones.length > 0 && (
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="checkout-zone"
                        className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                      >
                        Delivery Zone *
                      </label>
                      <select
                        id="checkout-zone"
                        value={zoneId}
                        onChange={(e) => {
                          setZoneId(e.target.value);
                          if (errors.zone) {
                            setErrors((prev) => ({ ...prev, zone: "" }));
                          }
                        }}
                        className={inputClass}
                      >
                        <option value="">Choose your area</option>
                        {enabledZones.map((zone) => {
                          const free =
                            typeof zone.freeAbove === "number" &&
                            subtotal >= zone.freeAbove;
                          const feeLabel = free
                            ? "Free"
                            : formatMoney(zone.fee);
                          return (
                            <option key={zone.id} value={zone.id}>
                              {zone.name + " - " + feeLabel}
                            </option>
                          );
                        })}
                      </select>
                      {errors.zone && (
                        <p className="mt-1 text-xs text-danger-600 dark:text-danger-400">
                          {errors.zone}
                        </p>
                      )}
                      {selectedZone &&
                        typeof selectedZone.freeAbove === "number" &&
                        subtotal < selectedZone.freeAbove && (
                          <p className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
                            {"Free delivery on orders above " +
                              formatMoney(selectedZone.freeAbove)}
                          </p>
                        )}
                    </div>
                  )}

                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="Street, house number"
                    />
                    {errors.address && (
                      <p className="mt-1 text-xs text-danger-600 dark:text-danger-400">
                        {errors.address}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="Accra"
                    />
                    {errors.city && (
                      <p className="mt-1 text-xs text-danger-600 dark:text-danger-400">
                        {errors.city}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Region
                    </label>
                    <input
                      type="text"
                      name="region"
                      value={form.region}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="Greater Accra"
                    />
                  </div>
                </>
              )}

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Order Notes (optional)
                </label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={2}
                  className={inputClass + " resize-none"}
                  placeholder="Any special instructions?"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="h-fit rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 sm:p-6">
          <h2 className="text-sm font-semibold text-neutral-950 dark:text-neutral-100">
            Order Summary
          </h2>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600 dark:text-neutral-400">
                Items ({totalItems})
              </span>
              <span className="font-medium text-neutral-950 dark:text-neutral-100">
                {formatMoney(subtotal)}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-neutral-600 dark:text-neutral-400">
                {fulfillment === "pickup"
                  ? "Pickup"
                  : selectedZone
                    ? "Shipping - " + selectedZone.name
                    : "Shipping"}
              </span>
              <span className="font-medium text-neutral-950 dark:text-neutral-100">
                {shippingFee === 0 ? "Free" : formatMoney(shippingFee)}
              </span>
            </div>

            {appliedCodFee > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600 dark:text-neutral-400">
                  Cash on delivery fee
                </span>
                <span className="font-medium text-neutral-950 dark:text-neutral-100">
                  {formatMoney(appliedCodFee)}
                </span>
              </div>
            )}

            {taxBreakdown.showIncluded && (
              <div className="flex justify-between text-xs">
                <span className="text-neutral-500 dark:text-neutral-400">
                  {"Includes " +
                    formatMoney(taxBreakdown.included) +
                    " VAT"}
                </span>
                <span className="text-neutral-500 dark:text-neutral-400">
                  {"(" + taxPercent + "%)"}
                </span>
              </div>
            )}

            {taxBreakdown.showAdded && (
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600 dark:text-neutral-400">
                  {"VAT (" + taxPercent + "%)"}
                </span>
                <span className="font-medium text-neutral-950 dark:text-neutral-100">
                  {formatMoney(taxBreakdown.added)}
                </span>
              </div>
            )}

            <div className="flex justify-between border-t border-neutral-200 pt-2 dark:border-neutral-800">
              <span className="text-base font-semibold text-neutral-950 dark:text-neutral-100">
                Total
              </span>
              <span className="text-base font-bold text-neutral-950 dark:text-neutral-100">
                {formatMoney(total)}
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <p className="text-sm font-medium text-neutral-950 dark:text-neutral-100">
              Payment Method
            </p>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="paymentMethod"
                checked={effectivePaymentMethod === "online"}
                onChange={() => setPaymentMethod("online")}
                className="text-brand-600"
              />
              Pay Online
            </label>

            {codEnabled && (
              <label
                className={cn(
                  "flex items-start gap-2 text-sm",
                  !codAvailable ? "cursor-not-allowed opacity-60" : ""
                )}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={effectivePaymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                  disabled={!codAvailable}
                  className="mt-0.5 text-brand-600 disabled:cursor-not-allowed"
                />
                <span>
                  <span className="block">Cash on Delivery</span>
                  {codBlockedByValue && codMaxOrderValue !== null && (
                    <span className="mt-0.5 block text-[11px] text-neutral-500 dark:text-neutral-400">
                      {"Not available above " +
                        formatMoney(codMaxOrderValue)}
                    </span>
                  )}
                  {codAvailable && appliedCodFee > 0 && (
                    <span className="mt-0.5 block text-[11px] text-neutral-500 dark:text-neutral-400">
                      {"A " + formatMoney(codFee) + " fee applies"}
                    </span>
                  )}
                </span>
              </label>
            )}
          </div>

          <Button
            onClick={handlePlaceOrder}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white"
            style={{ backgroundColor: store.primaryColor }}
          >
            Place Order
            <AtlasIcon
              name="arrow-right"
              className="h-4 w-4"
              aria-hidden="true"
            />
          </Button>
          <p className="mt-3 text-center text-xs text-neutral-500 dark:text-neutral-400">
            {effectivePaymentMethod === "cod"
              ? "You will pay upon delivery."
              : "You will be redirected to payment."}
          </p>
        </div>
      </div>

      <PaymentFlowModal
        open={paymentOpen}
        mode="purchase"
        title="Complete Payment"
        amount={total}
        methods={allowedMethods}
        showAmountInput={false}
        onClose={() => setPaymentOpen(false)}
        onSuccess={handlePaymentSuccess}
        onFailed={() => setPaymentOpen(false)}
      />
    </div>
  );
}