import Link from "next/link";
import { notFound } from "next/navigation";
import { AtlasContainer, AtlasSection } from "@/components/atlas";
import { ServiceIcon } from "@/components/atlas/service-icon";
import { ServiceProductCatalog } from "@/components/service/service-product-catalog";
import {
  getServiceCatalog,
  serviceCatalogSlugs,
} from "@/lib/service-products";

export function generateStaticParams() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return serviceCatalogSlugs.map((slug: any) => ({ service: slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ service: string }>;
}) {
  const { service } = await params;
  const catalog = getServiceCatalog(service);

  if (!catalog) {
    return {
      title: "Service not found — Atlas",
    };
  }

  return {
    title: `${catalog.name} — Atlas`,
    description: catalog.shortDescription,
  };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ service: string }>;
}) {
  const { service } = await params;
  const catalog = getServiceCatalog(service);

  if (!catalog) {
    notFound();
  }

  return (
    <AtlasSection size="lg" className="bg-white dark:bg-neutral-950">
      <AtlasContainer>
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-6 text-sm">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link
                href="/"
                className="text-neutral-500 transition-colors hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
              >
                Home
              </Link>
            </li>
            <li aria-hidden="true" className="text-neutral-400 dark:text-neutral-500">
              /
            </li>
            <li>
              <Link
                href="/services"
                className="text-neutral-500 transition-colors hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
              >
                Services
              </Link>
            </li>
            <li aria-hidden="true" className="text-neutral-400 dark:text-neutral-500">
              /
            </li>
            <li
              aria-current="page"
              className="font-medium text-neutral-700 dark:text-neutral-300"
            >
              {catalog.name}
            </li>
          </ol>
        </nav>

        {/* Service header */}
        <div className="mb-10 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-300">
            <ServiceIcon name={catalog.icon} className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-3xl">
              {catalog.name}
            </h1>
            <p className="mt-1 text-neutral-600 dark:text-neutral-400">
              {catalog.shortDescription}
            </p>
          </div>
        </div>

        {/* Product catalog with purchase flow */}
        <ServiceProductCatalog catalog={catalog} />
      </AtlasContainer>
    </AtlasSection>
  );
}