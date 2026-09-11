/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Provider } from "@/lib/admin/types/provider";
import { ProviderStatusBadge } from "./provider-status-badge";
import { Button } from "@/components/admin/ui/button";
import { AtlasIcon } from "@/components/atlas/icons";
import Link from "next/link";

function timeAgo(dateString: string) {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface ProvidersTableProps {
  providers: Provider[];
}

export function ProvidersTable({ providers }: ProvidersTableProps) {
  return (
    <div className="rounded-lg border border-neutral-200 overflow-hidden">
      {/* Desktop table */}
      <table className="hidden md:table w-full text-sm">
        <thead className="bg-neutral-50">
          <tr className="text-left text-xs font-semibold text-neutral-500">
            <th className="px-4 py-3">Provider</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Services</th>
            <th className="px-4 py-3">Transactions Today</th>
            <th className="px-4 py-3">Success Rate</th>
            <th className="px-4 py-3">Response Time</th>
            <th className="px-4 py-3">Priority</th>
            <th className="px-4 py-3">Last Check</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {providers.map(provider => (
            <tr key={provider.id} className="border-t border-neutral-100 hover:bg-neutral-50">
              <td className="px-4 py-3">
                <Link href={`/admin/providers/${provider.id}`} className="font-medium text-brand-600 hover:underline">
                  {provider.name}
                </Link>
                <p className="text-xs text-neutral-500">{provider.code}</p>
              </td>
              <td className="px-4 py-3"><ProviderStatusBadge status={provider.status} /></td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {provider.services.slice(0, 2).map(svc => (
                    <span key={svc.id} className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs">{svc.serviceCategory}</span>
                  ))}
                  {provider.services.length > 2 && <span className="text-xs text-neutral-500">+{provider.services.length - 2}</span>}
                </div>
              </td>
              <td className="px-4 py-3">{provider.transactionCountToday.toLocaleString()}</td>
              <td className="px-4 py-3">{provider.successRate}%</td>
              <td className="px-4 py-3">{provider.averageResponseTime} ms</td>
              <td className="px-4 py-3 capitalize">{provider.priority}</td>
              <td className="px-4 py-3 text-xs text-neutral-500">{timeAgo(provider.lastHealthCheck)}</td>
              <td className="px-4 py-3">
                <Link href={`/admin/providers/${provider.id}`} className="text-brand-600 hover:underline text-sm">View</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile cards */}
      <div className="md:hidden divide-y divide-neutral-100">
        {providers.map(provider => (
          <div key={provider.id} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <Link href={`/admin/providers/${provider.id}`} className="font-semibold text-brand-600">{provider.name}</Link>
                <p className="text-xs text-neutral-500">{provider.code}</p>
              </div>
              <ProviderStatusBadge status={provider.status} />
            </div>
            <div className="mt-2 text-sm text-neutral-600">
              <p>Success: {provider.successRate}% · Response: {provider.averageResponseTime}ms</p>
              <p>Transactions: {provider.transactionCountToday}</p>
            </div>
            <Link href={`/admin/providers/${provider.id}`} className="mt-2 inline-block text-sm text-brand-600">View Details</Link>
          </div>
        ))}
      </div>
    </div>
  );
}