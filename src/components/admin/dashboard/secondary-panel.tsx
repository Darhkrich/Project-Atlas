"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/admin/ui/card";

export function SecondaryPanel({
  title,
  href,
  linkLabel = "View",
  children,
}: {
  title: string;
  href: string;
  linkLabel?: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm">{title}</CardTitle>
        <Link
          href={href}
          className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400"
        >
          {linkLabel}
        </Link>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}