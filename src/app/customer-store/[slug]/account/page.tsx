import { Suspense } from "react";
import { CustomerAccountClient } from "@/components/reseller/storefront/account/customer-account-client";

export default async function StorefrontAccountPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <Suspense fallback={<AccountPageSkeleton />}>
      <CustomerAccountClient slug={slug} />
    </Suspense>
  );
}

function AccountPageSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <div className="h-10 w-48 animate-pulse rounded bg-neutral-200" />
        <div className="h-48 w-full animate-pulse rounded-2xl bg-neutral-200" />
        <div className="h-64 w-full animate-pulse rounded-2xl bg-neutral-200" />
      </div>
    </div>
  );
}