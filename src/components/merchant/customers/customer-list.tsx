"use client";

import type { MerchantCustomerView } from "@/lib/merchant/customers/types";
import { CustomerRow } from "./customer-row";
import { CustomerCard } from "./customer-card";

interface CustomerListProps {
  rows: MerchantCustomerView[];
  onReport: (customer: MerchantCustomerView) => void;
}

export function CustomerList({ rows, onReport }: CustomerListProps) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 lg:block">
        <table className="w-full text-left">
          <caption className="sr-only">Your customers</caption>
          <thead className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950">
            <tr>
              <th
                scope="col"
                className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500"
              >
                Customer
              </th>
              <th
                scope="col"
                className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500"
              >
                Phone
              </th>
              <th
                scope="col"
                className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500"
              >
                Orders
              </th>
              <th
                scope="col"
                className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500"
              >
                Spent
              </th>
              <th
                scope="col"
                className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500"
              >
                Last activity
              </th>
              <th
                scope="col"
                className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-neutral-500"
              >
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {rows.map((customer) => (
              <CustomerRow
                key={customer.id}
                customer={customer}
                onReport={onReport}
              />
            ))}
          </tbody>
        </table>
      </div>

      <ul role="list" className="space-y-3 lg:hidden">
        {rows.map((customer) => (
          <li key={customer.id}>
            <CustomerCard customer={customer} onReport={onReport} />
          </li>
        ))}
      </ul>
    </>
  );
}