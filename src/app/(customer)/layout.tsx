import { AuthGuard } from "@/components/auth/AuthGuard";
import { CustomerLayout } from "@/components/customer/customer-layout";

export default function CustomerAreaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <CustomerLayout>{children}</CustomerLayout>
    </AuthGuard>
  );
}