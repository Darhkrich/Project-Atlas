/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import Link from "next/link";
import { AtlasIcon } from "@/components/atlas/icons";
import { Button } from "@/components/atlas/button";
import { PaymentFlowModal } from "@/components/payments/PaymentFlowModal";
import { allPaymentMethods } from "@/lib/payment-methods";
import { useCart } from "@/contexts/cart-context";
import { useCustomerAuth } from "@/contexts/customer-auth-context";
import { tryGetPlanByCode } from "@/config/subscription-plans";
import { useOrders } from "@/contexts/orders-context";
import type { MerchantStorefrontConfig } from "@/types/merchant-storefront";

interface StorefrontCheckoutPageProps {
  store: MerchantStorefrontConfig;
}

export function StorefrontCheckoutPage({ store }: StorefrontCheckoutPageProps) {
  const { items, subtotal, clearCart, totalItems } = useCart();
  const { customer, isAuthenticated } = useCustomerAuth();
  const { addOrder } = useOrders();

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
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("online");

  // Non-throwing lookup. A storefront whose plan code has been retired
  // keeps all methods available rather than crashing the checkout page.
  const plan = tryGetPlanByCode(store.planId || "starter");
  const allowedMethods = plan
    ? allPaymentMethods.filter((m) =>
        (plan.paymentMethods as readonly string[]).includes(m.id)
      )
    : allPaymentMethods;

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
    if (!form.address.trim()) newErrors.address = "Address is required";
    if (!form.city.trim()) newErrors.city = "City is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = () => {
    if (!validate()) return;
    if (paymentMethod === "cod") {
      placeOrder("Cash on Delivery", "Pending");
    } else {
      setPaymentOpen(true);
    }
  };

  const placeOrder = (
    paymentMethodName: string,
    paymentStatus: "Paid" | "Pending"
  ) => {
    const orderItems = items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      image: item.image,
    }));

    addOrder({
      storeSlug: store.slug,
      customerEmail: form.email,
      total: subtotal,
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
    placeOrder("Online Payment", "Paid");
  };

  if (orderPlaced) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-200">
          <AtlasIcon name="check" className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-neutral-950">
          Order Placed!
        </h1>
        <p className="mt-2 text-neutral-600">
          Thank you for your purchase. You will receive a confirmation email
          shortly.
        </p>
        <Link
          href={`/ecommerce-stores/${store.slug}/products`}
          className="mt-6 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white"
          style={{ backgroundColor: store.primaryColor }}
        >
          Continue Shopping
          <AtlasIcon name="arrow-right" className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-neutral-950">
          No items to checkout
        </h1>
        <p className="mt-2 text-neutral-600">Your cart is empty.</p>
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
      <h1 className="text-3xl font-bold text-neutral-950">Checkout</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Complete your order below.
      </p>

      {!isAuthenticated && (
        <div className="mt-4 rounded-lg bg-neutral-100 p-4 text-sm text-neutral-600">
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
        {/* Customer details form */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-neutral-950">
            Customer Details
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm"
                placeholder="e.g., John Mensah"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-danger-600">{errors.name}</p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm"
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-danger-600">{errors.email}</p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                Phone *
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm"
                placeholder="024 XXX XXXX"
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-danger-600">{errors.phone}</p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                City *
              </label>
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm"
                placeholder="Accra"
              />
              {errors.city && (
                <p className="mt-1 text-xs text-danger-600">{errors.city}</p>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                Address *
              </label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm"
                placeholder="Street, house number"
              />
              {errors.address && (
                <p className="mt-1 text-xs text-danger-600">{errors.address}</p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                Region
              </label>
              <input
                type="text"
                name="region"
                value={form.region}
                onChange={handleChange}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm"
                placeholder="Greater Accra"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                Order Notes (optional)
              </label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={2}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm resize-none"
                placeholder="Any special instructions?"
              />
            </div>
          </div>
        </div>

        {/* Order summary and payment */}
        <div className="h-fit rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-neutral-950">
            Order Summary
          </h2>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600">Items ({totalItems})</span>
              <span className="font-medium text-neutral-950">
                GH₵ {subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600">Shipping</span>
              <span className="font-medium text-neutral-950">Free</span>
            </div>
            <div className="border-t border-neutral-200 pt-2 flex justify-between text-base">
              <span className="font-semibold text-neutral-950">Total</span>
              <span className="font-bold text-neutral-950">
                GH₵ {subtotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Payment method selection */}
          <div className="mt-6 space-y-3">
            <p className="text-sm font-medium text-neutral-950">
              Payment Method
            </p>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === "online"}
                onChange={() => setPaymentMethod("online")}
                className="text-brand-600"
              />
              Pay Online
            </label>
            {store.codEnabled && (
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                  className="text-brand-600"
                />
                Cash on Delivery
              </label>
            )}
          </div>

          <Button
            onClick={handlePlaceOrder}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white"
            style={{ backgroundColor: store.primaryColor }}
          >
            Place Order
            <AtlasIcon name="arrow-right" className="h-4 w-4" />
          </Button>
          <p className="mt-3 text-center text-xs text-neutral-500">
            {paymentMethod === "cod"
              ? "You will pay upon delivery."
              : "You will be redirected to payment."}
          </p>
        </div>
      </div>

      {/* Payment modal (only for online payment) */}
      <PaymentFlowModal
        open={paymentOpen}
        mode="purchase"
        title="Complete Payment"
        amount={subtotal}
        methods={allowedMethods}
        showAmountInput={false}
        onClose={() => setPaymentOpen(false)}
        onSuccess={handlePaymentSuccess}
        onFailed={() => setPaymentOpen(false)}
      />
    </div>
  );
}