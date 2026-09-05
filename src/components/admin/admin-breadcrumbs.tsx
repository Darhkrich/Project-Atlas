"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import { AtlasIcon } from "@/components/atlas/icons";

export function AdminBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  // Filter out "admin" and dynamic segments that are not meaningful
  const breadcrumbSegments = segments.slice(1);

  return (
    <nav className="flex items-center gap-1 text-sm text-neutral-500">
      <Link href="/admin" className="hover:text-neutral-700">
        Admin
      </Link>
      {breadcrumbSegments.map((segment, index) => {
        const href = "/" + segments.slice(0, index + 2).join("/");
        const isLast = index === breadcrumbSegments.length - 1;
        return (
          <Fragment key={segment}>
            <AtlasIcon name="arrow-right" className="h-3 w-3" />
            {isLast ? (
              <span className="font-medium text-neutral-700">{segment}</span>
            ) : (
              <Link href={href} className="hover:text-neutral-700">
                {segment}
              </Link>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}