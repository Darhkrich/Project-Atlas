"use client";

import Link from "next/link";
import { useCustomerAuth } from "@/contexts/customer-auth-context";
import type { MerchantStorefrontConfig } from "@/types/merchant-storefront";

export function CustomerAccountPage({
  store,
}: {
  store: MerchantStorefrontConfig;
}) {
  const { customer, isAuthenticated, logout } = useCustomerAuth();

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-neutral-950">Account Access</h1>
        <p className="mt-2 text-neutral-600">Please sign in to view your account.</p>
        <Link
          href={`/ecommerce-stores/${store.slug}/account/login`}
          className="mt-6 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white"
          style={{ backgroundColor: store.primaryColor }}
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-neutral-950">My Account</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[300px_1fr]">
        {/* Sidebar */}
        <aside className="h-fit rounded-2xl border border-neutral-200 bg-white p-6">
          <p className="text-lg font-semibold">{customer?.name}</p>
          <p className="text-sm text-neutral-500">{customer?.email}</p>
          <div className="mt-4 flex flex-col gap-2 text-sm">
            <Link href="#" className="rounded-lg px-3 py-2 hover:bg-neutral-100">
              Profile
            </Link>
           <Link
  href={`/ecommerce-stores/${store.slug}/account/orders`}
  className="rounded-lg px-3 py-2 hover:bg-neutral-100"
>
  Orders
</Link>
            <button
              onClick={logout}
              className="text-left rounded-lg px-3 py-2 text-danger-600 hover:bg-danger-50"
            >
              Log out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <h2 className="text-sm font-semibold">Profile Information</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 text-sm">
              <div><span className="text-neutral-500">Name:</span> {customer?.name}</div>
              <div><span className="text-neutral-500">Email:</span> {customer?.email}</div>
              <div><span className="text-neutral-500">Phone:</span> {customer?.phone}</div>
              <div><span className="text-neutral-500">Address:</span> {customer?.address}</div>
              <div><span className="text-neutral-500">City:</span> {customer?.city}</div>
              <div><span className="text-neutral-500">Region:</span> {customer?.region || "—"}</div>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <h2 className="text-sm font-semibold">Recent Orders</h2>
            <p className="mt-4 text-sm text-neutral-500">No orders yet.</p>
          </div>
        </div>
      </div>
    </div>
  );
}