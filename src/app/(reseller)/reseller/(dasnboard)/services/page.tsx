import { ResellerPageHeader } from "@/components/reseller/reseller-page-header";
import { ResellerServicesManager } from "@/components/reseller/reseller-services-manager";

export default function ResellerServicesPage() {
  return (
    <>
      <ResellerPageHeader
        title="Services & Products"
        description="Choose which digital services you want to sell through your storefront."
      />
      <ResellerServicesManager />
    </>
  );
}