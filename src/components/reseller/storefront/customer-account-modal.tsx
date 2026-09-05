/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { useStorefrontCustomer } from "@/contexts/storefront-customer-context";
import { AtlasInput } from "@/components/atlas/Input";
import { Button } from "@/components/atlas/button";
import { AtlasIcon } from "@/components/atlas/icons";

interface CustomerAccountModalProps {
  resellerSlug: string;
  onClose: () => void;
}

type Mode = "login" | "signup" | "account";

export function CustomerAccountModal({ resellerSlug, onClose }: CustomerAccountModalProps) {
  const { customer, isAuthenticated, login, signup, logout, saveDetail, setPreferredPaymentMethod } =
    useStorefrontCustomer();

  const [mode, setMode] = useState<Mode>(isAuthenticated ? "account" : "login");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result =
      mode === "login"
        ? await login(resellerSlug, form)
        : await signup(resellerSlug, form);
    setLoading(false);
    if (result.success) {
      setMode("account");
    } else {
      setError(result.error || "Something went wrong.");
    }
  };

  const handleLogout = () => {
    logout();
    setMode("login");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto p-6">
        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-500 hover:text-neutral-800">
          <AtlasIcon name="x-circle" className="h-5 w-5" />
        </button>

        {mode === "account" && customer ? (
          <div>
            <h2 className="text-xl font-bold text-neutral-900">My Account</h2>
            <div className="mt-4 space-y-3">
              <div>
                <p className="text-sm text-neutral-500">Name</p>
                <p className="font-semibold">{customer.name}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Email</p>
                <p className="font-semibold">{customer.email}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Phone</p>
                <p className="font-semibold">{customer.phone || "—"}</p>
              </div>

              <div className="border-t pt-3">
                <h3 className="font-semibold text-neutral-900 mb-2">Saved Details</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-neutral-500">Phone:</span>
                  <span>{customer.savedDetails?.phoneNumber || "—"}</span>
                  <span className="text-neutral-500">Meter:</span>
                  <span>{customer.savedDetails?.meterNumber || "—"}</span>
                  <span className="text-neutral-500">Smartcard:</span>
                  <span>{customer.savedDetails?.smartCardNumber || "—"}</span>
                </div>
              </div>

              <div className="border-t pt-3">
                <h3 className="font-semibold text-neutral-900 mb-2">Order History</h3>
                {customer.orders.length > 0 ? (
                  <div className="space-y-2">
                    {customer.orders.map((order) => (
                      <div key={order.id} className="flex justify-between text-sm">
                        <span>{order.service} - {order.plan}</span>
                        <span>GH₵{order.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-neutral-500">No orders yet.</p>
                )}
              </div>

              <Button variant="outline" className="w-full" onClick={handleLogout}>
                Log Out
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-bold text-neutral-900 text-center">
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="mt-2 text-sm text-neutral-600 text-center">
              {mode === "login"
                ? "Log in to track orders and save details."
                : "Sign up to get faster checkout and order tracking."}
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {mode === "signup" && (
                <>
                  <AtlasInput label="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  <AtlasInput label="Phone (optional)" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </>
              )}
              <AtlasInput label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              <AtlasInput label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />

              {error && <p className="text-sm text-danger-600">{error}</p>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Please wait..." : mode === "login" ? "Log In" : "Sign Up"}
              </Button>
            </form>

            <p className="mt-4 text-sm text-center text-neutral-600">
              {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
                className="text-brand-700 font-medium hover:underline"
              >
                {mode === "login" ? "Sign Up" : "Log In"}
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}