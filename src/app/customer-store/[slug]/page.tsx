import { CustomerStorefrontClient } from "@/components/reseller/storefront/customer-storefront-client";

export default async function CustomerStorePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <CustomerStorefrontClient slug={slug} />;
}