"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/atlas/button";
import { useCustomerAuth } from "@/contexts/customer-auth-context";
import type { MerchantStorefrontConfig } from "@/types/merchant-storefront";

export function CustomerLoginPage({ store }: { store: MerchantStorefrontConfig }) {
  const { login } = useCustomerAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(email, password);
    if (success) {
      router.push(`/ecommerce-stores/${store.slug}/account`);
    } else {
      setError("Invalid email or password.");
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold text-neutral-950">Sign In</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Sign in to your {store.storeName} account.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm"
            required
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm"
            required
          />
        </div>
        {error && <p className="text-sm text-danger-600">{error}</p>}
        <Button type="submit" className="w-full">
          Sign In
        </Button>
      </form>
      <p className="mt-4 text-sm text-neutral-600">
        Don&apos;t have an account?{" "}
        <Link
          href={`/ecommerce-stores/${store.slug}/account/register`}
          className="font-semibold text-brand-600"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}