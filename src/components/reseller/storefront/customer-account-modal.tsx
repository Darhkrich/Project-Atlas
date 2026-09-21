"use client";

import { useState } from "react";
import { useStorefrontCustomer } from "@/contexts/storefront-customer-context";
import { AtlasModalShell } from "@/components/atlas/modal-shell";
import { AtlasInput } from "@/components/atlas/Input";
import { Button } from "@/components/atlas/button";

interface CustomerAccountModalProps {
  resellerSlug: string;
  storefrontId?: string;
  onClose: () => void;
}

type Mode = "login" | "signup";

export function CustomerAccountModal({
  resellerSlug,
  storefrontId,
  onClose,
}: CustomerAccountModalProps) {
  const { login, signup } = useStorefrontCustomer();

  const [mode, setMode] = useState<Mode>("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const phoneValid = form.phone.trim().length >= 7;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "signup" && !phoneValid) {
      setError("A valid phone number is required.");
      return;
    }
    setLoading(true);
    setError("");
    const result =
      mode === "login"
        ? await login(resellerSlug, form)
        : await signup(resellerSlug, form, storefrontId);
    setLoading(false);
    if (result.success) {
      onClose();
    } else {
      setError(result.error || "Something went wrong.");
    }
  };

  return (
    <AtlasModalShell
      open
      onClose={onClose}
      title={mode === "login" ? "Welcome back" : "Create account"}
      description={
        mode === "login"
          ? "Log in to track orders and save details."
          : "Sign up to get faster checkout and order tracking."
      }
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "signup" && (
          <>
            <AtlasInput
              label="Full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <AtlasInput
              label="Phone number"
              type="tel"
              value={form.phone}
              onChange={(e) => {
                setForm({ ...form, phone: e.target.value });
                setError("");
              }}
              required
              error={!phoneValid && form.phone.length > 0 ? "Enter a valid phone number." : undefined}
            />
          </>
        )}
        <AtlasInput
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <AtlasInput
          label="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />

        {error && (
          <p
            role="alert"
            aria-live="polite"
            className="text-sm text-danger-600"
          >
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading
            ? "Please wait..."
            : mode === "login"
            ? "Log in"
            : "Sign up"}
        </Button>

        <p className="text-center text-sm text-neutral-600">
          {mode === "login"
            ? "Don't have an account?"
            : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError("");
            }}
            className="font-medium text-brand-700 hover:underline"
          >
            {mode === "login" ? "Sign up" : "Log in"}
          </button>
        </p>
      </form>
    </AtlasModalShell>
  );
}