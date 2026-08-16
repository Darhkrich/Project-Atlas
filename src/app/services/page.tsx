import { ServicesClient } from "@/components/services/ServicesClient";
import { AtlasNavbar } from "@/components/landing/AtlasNavbar";
import { AtlasFooter } from "@/components/atlas/atlas-footer";
export default function ServicesPage() {
  return (
    <>
      <AtlasNavbar />
      <ServicesClient />
      <AtlasFooter />
    </>
  );
}