/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { AdminBreadcrumbs } from "@/components/admin/admin-breadcrumbs";
import { ThemeProvider } from "@/lib/theme/theme-provider";
import { CurrentAdminProvider } from "@/lib/admin/rbac";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    
  <CurrentAdminProvider>
    <ThemeProvider>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <AdminTopbar onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 p-4 md:p-6">
            <AdminBreadcrumbs />

            <div className="mt-4">{children}</div>
          </main>
        </div>
      </div>
    </ThemeProvider>
    </CurrentAdminProvider>
  );
}
