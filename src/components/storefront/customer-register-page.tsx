

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/atlas/button";
import { useCustomerAuth } from "@/contexts/customer-auth-context";
import { useStoreCustomers } from "@/contexts/store-customers-context";
import type { MerchantStorefrontConfig } from "@/types/merchant-storefront";

export function CustomerRegisterPage({ store }: { store: MerchantStorefrontConfig }) {
  const { register } = useCustomerAuth();
  const { addCustomer } = useStoreCustomers();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    region: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = register({
      id: `cust-${Date.now()}`,
      name: form.name,
      email: form.email,
      phone: form.phone,
      address: form.address,
      city: form.city,
      region: form.region,
      password: form.password,
    });
    if (success) {
      // Add customer to store customers context so merchant can see them
      addCustomer({
        storeSlug: store.slug,
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        city: form.city,
        region: form.region,
      });
      router.push(`/ecommerce-stores/${store.slug}/account`);
    } else {
      setError("An account with this email already exists.");
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold text-neutral-950">Create Account</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Create an account to track your orders and speed up checkout.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            Full Name
          </label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm"
            required
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm"
            required
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            Phone
          </label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm"
            required
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            Address
          </label>
          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">
              City
            </label>
            <input
              name="city"
              value={form.city}
              onChange={handleChange}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">
              Region
            </label>
            <input
              name="region"
              value={form.region}
              onChange={handleChange}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm"
            required
          />
        </div>
        {error && <p className="text-sm text-danger-600">{error}</p>}
        <Button type="submit" className="w-full">
          Create Account
        </Button>
      </form>
      <p className="mt-4 text-sm text-neutral-600">
        Already have an account?{" "}
        <Link
          href={`/ecommerce-stores/${store.slug}/account/login`}
          className="font-semibold text-brand-600"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}



