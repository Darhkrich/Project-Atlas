/* eslint-disable @typescript-eslint/no-unused-vars */
import { AuthGuard } from "@/components/auth/AuthGuard";
import { CustomerLayout } from "@/components/customer/customer-layout";

export default function CustomerAreaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    
      <CustomerLayout>{children}</CustomerLayout>
   
  );
}