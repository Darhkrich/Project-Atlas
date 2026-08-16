import { AtlasNavbar } from "@/components/landing/AtlasNavbar";
import { AtlasHero } from "@/components/landing/AtlasHero";
import { TrustMockupSection } from "@/components/landing/TrustMockupSection";
import { PopularServices } from "@/components/landing/PopularServices";
import { AudienceSection } from "@/components/landing/AudienceSection";
import { TrustStats } from "@/components/landing/TrustStats";
import { BlogSection } from "@/components/landing/BlogSection";
import { ResellerSection } from "@/components/landing/ResellerSection";
import { EcommerceSection } from "@/components/landing/EcommerceSection";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { AtlasFooter } from "@/components/atlas/atlas-footer";

export default function HomePage() {
  return (
    <>
      <AtlasNavbar />
      <main>
        <AtlasHero />
        <TrustMockupSection />
        <PopularServices />
        <AudienceSection />
        <TrustStats />
        <BlogSection />
        <ResellerSection />
        <EcommerceSection />
        <FinalCTA />
      </main>
      <AtlasFooter />
    </>
  );
}