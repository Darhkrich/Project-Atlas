/* eslint-disable @typescript-eslint/no-unused-vars */
import { AuthGuard } from "@/components/auth/AuthGuard";
import { ResellerLayout } from "@/components/reseller/reseller-layout";
import { ResellerDataProvider } from "@/contexts/reseller-data-context";
import { StorefrontProvider } from "@/contexts/storefront-context";
import { StorefrontCustomerProvider } from "@/contexts/storefront-customer-context";

export default function ResellerAreaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    
      <ResellerLayout>
       <StorefrontProvider>

<StorefrontCustomerProvider>
         <ResellerDataProvider>
          <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">{children}</div>
        </ResellerDataProvider>
      </StorefrontCustomerProvider>


    </StorefrontProvider> 
        
        </ResellerLayout>
    
  );
}
