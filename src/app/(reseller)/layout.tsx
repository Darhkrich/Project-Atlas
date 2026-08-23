import { AuthGuard } from "@/components/auth/AuthGuard";
import { ResellerLayout } from "@/components/reseller/reseller-layout";

export default function ResellerAreaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <ResellerLayout>{children}</ResellerLayout>
    </AuthGuard>
  );
}